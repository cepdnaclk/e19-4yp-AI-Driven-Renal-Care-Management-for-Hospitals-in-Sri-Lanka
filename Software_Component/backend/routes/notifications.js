const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - type
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         title:
 *           type: string
 *           description: The title of the notification
 *         message:
 *           type: string
 *           description: The notification message
 *         type:
 *           type: string
 *           enum: [info, warning, error, success, reminder]
 *           description: The type of notification
 *         category:
 *           type: string
 *           enum: [system, patient, appointment, investigation, decision, ai_prediction]
 *           description: The category of notification
 *         userId:
 *           type: string
 *           description: The id of the user who should receive the notification
 *         relatedEntity:
 *           type: object
 *           properties:
 *             entityType:
 *               type: string
 *               enum: [patient, dialysis_session, investigation, decision, ai_prediction]
 *             entityId:
 *               type: string
 *           description: Related entity information
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: The priority level of the notification
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         actionRequired:
 *           type: boolean
 *           description: Whether the notification requires action
 *         actionUrl:
 *           type: string
 *           description: URL for the action if required
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the notification expires
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was read
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success, reminder]
 *         description: Filter by notification type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [system, patient, appointment, investigation, decision, ai_prediction]
 *         description: Filter by notification category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth.protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query for user's notifications
    const query = { userId: req.user.id };
    
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Remove expired notifications
    await Notification.deleteMany({
      userId: req.user.id,
      expiresAt: { $lt: new Date() }
    });

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', auth.protect, async (req, res) => {
  try {
    // Only admin can create notifications manually
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notification = new Notification(req.body);
    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/read', auth.protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        read: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.patch('/mark-all-read', auth.protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auth.protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns this notification or is admin
    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/clear-all:
 *   delete:
 *     summary: Delete all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.delete('/clear-all', auth.protect, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.id });

    res.json({
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', auth.protect, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to multiple users (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - userIds
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success, reminder]
 *               category:
 *                 type: string
 *                 enum: [system, patient, appointment, investigation, decision, ai_prediction]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Notifications broadcast successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 createdCount:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/broadcast', auth.protect, async (req, res) => {
  try {
    // Only admin can broadcast notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, message, type, category, priority, userIds, expiresAt } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    const notifications = userIds.map(userId => ({
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      priority: priority || 'medium',
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Notifications broadcast successfully',
      createdCount: createdNotifications.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
