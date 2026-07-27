import axios, { AxiosRequestConfig } from "axios";
import { getToken, saveToken, deleteToken } from "@/helpers";
import { base_url } from "@/constants/config";
import { AUTH } from "@/constants/apiRoutes";

const axiosInstance = axios.create({ baseURL: base_url });

const handleLogout = async () => {
  await Promise.all([
    deleteToken("accessToken"),
    deleteToken("refreshToken"),
  ]);
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname + window.location.search;
    window.location.href = `/login?from=${encodeURIComponent(pathname)}`;
  }
};

// Request interceptor — attaches Bearer token to all non-public requests
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getToken("accessToken");
  const publicEndpoints = [AUTH.login, AUTH.resetPassword, AUTH.confirmReset];
  const isPublic = publicEndpoints.some((ep) => config.url?.includes(ep));

  if (!isPublic && token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handles 401 with silent token refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getToken("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(AUTH.refreshToken, {
          refresh: refreshToken,
        });
        await saveToken("accessToken", data.access);
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch {
        await handleLogout();
      }
    }
    return Promise.reject(error);
  },
);

type Params = Record<string, unknown> | object;

const request = async <T>(
  method: AxiosRequestConfig["method"],
  url: string,
  body?: unknown,
  params?: Params,
  responseType: AxiosRequestConfig["responseType"] = "json",
): Promise<T> => {
  const res = await axiosInstance.request<T>({
    url,
    method,
    data: body,
    params,
    responseType,
  });
  return res.data;
};

export const api = {
  get: <T>(url: string, params?: Params) =>
    request<T>("GET", url, undefined, params),

  post: <T>(url: string, body?: unknown, params?: Params) =>
    request<T>("POST", url, body, params),

  put: <T>(url: string, body?: unknown, params?: Params) =>
    request<T>("PUT", url, body, params),

  patch: <T>(url: string, body?: unknown, params?: Params) =>
    request<T>("PATCH", url, body, params),

  delete: <T>(url: string, body?: unknown, params?: Params) =>
    request<T>("DELETE", url, body, params),

  getBlob: (url: string, params?: Params) =>
    request<Blob>("GET", url, undefined, params, "blob"),
};
