import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import apiClient from '../../services/apiConfig';
import { toast } from '../../utils/notify';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: [{ id: Role.DOCTOR, label: 'Doctor' }],
    password: ''
  });

  // Modal functionalities
  const openEditModal = (user: any) => {
    setCurrentUser({
      ...user,
      role: [{ id: user.role, label: getRoleLabel(user.role) }]
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.NURSE:
        return 'Nurse';
      case Role.DOCTOR:
        return 'Doctor';
      case Role.ADMIN:
        return 'Admin';
      default:
        return '';
    }
  };

  // Fetch all users at the begining
  useEffect(() => {
    fetchAllUsers()
  }, []);

  // Close the Modal
  const closeAddUserModal = () => {
    setIsAddModalOpen(false)
    
    setNewUser({
      name: '',
      email: '',
      role: [{ id: Role.DOCTOR, label: 'Doctor' }],
      password: ''
    })
  }

  // 1. Function to fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get('/users')
      setUsers(response.data.users);
    }
    catch (error: any) {
      toast.error('Failed to fetch users');
    }
  }

  // 2. Function to handle adding a new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || newUser.role.length === 0) {
      toast.error('Please fill in all fields');
      return 0
    }

    // Send data to the Database
    try {
      const sendData = await apiClient.post('/users',
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role[0].id
        }
      )

      toast.success('User added successfully');

      // Reset form
      setNewUser({
        name: '',
        email: '',
        role: [{ id: Role.DOCTOR, label: 'Doctor' }],
        password: ''
      })

      // Take the updated users list
      fetchAllUsers()

      // Close the Modal
      setIsAddModalOpen(false)
    }

    catch (error: any) {
      console.log(error.response.data.errors);

      if (error.response && error.response.data.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.msg);
        })
      }
      toast.error('Failed to add user');
    }
  }

  // 3. Function to update existing user
  const handleEditUser = async () => {
    if (!currentUser.name || !currentUser.email || !currentUser.role || currentUser.role.length === 0) {
      toast.error('Please fill in all required fields');
      return 0
    }

    try {
      // Send PUT request with apiClient
      const updateData = await apiClient.put(`/users/${currentUser.id}`,
        {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role[0].id
        }
      )

      toast.success('User Updated successfully');

      // Take the updated users list
      fetchAllUsers()

      // Close the Modal
      setIsEditModalOpen(false)
    }

    catch (error) {
      toast.error('Failed to update user');
    }
  }

  // 4. Function to delete existing user
  const handleDeleteUser = async () => {
    if (!currentUser || !currentUser.id) {
      toast.error('Invalid user data');
      return 0
    }

    console.log('Deleting user:', currentUser.id);

    try {
      const deleteData = await apiClient.delete(`/users/${currentUser.id}`)

      toast.success('User Deleted successfully');

      // Take the users list
      fetchAllUsers()

      // Close the Modal
      setIsDeleteModalOpen(false)
    }

    catch (error) {
      toast.error('Failed to Delete user');
    }
  }

  return (
    <div id='container'>
      <div className="page-header">
        <h1 className="h1">
          <i className="bi bi-people-fill"></i> User Management
        </h1>
        <p className="page-subtitle">Manage system users, roles, and permissions</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">
                <i className="bi bi-table"></i> All Users
              </h2>
              <button className="btn btn-green" onClick={() => setIsAddModalOpen(true)}>
                <i className="bi bi-plus-circle"></i> Add New User
              </button>
            </div>
            <div className="dashboard-card-body">
              {users.length === 0 ? (
                <div className="no-data-message">
                  <i className="bi bi-person-x"></i>
                  <p>No users found</p>
                  <span>Start by adding your first user</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="display-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                          <td>{user.id}</td>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td>
                            {user.lastLogin ? (
                              <span className="last-active">
                                <i className="bi bi-clock"></i>
                                {new Date(user.lastLogin).toLocaleString()}
                              </span>
                            ) : (
                              <span className="never-active">Never</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => openEditModal(user)}
                                title="Edit user"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => openDeleteModal(user)}
                                title="Delete user"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeAddUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-person-plus"></i> Add New User
              </h3>
              <button className="modal-close" onClick={closeAddUserModal}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="user-form">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person"></i> Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter user's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-envelope"></i> Email *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter user's email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock"></i> Password *
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    minLength={6}
                    required
                  />
                  <small className="form-help">Password must be at least 6 characters long</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-shield-check"></i> Role *
                  </label>
                  <select
                    className="form-select"
                    value={newUser.role[0]?.id || ''}
                    onChange={(e) => {
                      const selectedRole = e.target.value as Role;
                      setNewUser({ ...newUser, role: [{ id: selectedRole, label: getRoleLabel(selectedRole) }] });
                    }}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value={Role.NURSE}>Nurse</option>
                    <option value={Role.DOCTOR}>Doctor</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeAddUserModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddUser}>
                <i className="bi bi-check"></i> Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {currentUser && isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-pencil-square"></i> Edit User
              </h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="user-form">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person"></i> Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    placeholder="Enter user's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-envelope"></i> Email *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    placeholder="Enter user's email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-shield-check"></i> Role *
                  </label>
                  <select
                    className="form-select"
                    value={currentUser.role[0]?.id || ''}
                    onChange={(e) => {
                      const selectedRole = e.target.value as Role;
                      setCurrentUser({ ...currentUser, role: [{ id: selectedRole, label: getRoleLabel(selectedRole) }] });
                    }}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value={Role.NURSE}>Nurse</option>
                    <option value={Role.DOCTOR}>Doctor</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditUser}>
                <i className="bi bi-check"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {currentUser && isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-exclamation-triangle"></i> Delete User
              </h3>
              <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <i className="bi bi-person-x"></i>
                </div>
                <p>Are you sure you want to delete the user <strong>{currentUser.name}</strong>?</p>
                <p className="delete-warning">This action cannot be undone and will permanently remove the user from the system.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser}>
                <i className="bi bi-trash"></i> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
