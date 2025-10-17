import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import axios from 'axios';
import { refreshToken } from "@/service/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Helper
export const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { 
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
}).format(amount);

export const formatNumber = (
  value?: number | null,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  if (value == null) return "0"
  return new Intl.NumberFormat('id-ID', {
    ...options,
  }).format(value);
};

export const parseIndonesianNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const stringValue = String(value);
  const withoutThousandSeparators = stringValue.replace(/\./g, '');
  const standardFormat = withoutThousandSeparators.replace(',', '.');
  return Number(standardFormat);
};

export const capitalize = (value: string) => {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const formatDate = (dateInput: Date | string | number): string => {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

// Network Helper
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      originalRequest.url !== '/v1/auth/refresh' &&
      originalRequest.url !== '/v1/auth/login'
    ) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);