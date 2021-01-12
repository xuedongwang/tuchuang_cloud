import axios from 'axios';

const config = {
  baseURL: '//localhost:4000'
};

let http = axios.create(config);

http.interceptors.request.use(config => {
  return config;
}, error => {
  return Promise.reject(error);
});

http.interceptors.response.use(response => {
  return response.data;
}, error => {
  return Promise.reject(error);
});


export default http;