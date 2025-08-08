import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const SellerProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isSeller } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isSeller) {
      // Redirect non-sellers to their profile settings with a state to show a message
      return <Navigate to="/profile/settings" state={{ needsSellerUpgrade: true }} replace />;
  }

  return children;
};

export default SellerProtectedRoute;
