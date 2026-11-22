
import axios from "axios";

const api = axios.create({                                 /**  creates a reusable API connection */
    baseURL: process.env.NEXT_PUBLIC_API_URL,              /** this tells the client where the Express server lives. */
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;



