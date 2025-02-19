import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">Quiz App</h1>
      <div>
        <Link to="/teacher" className="mr-4">Teacher</Link>
        <Link to="/student" className="mr-4">Student</Link>
        <Link to="/leaderboard" className="mr-4">LeaderBoard</Link>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-2 rounded">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
