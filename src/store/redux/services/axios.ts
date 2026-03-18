import Axios from "axios";

const API_BASE_URL: string = "https://staging.slotter.app/api/v1/";

const axios = Axios.create({
  baseURL: API_BASE_URL,
});

export default axios;
