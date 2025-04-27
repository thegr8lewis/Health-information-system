import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, X, Check, Calendar, Phone, MapPin, Briefcase, Clock, UserCircle } from 'lucide-react';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    program: ''
  });


  
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const [clientRes, programsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/clients/${id}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }),
          axios.get('http://localhost:8000/api/programs/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          })
        ]);
        setClient(clientRes.data);
        setPrograms(programsRes.data);
        // Initialize form data
        setFormData({
          first_name: clientRes.data.first_name,
          last_name: clientRes.data.last_name,
          email: clientRes.data.email,
          phone: clientRes.data.phone,
          date_of_birth: clientRes.data.date_of_birth,
          address: clientRes.data.address,
          program: clientRes.data.program || ''
        });
      } catch (err) {
        setError('Failed to fetch client data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/clients/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setClient(response.data);
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to update client. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
    // Reset form to original client data
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      date_of_birth: client.date_of_birth,
      address: client.address,
      program: client.program || ''
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRandomGradient = () => {
    const gradients = [
      'bg-gradient-to-r from-blue-500 to-purple-500',
      'bg-gradient-to-r from-green-400 to-blue-500',
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-yellow-400 to-orange-500',
      'bg-gradient-to-r from-red-400 to-pink-500',
    ];
    // Use the client's id to get a consistent gradient
    const index = id ? id.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <Link to="/client-management" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const currentProgram = programs.find(p => p.id === client.program);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/client-management" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
        >
          <ArrowLeft className="mr-1" size={18} />
          <span>Back to Clients Management</span>
        </Link>

        {/* Client Profile Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className={`h-24 ${getRandomGradient()}`}></div>
          <div className="px-6 py-5 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className={`h-20 w-20 rounded-full ${getRandomGradient()} flex items-center justify-center text-white text-2xl font-bold border-4 border-white -mt-12`}>
                {getInitials(client.first_name, client.last_name)}
              </div>
              <div className="md:ml-4 mt-3 md:mt-0 flex-grow">
                <h1 className="text-2xl font-bold text-gray-800">
                  {client.first_name} {client.last_name}
                </h1>
                <p className="text-gray-600">{client.email}</p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition duration-200"
              >
                <Edit2 className="mr-2" size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserCircle className="mr-2 text-blue-500" size={20} />
            Personal Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-start">
              <Phone className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">{client.phone}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-gray-900 font-medium">{formatDate(client.date_of_birth)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900 whitespace-pre-line">{client.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Information */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Briefcase className="mr-2 text-blue-500" size={20} />
            Program Information
          </h2>
          {currentProgram ? (
            <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">
                {currentProgram.name}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-600">Category:</span> {currentProgram.category}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-600">Duration:</span> {currentProgram.duration} days
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-600">Status:</span> 
                    <span className={`ml-1 ${
                      currentProgram.status === 'Active' ? 'text-green-600' :
                      currentProgram.status === 'Pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {currentProgram.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <Briefcase className="text-gray-400" size={20} />
              </div>
              <p className="text-gray-500">No program assigned</p>
              <button 
                onClick={() => setShowEditModal(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Assign Program
              </button>
            </div>
          )}
        </div>

        {/* History/Notes */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-500" size={20} />
            Client History
          </h2>
          <div className="space-y-5">
            <div className="flex items-start">
              <div className="mr-3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900 font-medium">{formatDate(client.created_at)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900 font-medium">{formatDate(client.updated_at)}</p>
              </div>
            </div>
            <hr className="my-4 border-gray-100" />
            <div className="text-center">
              <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-200">
                View Full History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
{showEditModal && (
  <>
    {/* Backdrop */}
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={handleCancel}
    ></div>
    
    {/* Modal Container */}
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Client Profile</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <select
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
            
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
          >
            <Check className="mr-1" size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </>
)}

      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;