import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2 } from 'lucide-react';

const ClientProfile = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError('Failed to fetch client data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

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
          <Link to="/clients" className="text-blue-600 mt-2 inline-block">
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
          to="/clients" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-1" size={18} />
          Back to Clients
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
              {getInitials(client.first_name, client.last_name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {client.first_name} {client.last_name}
              </h1>
              <p className="text-gray-600">{client.email}</p>
            </div>
          </div>
          <Link
            to={`/clients/edit/${client.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="mr-1" size={18} />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900">{client.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="text-gray-900">
                {new Date(client.date_of_birth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-900 whitespace-pre-line">{client.address}</p>
            </div>
          </div>
        </div>

        {/* Program Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Program Information</h2>
          {client.program ? (
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
    </div>
  );
};

export default ClientProfile;