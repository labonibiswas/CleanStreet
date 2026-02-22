import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // This matches your backend route prefix
});

export default API;