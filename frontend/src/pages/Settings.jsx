import { useState, useEffect } from "react";
import { User, Lock, Mail, Check, Eye, EyeOff, Save, ArrowRight, ChevronRight, Activity, Globe, Clock, Users, PlusCircle, UserPlus, List } from "lucide-react";
import axios from 'axios';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [adminLogs, setAdminLogs] = useState([]);
  const [isLoadingAdminLogs, setIsLoadingAdminLogs] = useState(false);

  const fetchAdminLogs = async () => {
    setIsLoadingAdminLogs(true);
    try {
      const response = await axios.get('http://localhost:8000/api/auth/admin/creation-logs/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAdminLogs(response.data);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    } finally {
      setIsLoadingAdminLogs(false);
    }
  };

  const handleAdminCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (adminFormData.password !== adminFormData.confirmPassword) {
      setErrorMessage("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/admin/create/',
        {
          username: adminFormData.username,
          email: adminFormData.email,
          password: adminFormData.password,
          confirm_password: adminFormData.confirmPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage(response.data.message || "Admin created successfully!");
      setAdminFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      
      fetchAdminLogs();
      
    } catch (error) {
      console.error("Admin creation error:", error);
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          setErrorMessage(
            Object.entries(errorData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
              .join('\n')
          );
        } else {
          setErrorMessage(errorData || "Failed to create admin");
        }
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/superuser/update/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setUserData(response.data);
        setFormData(prev => ({
          ...prev,
          username: response.data.username || "",
          email: response.data.email || ""
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeSection === "api-usage") {
      fetchAccessLogs();
    }
  }, [activeSection]);

  const fetchAccessLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await axios.get('http://localhost:8000/api/client-access-logs/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAccessLogs(response.data);
    } catch (error) {
      console.error("Error fetching access logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (activeSection === "security" && formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const payload = activeSection === "profile" 
        ? { username: formData.username, email: formData.email }
        : { 
            current_password: formData.currentPassword,
            password: formData.newPassword
          };

      const response = await axios.patch(
        'http://localhost:8000/api/auth/superuser/update/',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage(response.data.message || "Settings updated successfully!");
      
      if (activeSection === "security") {
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }

    } catch (error) {
      console.error("Update error:", error);
      if (error.response) {
        setErrorMessage(error.response.data.error || "Failed to update settings");
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 py-6 px-8">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-600">Manage your profile, security preferences, and API usage</p>
      </div>
      
      {/* Notifications */}
      {(successMessage || errorMessage) && (
        <div className="px-8 pt-4">
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded flex items-center text-green-800">
              <Check className="mr-2 h-5 w-5" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded flex items-center text-red-800">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <button 
              onClick={() => setActiveSection("profile")}
              className={`flex items-center justify-between w-full p-3 rounded text-left mb-2 ${
                activeSection === "profile" 
                  ? "bg-gray-100 font-medium text-black" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3" />
                <span>Profile</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setActiveSection("security")}
              className={`flex items-center justify-between w-full p-3 rounded text-left mb-2 ${
                activeSection === "security" 
                  ? "bg-gray-100 font-medium text-black" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-3" />
                <span>Security</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setActiveSection("api-usage")}
              className={`flex items-center justify-between w-full p-3 rounded text-left ${
                activeSection === "api-usage" 
                  ? "bg-gray-100 font-medium text-black" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-3" />
                <span>API Usage</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button 
              onClick={() => {
                setActiveSection("admin-management");
                fetchAdminLogs();
              }}
              className={`flex items-center justify-between w-full p-3 rounded text-left mb-2 ${
                activeSection === "admin-management" 
                  ? "bg-gray-100 font-medium text-black" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}>
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-3" />
                <span>Admin Management</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeSection !== "api-usage" && activeSection !== "admin-management" && (
            <form onSubmit={handleSubmit} className="max-w-2xl">
              {activeSection === "profile" && (
                <>
                  <div className="mb-8">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-black text-xl font-bold">
                        {formData.username.substring(0, 2).toUpperCase()}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 bg-gray-700 p-1.5 rounded-full">
                        <User className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === "security" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-medium text-gray-800 mb-1">Password Settings</h2>
                    <p className="text-gray-500 text-sm">Update your password to keep your account secure</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeSection === "admin-management" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-800 mb-1">Admin Management</h2>
                <p className="text-gray-500 text-sm">Create new admin users and view creation history</p>
              </div>
              
              <form onSubmit={handleAdminCreate} className="max-w-2xl mb-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={adminFormData.username}
                      onChange={(e) => setAdminFormData({...adminFormData, username: e.target.value})}
                      className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                      className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                      className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={adminFormData.confirmPassword}
                      onChange={(e) => setAdminFormData({...adminFormData, confirmPassword: e.target.value})}
                      className="pl-10 block w-full rounded border border-gray-300 bg-white py-2 text-black shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Admin
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="bg-white border border-gray-200 rounded">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <List className="h-5 w-5 mr-2" />
                    Admin Creation History
                  </h3>
                </div>
                
                {isLoadingAdminLogs ? (
                  <div className="p-8 flex justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : adminLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No admin creation logs found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Admin</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.creator_username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.new_admin_username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeSection === "api-usage" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-800 mb-1">External API Usage</h2>
                <p className="text-gray-500 text-sm">Track access to client data through the external API</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium text-gray-700">Total Accesses</h3>
                  </div>
                  <p className="text-2xl font-bold">{accessLogs.length}</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded p-4">
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium text-gray-700">Unique Locations</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {new Set(accessLogs.map(log => log.location)).size}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-medium text-gray-700">Last Access</h3>
                  </div>
                  <p className="text-lg font-bold">
                    {accessLogs.length > 0 ? formatDate(accessLogs[0].access_time) : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">Recent API Access Logs</h3>
                </div>
                
                {isLoadingLogs ? (
                  <div className="p-8 flex justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : accessLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No access logs found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accessLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.client_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.accessor_email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.access_time)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 text-gray-400 mr-1" />
                                {log.location}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  API Access Information
                </h4>
                <p className="text-sm text-blue-800">
                  The external client API endpoint is accessible at: 
                  <code className="bg-blue-100 px-2 py-0.5 rounded ml-2 font-mono">
                    /api/external/clients/&#123;client_id&#125;/
                  </code>
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  All API access is logged with IP address and location information for security purposes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}