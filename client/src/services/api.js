import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("trrip_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("trrip_token");
      localStorage.removeItem("trrip_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Upload
export const uploadFiles = (formData, onProgress) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

// Itineraries
export const getMyItineraries = () => API.get("/itinerary");
export const getItinerary = (id) => API.get(`/itinerary/${id}`);
export const getItineraryStatus = (id) => API.get(`/itinerary/${id}/status`);
export const toggleShare = (id) => API.patch(`/itinerary/${id}/share`);
export const deleteItinerary = (id) => API.delete(`/itinerary/${id}`);
export const getSharedItinerary = (token) =>
  API.get(`/itinerary/shared/${token}`);

export default API;
