import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Adjust the base URL as needed

export const uploadPhoto = async (photoData: FormData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/photos`, photoData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

export const getPhotos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/photos`);
    return response.data;
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }
};

export const addPerson = async (personData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/persons`, personData);
    return response.data;
  } catch (error) {
    console.error("Error adding person:", error);
    throw error;
  }
};

export const getPersons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/persons`);
    return response.data;
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw error;
  }
};

export const getPersonDetails = async (personId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/persons/${personId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching person details:", error);
    throw error;
  }
};
