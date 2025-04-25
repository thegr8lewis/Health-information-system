import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, Trash2, X, Check } from 'lucide-react';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    category: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setIsLoading(true);
        const programRes = await axios.get(`http://localhost:8000/api/programs/${id}/`);
        setProgram(programRes.data);
        setFormData({
          name: programRes.data.name,
          description: programRes.data.description,
          duration: programRes.data.duration.toString(),
          category: programRes.data.category,
          status: programRes.data.status
        });
        
        const clientsRes = await axios.get(`http://localhost:8000/api/programs/${id}/clients/`);
        setClients(clientsRes.data);
      } catch (err) {
        setError('Failed to fetch program data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramData();
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
      const updatedProgram = {
        ...formData,
        duration: parseInt(formData.duration)
      };
      
      const response = await axios.put(`http://localhost:8000/api/programs/${id}/`, updatedProgram);
      setProgram(response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update program. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original program data
    setFormData({
      name: program.name,
      description: program.description,
      duration: program.duration.toString(),
      category: program.category,
      status: program.status
    });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/programs/${id}/`);
      navigate('/programs');
    } catch (err) {
      setError('Failed to delete program');
      console.error(err);
    }
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
          <Link to="/programs" className="text-blue-600 mt-2 inline-block">
            Back to programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link 
          to="/programs" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-1" size={18} />
          Back to Programs
        </Link>

        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-800 border border-gray-300 rounded px-2 py-1"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">{program.name}</h1>
            )}
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                rows="2"
                required
              />
            ) : (
              <p className="text-gray-600">{program.description}</p>
            )}
          </div>
          <div className="flex space-x-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Edit2 className="mr-1" size={18} />
                Edit
              </button>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <Trash2 className="mr-1" size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Program Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Program Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              {isEditing ? (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  required
                />
              ) : (
                <p className="text-gray-900">{program.category}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              {isEditing ? (
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  min="1"
                  required
                />
              ) : (
                <p className="text-gray-900">{program.duration} days</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {program.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-gray-900 text-2xl font-bold">{clients.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900">
                {new Date(program.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Enrolled Clients</h2>
        </div>
        {clients.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/client/${client.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {client.first_name} {client.last_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            No clients enrolled in this program yet.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 z-10">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the program "{program.name}"? This will also unenroll all clients.
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
                  onClick={handleDelete}
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

export default ProgramDetail;