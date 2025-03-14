import { getImageUrl, fetchNearbyRestaurants } from "../googlePlacesService";

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      googleMapsApiKey: "fake-google-api-key", 
    },
  },
}));

global.fetch = jest.fn() as jest.Mock<Promise<Response>>;

describe("getImageUrl", () => {
  it("should generate the correct image URL", () => {
    const photoReference = "samplePhotoReference";
    const expectedUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=fake-google-api-key`;

    const result = getImageUrl(photoReference);
    expect(result).toBe(expectedUrl);
  });
});

describe("fetchNearbyRestaurants", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("should fetch nearby restaurants and return an array of places", async () => {

    const mockResponse = {
      results: [
        {
          place_id: "123",
          name: "Restaurant 1",
          geometry: {
            location: {
              lat: 10.0,
              lng: 20.0,
            },
          },
          vicinity: "123 Street, City",
          rating: 4.5,
          photos: [
            {
              height: 400,
              width: 400,
              photo_reference: "photoReference1",
            },
          ],
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const userLocation = { latitude: 10.0, longitude: 20.0 };
    const result = await fetchNearbyRestaurants(userLocation);

    expect(result).toHaveLength(1);
    expect(result[0].place_id).toBe("123");
    expect(result[0].name).toBe("Restaurant 1");
    expect(result[0].geometry.location.lat).toBe(10.0);
    expect(result[0].geometry.location.lng).toBe(20.0);
    expect(result[0].rating).toBe(4.5);
    expect(result[0].photos?.[0]?.imageUrl).toBe(
        "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=photoReference1&key=fake-google-api-key"
      );      
  });

  it("should return an empty array when no results are found", async () => {
    const mockResponse = { results: [] };
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const userLocation = { latitude: 10.0, longitude: 20.0 };
    const result = await fetchNearbyRestaurants(userLocation);

    expect(result).toHaveLength(0);
  });

  it("should return an empty array when fetch fails", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    const userLocation = { latitude: 10.0, longitude: 20.0 };
    const result = await fetchNearbyRestaurants(userLocation);

    expect(result).toEqual([]);
  });
});