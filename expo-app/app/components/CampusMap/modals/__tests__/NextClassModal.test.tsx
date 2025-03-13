import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NextClassModal from "../NextClassModal";
import { fetchTodaysEventsFromSelectedSchedule } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import { GoogleCalendarEvent } from "@/app/utils/types";
import { SGWBuildings } from "../../data/buildingData";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("@/app/services/GoogleCalendar/fetchingUserCalendarData", () => ({
  fetchTodaysEventsFromSelectedSchedule: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/app/utils/directions", () => ({
  coordinatesFromRoomLocation: jest.fn().mockReturnValue({ latitude: 12.34, longitude: 56.78 }),
}));

const mockNextClass: GoogleCalendarEvent = {
  id: "1",
  summary: "Math 101",
  start: { dateTime: "2025-03-01T10:00:00", timeZone: "America/Toronto" },
  end: { dateTime: "2025-03-01T11:00:00", timeZone: "America/Toronto" },
  location: '{"room": "123", "building": {"id": "1", "name": "Engineering", "coordinates": [{"latitude": 45.497, "longitude": -73.579}], "campus": "SGW"}}',
};

const renderComponent = (props = {}) =>
  render(
    <NextClassModal
      visible={true}
      onClose={jest.fn()}
      destination={{ coordinates: { latitude: 0, longitude: 0 } }}
      setDestination={jest.fn()}
      testID="next-class-modal"
      {...props}
    />
  );

describe("NextClassModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state correctly", async () => {
    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([]);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("next-class-modal-loading-indicator")).toBeTruthy();
    });
  });

  it("should display class details when events are available", async () => {
    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([mockNextClass]);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("next-class-modal-class-name")).toHaveTextContent("Math 101");
      expect(getByTestId("next-class-modal-room-value")).toHaveTextContent("123");
      expect(getByTestId("next-class-modal-building-value")).toHaveTextContent("Engineering");
    });
  });

  it("should close the modal when close button is pressed", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = renderComponent({ onClose: mockOnClose });

    await act(async () => {
      fireEvent.press(getByTestId("next-class-modal-close-button"));
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should correctly map building name to its corresponding building object", async () => {
    const mockClassWithBuildingString = {
      id: "3",
      summary: "Computer Science 301",
      start: { dateTime: "2025-03-02T18:00:00", timeZone: "America/Toronto" },
      end: { dateTime: "2025-03-02T19:00:00", timeZone: "America/Toronto" },
      location: '{"room": "789", "building": "Science Hall"}',
    };

    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([mockClassWithBuildingString]);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("next-class-modal-building-value")).toHaveTextContent("Faubourg Building");
    });
  });

  it("should assign a default building if the parsed building is not found", async () => {
    const mockClassWithUnknownBuilding = {
      id: "4",
      summary: "Data Structures",
      start: { dateTime: "2025-03-02T20:00:00", timeZone: "America/Toronto" },
      end: { dateTime: "2025-03-02T21:00:00", timeZone: "America/Toronto" },
      location: '{"room": "999", "building": "Nonexistent Hall"}',
    };

    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([mockClassWithUnknownBuilding]);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId("next-class-modal-building-value")).toHaveTextContent(SGWBuildings[0].name);
    });
  });

  it("should set the destination and close modal when 'Go to Location' button is pressed", async () => {
    const mockSetDestination = jest.fn();
    const mockOnClose = jest.fn();

    const mockClassWithCoordinates = {
      id: "7",
      summary: "Cybersecurity 101",
      start: { dateTime: "2025-03-02T14:00:00", timeZone: "America/Toronto" },
      end: { dateTime: "2025-03-02T15:00:00", timeZone: "America/Toronto" },
      location: '{"room": "777", "building": {"name": "Computer Science Building", "campus": "SGW"}}',
    };

    (fetchTodaysEventsFromSelectedSchedule as jest.Mock).mockResolvedValueOnce([mockClassWithCoordinates]);

    const { getByTestId } = renderComponent({
      onClose: mockOnClose,
      setDestination: mockSetDestination,
    });

    await waitFor(() => {
      expect(getByTestId("next-class-modal-modal")).toBeTruthy();
    });

    const getDirectionsButton = await waitFor(() => getByTestId("next-class-modal-get-directions-button"));
    expect(getDirectionsButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(getDirectionsButton);
    });

    expect(mockSetDestination).toHaveBeenCalledWith({
      coordinates: { latitude: 12.34, longitude: 56.78 },
      room: expect.objectContaining({
        room: "777",
        building: expect.objectContaining({
          name: "Computer Science Building",
          campus: "SGW",
        }),
      }),
      building: expect.objectContaining({
        name: "Computer Science Building",
        campus: "SGW",
      }),
      campus: "SGW",
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
