import axios from "axios";
export const serverURL = "http://localhost:3000";

const server = axios.create({
  baseURL: serverURL,
  withCredentials: true,
});

export default server;
