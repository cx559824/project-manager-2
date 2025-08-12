import type { User } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";
import { toast } from "sonner";

export interface LoginResponse {
	token: string;
	user: User;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (data: LoginResponse) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const navigate = useNavigate();
	const currentPath = useLocation().pathname;
	const isPublicRoute = publicRoutes.includes(currentPath);

	const checkAuth = () => {
		setIsLoading(true);
		try {
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
				setUser(JSON.parse(storedUser));
				setIsAuthenticated(true);
			} else {
				setUser(null);
				setIsAuthenticated(false);
				if (!isPublicRoute) navigate("/sign-in", { replace: true });
			}
		} catch (error) {
			console.error("Auth check failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	const login = async (data: LoginResponse) => {
		localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.user));

		setUser(data.user);
		setIsAuthenticated(true);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setIsAuthenticated(false);
		queryClient.clear();

		navigate("/sign-in", { replace: true });
		toast.error("You have been logged out");
	};

	const values = useMemo(
		() => ({ user, isAuthenticated, isLoading, login, logout }),
		[user, isAuthenticated, isLoading],
	);

	return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
