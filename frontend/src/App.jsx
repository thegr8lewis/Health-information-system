import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DocterRoutes from "./routes/DocterRoute";
import Login from "./pages/login";
import Forgotpassward from "./pages/Forgetpassword";


function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<Forgotpassward />} />
        <Route path="*" element={<DocterRoutes />} />

      </Routes>
    </Router>
  );
}

export default App;

