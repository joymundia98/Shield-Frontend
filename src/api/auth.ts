import axios from "axios";
import { BASE_API_URL } from "../constants/api";

// ---------------------------
// Types
// ---------------------------
interface LoginData {
  email: string;
  password: string;
}

interface RegisterUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  role_id: number;
  organization_id: number;
  password: string;
}

interface RegisterOrgData {
  name: string;
  denomination: string;
  address: string;
  region: string;
  district: string;
  status?: "active" | "inactive";
}

// ---------------------------
// Auth API Functions
// ---------------------------

export const loginUser = async (data: LoginData) => {
  const res = await axios.post(`${BASE_API_URL}/auth/login`, data, {
    withCredentials: true
  });
  return res.data; // { token, user }
};

export const registerUser = async (data: RegisterUserData) => {
  const res = await axios.post(`${BASE_API_URL}/auth/register`, data, {
    withCredentials: true
  });
  return res.data; // { token, user }
};

// ---------------------------
// Organization API Function
// ---------------------------

export const registerOrganization = async (data: RegisterOrgData) => {
  const res = await axios.post(`${BASE_API_URL}/organizations/register`, data, {
    withCredentials: true // JWT cookie must be sent
  });
  return res.data; // newly created organization
};
