import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    category: '',
    status: 'active'
  });

  // Mock data - in real application, fetch from Django backend
  useEffect(() => {
    // Simulating API call to fetch programs
    const mockPrograms = [
      {
        id: 1,
        name: "Weight Management",
        description: "A comprehensive program focused on healthy weight loss and maintenance",
        duration: "12 weeks",
        category: "Lifestyle",
        status: "active",
        enrolledClients: 24
      },
      {
        id: 2,
        name: "Cardiac Rehabilitation",
        description: "Recovery program for patients with heart conditions",
        duration: "8 weeks",
        category: "Rehabilitation",
        status: "active",
        enrolledClients: 18
      },
      {
        id: 3,
        name: "Diabetes Management",
        description: "Program to help manage and control diabetes through lifestyle changes",
        duration: "16 weeks",
        category: "Chronic Disease",
        status: "active",
        enrolledClients: 31
      },
      {
        id: 4,
        name: "Prenatal Wellness",
        description: "Health program for expectant mothers",
        duration: "9 months",
        category: "Maternal Health",
        status: "inactive",
        enrolledClients: 0
      }
    ];
    setPrograms(mockPrograms);
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
      duration: program.duration,
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
  const confirmDeleteProgram = () => {
    // In a real app, you would make an API call to delete the program
    setPrograms(programs.filter(p => p.id !== programToDelete.id));
    setIsDeleteModalOpen(false);
    setProgramToDelete(null);
  };

  // Save program (create new or update existing)
  const handleSaveProgram = () => {
    if (currentProgram) {
      // Update existing program
      setPrograms(programs.map(p => 
        p.id === currentProgram.id ? 
        { ...p, ...formData } : 
        p
      ));
    } else {
      // Create new program
      const newProgram = {
        ...formData,
        id: programs.length ? Math.max(...programs.map(p => p.id)) + 1 : 1,
        enrolledClients: 0
      };
      setPrograms([...programs, newProgram]);
    }
    
    // Close modal and reset form
    setIsModalOpen(false);
    setCurrentProgram(null);
  };

  // Filter programs based on search term
  const filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Clients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{program.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{program.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.enrolledClients}</td>
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
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No programs found. Create a new program or adjust your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Program Modal - Using a more transparent overlay */}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter program name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Enter program description"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 12 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Weight Loss"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
