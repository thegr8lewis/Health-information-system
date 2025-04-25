import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    selectedPrograms: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Simulated data - in real app, this would be fetched from API
  useEffect(() => {
    // Mock data for clients
    const mockClients = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        dateOfBirth: "1985-07-15",
        address: "123 Main St, Anytown",
        programs: [1, 3]
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "(555) 987-6543",
        dateOfBirth: "1990-03-22",
        address: "456 Elm St, Somewhere",
        programs: [2]
      },
      {
        id: 3,
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.j@example.com",
        phone: "(555) 567-8901",
        dateOfBirth: "1978-11-08",
        address: "789 Oak Ave, Nowhere",
        programs: [1, 2, 3]
      }
    ];

    // Mock data for programs
    const mockPrograms = [
      { id: 1, name: "Weight Management" },
      { id: 2, name: "Cardiac Rehabilitation" },
      { id: 3, name: "Diabetes Control" }
    ];

    setClients(mockClients);
    setPrograms(mockPrograms);
  }, []);

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           client.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const resetForm = () => {
    setFormData({
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      selectedPrograms: [],
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setFormData({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth,
      address: client.address,
      selectedPrograms: client.programs || [],
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleProgramToggle = (programId) => {
    setFormData(prev => {
      const currentPrograms = [...prev.selectedPrograms];
      const programIndex = currentPrograms.indexOf(programId);
      
      if (programIndex === -1) {
        // Add program
        return {
          ...prev,
          selectedPrograms: [...currentPrograms, programId]
        };
      } else {
        // Remove program
        currentPrograms.splice(programIndex, 1);
        return {
          ...prev,
          selectedPrograms: currentPrograms
        };
      }
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (formData.id) {
        // Update existing client
        const updatedClients = clients.map(client => 
          client.id === formData.id ? { ...formData } : client
        );
        setClients(updatedClients);
      } else {
        // Add new client
        const newClient = {
          ...formData,
          id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
          programs: formData.selectedPrograms
        };
        setClients([...clients, newClient]);
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedClient) {
      const updatedClients = clients.filter(client => client.id !== selectedClient.id);
      setClients(updatedClients);
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    }
  };

  const getProgramNames = (programIds) => {
    return programIds.map(id => {
      const program = programs.find(p => p.id === id);
      return program ? program.name : "";
    }).filter(Boolean).join(", ");
  };

  return (
    <div className="px-6 py-8 max-w-full mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add New Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Clients
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-semibold">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.firstName} {client.lastName}</div>
                          <div className="text-sm text-gray-500">{client.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.programs && client.programs.length > 0 ? (
                          getProgramNames(client.programs)
                        ) : (
                          <span className="text-gray-400 italic">No programs assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openEditModal(client)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(client)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.id ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>}
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.address ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                  />
                  {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Programs
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {programs.map(program => (
                    <div key={program.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`program-${program.id}`}
                        checked={formData.selectedPrograms.includes(program.id)}
                        onChange={() => handleProgramToggle(program.id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`program-${program.id}`} className="ml-2 block text-sm text-gray-900">
                        {program.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {formData.id ? 'Update Client' : 'Add Client'}
                </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete {selectedClient.firstName} {selectedClient.lastName}? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
              