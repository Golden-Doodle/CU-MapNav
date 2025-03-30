import { getAccessToken } from "../../GoogleSignin/accessToken";
import {
  fetchAllCalendars,
  fetchGoogleCalendarEvents,
  fetchCalendarEvents,
  fetchTodaysEventsFromSelectedSchedule,
} from "../fetchingUserCalendarData";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("../../GoogleSignin/accessToken", () => ({
  getAccessToken: jest.fn(),
}));


jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    getTokens: jest.fn().mockResolvedValue({ accessToken: "mockAccessToken" }),
    signIn: jest.fn(),
    signInSilently: jest.fn(),
  },
}));

global.fetch = jest.fn() as jest.Mock;

describe("Google Calendar Utils", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchAllCalendars", () => {
    it("throws error if no access token is found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await expect(fetchAllCalendars()).rejects.toThrow(
        "No Google access token found. Please sign in again."
      );
    });

    it("throws UNAUTHORIZED if response is unauthorized (401)", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });
      await expect(fetchAllCalendars()).rejects.toThrow("UNAUTHORIZED");
    });

    it("throws error if response is not ok with non-401/403 status", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(fetchAllCalendars()).rejects.toThrow("Error fetching calendars");
    });

    it("returns empty array if response json has no items", async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      const calendars = await fetchAllCalendars();
      expect(calendars).toEqual([]);
    });

    it("fetches all calendars successfully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      const mockCalendars = {
        items: [
          { id: "1", summary: "Test Calendar 1" },
          { id: "2", summary: "Schedule Calendar" },
        ],
      };
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockCalendars });
      const calendars = await fetchAllCalendars();
      expect(calendars).toEqual(mockCalendars.items);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mockAccessToken",
          }),
        })
      );
    });
  });

  describe("fetchGoogleCalendarEvents", () => {
    it("throws error if no calendar ID is provided", async () => {
      await expect(fetchGoogleCalendarEvents("", 7)).rejects.toThrow("No calendar ID provided.");
    });

    it("throws error if no access token is found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await expect(fetchGoogleCalendarEvents("someId", 7)).rejects.toThrow(
        "No access token found. Please sign in again."
      );
    });

    it("throws UNAUTHORIZED if response is unauthorized (403)", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });
      await expect(fetchGoogleCalendarEvents("someId", 7)).rejects.toThrow("UNAUTHORIZED");
    });

    it("throws error if response is not ok with non-401/403 status", async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(fetchGoogleCalendarEvents("someId", 7)).rejects.toThrow("Error fetching calendars");
    });

    it("fetches events based on calendar ID and days ahead", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      const mockEvents = {
        items: [
          { id: "event1", summary: "Event 1", start: { dateTime: "2022-03-01T10:00:00Z" } },
        ],
      };
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockEvents });
      const events = await fetchGoogleCalendarEvents("mockCalendarId", 7);
      expect(events).toEqual(mockEvents.items);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://www.googleapis.com/calendar/v3/calendars/mockCalendarId/events"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mockAccessToken",
          }),
        })
      );
    });
  });

  describe("fetchCalendarEvents", () => {
    it("throws error if no schedule calendar is found", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("") 
        .mockResolvedValueOnce("");
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("mockAccessToken");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) });
      await expect(fetchCalendarEvents()).rejects.toThrow("No schedule calendar found.");
    });

    it("fetches calendar events successfully when no storedCalendarID but schedule calendar is found", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("") 
        .mockResolvedValueOnce("") 
        .mockResolvedValueOnce("mockAccessToken") 
        .mockResolvedValueOnce("mockAccessToken");
      const mockCalendars = { items: [{ id: "calendar123", summary: "My Schedule Calendar" }] };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockCalendars })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [{ id: "event123", summary: "Event 123", start: { dateTime: "2022-03-01T10:00:00Z" } }] }),
        });
      const result = await fetchCalendarEvents();
      expect(result).toEqual({
        scheduleName: "My Schedule Calendar",
        events: [{ id: "event123", summary: "Event 123", start: { dateTime: "2022-03-01T10:00:00Z" } }],
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedScheduleID", "calendar123");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedScheduleName", "My Schedule Calendar");
    });

    it("fetches calendar events successfully when storedCalendarID exists", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("storedId")
        .mockResolvedValueOnce("Stored Schedule")
        .mockResolvedValueOnce("mockAccessToken");
      const mockEvents = {
        items: [{ id: "event456", summary: "Event 456", start: { dateTime: "2022-04-01T10:00:00Z" } }],
      };
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockEvents });
      const result = await fetchCalendarEvents();
      expect(result).toEqual({
        scheduleName: "Stored Schedule",
        events: mockEvents.items,
      });
    });
  });

  describe("fetchTodaysEventsFromSelectedSchedule", () => {
    it("throws error if no access token is found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await expect(fetchTodaysEventsFromSelectedSchedule()).rejects.toThrow(
        "No access token found. Please sign in again."
      );
    });

    it("throws error if no selectedScheduleID is found", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("mockAccessToken")
        .mockResolvedValueOnce(null);
      await expect(fetchTodaysEventsFromSelectedSchedule()).rejects.toThrow(
        "No schedule calendar ID found. Please select a schedule."
      );
    });

    it("throws UNAUTHORIZED if response is unauthorized", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("mockAccessToken")
        .mockResolvedValueOnce("storedId");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });
      await expect(fetchTodaysEventsFromSelectedSchedule()).rejects.toThrow("UNAUTHORIZED");
    });

    it("returns empty array if response json has no items", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("mockAccessToken")
        .mockResolvedValueOnce("storedId");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      const events = await fetchTodaysEventsFromSelectedSchedule();
      expect(events).toEqual([]);
    });

    it("fetches today's events successfully", async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce("mockAccessToken")
        .mockResolvedValueOnce("storedId");
      const mockEvents = {
        items: [{ id: "todayEvent", summary: "Today Event", start: { dateTime: "2022-05-01T12:00:00Z" } }],
      };
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockEvents });
      const events = await fetchTodaysEventsFromSelectedSchedule();
      expect(events).toEqual(mockEvents.items);
    });
  });
});
