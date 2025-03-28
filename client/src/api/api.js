import axios from "axios";
import {jwtDecode} from "jwt-decode";


const api=axios.create({
    baseURL:"https://dentist-appointment-booking-msij.onrender.com/api/",
    headers:{
        "Content-Type":"application/json"
    }
})


api.interceptors.request.use((config)=>{
    console.log("in interceptor")
    const token = localStorage.getItem("token");

    if(token){
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            window.location.href = "/login"; // Redirect to login
            return Promise.reject("Token expired");
          }
        config.headers.Authorization = `${token}`;

    }
    return config;

}, (error) =>{
    console.log(error)
    Promise.reject(error)
} )


api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error,"ss")
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  export default api;
