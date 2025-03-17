const API_BASE_URL = "http://localhost:5000/api";

export interface Person {
  id?: number;
  name: string;
  birth_date?: string;
  // Add other person fields as needed
}

export interface Photo {
  id?: number;
  filename: string;
  description?: string;
  upload_date?: string;
}

export const api = {
  async getPhotos() {
    const response = await fetch(`${API_BASE_URL}/photos`);
    const data = await response.json();
    return data.data;
  },

  async uploadPhoto(file: File, description: string) {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("description", description);

    const response = await fetch(`${API_BASE_URL}/photos`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  async getPersons() {
    const response = await fetch(`${API_BASE_URL}/persons`);
    const data = await response.json();
    return data.data;
  },

  async createPerson(person: Person) {
    const response = await fetch(`${API_BASE_URL}/persons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    });
    return response.json();
  },
};
