import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check local storage on load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you would validate this token with the backend here
      // For now, we decode or assume valid if present
      const mockUser = { id: 1, name: 'Inquisitor' }; 
      setUser(mockUser);
    }
  }, []);

  const login = (username, password) => {
    // Mock login - replace with actual API call to /api/login
    if (username && password) {
      const mockToken = 'mock-jwt-token';
      const mockUser = { id: 1, name: username };
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
