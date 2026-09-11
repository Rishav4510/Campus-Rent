import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cr_token"));
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        if (data.college) {
          setSelectedCollege(data.college);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
        localStorage.removeItem("cr_token");
        localStorage.removeItem("cr_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("cr_token", data.token);
    localStorage.setItem("cr_user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    if (data.college) {
      setSelectedCollege(data.college);
    }
    return data;
  };

  const register = async (signupData) => {
    const { data } = await api.post("/auth/register", signupData);
    localStorage.setItem("cr_token", data.token);
    localStorage.setItem("cr_user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    if (data.college) {
      setSelectedCollege(data.college);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("cr_token");
    localStorage.removeItem("cr_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put("/auth/me", profileData);
    setUser(data);
    localStorage.setItem("cr_user", JSON.stringify(data));
    if (data.college) {
      setSelectedCollege(data.college);
    }
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        selectedCollege,
        setSelectedCollege,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
