import axios from 'axios';

// Create an Axios instance with a base URL
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // You can add default headers or other configuration details here
});

export const axiosClientPDF = axios.create({
  baseURL: import.meta.env.VITE_PDF_URL,
  // You can add default headers or other configuration details here
});

export default axiosClient;
