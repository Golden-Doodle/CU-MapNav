import Constants from "expo-constants";
import { GooglePlace } from "../../utils/types";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getImageUrl = (photoReference: string): string => {
  const baseUrl = "https://maps.googleapis.com/maps/api/place/photo";
  const maxWidth = 400;
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
  return `${baseUrl}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
};

export const fetchNearbyPlaces = async (
  userLocation: Coordinates,
  placeType: "restaurant" | "cafe" | "washroom"
): Promise<GooglePlace[]> => {
  try {
    const { latitude, longitude } = userLocation;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=${placeType}&key=${Constants.expoConfig?.extra?.googleMapsApiKey}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.results) {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        },
        vicinity: place.vicinity,
        rating: place.rating,
        photos: place.photos?.map((photo: any) => ({
          height: photo.height,
          width: photo.width,
          photo_reference: photo.photo_reference,
          imageUrl: getImageUrl(photo.photo_reference),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching nearby places: ", error);
    return [];
  }
};