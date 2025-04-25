import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  FileText, 
  Activity,
  AlertTriangle
} from 'lucide-react';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to update program. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowEditModal(false);
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
      navigate('/program-management');
    } catch (err) {
      setError('Failed to delete program');
      console.error(err);
    }
  };

  const getCategoryColor = (category) => {
    const categories = {
      'fitness': 'bg-green-100 text-green-800',
      'wellness': 'bg-blue-100 text-blue-800',
      'nutrition': 'bg-yellow-100 text-yellow-800',
      'rehabilitation': 'bg-purple-100 text-purple-800',
      'mental health': 'bg-indigo-100 text-indigo-800',
      'weight management': 'bg-red-100 text-red-800',
    };
    
    return categories[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (error && !program) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <Link to="/program-management" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Program Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/program-management" 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
        >
          <ArrowLeft className="mr-1" size={18} />
          <span>Back to Program Management</span>
        </Link>

        {/* Program Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-24"></div>
          <div className="px-6 py-5 relative">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(program.category)} mr-3`}>
                    {program.category}
                  </span>
                  <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(program.status)}`}>
                    {program.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mt-2">
                  {program.name}
                </h1>
                <p className="text-gray-600 mt-1 max-w-2xl">{program.description}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition duration-200"
                >
                  <Edit2 className="mr-2" size={16} />
                  Edit Program
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 h-10 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg flex items-center transition duration-200"
                >
                  <Trash2 className="mr-2" size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Program Details */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2 text-blue-500" size={20} />
            Program Details
          </h2>
          <div className="space-y-5">
            <div className="flex items-start">
              <Tag className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(program.category)}`}>
                  {program.category}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900 font-medium">{program.duration} days</p>
              </div>
            </div>
            <div className="flex items-start">
              <Activity className="text-gray-400 mr-3 mt-1" size={18} />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}>
                  {program.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-blue-500" size={20} />
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-blue-800 mt-1">{clients.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Duration</p>
              <p className="text-3xl font-bold text-green-800 mt-1">{program.duration}</p>
              <p className="text-xs text-green-600">days</p>
            </div>
          </div>
          <div className="mt-4 flex items-start">
            <Calendar className="text-gray-400 mr-3 mt-1" size={18} />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900 font-medium">{formatDate(program.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center">
              <Users className="mr-2" size={16} />
              Add New Client
            </button>
            <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 flex items-center justify-center">
              <FileText className="mr-2" size={16} />
              Generate Report
            </button>
            <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200 flex items-center justify-center">
              <Activity className="mr-2" size={16} />
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="mr-2 text-blue-500" size={20} />
            Enrolled Clients ({clients.length})
          </h2>
          {clients.length > 0 && (
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition duration-200">
                Search
              </button>
            </div>
          )}
        </div>
        {clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm mr-3">
                          {getInitials(client.first_name, client.last_name)}
                        </div>
                        <div>
                          <Link 
                            to={`/client/${client.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {client.first_name} {client.last_name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{client.email}</p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <Link 
                        to={`/client/${client.id}`}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition duration-200"
                      >
                        View
                      </Link>
                      <button className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition duration-200">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">No clients enrolled</h3>
            <p className="text-gray-500 mb-4">There are no clients enrolled in this program yet.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
              Add Client
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
  <>
    <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Rest of your edit modal content remains the same */}
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold text-gray-800">Edit Program</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
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
      
        {/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
  <>
    <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-50">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Confirm Deletion</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete the program "{program.name}"? This will also unenroll all {clients.length} clients.
          </p>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Program
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
      )}
    </div>
  );
};

export default ProgramDetail;