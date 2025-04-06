import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCampus } from "../useCampus";

// Mock setup as you specified
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)), // Default mock returns null
  setItem: jest.fn(() => Promise.resolve()),
}));

describe("useCampus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default mock implementation
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (AsyncStorage.setItem as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  it("should initialize with default campus (SGW)", async () => {
    const { result } = renderHook(() => useCampus());

    // Initial state before useEffect runs
    expect(result.current.campus).toBe("SGW");

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("selectedCampus");
    });

    // After AsyncStorage check completes
    expect(result.current.campus).toBe("SGW");
  });

  it("should initialize with provided default campus", async () => {
    const { result } = renderHook(() => useCampus("LOY"));

    expect(result.current.campus).toBe("LOY");

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    expect(result.current.campus).toBe("LOY");
  });

  it("should load campus from AsyncStorage on mount", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("SGW");

    const { result } = renderHook(() => useCampus("LOY"));

    await waitFor(() => {
      expect(result.current.campus).toBe("SGW");
    });
  });

  it("should handle AsyncStorage error on mount gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error("Failed to read"));

    const { result } = renderHook(() => useCampus("LOY"));

    await waitFor(() => {
      // Should maintain the initial value on error
      expect(result.current.campus).toBe("LOY");
    });
  });

  it("should toggle campus from LOY to SGW", async () => {
    const { result } = renderHook(() => useCampus("LOY"));

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.campus).toBe("SGW");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCampus", "SGW");
  });

  it("should toggle campus from SGW to LOY", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("SGW");
    const { result } = renderHook(() => useCampus());

    await waitFor(() => {
      expect(result.current.campus).toBe("SGW");
    });

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current.campus).toBe("LOY");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("selectedCampus", "LOY");
  });

  it("should handle AsyncStorage error during toggle", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error("Failed to save"));
    const { result } = renderHook(() => useCampus("LOY"));

    await act(async () => {
      await result.current.toggle();
    });

    // Campus should still update locally despite storage error
    expect(result.current.campus).toBe("SGW");
  });

  it("should maintain consistent state during AsyncStorage delay", async () => {
    let resolveStorage: (value: string | null) => void;
    (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStorage = resolve;
        })
    );

    const { result } = renderHook(() => useCampus("LOY"));

    // Initial state before AsyncStorage responds
    expect(result.current.campus).toBe("LOY");

    // Resolve the AsyncStorage promise
    await act(async () => {
      resolveStorage!("SGW");
    });

    // After resolution
    await waitFor(() => {
      expect(result.current.campus).toBe("SGW");
    });
  });
});
