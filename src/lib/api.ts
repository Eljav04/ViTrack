/// <reference types="vite/client" />
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5286',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
