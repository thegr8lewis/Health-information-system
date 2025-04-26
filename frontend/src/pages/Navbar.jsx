import { useState, useEffect } from "react";
import { Bell, ChevronDown } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const notifications = [
    { id: 1, text: "New client registered", time: "2 minutes ago", read: false },
    { id: 2, text: "Program update: Weight Management", time: "1 hour ago", read: false },
    { id: 3, text: "Meeting reminder: Staff update at 3PM", time: "3 hours ago", read: true }
  ];

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
      <nav className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
      <div className="flex-1"></div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-6 w-6 text-gray-600" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50">
              <div className="p-3 border-b">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <p className="text-sm font-medium">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              <div className="p-2 text-center border-t">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {admin.avatar ? (
            <img 
              src={admin.avatar} 
              alt="Admin avatar" 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
              {getInitials(admin.name)}
            </div>
          )}
          <div className="hidden md:block">
            <p className="font-medium text-sm">{admin.name}</p>
            <p className="text-xs text-gray-500">{admin.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;