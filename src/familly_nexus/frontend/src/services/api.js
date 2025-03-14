export const fetchPhotos = async () => {
  const response = await fetch("/api/photos");
  return response.json();
};

export const fetchPerson = async (personId) => {
  const response = await fetch(`/api/persons/${personId}`);
  return response.json();
};
