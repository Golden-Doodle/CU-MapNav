import { renderHook, waitFor } from "@testing-library/react-native";
import useLiveShuttleLocations from "../useLiveShuttleLocations";
import { fetchBusCoordinates } from "@/app/services/ConcordiaShuttle/ConcordiaApiShuttle";

jest.mock("@/app/services/ConcordiaShuttle/ConcordiaApiShuttle", () => ({
  fetchBusCoordinates: jest.fn(),
}));

const mockLocations = [
  { coordinates: { latitude: 12.34, longitude: 56.78 } },
  { coordinates: { latitude: 98.76, longitude: 54.32 } },
];

describe("useLiveShuttleLocations Hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (fetchBusCoordinates as jest.Mock).mockResolvedValue(mockLocations);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("should fetch locations initially and set interval when displayLiveShuttleLocation is true", async () => {
    const { result } = renderHook(() => useLiveShuttleLocations(true));

    await waitFor(() => {
      expect(fetchBusCoordinates).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual(mockLocations);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(fetchBusCoordinates).toHaveBeenCalledTimes(2);
      expect(result.current).toEqual(mockLocations);
    });
  });

  it("should NOT fetch locations when displayLiveShuttleLocation is false", async () => {
    const { result } = renderHook(() => useLiveShuttleLocations(false));

    expect(fetchBusCoordinates).not.toHaveBeenCalled();
    expect(result.current).toEqual([]);
  });

  it("should clear interval when displayLiveShuttleLocation changes to false", async () => {
    const { rerender } = renderHook(({ display }) => useLiveShuttleLocations(display), {
      initialProps: { display: true },
    });

    await waitFor(() => expect(fetchBusCoordinates).toHaveBeenCalledTimes(1));

    rerender({ display: false });

    jest.advanceTimersByTime(60000);
    expect(fetchBusCoordinates).toHaveBeenCalledTimes(1);
  });

  it("handles errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (fetchBusCoordinates as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    renderHook(() => useLiveShuttleLocations(true));

    await waitFor(() => {
      expect(fetchBusCoordinates).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching shuttle locations: ",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
