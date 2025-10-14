const cron = require('node-cron');
const notificationService = require('./notificationService');
const Patient = require('../models/Patient');
const DialysisSession = require('../models/DialysisSession');
const User = require('../models/User');

class ScheduledNotificationService {
  
  // Initialize all scheduled notification jobs
  static initializeScheduledNotifications() {
    console.log('Initializing scheduled notification services...');
    
    // Daily appointment reminders - runs at 8:00 AM every day
    cron.schedule('0 8 * * *', () => {
      this.sendDailyAppointmentReminders();
    });

    // Missed session alerts - runs every 2 hours during business hours
    cron.schedule('0 8-18/2 * * *', () => {
      this.checkMissedSessions();
    });

    // Weekly patient review reminders - runs every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', () => {
      this.sendWeeklyPatientReviews();
    });

    // Equipment maintenance reminders - runs every day at 7:00 AM
    cron.schedule('0 7 * * *', () => {
      this.sendMaintenanceReminders();
    });

    // Critical lab follow-up reminders - runs every 4 hours
    cron.schedule('0 */4 * * *', () => {
      this.checkCriticalLabFollowups();
    });

    console.log('Scheduled notification services initialized successfully');
  }

  // Send daily appointment reminders
  static async sendDailyAppointmentReminders() {
    try {
      console.log('Sending daily appointment reminders...');
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get all active patients with thrice weekly dialysis
      const patients = await Patient.find({
        status: 'ACTIVE',
        'dialysisInfo.frequency': 'THRICE_WEEKLY'
      }).populate('assignedDoctor');

      for (const patient of patients) {
        // Check if patient should have dialysis tomorrow (simplified logic)
        const dayOfWeek = tomorrow.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dialysisDays = [1, 3, 5]; // Monday, Wednesday, Friday
        
        if (dialysisDays.includes(dayOfWeek)) {
          // Notify assigned doctor
          if (patient.assignedDoctor) {
            await notificationService.createNotification({
              title: 'Dialysis Session Reminder',
              message: `${patient.name} has a scheduled dialysis session tomorrow. Please ensure all preparations are in place.`,
              type: 'INFO',
              priority: 'MEDIUM',
              category: 'APPOINTMENT_REMINDER',
              recipient: patient.assignedDoctor._id,
              relatedEntity: {
                entityType: 'Patient',
                entityId: patient._id
              },
              data: {
                actionRequired: false,
                appointmentDate: tomorrow,
                appointmentType: 'Hemodialysis Session'
              },
              expiresAt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) // Expires after the appointment day
            });
          }

          // Notify nurses
          const nurses = await User.find({ role: 'nurse', isActive: true });
          for (const nurse of nurses.slice(0, 2)) { // Limit to 2 nurses to avoid spam
            await notificationService.createNotification({
              title: 'Tomorrow\'s Dialysis Schedule',
              message: `${patient.name} scheduled for dialysis session tomorrow. Please prepare equipment and review patient chart.`,
              type: 'INFO',
              priority: 'MEDIUM',
              category: 'APPOINTMENT_REMINDER',
              recipient: nurse._id,
              relatedEntity: {
                entityType: 'Patient',
                entityId: patient._id
              },
              data: {
                actionRequired: true,
                appointmentDate: tomorrow,
                appointmentType: 'Hemodialysis Session'
              },
              expiresAt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            });
          }
        }
      }
      
      console.log('Daily appointment reminders sent successfully');
    } catch (error) {
      console.error('Error sending daily appointment reminders:', error);
    }
  }

  // Check for missed dialysis sessions
  static async checkMissedSessions() {
    try {
      console.log('Checking for missed dialysis sessions...');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get all active patients
      const patients = await Patient.find({
        status: 'ACTIVE'
      }).populate('assignedDoctor');

      for (const patient of patients) {
        // Check if patient had a session yesterday
        const yesterdaySession = await DialysisSession.findOne({
          patient: patient._id,
          date: {
            $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            $lt: new Date(yesterday.setHours(23, 59, 59, 999))
          }
        });

        // If no session found and it was a scheduled dialysis day
        if (!yesterdaySession) {
          const dayOfWeek = yesterday.getDay();
          const dialysisDays = [1, 3, 5]; // Monday, Wednesday, Friday
          
          if (dialysisDays.includes(dayOfWeek)) {
            // Notify assigned doctor about missed session
            if (patient.assignedDoctor) {
              await notificationService.createNotification({
                title: 'Missed Dialysis Session Alert',
                message: `${patient.name} missed their scheduled dialysis session yesterday. Please follow up to ensure patient safety.`,
                type: 'WARNING',
                priority: 'HIGH',
                category: 'PATIENT_ALERT',
                recipient: patient.assignedDoctor._id,
                relatedEntity: {
                  entityType: 'Patient',
                  entityId: patient._id
                },
                data: {
                  actionRequired: true,
                  actionUrl: `/patients/${patient._id}/sessions`
                }
              });
            }

            // Notify nurses
            const nurses = await User.find({ role: 'nurse', isActive: true });
            for (const nurse of nurses.slice(0, 1)) { // Only one nurse to avoid spam
              await notificationService.createNotification({
                title: 'Patient No-Show Alert',
                message: `${patient.name} did not attend their scheduled dialysis session yesterday. Please contact patient and reschedule if needed.`,
                type: 'WARNING',
                priority: 'HIGH',
                category: 'PATIENT_ALERT',
                recipient: nurse._id,
                relatedEntity: {
                  entityType: 'Patient',
                  entityId: patient._id
                },
                data: {
                  actionRequired: true
                }
              });
            }
          }
        }
      }
      
      console.log('Missed session check completed');
    } catch (error) {
      console.error('Error checking missed sessions:', error);
    }
  }

  // Send weekly patient review reminders
  static async sendWeeklyPatientReviews() {
    try {
      console.log('Sending weekly patient review reminders...');
      
      const doctors = await User.find({ role: 'doctor', isActive: true });
      
      for (const doctor of doctors) {
        const patientCount = await Patient.countDocuments({
          assignedDoctor: doctor._id,
          status: 'ACTIVE'
        });

        if (patientCount > 0) {
          await notificationService.createNotification({
            title: 'Weekly Patient Review',
            message: `You have ${patientCount} active patients assigned to you. Please review their progress and update care plans as needed.`,
            type: 'INFO',
            priority: 'MEDIUM',
            category: 'SYSTEM_ALERT',
            recipient: doctor._id,
            data: {
              actionRequired: true,
              actionUrl: '/patients/my-patients'
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 1 week
          });
        }
      }
      
      console.log('Weekly patient review reminders sent');
    } catch (error) {
      console.error('Error sending weekly patient review reminders:', error);
    }
  }

  // Send equipment maintenance reminders
  static async sendMaintenanceReminders() {
    try {
      console.log('Checking equipment maintenance schedules...');
      
      // This is a simplified example - in a real system, you'd have an equipment tracking model
      const nurses = await User.find({ role: 'nurse', isActive: true });
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Weekly maintenance reminder (every Sunday)
      if (dayOfWeek === 0) {
        for (const nurse of nurses.slice(0, 2)) { // Limit to 2 nurses
          await notificationService.createNotification({
            title: 'Weekly Equipment Maintenance',
            message: 'Weekly equipment maintenance is due. Please check dialysis machines, water treatment system, and other critical equipment.',
            type: 'INFO',
            priority: 'MEDIUM',
            category: 'SYSTEM_ALERT',
            recipient: nurse._id,
            data: {
              actionRequired: true,
              actionUrl: '/maintenance/weekly-checklist'
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          });
        }
      }
      
      console.log('Equipment maintenance reminders processed');
    } catch (error) {
      console.error('Error sending maintenance reminders:', error);
    }
  }

  // Check for critical lab results that need follow-up
  static async checkCriticalLabFollowups() {
    try {
      console.log('Checking critical lab follow-ups...');
      
      const MonthlyInvestigation = require('../models/MonthlyInvestigation');
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Find recent critical lab results
      const criticalLabs = await MonthlyInvestigation.find({
        date: { $gte: threeDaysAgo },
        $or: [
          { hb: { $lt: 7.0 } }, // Critical hemoglobin
          { scrPreHD: { $gt: 1200 } }, // Critical creatinine
          { serumKPreHD: { $gt: 6.5 } }, // Critical potassium
          { serumKPreHD: { $lt: 2.5 } }
        ]
      }).populate('patient');

      for (const lab of criticalLabs) {
        if (lab.patient && lab.patient.assignedDoctor) {
          await notificationService.createNotification({
            title: 'Critical Lab Follow-up Required',
            message: `Patient ${lab.patient.name} had critical lab results 3 days ago. Please ensure appropriate follow-up actions have been taken.`,
            type: 'WARNING',
            priority: 'HIGH',
            category: 'LAB_RESULT',
            recipient: lab.patient.assignedDoctor,
            relatedEntity: {
              entityType: 'Patient',
              entityId: lab.patient._id
            },
            data: {
              actionRequired: true,
              actionUrl: `/patients/${lab.patient._id}/investigations`
            }
          });
        }
      }
      
      console.log('Critical lab follow-up check completed');
    } catch (error) {
      console.error('Error checking critical lab follow-ups:', error);
    }
  }

  // Stop all scheduled jobs (useful for testing or shutdown)
  static stopAllScheduledJobs() {
    console.log('Stopping all scheduled notification jobs...');
    cron.getTasks().forEach((task) => {
      task.stop();
    });
    console.log('All scheduled notification jobs stopped');
  }
}

module.exports = ScheduledNotificationService;
