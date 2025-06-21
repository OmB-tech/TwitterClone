import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUserAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
