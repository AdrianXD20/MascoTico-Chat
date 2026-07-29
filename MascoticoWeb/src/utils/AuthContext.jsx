import { createContext, useState, useEffect } from "react";
import axiosInstance from "./AxiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axiosInstance.post("/login", { email, password });

      if (!data.token || !data.usuario) {
        throw new Error("Respuesta de servidor inválida");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      setUser(data.usuario);
      return true;
    } catch (error) {
      console.error("Error en login:", error.response?.data?.message || error.message);
      return false;
    }
  };

  const register = async (nombre, apellido, email, password) => {
    try {
      const { data } = await axiosInstance.post("/register", { nombre, apellido, email, password });

      if (!data.token || !data.usuario) {
        throw new Error("Respuesta de servidor inválida");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario));
      setUser(data.usuario);
      return true;
    } catch (error) {
      console.error("Error en registro:", error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
