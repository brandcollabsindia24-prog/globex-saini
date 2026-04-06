"use client";

import { useEffect } from "react";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, getRoleFromToken, refreshAuthSession } from "../lib/authStorage";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function extractBearerToken(config: InternalAxiosRequestConfig): string | null {
  const headerValue = config.headers?.Authorization || config.headers?.authorization;
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export default function AuthRefreshBootstrap() {
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      config.withCredentials = true;
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryableRequestConfig | undefined;

        if (!config || config._retry || error.response?.status !== 401) {
          return Promise.reject(error);
        }

        const token = extractBearerToken(config);
        if (!token) {
          return Promise.reject(error);
        }

        const role = getRoleFromToken(token);
        if (!role) {
          return Promise.reject(error);
        }

        config._retry = true;

        const refreshed = await refreshAuthSession(role);
        if (!refreshed?.token) {
          clearAuthSession(role);
          return Promise.reject(error);
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${refreshed.token}`;

        return axios(config);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return null;
}
