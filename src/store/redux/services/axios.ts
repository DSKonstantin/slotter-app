import Axios from "axios";

const API_BASE_URL: string = "https://api.chucknorris.io";
const axios = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axios;
