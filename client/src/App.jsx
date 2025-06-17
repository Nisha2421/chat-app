import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useAuthContext } from "./context/authContext";

const Home = lazy(() => import("./pages/HomePage"));
const Login = lazy(() => import("./pages/LoginPage"));
const Profile = lazy(() => import("./pages/ProfilePage"));

const App = () => {
  const {authUser} = useAuthContext()
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <ToastContainer />
      <Routes>
        <Route path="/" element={authUser? <Home />: <Navigate  to="/login"/>} />
        <Route path="/login" element={!authUser? <Login />: <Navigate to="/"/>} />
        <Route path="/profile" element={authUser? <Profile />: <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
