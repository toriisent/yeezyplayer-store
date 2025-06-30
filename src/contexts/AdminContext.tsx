
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAuthenticated: boolean;
  isAdminPanelOpen: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const login = (password: string): boolean => {
    if (password === 'yzydotcom') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminPanelOpen(false);
  };

  const openAdminPanel = () => {
    setIsAdminPanelOpen(true);
  };

  const closeAdminPanel = () => {
    setIsAdminPanelOpen(false);
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      isAdminPanelOpen,
      login,
      logout,
      openAdminPanel,
      closeAdminPanel
    }}>
      {children}
    </AdminContext.Provider>
  );
};
