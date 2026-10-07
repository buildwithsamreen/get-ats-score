import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

export const errorMessage = (e, fallback) =>
  e?.response?.data?.message || (e?.request && !e?.response ? 'Cannot reach the server. Is it running?' : fallback)
