'use client';

import React, { useState } from 'react';
import { Search, MoreVertical, Plus, Layers, CheckCircle, XCircle, Edit, Trash2, X, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';

import ConfirmationModal from '@/components/ui/ConfirmationModal';

type CategoryData = {
  id: number;
  name: string;
  platform?: {
    id: number;
    name: string;
  };
};

type ApiProviderData = {
  id: number;
  name: string;
  code: string;
};

type ServiceData = {
  id: number;
  name: string;
  sid?: string | null;
  id_category: number;
  id_api_provider?: number | null;
  min: number;
  max: number;
  price_api: any;
  price_sale: any;
  price_reseller: any;
  refill: boolean;
  type: string;
  status: string;
  note?: string | null;
  category: CategoryData;
  api_provider?: ApiProviderData | null;
  _count?: {
    orders: number;
  };
};

type ModalType = 'add' | 'edit' | 'delete' | null;

type Props = {
  initialServices: ServiceData[];
  categories: CategoryData[];
  apiProviders: ApiProviderData[];
};

const ServicesClient = ({ initialServices, categories, apiProviders }: Props) => {
  const [services, setServices] = useState(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sid: '',
    id_category: '',
    id_api_provider: '',
    min: '100',
    max: '10000',
    price_api: '0.0000',
    price_sale: '0.0000',
    price_reseller: '0.0000',
    refill: false,
    type: 'DEFAULT',
    status: 'ACTIVE',
    note: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || service.id_category.toString() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      sid: '',
      id_category: categories.length > 0 ? categories[0].id.toString() : '',
      id_api_provider: '',
      min: '100',
      max: '10000',
      price_api: '0.0000',
      price_sale: '0.0000',
      price_reseller: '0.0000',
      refill: false,
      type: 'DEFAULT',
      status: 'ACTIVE',
      note: ''
    });
    setModalType('add');
  };

  // Open Edit Modal
  const openEditModal = (service: ServiceData) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      sid: service.sid || '',
      id_category: service.id_category.toString(),
      id_api_provider: service.id_api_provider?.toString() || '',
      min: service.min.toString(),
      max: service.max.toString(),
      price_api: Number(service.price_api).toString(),
      price_sale: Number(service.price_sale).toString(),
      price_reseller: Number(service.price_reseller).toString(),
      refill: service.refill,
      type: service.type,
      status: service.status,
      note: service.note || ''
    });
    setModalType('edit');
    setDropdownOpen(null);
  };

  // Open Delete Modal
  const openDeleteModal = (service: ServiceData) => {
    setSelectedService(service);
    setModalType('delete');
    setDropdownOpen(null);
  };

  // Close Modal
  const closeModal = () => {
    setModalType(null);
    setSelectedService(null);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Create Service
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.id_category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sid: formData.sid || null,
          id_category: formData.id_category,
          id_api_provider: formData.id_api_provider || null,
          min: formData.min,
          max: formData.max,
          price_api: formData.price_api,
          price_sale: formData.price_sale,
          price_reseller: formData.price_reseller,
          refill: formData.refill,
          type: formData.type,
          status: formData.status,
          note: formData.note || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create service');
        return;
      }

      const newService = await res.json();
      setServices(prev => [...prev, newService]);
      toast.success('Service created successfully');
      closeModal();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  // Update Service
  const handleUpdate = async () => {
    if (!selectedService) return;
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.id_category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sid: formData.sid || null,
          id_category: formData.id_category,
          id_api_provider: formData.id_api_provider || null,
          min: formData.min,
          max: formData.max,
          price_api: formData.price_api,
          price_sale: formData.price_sale,
          price_reseller: formData.price_reseller,
          refill: formData.refill,
          type: formData.type,
          status: formData.status,
          note: formData.note || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update service');
        return;
      }

      const updatedService = await res.json();
      setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
      toast.success('Service updated successfully');
      closeModal();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  // Delete Service
  const handleDelete = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete service');
        return;
      }

      setServices(prev => prev.filter(s => s.id !== selectedService.id));
      toast.success('Service deleted successfully');
      closeModal();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SMM Services</h1>
          <p className="text-slate-500 text-sm">Manage services, rates, and constraints.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id.toString()}>
                {category.platform?.name} - {category.name}
              </option>
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
                <th className="px-6 py-4 font-semibold">Service ID & Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Rate (per 1k)</th>
                <th className="px-6 py-4 font-semibold">Min / Max</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">#{service.id}</div>
                        <div className="text-sm text-slate-600 truncate max-w-[250px]" title={service.name}>{service.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-400">{service.category.platform?.name}</div>
                        <div>{service.category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">API: ${Number(service.price_api)}</div>
                      <div className="font-medium text-emerald-600">Sale: ${Number(service.price_sale)}</div>
                      <div className="text-xs text-blue-600">Reseller: ${Number(service.price_reseller)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div>Min: {service.min.toLocaleString()}</div>
                    <div>Max: {service.max.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                        {service.type}
                      </span>
                      {service.refill && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          <RefreshCw className="w-3 h-3" />
                          Refill
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ` +
                        (service.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800')
                      }
                    >
                      {service.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === service.id ? null : service.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen === service.id && (
                      <div className="absolute right-6 top-12 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button
                          onClick={() => openEditModal(service)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(service)}
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
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No services found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              Showing <span className="font-medium text-slate-900">{Math.min(startIndex + 1, filteredServices.length)}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredServices.length)}</span> of <span className="font-medium text-slate-900">{filteredServices.length}</span> results
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 mr-2">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-sm disabled:opacity-50 disabled:hover:bg-white transition-colors"
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
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">
                  {modalType === 'add' ? 'Add New Service' : 'Edit Service'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Instagram Followers - High Quality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select
                      name="id_category"
                      value={formData.id_category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.platform?.name} - {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API Provider</label>
                    <select
                      name="id_api_provider"
                      value={formData.id_api_provider}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Provider (Manual)</option>
                      {apiProviders.map(provider => (
                        <option key={provider.id} value={provider.id.toString()}>
                          {provider.name} ({provider.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service ID (API)</label>
                    <input
                      type="text"
                      name="sid"
                      value={formData.sid}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DEFAULT">Default</option>
                      <option value="PACKAGE">Package</option>
                      <option value="CUSTOM_COMMENTS">Custom Comments</option>
                      <option value="POLL">Poll</option>
                      <option value="SUBSCRIPTIONS">Subscriptions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Order *</label>
                    <input
                      type="number"
                      name="min"
                      value={formData.min}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Order *</label>
                    <input
                      type="number"
                      name="max"
                      value={formData.max}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price API (per 1k) *</label>
                    <input
                      type="text"
                      name="price_api"
                      value={formData.price_api}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Sale (per 1k) *</label>
                    <input
                      type="text"
                      name="price_sale"
                      value={formData.price_sale}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Reseller (per 1k) *</label>
                    <input
                      type="text"
                      name="price_reseller"
                      value={formData.price_reseller}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0000"
                    />
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

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="refill"
                      name="refill"
                      checked={formData.refill}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="refill" className="text-sm font-medium text-slate-700">
                      Enable Refill
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes about this service..."
                    />
                  </div>
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
                  {loading ? 'Saving...' : (modalType === 'add' ? 'Create Service' : 'Update Service')}
                </button>
              </div>
            </div>
          )}


          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={modalType === 'delete' && !!selectedService}
            onClose={closeModal}
            onConfirm={handleDelete}
            title="Delete Service"
            variant="danger"
            loading={loading}
            message={
              selectedService && (
                <span>
                  Are you sure you want to delete <span className="font-medium text-slate-900">#{selectedService.id} - {selectedService.name}</span>?
                  This action cannot be undone.
                  {selectedService._count?.orders && selectedService._count.orders > 0 && (
                    <span className="block mt-2 p-2 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                      ⚠️ This service has {selectedService._count.orders} orders. You cannot delete it.
                    </span>
                  )}
                </span>
              )
            }
            confirmText="Delete Service"
          />
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen !== null && (
        <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(null)}></div>
      )}
    </div>
  );
};

export default ServicesClient;
