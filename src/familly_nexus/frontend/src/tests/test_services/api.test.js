import { fetchPhotos, fetchPerson } from "../../services/api";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

beforeEach(() => {
  fetch.mockClear();
});

test("fetchPhotos calls the correct API endpoint", async () => {
  await fetchPhotos();
  expect(fetch).toHaveBeenCalledWith("/api/photos");
});

test("fetchPerson calls the correct API endpoint", async () => {
  const personId = 1;
  await fetchPerson(personId);
  expect(fetch).toHaveBeenCalledWith(`/api/persons/${personId}`);
});
