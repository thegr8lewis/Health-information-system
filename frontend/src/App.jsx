import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DocterRoutes from "./routes/DocterRoute";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="*" element={<DocterRoutes />} />

      </Routes>
    </Router>
  );
}

export default App;

