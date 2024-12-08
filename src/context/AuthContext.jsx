import React, { createContext, useContext, useState, useEffect } from "react";

// Create Context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null); // New state for userId

  // Simulating an authentication check (replace this with actual logic)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("userToken"); // Get token from localStorage
    const storedUserId = localStorage.getItem("userId"); // Get userId from localStorage

    if (storedUser && storedToken && storedUserId) {
      setUser(storedUser);
      setToken(storedToken); // Set token if available
      setUserId(storedUserId); // Set userId if available
    }
  }, []);

  const login = (user, token, userId) => {
    setUser(user);
    setToken(token);
    setUserId(userId); // Set userId on login
    localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
    localStorage.setItem("userToken", token); // Store token in localStorage
    localStorage.setItem("userId", userId); // Store userId in localStorage
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserId(null); // Reset userId on logout
    localStorage.removeItem("user"); // Remove user from localStorage
    localStorage.removeItem("userToken"); // Remove token from localStorage
    localStorage.removeItem("userId"); // Remove userId from localStorage
  };

  return (
    <AuthContext.Provider value={{ user, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
