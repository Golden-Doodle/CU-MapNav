import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassModal from "../NextClassModal";
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { GoogleCalendarEvent } from "@/app/utils/types";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchTodaysEventsFromSelectedSchedule: jest.fn().mockResolvedValue([]),
}));

const mockNextClass: GoogleCalendarEvent = {
  id: "1",
  summary: "Math 101",
  start: { dateTime: "2025-03-01T10:00:00", timeZone: "America/Toronto" },
  end: { dateTime: "2025-03-01T11:00:00", timeZone: "America/Toronto" },
  location: '{"room": "123", "building": {"id": "1", "name": "Engineering", "coordinates": [{"latitude": 45.497, "longitude": -73.579}], "campus": "SGW"}}',
};

describe("NextClassModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state correctly", async () => {
    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([]);

    const { getByTestId } = render(
      <NextClassModal
        visible={true}
        onClose={() => {}}
        destination={{ coordinates: { latitude: 0, longitude: 0 } }}
        setDestination={() => {}}
        testID="next-class-modal"
      />
    );

    await waitFor(() => {
      expect(getByTestId("next-class-modal-loading-indicator")).toBeTruthy();
    });
  });

  it("should display class details when events are available", async () => {
    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([mockNextClass]);

    const { getByTestId } = render(
      <NextClassModal
        visible={true}
        onClose={() => {}}
        destination={{ coordinates: { latitude: 0, longitude: 0 } }}
        setDestination={() => {}}
        testID="next-class-modal"
      />
    );

    await waitFor(() => {
      expect(getByTestId("next-class-modal-class-name")).toHaveTextContent("Math 101");

      const normalizeText = (text: string) =>
        text.toLowerCase().replace(/\./g, "").trim();

      const expectedTimeRange = ["10:00 am", "11:00 am"];
      const receivedTime = getByTestId("next-class-modal-class-time")
        .props.children.join("")
        .split(" - ")
        .map(normalizeText);

      expect(receivedTime).toEqual(expectedTimeRange.map(normalizeText));

      expect(getByTestId("next-class-modal-room-value")).toHaveTextContent("123");
      expect(getByTestId("next-class-modal-building-value")).toHaveTextContent("Engineering");
    });
  });

  it("should close the modal when close button is pressed", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <NextClassModal
        visible={true}
        onClose={mockOnClose}
        destination={{ coordinates: { latitude: 0, longitude: 0 } }}
        setDestination={() => {}}
        testID="next-class-modal"
      />
    );

    const closeButton = getByTestId("next-class-modal-close-button");

    await act(async () => {
      fireEvent.press(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
