import { Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";
import Login from "../pages/login"; 
import Dashboard from "../pages/Dashboard";
import Program from "../pages/Program";
import ProgramManagement from "../pages/ProgramManagement";
import ClientManagement from "../pages/ClientManagement";
import Client from "../pages/Client";
import Settings from "../pages/Settings";

const UserRoutes = () => {
  return (
    
    <Layout>
      <Routes>
        
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/program" element={<Program />} />
        <Route path="/program/:id" element={<Program />} />
        <Route path="/program-management" element={<ProgramManagement />} />
        <Route path="/client-management" element={<ClientManagement />} />
        <Route path="/client" element={<Client />} />
        <Route path="/client/:id" element={<Client/>} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};
export default UserRoutes;