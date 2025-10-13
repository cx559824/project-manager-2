import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 ensures cookies are sent
});

// --- Access token store (will be set from AuthContext) ---
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// --- Request interceptor: attach access token ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// --- Response interceptor: refresh token on 401 ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // force logout if refresh fails
        window.dispatchEvent(new Event("force-logout"));

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// --- Helper functions ---
const postData = async <T>(path: string, data: unknown): Promise<T> => {
  const response = await api.post(path, data);
  return response.data;
};

const fetchData = async <T>(path: string): Promise<T> => {
  const response = await api.get(path);
  return response.data;
};

const updateData = async <T>(path: string, data: unknown): Promise<T> => {
  const response = await api.put(path, data);
  return response.data;
};

const deleteData = async <T>(path: string): Promise<T> => {
  const response = await api.delete(path);
  return response.data;
};

export { postData, fetchData, updateData, deleteData };
