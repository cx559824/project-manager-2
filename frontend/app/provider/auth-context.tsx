import type { User } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (data: { accessToken: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const isPublicRoute = publicRoutes.includes(currentPath);

  // 🔹 Load user from storage on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Try refreshing access token immediately
          const token = await refreshAccessToken();
          if (token) {
            setAccessToken(token);
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    if (!isPublicRoute) {
      navigate("/sign-in");
    }
  }, [navigate, isPublicRoute]);

  // 🔹 Refresh access token (calls backend /refresh endpoint)
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // 🔥 important: sends cookie
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh access token", error);
      return null;
    }
  }, []);

  // 🔹 Login
  const login = async (data: { accessToken: string; user: User }) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setAccessToken(data.accessToken);
    setIsAuthenticated(true);
  };

  // 🔹 Logout
  const logout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    queryClient.clear();

    // hit backend logout to clear cookie
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  };

  const values: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
