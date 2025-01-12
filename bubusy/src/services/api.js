import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Backend URL (update for production)

export const fetchDensityData = async () => {
  try {
    const response = await axios.post(`${API_URL}/predict`);
    return response.data; // This will return the data from the backend
  } catch (error) {
    console.error('Error fetching density data:', error);
    throw error;
  }
};
