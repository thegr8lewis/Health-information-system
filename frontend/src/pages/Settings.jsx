

import { useState, useEffect } from "react";
import { User, Lock, Mail, Check, Eye, EyeOff, Save, ArrowRight, ChevronRight } from "lucide-react";
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

  // Fetch user data on component mount
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

    // Validate passwords match if changing password
    if (activeSection === "security" && formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare the data to send based on active section
      const payload = activeSection === "profile" 
        ? { username: formData.username, email: formData.email }
        : { 
            current_password: formData.currentPassword,
            new_password: formData.newPassword 
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
      
      // Clear form if password was changed
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {successMessage && (
          <div className="mb-6 bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 p-4 rounded-xl flex items-center text-emerald-300 transform transition-all duration-300 animate-fade-in">
            <Check className="mr-2 h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 bg-red-900/40 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl flex items-center text-red-300 transform transition-all duration-300 animate-fade-in">
            <span>{errorMessage}</span>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-gray-700">
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your profile and security preferences</p>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 bg-gray-800/50 lg:border-r border-gray-700">
              <nav className="p-4">
                <button 
                  onClick={() => setActiveSection("profile")}
                  className={`flex items-center justify-between w-full p-3 rounded-xl text-left mb-2 transition-all duration-200 ${
                    activeSection === "profile" 
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-400" 
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                  }`}>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setActiveSection("security")}
                  className={`flex items-center justify-between w-full p-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === "security" 
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-400" 
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                  }`}>
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-3" />
                    <span>Security</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeSection === "profile" && (
                  <>
                    <div className="mb-8 flex justify-center">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {formData.username.substring(0, 2).toUpperCase()}
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200">
                          <User className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Username Section */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-focus-within:text-blue-400">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="pl-12 block w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3.5 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-gray-700 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Email Section */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-focus-within:text-blue-400">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-12 block w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3.5 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-gray-700 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeSection === "security" && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-2">Password Settings</h2>
                      <p className="text-gray-400 text-sm">Update your password to keep your account secure</p>
                    </div>
                    
                    {/* Current Password */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-focus-within:text-blue-400">Current Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="pl-12 block w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3.5 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-gray-700 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-focus-within:text-blue-400">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="pl-12 block w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3.5 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-gray-700 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-focus-within:text-blue-400">Confirm New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-12 block w-full rounded-xl border border-gray-600 bg-gray-700/50 py-3.5 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:bg-gray-700 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center justify-center ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Save Changes
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-gray-500 text-center text-sm">
          Version 2.0 • Last updated April 2025
        </div>
      </div>
    </div>
  );
}