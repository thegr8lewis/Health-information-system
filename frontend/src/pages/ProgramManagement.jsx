import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';
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
      duration: program.duration.toString(), // Ensure it's a string for the input
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
        duration: parseInt(formData.duration) // Convert duration to number for backend
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
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Program Management</h1>
        <p className="text-gray-600">Create, edit and manage health programs for your clients</p>
      </div>

      {/* Search and Add Program Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search programs..."
            className="pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <button 
          onClick={handleCreateProgram}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-1" />
          Add Program
        </button>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (days)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                               <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/program/${program.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {program.name}
                </Link>
                <div className="text-sm text-gray-500 truncate max-w-xs">{program.description}</div>
              </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {program.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditProgram(program)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(program)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No programs found. Create a new program or adjust your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentProgram ? 'Edit Program' : 'Create New Program'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter program name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Enter program description"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)*</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Fitness"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgram}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
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
          
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 z-10">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the program "{programToDelete.name}"? This action cannot be undone.
              </p>
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProgram}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
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