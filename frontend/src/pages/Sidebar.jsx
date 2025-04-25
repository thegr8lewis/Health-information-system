import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  HeartPulse,
  Layout as LayoutIcon
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard"
    },
    {
      name: "Program Management",
      icon: Calendar,
      path: "/program-management"
    },
    {
      name: "Client Management",
      icon: Users,
      path: "/client-management"
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ];
  
  return (
    <div 
      className={`bg-indigo-900 text-white h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } flex flex-col`}
    >
      <div className="flex items-center p-4 border-b border-indigo-800">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <HeartPulse className="h-6 w-6 text-indigo-300" />
            <h1 className="font-bold text-xl">HealthCare</h1>
          </div>
        )}
        {collapsed && (
          <div className="flex-1 flex justify-center">
            <HeartPulse className="h-6 w-6 text-indigo-300" />
          </div>
        )}
        <button 
          className="p-1 rounded-full hover:bg-indigo-800 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-indigo-300" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-indigo-300" />
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 ${
                  location.pathname === item.path
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-300 hover:bg-indigo-800 hover:text-white"
                } transition-colors rounded-lg mx-2`}
              >
                <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-indigo-800">
        <button className={`flex items-center text-indigo-300 hover:text-white transition-colors ${
          collapsed ? "justify-center" : "px-4 py-2"
        } w-full rounded-lg hover:bg-indigo-800`}>
          <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;