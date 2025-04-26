import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Replace with your actual admin endpoint
        const response = await axios.get("http://localhost:8000/api/auth/user/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const adminData = response.data;
        
        setAdmin({
          name: adminData.full_name || "Admin User",
          email: adminData.email,
          avatar: adminData.avatar || ""
        });
      } catch (err) {
        setError("Failed to load admin data");
        console.error("Error fetching admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "AU";
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    
    return initials;
  };

  if (isLoading) {
    return (
      <nav className="bg-gradient-to-r from-white to-gray-50 px-4 py-3 flex justify-between items-center relative">
        <div className="flex-1"></div>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 px-6 py-4 flex justify-between items-center relative">
      <div className="flex-1"></div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="group relative cursor-pointer">
            {admin.avatar ? (
              <img 
                src={admin.avatar} 
                alt="Admin avatar" 
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100 transition-all hover:ring-4"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium shadow-md transition-all hover:shadow-lg">
                {getInitials(admin.name)}
              </div>
            )}
            <div className="absolute top-12 right-0 hidden min-w-max rounded-md bg-white p-2 shadow-lg group-hover:block">
              <p className="whitespace-nowrap font-medium text-sm">{admin.name}</p>
              <p className="whitespace-nowrap text-xs text-gray-500">{admin.email}</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col">
            <p className="font-medium text-sm">{admin.name}</p>
            <p className="text-xs text-gray-500">{admin.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </nav>
  );
};

export default Navbar;