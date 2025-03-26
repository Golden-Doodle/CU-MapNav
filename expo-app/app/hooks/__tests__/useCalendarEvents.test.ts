import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCalendarEvents } from "../useCalendarEvents";
import { fetchGoogleCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { GoogleCalendarEvent } from "@/app/utils/types";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchGoogleCalendarEvents: jest.fn(),
}));

describe("useCalendarEvents", () => {
  const mockEvents: GoogleCalendarEvent[] = [
    {
      id: "1",
      summary: "Event 1",
      start: { dateTime: "2023-01-01T10:00:00Z", timeZone: "UTC" },
      end: { dateTime: "2023-01-01T11:00:00Z", timeZone: "UTC" },
    },
    {
      id: "2",
      summary: "Event 2",
      start: { dateTime: "2023-01-02T10:00:00Z", timeZone: "UTC" },
      end: { dateTime: "2023-01-02T11:00:00Z", timeZone: "UTC" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty events and loading false", () => {
    const { result } = renderHook(() => useCalendarEvents(null));
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch and set events on refresh", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("calendarId");
    (fetchGoogleCalendarEvents as jest.Mock).mockResolvedValue(mockEvents);

    const { result } = renderHook(() => useCalendarEvents("userId"));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.loading).toBe(false);
  });

  it("should set loading to true before fetching and false after (even on error)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("calendarId");
    (fetchGoogleCalendarEvents as jest.Mock).mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useCalendarEvents("userId"));

    // Start the refresh (but don't await yet)
    let refreshPromise: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });

    // Immediately check if loading is true (before await)
    expect(result.current.loading).toBe(true);

    // Now wait for the refresh to complete
    await act(async () => {
      await refreshPromise;
    });

    // Verify loading is false afterward
    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([]);
  });

  it("should not fetch events if userId is null", async () => {
    const { result } = renderHook(() => useCalendarEvents(null));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([]);
  });

  it("should set loading to true first when calendarId is null", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useCalendarEvents("userId"));

    // Start refresh but don't await yet
    let refreshPromise: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });

    // Assert loading is true DURING the operation (before await)
    expect(result.current.loading).toBe(true); // ✅ Loading starts true

    // Now wait for completion
    await act(async () => {
      await refreshPromise;
    });

    // Verify final state
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false); // ✅ Loading ends false
  });
});
