import { renderHook, waitFor } from "@testing-library/react-native";
import useLiveShuttleLocations from "../useLiveShuttleLocations";
import * as api from "@/app/services/ConcordiaShuttle/ConcordiaApiShuttle";

const mockLocations = [
  { coordinates: { latitude: 12.34, longitude: 56.78 } },
  { coordinates: { latitude: 98.76, longitude: 54.32 } },
];

describe("useLiveShuttleLocations Hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (api.fetchBusCoordinates as jest.Mock).mockResolvedValue(mockLocations);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("should fetch locations initially and set interval when displayLiveShuttleLocation is true", async () => {
    const { result } = renderHook(() => useLiveShuttleLocations(true));

    // initial fetch
    await waitFor(() => {
      expect(api.fetchBusCoordinates).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual(mockLocations);
    });

    // advance timer 60 seconds to trigger another fetch
    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(api.fetchBusCoordinates).toHaveBeenCalledTimes(2);
      expect(result.current).toEqual(mockLocations);
    });
  });

  it("should NOT fetch locations when displayLiveShuttleLocation is false", async () => {
    const { result } = renderHook(() => useLiveShuttleLocations(false));

    expect(api.fetchBusCoordinates).not.toHaveBeenCalled();
    expect(result.current).toEqual([]);
  });

  it("should clear interval when displayLiveShuttleLocation changes to false", async () => {
    const { result, rerender } = renderHook(({ display }) => useLiveShuttleLocations(display), {
      initialProps: { display: true },
    });

    await waitFor(() => expect(api.fetchBusCoordinates).toHaveBeenCalledTimes(1));

    // simulate display toggled off
    rerender({ display: false });

    jest.advanceTimersByTime(60000);
    expect(api.fetchBusCoordinates).toHaveBeenCalledTimes(1); // No additional call after toggling off
  });

  it("handles errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (api.fetchBusCoordinates as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() => useLiveShuttleLocations(true));

    await waitFor(() => {
      expect(api.fetchBusCoordinates).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching shuttle locations: ",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
