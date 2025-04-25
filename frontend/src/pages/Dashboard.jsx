import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  CalendarPlus, 
  FileEdit, 
  ChevronRight, 
  Users, 
  Calendar, 
  TrendingUp,
  Activity
} from "lucide-react";

const Dashboard = () => {
  // Mock data
  const stats = [
    { title: "Total Clients", value: 458, icon: Users, color: "bg-blue-500" },
    { title: "Active Programs", value: 27, icon: Calendar, color: "bg-green-500" },
    { title: "Program Completions", value: 189, icon: TrendingUp, color: "bg-purple-500" },
    { title: "Avg. Client Satisfaction", value: "4.8/5", icon: Activity, color: "bg-amber-500" }
  ];
  
  const recentClients = [
    { id: 1, name: "Emma Thompson", age: 34, program: "Weight Management", date: "Today" },
    { id: 2, name: "John Baker", age: 45, program: "Heart Health", date: "Yesterday" },
    { id: 3, name: "Mia Chen", age: 29, program: "Stress Relief", date: "Apr 22, 2025" }
  ];

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Clients</h2>
          <Link to="/client-management" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Program</th>
                <th className="pb-3">Added</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 rounded-full h-8 w-8 flex items-center justify-center">
                        <span className="font-medium text-indigo-700">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td>{client.age}</td>
                  <td>{client.program}</td>
                  <td>{client.date}</td>
                  <td>
                    <Link 
                      to={`/client?id=${client.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;