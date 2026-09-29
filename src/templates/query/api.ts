import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { base_url } from "@/constants/config";
import { AUTH } from "@/constants/apiRoutes";
// For IndexedDB token storage, uncomment this import and the marked blocks below.
// import { deleteToken, getToken, saveToken } from "@/helpers";

const axiosInstance = axios.create({
  baseURL: base_url,
  withCredentials: true,
});

const handleLogout = () => {
  // TODO: This just navigates, perform logout cleanup (e.g., clearing tokens) if using IndexedDB token storage.
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname + window.location.search;
    window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  }
};

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;

//TODO:  Cookie auth is the default, so requests rely on `withCredentials` instead of
// an Authorization header. To use IndexedDB token storage, uncomment this block.

// axiosInstance.interceptors.request.use(async (config) => {
//   const token = await getToken("accessToken");
//   const publicEndpoints = [AUTH.login, AUTH.resetPassword, AUTH.confirmReset];
//   const isPublic = publicEndpoints.some((endpoint) =>
//     config.url?.includes(endpoint),
//   );
//
//   if (!isPublic && token) {
//     config.headers = config.headers ?? {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//
//   return config;
// });

// Response interceptor — handles a single 401 retry after refreshing cookies.
// The refresh endpoint accepts the refresh token in either the body or a
// credentialed cookie. This template uses the cookie path, so the body is
// intentionally empty and the backend reads the HttpOnly refreshToken cookie.
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= axios
        .post(AUTH.refreshToken, undefined, { withCredentials: true })
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });

      await refreshPromise;
      return axiosInstance(originalRequest);
    } catch {
      handleLogout();
      return Promise.reject(error);
    }
  },
);

//TODO: For IndexedDB token storage, comment out the cookie interceptor above and
// uncomment this interceptor. It sends refreshToken in the body and stores the
// replacement access token locally instead of relying on Set-Cookie responses.
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config as RetriableRequest | undefined;
//     if (
//       error.response?.status !== 401 ||
//       !originalRequest ||
//       originalRequest._retry
//     ) {
//       return Promise.reject(error);
//     }
//
//     originalRequest._retry = true;
//     try {
//       const refreshToken = await getToken("refreshToken");
//       if (!refreshToken) throw new Error("No refresh token");
//
//       const { data } = await axios.post(AUTH.refreshToken, {
//         refresh: refreshToken,
//       });
//       await saveToken("accessToken", data.access);
//       originalRequest.headers.Authorization = `Bearer ${data.access}`;
//       return axiosInstance(originalRequest);
//     } catch {
//       await Promise.all([deleteToken("accessToken"), deleteToken("refreshToken")]);
//       handleLogout();
//       return Promise.reject(error);
//     }
//   },
// );

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
