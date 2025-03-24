/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getFromLocalStorage } from "../localStorage";
// import { IAppResponseBase } from '~/baseTypes';
const baseURL = String(import.meta.env.VITE_BACKEND_URL);
const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
http.interceptors.request.use((config) => {
  if (getFromLocalStorage("accessToken") !== undefined && config.headers) {
    config.headers.Authorization = "Bearer " + String(getFromLocalStorage("accessToken"));
  }
  return config;
});
http.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // window.location.href = "/login";
    }
    return await Promise.reject(error);
  }
);
export default http;
