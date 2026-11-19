import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    const text = sessionStorage.getItem("user");
    return text ? JSON.parse(text) : null;
  } catch (error) {
    return null;
  }
}

export function getHomePath(role) {
  return role === "OWNER" ? "/owner" : "/customer";
}

function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [user, setUser] = useState(readSavedUser());

  function login(newToken, newUser) {
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const value = {
    user: user,
    token: token,
    role: user ? user.role : null,

    timeZone: getDeviceTimeZone() || (user ? user.timeZone : null) || "UTC",
    isLoggedIn: Boolean(token && user),
    login: login,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
