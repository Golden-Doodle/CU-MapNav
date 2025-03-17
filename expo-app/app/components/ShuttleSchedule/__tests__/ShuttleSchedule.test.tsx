import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ShuttleSchedule from "../ShuttleSchedule"; 

jest.useFakeTimers(); 

describe("ShuttleSchedule Component", () => {
  beforeAll(() => {
    jest.setSystemTime(new Date("2024-02-24T14:00:00")); 
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders the ID card notice at the top", () => {
    const { getByText, getByTestId } = render(<ShuttleSchedule route="LOY" testID="LOY" />);
    
    expect(getByText("ID Card is obligatory to board the shuttle.")).toBeTruthy();
    expect(getByTestId("LOY-id-card-icon")).toBeTruthy();
  });
  
  it("renders the schedule correctly for LOY route", () => {
    const { getByText } = render(<ShuttleSchedule route="LOY" />);
    
    expect(getByText("9:15 AM")).toBeTruthy();
    expect(getByText("6:45 PM")).toBeTruthy();
  });

  it("disables past times correctly", () => {
    const { getByText } = render(<ShuttleSchedule route="LOY" />);
    
    const pastTime = getByText("9:15 AM"); 
    expect(pastTime).toBeTruthy();
    expect(pastTime.props.style).toEqual(
      expect.arrayContaining([{ color: "#666" }]) 
    );
  });

  it("expands info panel when a future time is clicked", () => {
    const { getByText, queryByText } = render(<ShuttleSchedule route="LOY" />);

    const futureTime = getByText("3:15 PM"); 
    expect(queryByText("Pickup Location")).toBeFalsy();

    fireEvent.press(futureTime);

    expect(getByText("Pickup Location")).toBeTruthy(); 
  });

  it("closes info panel when the same time is clicked again", () => {
    const { getByText, queryByText } = render(<ShuttleSchedule route="LOY" />);

    const futureTime = getByText("3:15 PM");
    fireEvent.press(futureTime); 
    fireEvent.press(futureTime); 

    expect(queryByText("Pickup Location")).toBeFalsy(); 
  });

  it("renders schedule correctly for SGW route", () => {
    const { getByText, queryByText } = render(<ShuttleSchedule route="SGW" />);
    
    expect(getByText("9:15 AM")).toBeTruthy(); 
    expect(getByText("6:45 PM")).toBeTruthy(); 

    expect(queryByText("5:15 PM")).toBeTruthy(); 
    expect(queryByText("5:45 PM")).toBeTruthy(); 
  });

  it("updates schedule when the route changes", () => {
    const { getByText, queryByText, rerender } = render(
      <ShuttleSchedule route="LOY" />
    );

    expect(getByText("9:15 AM")).toBeTruthy(); 

    rerender(<ShuttleSchedule route="SGW" />); 

    expect(getByText("9:15 AM")).toBeTruthy(); 
    expect(queryByText("11:15 AM")).toBeFalsy(); 
  });
});
