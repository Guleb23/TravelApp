import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../Context/AuthContext'

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Outlet />;
    }

    // Если пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" />;
};

export default PrivateRoute;