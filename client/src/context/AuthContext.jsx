import {
  createContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { toast } from "sonner";

import authService from "../services/authService";

export const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      ) || null
    );

  const [loading, setLoading] =
    useState(true);

  /* ───────────────── API INSTANCE ───────────────── */

  const api = axios.create({
  baseURL:
    "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type":
      "application/json",
  },
});

  // Attach token automatically

  api.interceptors.request.use(
    (config) => {
      const savedToken =
        localStorage.getItem(
          "token"
        );

      if (savedToken) {

  console.log("TOKEN SENT =>", savedToken);

  config.headers.Authorization = `Bearer ${savedToken}`;
}

      return config;
    }
  );

  /* ───────────────── COMPUTED VALUES ───────────────── */

  const isAuthenticated = !!user;

  const role =
    user?.role || null;

  /* ───────────────── LOAD USER ───────────────── */

  useEffect(() => {
    const fetchUser =
      async () => {
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const res =
            await authService.getMe();

          console.log(
            "GET ME RESPONSE:",
            res
          );

          const userData =
            res.data?.data;

          if (!userData) {
            throw new Error(
              "User data not found"
            );
          }

          const fixedUser = {
            ...userData,
            role:
              userData.role?.toLowerCase(),
          };

          console.log(
            "FINAL USER:",
            fixedUser
          );

          setUser(fixedUser);

          localStorage.setItem(
            "user",
            JSON.stringify(
              fixedUser
            )
          );
        } catch (err) {
          console.error(
            "Auth check failed",
            err
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setToken(null);

          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    fetchUser();
  }, [token]);

  /* ───────────────── LOGIN ───────────────── */

  const login = async (
    email,
    password,
    loginRole
  ) => {
    try {
      const data =
        await authService.login(
          email,
          password,
          loginRole
        );

      const fixedUser = {
        ...data.user,
        role:
          data.user.role.toLowerCase(),
      };

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          fixedUser
        )
      );

      setToken(data.token);

      setUser(fixedUser);

      toast.success(
        "Logged in successfully!"
      );

      return fixedUser;
    } catch (err) {
      const msg =
        err.response?.data
          ?.message ||
        "Login failed";

      toast.error(msg);

      throw err;
    }
  };

  /* ───────────────── REGISTER ───────────────── */

  const register = async (
    userData
  ) => {
    try {
      const data =
        await authService.register(
          userData
        );

      const fixedUser = {
        ...data.user,
        role:
          data.user.role.toLowerCase(),
      };

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          fixedUser
        )
      );

      setToken(data.token);

      setUser(fixedUser);

      toast.success(
        "Registered successfully!"
      );

      return fixedUser;
    } catch (err) {
      const msg =
        err.response?.data
          ?.message ||
        "Registration failed";

      toast.error(msg);

      throw err;
    }
  };

  /* ───────────────── LOGOUT ───────────────── */

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      setToken(null);

      setUser(null);

      toast.info(
        "Logged out"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        api, // ✅ IMPORTANT FIX
        isAuthenticated,
        role,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};