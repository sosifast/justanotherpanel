'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Globe, CheckCircle, XCircle, Edit, Trash2, X } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

type PlatformData = {
  id: number;
  name: string;
  slug?: string;
  icon_imagekit_url?: string | null;
  status: string;
  _count?: {
    categories: number;
  };
};

type ModalType = 'add' | 'edit' | 'delete' | null;

const PlatformsClient = ({ initialPlatforms }: { initialPlatforms: PlatformData[] }) => {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon_imagekit_url: '',
    status: 'ACTIVE'
  });

  // Filter platforms
  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = platform.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || platform.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      icon_imagekit_url: '',
      status: 'ACTIVE'
    });
    setModalType('add');
  };

  // Open Edit Modal
  const openEditModal = (platform: PlatformData) => {
    setSelectedPlatform(platform);
    setFormData({
      name: platform.name,
      icon_imagekit_url: platform.icon_imagekit_url || '',
      status: platform.status
    });
    setModalType('edit');
    setDropdownOpen(null);
  };

  // Open Delete Modal
  const openDeleteModal = (platform: PlatformData) => {
    setSelectedPlatform(platform);
    setModalType('delete');
    setDropdownOpen(null);
  };

  // Close Modal
  const closeModal = () => {
    setModalType(null);
    setSelectedPlatform(null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle icon change from ImageUpload
  const handleIconChange = (url: string) => {
    setFormData(prev => ({ ...prev, icon_imagekit_url: url }));
  };

  // Create Platform
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Platform name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          icon_imagekit_url: formData.icon_imagekit_url || null,
          status: formData.status
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to create platform');
        return;
      }

      const newPlatform = await res.json();
      setPlatforms(prev => [...prev, newPlatform]);
      closeModal();
    } catch (error) {
      console.error('Error creating platform:', error);
      alert('Failed to create platform');
    } finally {
      setLoading(false);
    }
  };

  // Update Platform
  const handleUpdate = async () => {
    if (!selectedPlatform) return;
    if (!formData.name.trim()) {
      alert('Platform name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/platforms/${selectedPlatform.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          icon_imagekit_url: formData.icon_imagekit_url || null,
          status: formData.status
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update platform');
        return;
      }

      const updatedPlatform = await res.json();
      setPlatforms(prev => prev.map(p => p.id === updatedPlatform.id ? updatedPlatform : p));
      closeModal();
    } catch (error) {
      console.error('Error updating platform:', error);
      alert('Failed to update platform');
    } finally {
      setLoading(false);
    }
  };

  // Delete Platform
  const handleDelete = async () => {
    if (!selectedPlatform) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/platforms/${selectedPlatform.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete platform');
        return;
      }

      setPlatforms(prev => prev.filter(p => p.id !== selectedPlatform.id));
      closeModal();
    } catch (error) {
      console.error('Error deleting platform:', error);
      alert('Failed to delete platform');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SMM Platforms</h1>
          <p className="text-slate-500 text-sm">Manage supported social media platforms.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search platforms..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="NOT_ACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Platform Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Categories</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlatforms.map((platform) => (
                <tr key={platform.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
                        {platform.icon_imagekit_url ? (
                          <img
                            src={platform.icon_imagekit_url}
                            alt={platform.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="w-5 h-5" />
                        )}
                      </div>
                      <div className="font-medium text-slate-900">{platform.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <code className="px-2 py-1 bg-slate-100 rounded text-xs">{platform.slug || '-'}</code>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {platform._count?.categories || 0} categories
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${platform.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                      {platform.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {platform.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === platform.id ? null : platform.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen === platform.id && (
                      <div className="absolute right-6 top-12 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button
                          onClick={() => openEditModal(platform)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(platform)}
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
              {filteredPlatforms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No platforms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{filteredPlatforms.length}</span> of <span className="font-medium text-slate-900">{platforms.length}</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm">Next</button>
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
                  {modalType === 'add' ? 'Add New Platform' : 'Edit Platform'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Instagram, TikTok, YouTube"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform Icon</label>
                  <div className="space-y-3">
                    <ImageUpload
                      value={formData.icon_imagekit_url}
                      onChange={handleIconChange}
                      folder="platforms"
                      label="Upload Icon"
                      previewClassName="h-16 w-16"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-slate-400">or enter URL manually</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="icon_imagekit_url"
                      value={formData.icon_imagekit_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
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
                    <option value="NOT_ACTIVE">Inactive</option>
                  </select>
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
                  {loading ? 'Saving...' : (modalType === 'add' ? 'Create Platform' : 'Update Platform')}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {modalType === 'delete' && selectedPlatform && (
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Platform</h2>
                <p className="text-sm text-slate-500 text-center">
                  Are you sure you want to delete <span className="font-medium text-slate-700">{selectedPlatform.name}</span>?
                  {selectedPlatform._count?.categories && selectedPlatform._count.categories > 0 && (
                    <span className="block mt-2 text-amber-600">
                      ⚠️ This platform has {selectedPlatform._count.categories} categories. You need to delete or move them first.
                    </span>
                  )}
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

export default PlatformsClient;
