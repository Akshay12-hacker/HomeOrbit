import axios from 'axios';
// Force refresh of environment variables
import { API_BASE_URL } from '@env';
const authApi = axios.create({
  baseURL: API_BASE_URL
});

export default authApi;