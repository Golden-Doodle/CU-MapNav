import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "../SearchBar"; 
import {useRouter} from "expo-router"; 

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("SearchBar Component", () => {
  it("renders the search input field", () => {
    const { getByTestId } = render(<SearchBar />);
    expect(getByTestId("search-input")).toBeTruthy();
  });

  it("displays the search icon", () => {
    const { getByTestId } = render(<SearchBar />);
    expect(getByTestId("search-input")).toBeTruthy();
  });

  it("allows user to type in the search field", () => {
    const { getByTestId } = render(<SearchBar />);
    const searchInput = getByTestId("search-input");

    fireEvent.changeText(searchInput, "Coffee Shop");

    expect(searchInput.props.value).toBe("Coffee Shop"); 
  });

  it("navigates to CampusMapScreen on focus", () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByTestId } = render(<SearchBar />);
    const searchInput = getByTestId("search-input");

    fireEvent(searchInput, "focus"); // Simulate focus event

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/screens/Home/CampusMapScreen",
      params: {
        pressedSearch: "true",
      },
    });
  });
});
