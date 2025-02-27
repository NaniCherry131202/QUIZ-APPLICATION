import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState} from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);

   // Empty dependency array since it’s only for mount
  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem("role", role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem("role");
  };

  // Define protected routes with their allowed roles
  const protectedRoutes = [
    { path: "/teacher", element: <TeacherDashboard />, allowedRoles: ["teacher"] },
    { path: "/student", element: <StudentDashboard />, allowedRoles: ["student"] },
    { path: "/admin", element: <AdminDashboard />, allowedRoles: ["admin"] },
    { path: "/leaderboard", element: <Leaderboard />, allowedRoles: ["student", "teacher", "admin"] }, // Accessible to all logged-in users
  ];

  return (
    <Router>
      <Navbar onLogout={handleLogout} userRole={userRole} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        {protectedRoutes.map(({ path, element, allowedRoles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={allowedRoles} userRole={userRole}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch-all route: Redirect to login if not authenticated */}
        <Route path="*" element={userRole ? <Navigate to={`/${userRole}`} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;