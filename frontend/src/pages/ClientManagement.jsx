import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'asc' });

  const API_URL = 'http://localhost:8000/api/clients/';
  const PROGRAMS_API_URL = 'http://localhost:8000/api/programs/';

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    program: ''
  });

  // Fetch clients and programs
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [clientsRes, programsRes] = await Promise.all([
        axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }),
        axios.get(PROGRAMS_API_URL + '?status=active', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
      ]);
      setClients(clientsRes.data);
      setPrograms(programsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter clients based on search term
  const filteredClients = sortedClients.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.program_name && client.program_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Open modal for creating a new client
  const handleCreateClient = () => {
    setCurrentClient(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      program: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing client
  const handleEditClient = (client) => {
    setCurrentClient(client);
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      date_of_birth: client.date_of_birth,
      address: client.address,
      program: client.program?.id || ''
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Generate a dynamic gradient color based on client name
  const getAvatarColor = (name) => {
    const colorOptions = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600', 
      'from-violet-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-sky-600'
    ];
    
    // Simple hash function to get consistent colors for the same name
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorOptions[nameHash % colorOptions.length];
  };

  // Delete a client
  const confirmDeleteClient = async () => {
    try {
      await axios.delete(`${API_URL}${clientToDelete.id}/`);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client. Please try again.');
    }
  };

  // Save client (create new or update existing)
  const handleSaveClient = async () => {
    try {
      if (currentClient) {
        // Update existing client
        const response = await axios.put(`${API_URL}${currentClient.id}/`, formData);
        setClients(clients.map(c => 
          c.id === currentClient.id ? response.data : c
        ));
      } else {
        // Create new client
        const response = await axios.post(API_URL, formData);
        setClients([...clients, response.data]);
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      setCurrentClient(null);
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Failed to save client. Please check your inputs and try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Client Management</h1>
        <p className="text-slate-500">Manage your clients and their program enrollments</p>
      </div>

      {/* Search and Add Client Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search clients..."
            className="pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button 
          onClick={handleCreateClient}
          className="w-full md:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add New Client
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Total Clients</h3>
          <p className="text-3xl font-bold text-slate-800">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Active Programs</h3>
          <p className="text-3xl font-bold text-slate-800">{programs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-2">With Programs</h3>
          <p className="text-3xl font-bold text-slate-800">
            {clients.filter(client => client.program).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm font-medium mb-2">Without Programs</h3>
          <p className="text-3xl font-bold text-slate-800">
            {clients.filter(client => !client.program).length}
          </p>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('last_name')}
                >
                  <div className="flex items-center">
                    Client
                    {sortConfig.key === 'last_name' ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : null}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/client/${client.id}`} className="flex items-center group">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br ${getAvatarColor(`${client.first_name}${client.last_name}`)} flex items-center justify-center text-white font-medium mr-4 shadow-sm group-hover:shadow transition-all`}>
                          {getInitials(client.first_name, client.last_name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-sm text-slate-500 truncate max-w-xs">{client.address}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{client.email}</div>
                      <div className="text-sm text-slate-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(client.date_of_birth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.program_name ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                          {client.program_name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-slate-100 text-slate-800">
                          No Program
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colorss"
                          aria-label="Edit client"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(client)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          aria-label="Delete client"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Search className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-base">No clients found.</p>
                      <p className="text-sm text-slate-400">Create a new client or adjust your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {currentClient ? 'Edit Client' : 'Create New Client'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name*</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name*</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="+1 (234) 567-8900"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth*</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address*</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-20 resize-none"
                  placeholder="Enter full address"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a program (optional)</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClient}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {currentClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 z-10 overflow-hidden">
            <div className="p-6">
              <div className="mb-6 flex items-center">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Confirm Deletion</h3>
              </div>
              
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-medium text-slate-900">{clientToDelete.first_name} {clientToDelete.last_name}</span>? This action cannot be undone.
              </p>
              
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClient}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center flex-1"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;