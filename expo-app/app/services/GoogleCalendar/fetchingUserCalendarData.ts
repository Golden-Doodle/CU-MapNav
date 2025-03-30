import { GoogleCalendarEvent } from "@/app/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessToken } from "../GoogleSignin/accessToken";

/**
 * Helper function to check if a response is unauthorized (401/403).
 * If so, throws an Error("UNAUTHORIZED").
 * Otherwise, throws a general error if response is not OK.
 */
const checkUnauthorized = (response: Response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("Error fetching calendars");
  }
  return response;
};

/**
 * Fetch all calendars in the user's Google Calendar account
 */
export const fetchAllCalendars = async () => {
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

    checkUnauthorized(response);

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching calendars:", error);
    throw error;
  }
};

/**
 * Fetch events from a given calendar ID for X days ahead
 */
export const fetchGoogleCalendarEvents = async (
  calendarId: string,
  daysAhead: number
): Promise<GoogleCalendarEvent[]> => {
  try {
    if (!calendarId) {
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

    console.log("Fetching events from calendar:", calendarId);

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

    checkUnauthorized(response);

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Google Calendar Fetch Error:", error);
    throw error;
  }
};

/**
 * Example function to fetch events from a 'selectedScheduleID' 
 */
export const fetchCalendarEvents = async () => {
  try {
    const storedCalendarID = (await AsyncStorage.getItem("selectedScheduleID")) || "";
    const storedScheduleName =
      (await AsyncStorage.getItem("selectedScheduleName")) || "Default Schedule";

    let scheduleID = storedCalendarID;
    let scheduleName = storedScheduleName;

    if (!storedCalendarID) {
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

    const events = await fetchGoogleCalendarEvents(scheduleID, 7);
    return {
      scheduleName,
      events,
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

/**
 * Fetch today's events only
 */
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

    checkUnauthorized(response);

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching today's events from selected schedule:", error);
    throw error;
  }
};