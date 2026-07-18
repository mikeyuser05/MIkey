import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext<any>(null);
export const AuthProvider: React.FC<any> = ({ children }) => {
const [u] = useState({ uid: 'usr_dev_production_v2', email: 'operator@noexcuse.ai', assignedDevices: ['PR1', 'PR2'], createdAt: Date.now() });
return <AuthContext.Provider value={{ user: u, isAuthenticated: true, isLoading: false, error: null, logout: async ()=>{} }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);