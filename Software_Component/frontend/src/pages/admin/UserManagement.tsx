import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { Table } from 'baseui/table-semantic';
import { toaster } from 'baseui/toast';
import { User, Role } from '../../types';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@hospital.com',
    role: Role.NURSE,
    lastActive: '2025-05-30T14:30:00'
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    role: Role.DOCTOR,
    lastActive: '2025-05-31T09:15:00'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@hospital.com',
    role: Role.ADMIN,
    lastActive: '2025-05-31T10:00:00'
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.brown@hospital.com',
    role: Role.NURSE,
    lastActive: '2025-05-29T16:45:00'
  },
  {
    id: '5',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@hospital.com',
    role: Role.DOCTOR,
    lastActive: '2025-05-30T11:20:00'
  }
];

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: [{ id: Role.NURSE, label: 'Nurse' }],
    password: ''
  });

  useEffect(() => {
    // In a real app, this would fetch from an API
    setUsers(mockUsers);
  }, []);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || newUser.role.length === 0) {
      toaster.negative('Please fill in all fields', {});
      return;
    }

    // In a real app, this would make an API call
    const user = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role[0].id,
      lastActive: new Date().toISOString()
    };

    setUsers([...users, user]);
    setIsAddModalOpen(false);
    toaster.positive('User added successfully', {});

    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: [{ id: Role.NURSE, label: 'Nurse' }],
      password: ''
    });
  };

  const handleEditUser = () => {
    if (!currentUser.name || !currentUser.email || !currentUser.role || currentUser.role.length === 0) {
      toaster.negative('Please fill in all fields', {});
      return;
    }

    // In a real app, this would make an API call
    const updatedUsers = users.map(user =>
      user.id === currentUser.id ? { ...user, ...currentUser, role: currentUser.role[0].id } : user
    );

    setUsers(updatedUsers);
    setIsEditModalOpen(false);
    toaster.positive('User updated successfully', {});
  };

  const handleDeleteUser = () => {
    // In a real app, this would make an API call
    const updatedUsers = users.filter(user => user.id !== currentUser.id);
    setUsers(updatedUsers);
    setIsDeleteModalOpen(false);
    toaster.positive('User deleted successfully', {});
  };

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

  return (
    <Block>
      <HeadingLarge>User Management</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card>
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                <HeadingMedium marginTop="0" marginBottom="0">
                  All Users
                </HeadingMedium>
                <Button onClick={() => setIsAddModalOpen(true)}>Add New User</Button>
              </Block>

              <Table
                columns={['ID', 'Name', 'Email', 'Role', 'Last Active', 'Actions']}
                data={users.map(user => [
                  user.id,
                  user.name,
                  user.email,
                  getRoleLabel(user.role),
                  new Date(user.lastActive).toLocaleString(),
                  <Block
                    key={`actions-${user.id}`}
                    display="flex"
                    overrides={{
                      Block: {
                        style: {
                          gap: '8px',
                        },
                      },
                    }}
                  >
                    <Button
                      size="compact"
                      kind="secondary"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="compact"
                      kind="tertiary"
                      onClick={() => openDeleteModal(user)}
                    >
                      Delete
                    </Button>
                  </Block>
                ])}
                emptyMessage="No users found"
              />
            </StyledBody>
          </Card>
        </Cell>
      </Grid>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        closeable
        animate
        autoFocus
      >
        <ModalHeader>Add New User</ModalHeader>
        <ModalBody>
          <FormControl label="Name *">
            <Input
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.currentTarget.value })}
              placeholder="Enter user's full name"
            />
          </FormControl>

          <FormControl label="Email *">
            <Input
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.currentTarget.value })}
              placeholder="Enter user's email"
              type="email"
            />
          </FormControl>

          <FormControl label="Password *">
            <Input
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.currentTarget.value })}
              placeholder="Enter password"
              type="password"
            />
          </FormControl>

          <FormControl label="Role *">
            <Select
              options={[
                { id: Role.NURSE, label: 'Nurse' },
                { id: Role.DOCTOR, label: 'Doctor' },
                { id: Role.ADMIN, label: 'Admin' }
              ]}
              value={newUser.role}
              placeholder="Select user role"
              onChange={params => {
                const roles = params.value.map(item => ({
                  id: item.id as Role,
                  label: item.label as string,
                }));
                setNewUser({ ...newUser, role: roles });
              }}
            />
          </FormControl>

        </ModalBody>
        <ModalFooter>
          <ModalButton kind="tertiary" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleAddUser}>Add User</ModalButton>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      {currentUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          closeable
          animate
          autoFocus
        >
          <ModalHeader>Edit User</ModalHeader>
          <ModalBody>
            <FormControl label="Name *">
              <Input
                value={currentUser.name}
                onChange={e => setCurrentUser({ ...currentUser, name: e.currentTarget.value })}
                placeholder="Enter user's full name"
              />
            </FormControl>

            <FormControl label="Email *">
              <Input
                value={currentUser.email}
                onChange={e => setCurrentUser({ ...currentUser, email: e.currentTarget.value })}
                placeholder="Enter user's email"
                type="email"
              />
            </FormControl>

            <FormControl label="Role *">
              <Select
                options={[
                  { id: Role.NURSE, label: 'Nurse' },
                  { id: Role.DOCTOR, label: 'Doctor' },
                  { id: Role.ADMIN, label: 'Admin' }
                ]}
                value={currentUser.role}
                placeholder="Select user role"
                onChange={params => setCurrentUser({ ...currentUser, role: [...params.value] })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleEditUser}>Save Changes</ModalButton>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete User Modal */}
      {currentUser && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          closeable
          animate
          autoFocus
        >
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            <Block>
              Are you sure you want to delete the user <strong>{currentUser.name}</strong>? This action cannot be undone.
            </Block>
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton kind="negative" onClick={handleDeleteUser}>Delete</ModalButton>
          </ModalFooter>
        </Modal>
      )}
    </Block>
  );
};

export default AdminUserManagement;
