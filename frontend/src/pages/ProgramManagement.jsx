import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Filter, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    category: '',
    status: 'active'
  });

  // API base URL
  const API_URL = 'http://localhost:8000/api/programs/';

  // Fetch programs from API
  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setPrograms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch programs. Please try again later.');
      console.error('Error fetching programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal for creating a new program
  const handleCreateProgram = () => {
    setCurrentProgram(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      category: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing program
  const handleEditProgram = (program) => {
    setCurrentProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      duration: program.duration.toString(),
      category: program.category,
      status: program.status
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (program) => {
    setProgramToDelete(program);
    setIsDeleteModalOpen(true);
  };

  // Delete a program
  const confirmDeleteProgram = async () => {
    try {
      await axios.delete(`${API_URL}${programToDelete.id}/`);
      setPrograms(programs.filter(p => p.id !== programToDelete.id));
      setIsDeleteModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program. Please try again.');
    }
  };

  // Save program (create new or update existing)
  const handleSaveProgram = async () => {
    try {
      const programData = {
        ...formData,
        duration: parseInt(formData.duration)
      };

      if (currentProgram) {
        // Update existing program
        const response = await axios.put(`${API_URL}${currentProgram.id}/`, programData);
        setPrograms(programs.map(p => 
          p.id === currentProgram.id ? response.data : p
        ));
      } else {
        // Create new program
        const response = await axios.post(API_URL, programData);
        setPrograms([...programs, response.data]);
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      setCurrentProgram(null);
    } catch (err) {
      console.error('Error saving program:', err);
      setError('Failed to save program. Please check your inputs and try again.');
    }
  };

  // Filter programs based on search term
  const filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
          <p className="mt-1 text-gray-600">Create, edit and manage health programs for your clients</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Add Program Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search programs..."
              className="pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm border border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleCreateProgram}
            className="w-full md:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors shadow-sm font-medium"
          >
            <Plus size={20} className="mr-2" />
            Add New Program
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-blue-600 font-medium mb-1">Total Programs</div>
            <div className="text-3xl font-bold">{programs.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-green-600 font-medium mb-1">Active Programs</div>
            <div className="text-3xl font-bold">{programs.filter(p => p.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-gray-600 font-medium mb-1">Inactive Programs</div>
            <div className="text-3xl font-bold">{programs.filter(p => p.status === 'inactive').length}</div>
          </div>
        </div>

        {/* Programs List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (days)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/program/${program.id}`}
                          className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {program.name}
                        </Link>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{program.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-blue-50 text-blue-700">
                          {program.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{program.duration} days</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                          program.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditProgram(program)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="Edit Program"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteModal(program)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Program"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium mb-1">No programs found</p>
                        <p className="text-gray-400">Try adjusting your search or create a new program</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 z-10 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {currentProgram ? 'Edit Program' : 'Create New Program'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                  placeholder="Enter program name"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 h-28"
                  placeholder="Enter program description"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)*</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                    placeholder="e.g. 28"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                    placeholder="e.g. Fitness"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleInputChange}
                      className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgram}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <Check size={18} className="mr-2" />
                  {currentProgram ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && programToDelete && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the program "{programToDelete.name}"? This action cannot be undone.
              </p>
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProgram}
                  className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1 flex items-center justify-center"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;