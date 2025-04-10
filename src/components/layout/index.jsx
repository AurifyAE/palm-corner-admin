// import React from "react";
// import Sidebar from "../Sidebar";
// import Header from "../Header";

// const Layout = ({ children }) => {

//   return (
//     <div className="flex">
//       <Sidebar />

//       <div className="flex-1">
//         {/* <Header /> */}

//         {/* Main Components */}
//         <div>{children}</div>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1  bg-gray-50">
        <Outlet /> 
        {/* This is where protected routes will render */}
      </div>
    </div>
  );
};

export default Layout;
