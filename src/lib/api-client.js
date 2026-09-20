import axios from "axios";

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? decodeURIComponent(match[2]) : null;
      };
      const token =
        getCookie("better-auth.session_token") ||
        getCookie("__Secure-better-auth.session_token") ||
        getCookie("better_auth.session_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`[CLIENT API DEBUG Request] ${config.method?.toUpperCase()} ${config.url}`, {
        hasTokenInHeader: Boolean(config.headers.Authorization),
        params: config.params,
      });
    }
    return config;
  },
  (error) => {
    console.error("[CLIENT API DEBUG Request Error]:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[CLIENT API DEBUG Response] ${response.status} ${response.config.url}`, {
      dataSuccess: response.data?.success,
      itemCount: Array.isArray(response.data?.data) ? response.data.data.length : undefined,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.message || error.message;

    console.error(`[CLIENT API DEBUG Error] ${status || "NETWORK_ERR"} ${url}:`, {
      message,
      responseData: error.response?.data,
    });

    if (status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
        console.warn("[CLIENT API DEBUG 401 Unauthorized] Session invalid, redirecting to /admin/login...");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
