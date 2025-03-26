import { GoogleCalendarEvent } from "@/app/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken } from "../GoogleSignin/accessToken";

const fetchAllCalendars = async () => {
  try {
    const accessToken = await getAccessToken();

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

// Fetch events based on a given calendar ID and duration
export const fetchGoogleCalendarEvents = async (
  calendarId: string,
  daysAhead: number
): Promise<GoogleCalendarEvent[]> => {
  try {
    if (!calendarId || calendarId === "") {
      throw new Error("No calendar ID provided.");
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token found. Please sign in again.");
    }

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead); 

    const timeMin = now.toISOString();
    const timeMax = futureDate.toISOString();
    
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
    return data.items || [];
  } catch (error) {
    console.error("Google Calendar Fetch Error:", error);
    return [];
  }
};

// Function to fetch events based on selected schedule
export const fetchCalendarEvents = async () => {
  const storedCalendarID = (await AsyncStorage.getItem("selectedScheduleID")) || "";
  const storedScheduleName = (await AsyncStorage.getItem("selectedScheduleName")) || "Default Schedule";
  
  
  let scheduleID = storedCalendarID;
  let scheduleName = storedScheduleName;
  

  if (!storedCalendarID || storedCalendarID === "") {
    const allCalendars = await fetchAllCalendars();

    const concordiaCalendar = allCalendars.find((calendar: any) =>
      calendar.summary.includes("Schedule")
    );

    if (!concordiaCalendar) {
      throw new Error("No schedule calendar found.");
    }

    scheduleID = concordiaCalendar.id;
    scheduleName = concordiaCalendar.summary;

    await AsyncStorage.setItem("selectedScheduleID", scheduleID);
    await AsyncStorage.setItem("selectedScheduleName", scheduleName);
  }

  return {
    scheduleName,
    events: await fetchGoogleCalendarEvents(scheduleID, 7),
  };
};

// Function to fetch today's events at the current time and later, but not tomorrow, based on selected schedule
export const fetchTodaysEventsFromSelectedSchedule = async (): Promise<GoogleCalendarEvent[]> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No access token found. Please sign in again.");
    }

    const now = new Date();

    const timeMin = now.toISOString();

    const timeMax = new Date(now);
    timeMax.setHours(23, 59, 59, 999);
    const timeMaxISOString = timeMax.toISOString();

    console.log("Fetching events from: ", timeMin, "to: ", timeMaxISOString);

    const storedCalendarID = await AsyncStorage.getItem("selectedScheduleID");
    if (!storedCalendarID) {
      throw new Error("No schedule calendar ID found. Please select a schedule.");
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${storedCalendarID}/events?timeMin=${timeMin}&timeMax=${timeMaxISOString}&maxResults=10&orderBy=startTime&singleEvents=true`,
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
    return data.items || [];
  } catch (error) {
    console.error("Error fetching today's events from selected schedule:", error);
    return [];
  }
};


export { fetchAllCalendars };
