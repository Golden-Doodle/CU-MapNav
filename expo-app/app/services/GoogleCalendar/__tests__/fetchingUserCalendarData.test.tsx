import { getAccessToken } from "../../GoogleSignin/accessToken";
import {
  fetchAllCalendars,
  fetchGoogleCalendarEvents,
  fetchCalendarEvents,
  fetchTodaysEventsFromSelectedSchedule,
} from "../fetchingUserCalendarData";

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

describe("fetchAllCalendars", () => {
  it("throws error if no access token is found", async () => {
    (getAccessToken as jest.Mock).mockResolvedValueOnce(null);
    await expect(fetchAllCalendars()).rejects.toThrow(
      "No Google access token found. Please sign in again."
    );
  });

  it("throws UNAUTHORIZED if response is unauthorized (401)", async () => {
    (getAccessToken as jest.Mock).mockResolvedValueOnce("mockAccessToken");
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(fetchAllCalendars()).rejects.toThrow("UNAUTHORIZED");
  });

  it("throws error if response is not ok with non-401/403 status", async () => {
    (getAccessToken as jest.Mock).mockResolvedValueOnce("mockAccessToken");
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
    (getAccessToken as jest.Mock).mockResolvedValueOnce("mockAccessToken");
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
