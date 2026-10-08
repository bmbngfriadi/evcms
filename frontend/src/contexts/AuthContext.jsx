import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await axios.post('/evcms/api/auth/login', { email, password });
        if (response.data.success) {
            const { token, user } = response.data;
            Cookies.set('token', token, { expires: 1 });
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const hasPermission = (permission) => {
        return user?.permissions?.includes(permission) || user?.role === 'Administrator';
    };

    const updateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
