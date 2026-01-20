'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Layers, CheckCircle, XCircle, Edit, Trash2, X, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

type PlatformData = {
  id: number;
  name: string;
  icon_imagekit_url?: string | null;
};

type CategoryData = {
  id: number;
  id_platform: number;
  name: string;
  status: string;
  platform?: PlatformData;
  _count?: {
    services: number;
  };
};

type ModalType = 'add' | 'edit' | 'delete' | null;

type Props = {
  initialCategories: CategoryData[];
  platforms: PlatformData[];
};

const CategoriesClient = ({ initialCategories, platforms }: Props) => {
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    id_platform: '',
    status: 'ACTIVE'
  });

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || category.status === statusFilter;
    const matchesPlatform = platformFilter === 'ALL' || category.id_platform.toString() === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      id_platform: platforms.length > 0 ? platforms[0].id.toString() : '',
      status: 'ACTIVE'
    });
    setModalType('add');
  };

  // Open Edit Modal
  const openEditModal = (category: CategoryData) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      id_platform: category.id_platform.toString(),
      status: category.status
    });
    setModalType('edit');
    setDropdownOpen(null);
  };

  // Open Delete Modal
  const openDeleteModal = (category: CategoryData) => {
    setSelectedCategory(category);
    setModalType('delete');
    setDropdownOpen(null);
  };

  // Close Modal
  const closeModal = () => {
    setModalType(null);
    setSelectedCategory(null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create Category
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.id_platform) {
      toast.error('Please select a platform');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          id_platform: formData.id_platform,
          status: formData.status
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create category');
        return;
      }

      const newCategory = await res.json();
      setCategories(prev => [...prev, newCategory]);
      toast.success('Category created successfully');
      closeModal();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  // Update Category
  const handleUpdate = async () => {
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.id_platform) {
      toast.error('Please select a platform');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          id_platform: formData.id_platform,
          status: formData.status
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update category');
        return;
      }

      const updatedCategory = await res.json();
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      toast.success('Category updated successfully');
      closeModal();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete category');
        return;
      }

      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      toast.success('Category deleted successfully');
      closeModal();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SMM Categories</h1>
          <p className="text-slate-500 text-sm">Manage service categories and their ordering.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id.toString()}>{platform.name}</option>
            ))}
          </select>
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
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold">Platform</th>
                <th className="px-6 py-4 font-semibold">Services</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="font-medium text-slate-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
                        {category.platform?.icon_imagekit_url ? (
                          <img
                            src={category.platform.icon_imagekit_url}
                            alt={category.platform.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Globe className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-slate-700">{category.platform?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {category._count?.services || 0} services
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                      {category.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === category.id ? null : category.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen === category.id && (
                      <div className="absolute right-6 top-12 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button
                          onClick={() => openEditModal(category)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
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
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{filteredCategories.length}</span> of <span className="font-medium text-slate-900">{categories.length}</span> results</p>
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
                  {modalType === 'add' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Followers, Likes, Views"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform *</label>
                  <select
                    name="id_platform"
                    value={formData.id_platform}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Platform</option>
                    {platforms.map(platform => (
                      <option key={platform.id} value={platform.id.toString()}>
                        {platform.name}
                      </option>
                    ))}
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
                  {loading ? 'Saving...' : (modalType === 'add' ? 'Create Category' : 'Update Category')}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {modalType === 'delete' && selectedCategory && (
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Category</h2>
                <p className="text-sm text-slate-500 text-center">
                  Are you sure you want to delete <span className="font-medium text-slate-700">{selectedCategory.name}</span>?
                  {selectedCategory._count?.services && selectedCategory._count.services > 0 && (
                    <span className="block mt-2 text-amber-600">
                      ⚠️ This category has {selectedCategory._count.services} services. You need to delete or move them first.
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

export default CategoriesClient;
