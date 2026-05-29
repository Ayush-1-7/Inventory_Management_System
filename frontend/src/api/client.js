/**
 * Axios client configured from VITE_API_URL.
 * Falls back to "" (same origin) so nginx can proxy /api in Docker.
 */
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

export default client;
