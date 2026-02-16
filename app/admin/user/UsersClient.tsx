'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, User, Mail, CheckCircle, XCircle, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';

type UserData = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  balance: any;
  role: string;
  status: string;
};

type ModalType = 'add' | 'edit' | 'delete' | null;

const UsersClient = ({ initialUsers }: { initialUsers: UserData[] }) => {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'MEMBER',
    status: 'ACTIVE',
    balance: '0'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 20, 50, 100, 150];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, pageSize]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'MEMBER',
      status: 'ACTIVE',
      balance: '0'
    });
    setModalType('add');
  };

  // Open Edit Modal
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      balance: String(user.balance)
    });
    setModalType('edit');
    setDropdownOpen(null);
  };

  // Open Delete Modal
  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setModalType('delete');
    setDropdownOpen(null);
  };

  // Close Modal
  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create User
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
        return;
      }

      const newUser = await res.json();
      setUsers(prev => [newUser, ...prev]);
      closeModal();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Update User
  const handleUpdate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const updateData: any = {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        balance: parseFloat(formData.balance)
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
        return;
      }

      const updatedUser = await res.json();
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Delete User
  const handleDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
        return;
      }

      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      closeModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
          <p className="text-slate-500 text-sm">Manage all registered users and their balances.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search users by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="MEMBER">Member</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Balance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.full_name || user.username}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">${Number(user.balance).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen === user.id && (
                      <div className="absolute right-6 top-12 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button
                          onClick={() => openEditModal(user)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{endIndex}</span> of <span className="font-medium text-slate-900">{totalItems}</span> results
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>

          {/* Add/Edit Modal */}
          {(modalType === 'add' || modalType === 'edit') && (
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  {modalType === 'add' ? 'Add New User' : 'Edit User'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {modalType === 'edit' && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={modalType === 'add' ? 'Enter password' : 'Enter new password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="NOT_ACTIVE">Not Active</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Balance</label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter balance"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={modalType === 'add' ? handleCreate : handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (modalType === 'add' ? 'Create User' : 'Update User')}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {modalType === 'delete' && selectedUser && (
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete User</h2>
                <p className="text-sm text-slate-500 text-center">
                  Are you sure you want to delete <span className="font-medium text-slate-700">{selectedUser.full_name || selectedUser.username}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(null)}></div>
      )}
    </div>
  );
};

export default UsersClient;
