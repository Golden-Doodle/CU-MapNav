import { GoogleCalendarEvent } from "@/app/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOOGLE_CALENDAR_API_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";


// Fetch Google Calendar events, but only for the next 24 hours
const fetchGoogleCalendarEvents24HoursMax = async (
  calendarId: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    if (!calendarId || calendarId === "") {
      throw new Error("No calendar ID provided.");
    }

    const accessToken = await AsyncStorage.getItem("googleAccessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please sign in again.");
    }

    const now = new Date();
    const oneDayLater = new Date();
    oneDayLater.setDate(now.getDate() + 1); // Get the date one day from now

    // Format the dates as ISO strings
    const timeMin = now.toISOString();
    const timeMax = oneDayLater.toISOString();

    // Make the API request to fetch events within the next 24 hours
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching events from Google Calendar.");
    }

    const data = await response.json();
    // console.log("Google Calendar Data:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Google Calendar Fetch Error:", error);
    return [];
  }
}


// Fetch Google Calendar events, but only for the next 7 days
const fetchGoogleCalendarEvents7SevenDaysMax = async (
  calendarId: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    if (!calendarId || calendarId === "") {
      throw new Error("No calendar ID provided.");
    }

    const accessToken = await AsyncStorage.getItem("googleAccessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please sign in again.");
    }

    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7); // Get the date one week from now

    // Format the dates as ISO strings
    const timeMin = now.toISOString();
    const timeMax = oneWeekLater.toISOString();

    // Make the API request to fetch events within the next week
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching events from Google Calendar.");
    }

    const data = await response.json();
    // console.log("Google Calendar Data:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Google Calendar Fetch Error:", error);
    return [];
  }
};

const fetchGoogleCalendarEvents = async (
  calendarId: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    if (!calendarId || calendarId === "") {
      throw new Error("No calendar ID provided.");
    }

    const accessToken = await AsyncStorage.getItem("googleAccessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please sign in again.");
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=10&orderBy=startTime&singleEvents=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching events from Google Calendar.");
    }

    const data = await response.json();
    // console.log("Google Calendar Data:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Google Calendar Fetch Error:", error);
    return [];
  }
};

const fetchAllCalendars = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("googleAccessToken");

    if (!accessToken) {
      throw new Error("No Google access token found. Please sign in again.");
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching calendars");
    }

    const data = await response.json();
    return data.items || []; // List of all calendars (including primary, shared, etc.)
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return [];
  }
};



export const fetchSameDayCalendarEvents = async () => {
  const storedCalendarID = await AsyncStorage.getItem("concordiaCalendarID");
  var concordiaCalendarID: string;

  if (
    !storedCalendarID ||
    storedCalendarID === "" ||
    storedCalendarID === null ||
    storedCalendarID === undefined
  ) {
    const allCalendars = await fetchAllCalendars();
    // Find the Concordia calendar ID
    const concordiaCalendar = allCalendars.find((calendar: any) => {
      return calendar.summary === "Concordia_Class_Schedule";
    });

    if (!concordiaCalendar) {
      throw new Error("Concordia calendar not found.");
    }
    concordiaCalendarID = concordiaCalendar.id;
    await AsyncStorage.setItem("concordiaCalendarID", concordiaCalendarID);
    return fetchGoogleCalendarEvents24HoursMax(concordiaCalendarID);
  }

  return fetchGoogleCalendarEvents24HoursMax(storedCalendarID);
};


export const fetchCalendarEvents = async () => {
  const storedCalendarID = await AsyncStorage.getItem("concordiaCalendarID");
  var concordiaCalendarID: string;

  if (
    !storedCalendarID ||
    storedCalendarID === "" ||
    storedCalendarID === null ||
    storedCalendarID === undefined
  ) {
    const allCalendars = await fetchAllCalendars();
    // Find the Concordia calendar ID
    const concordiaCalendar = allCalendars.find((calendar: any) => {
      return calendar.summary === "Concordia_Class_Schedule";
    });

    if (!concordiaCalendar) {
      throw new Error("Concordia calendar not found.");
    }
    concordiaCalendarID = concordiaCalendar.id;
    await AsyncStorage.setItem("concordiaCalendarID", concordiaCalendarID);
    return fetchGoogleCalendarEvents7SevenDaysMax(concordiaCalendarID);
  }

  return fetchGoogleCalendarEvents7SevenDaysMax(storedCalendarID);
};
