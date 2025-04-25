import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, X, Check } from 'lucide-react';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
          axios.get(`http://localhost:8000/api/clients/${id}/`),
          axios.get('http://localhost:8000/api/programs/')
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
      const response = await axios.put(`http://localhost:8000/api/clients/${id}/`, formData);
      setClient(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update client. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
          <Link to="/client-management" className="text-blue-600 mt-2 inline-block">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link 
          to="/client-management" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-1" size={18} />
          Back to Clients Management
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
              {getInitials(client.first_name, client.last_name)}
            </div>
            <div>
              {isEditing ? (
                <div className="flex space-x-4">
                  <div>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder="First Name"
                      required
                    />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                      title="Save"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {client.first_name} {client.last_name}
                  </h1>
                  <p className="text-gray-600">{client.email}</p>
                </>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Edit2 className="mr-1" size={18} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              ) : (
                <p className="text-gray-900">{client.phone}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              ) : (
                <p className="text-gray-900">
                  {new Date(client.date_of_birth).toLocaleDateString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-line">{client.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Program Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Program Information</h2>
          {isEditing ? (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Program</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
          ) : client.program ? (
            <div>
              <h3 className="font-medium text-gray-900">
                {programs.find(p => p.id === client.program)?.name || 'Unknown Program'}
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Category:</span> {programs.find(p => p.id === client.program)?.category}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Duration:</span> {programs.find(p => p.id === client.program)?.duration} days
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Status:</span> {programs.find(p => p.id === client.program)?.status}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No program assigned</p>
          )}
        </div>

        {/* History/Notes */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client History</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-900">
                {new Date(client.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-gray-900">
                {new Date(client.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;