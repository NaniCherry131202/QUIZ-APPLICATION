import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-3xl font-bold">
      Welcome to Quiz App Dashboard 🎉
    </div>
  );
};

export default Dashboard;
