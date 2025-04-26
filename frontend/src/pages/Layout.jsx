import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Login from "./login";

const Layout = ({ children }) => {
  return (
    
    <div className="flex h-screen bg-gray-50">
      
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;