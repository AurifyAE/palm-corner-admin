import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LayoutDashboard, LineChart, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Optimized logout handler
  const handleLogout = async (e) => {
    e.preventDefault();

    await toast.promise(
      new Promise((resolve) => {
        // Clear authentication data
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        setTimeout(() => {
          resolve();
          navigate("/login", { replace: true });
        }, 1000);
      }),
      {
        loading: "Logging out...",
        success: "Logged out successfully!",
        error: "Logout failed",
      }
    );
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col p-5 h-screen">
      {/* Logo Section */}
      <div className="flex items-center gap-3 -mt-14">
        <img src={logo} alt="Aurify Logo" className="h-40" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-3 -mt-10">
        <SidebarItem
          icon={
            <LayoutDashboard
              strokeWidth={1.5}
              size={22}
              className="text-white"
            />
          }
          text="Category Management"
          to="/category-management"
          active={location.pathname === "/category-management"}
        />
        <SidebarItem
          icon={
            <LineChart strokeWidth={1.5} size={22} className="text-white" />
          }
          text="Product Management"
          to="/product-management"
          active={location.pathname === "/product-management"}
        />
      </nav>

      {/* Logout Section */}
      <div className="mt-auto">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-xl cursor-pointer transition-all
                        text-slate-700 hover:bg-slate-100"
        >
          <div className="flex items-center justify-center bg-gradient-to-r from-[#156AEF] to-[#32B4DB] p-2 rounded-md">
            <LogOut strokeWidth={1.5} size={22} className="text-white" />
          </div>
          <span className="font-medium">Log Out</span>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

const SidebarItem = ({ icon, text, to, active }) => {
  return (
    <Link to={to} className="no-underline">
      <div
        className={`flex relative items-center gap-3 p-3 w-64 rounded-xl cursor-pointer transition-all
                    ${
                      active
                        ? "bg-white text-[#1A3C70] font-bold shadow-lg shadow-[rgba(21,106,239,0.2)]"
                        : "text-[#737272] hover:bg-slate-100"
                    }`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-1 rounded-r-md 
                    ${
                      active
                        ? "bg-gradient-to-r from-[#156AEF] to-[#32B4DB]"
                        : ""
                    }`}
        ></div>
        <div className="flex items-center justify-center bg-gradient-to-r from-[#156AEF] to-[#32B4DB] p-2 rounded-md">
          {icon}
        </div>
        <span>{text}</span>
      </div>
    </Link>
  );
};

export default Sidebar;
