import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  CalendarPlus, 
  FileEdit, 
  ChevronRight, 
  Users, 
  Calendar, 
  TrendingUp,
  Activity,
  Search,
  X
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create axios instance with authorization header
  const api = axios.create({
    baseURL: "http://localhost:8000/api/",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [statsRes, clientsRes] = await Promise.all([
          api.get("dashboard/stats/"),
          api.get("clients/?ordering=-created_at&limit=5")
        ]);

        setStats([
          { title: "Total Clients", value: statsRes.data.total_clients, icon: Users, color: "bg-blue-500" },
          { title: "Active Programs", value: statsRes.data.active_programs, icon: Calendar, color: "bg-green-500" },
          { title: "Program Completions", value: statsRes.data.program_completions, icon: TrendingUp, color: "bg-purple-500" },
          { title: "Avg. Client Satisfaction", value: `${statsRes.data.avg_satisfaction}/5`, icon: Activity, color: "bg-amber-500" }
        ]);

        setRecentClients(clientsRes.data.map(client => ({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone: client.phone,
          age: calculateAge(client.date_of_birth),
          date_of_birth: client.date_of_birth,
          address: client.address,
          program_name: client.program?.name || client.program_name || "No Program",
          created_at: client.created_at
        })));

      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Handle unauthorized access
          setError("Session expired. Please login again.");
          // Optionally redirect to login page
          // navigate('/login');
        } else {
          setError("Failed to load dashboard data");
          console.error("Dashboard data error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Function to get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Generate a dynamic gradient color based on client name
  const getAvatarColor = (name) => {
    const colorOptions = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600', 
      'from-violet-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-amber-500 to-orange-600',
      'from-cyan-500 to-sky-600'
    ];
    
    // Simple hash function to get consistent colors for the same name
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorOptions[nameHash % colorOptions.length];
  };

  // Filter clients based on search term
  const filteredClients = recentClients.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.program_name && client.program_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
    <div className="space-y-6 px-2">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3">
          <Link 
            to="/client-management"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Client</span>
          </Link>
          <Link 
            to="/program-management"
            className="flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>New Program</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/client-management" 
            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg shadow-sm">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="font-medium">Add New Client</span>
            </div>
            <ChevronRight className="h-5 w-5 text-blue-500" />
          </Link>
          
          <Link 
            to="/program-management" 
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-lg shadow-sm">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <span className="font-medium">Create Program</span>
            </div>
            <ChevronRight className="h-5 w-5 text-green-500" />
          </Link>
          
          <Link 
            to="/client-management" 
            className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 text-white p-2 rounded-lg shadow-sm">
                <FileEdit className="h-5 w-5" />
              </div>
              <span className="font-medium">Assign Program</span>
            </div>
            <ChevronRight className="h-5 w-5 text-purple-500" />
          </Link>
        </div>
      </div>
      
      {/* Recent Clients */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold">Recent Clients</h2>
            <Link to="/client-management" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all
            </Link>
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-slate-100">
                <th className="pb-3 pl-2">Client</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Program</th>
                <th className="pb-3">Added</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-3 pl-2">
                      <Link to={`/client/${client.id}`} className="flex items-center group">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(`${client.first_name}${client.last_name}`)} flex items-center justify-center text-white font-medium mr-3 shadow-sm group-hover:shadow transition-all`}>
                          {getInitials(client.first_name, client.last_name)}
                        </div>
                        <span className="font-medium group-hover:text-indigo-600 transition-colors">
                          {client.first_name} {client.last_name}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="text-sm text-slate-900">{client.email}</div>
                      <div className="text-sm text-slate-500">{client.phone}</div>
                    </td>
                    <td>{client.age}</td>
                    <td>
                      {client.program_name && client.program_name !== "No Program" ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                          {client.program_name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-slate-100 text-slate-800">
                          No Program
                        </span>
                      )}
                    </td>
                    <td>{formatDate(client.created_at)}</td>
                    <td className="text-right">
                      <Link 
                        to={`/client/${client.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Search className="h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-base">No clients found.</p>
                      <p className="text-sm text-slate-400">Try adjusting your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;