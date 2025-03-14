import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ReportForm from "../ReportForm";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

jest.useFakeTimers();

describe("ReportForm", () => {
    it("should render the form correctly", () => {
        const { getByTestId } = render(<ReportForm />);

        expect(getByTestId("dateButton")).toBeTruthy();
        expect(getByTestId("timePicker")).toBeTruthy();
        expect(getByTestId("buildingInput")).toBeTruthy();
        expect(getByTestId("roomInput")).toBeTruthy();
        expect(getByTestId("categoryContainer")).toBeTruthy();
        expect(getByTestId("imageButton")).toBeTruthy();
        expect(getByTestId("reportInput")).toBeTruthy();
        expect(getByTestId("submitButton")).toBeTruthy();
    });

    it("should allow the user to pick a date", async () => {
        const { getByTestId } = render(<ReportForm />);
        const dateButton = getByTestId("dateButton");
    
        fireEvent.press(dateButton);
    
        const selectedDay = new Date().toISOString().split("T")[0];
    
        const calendar = getByTestId("calendar");
        fireEvent.press(calendar); 
    
        await waitFor(() => {
            expect(getByTestId("selectedDate").children[0]).toBe(selectedDay);
        });
    });
    
    

    it("should allow the user to select a category", () => {
        const { getByTestId } = render(<ReportForm />);
        const categoryButtons = [
            getByTestId("categoryButton-Lost Item"),
            getByTestId("categoryButton-Safety Issue"),
            getByTestId("categoryButton-Complaint"),
            getByTestId("categoryButton-Feedback"),
        ];

        fireEvent.press(categoryButtons[1]); 
        expect(categoryButtons[1]).toHaveStyle({ backgroundColor: "#912338" });

        fireEvent.press(categoryButtons[2]); 
        expect(categoryButtons[2]).toHaveStyle({ backgroundColor: "#912338" });
    });

    it("should allow the user to add a building and room", () => {
        const { getByTestId } = render(<ReportForm />);
        const buildingInput = getByTestId("buildingInput");
        const roomInput = getByTestId("roomInput");

        fireEvent.changeText(buildingInput, "Building A");
        fireEvent.changeText(roomInput, "101");

        expect(buildingInput.props.value).toBe("Building A");
        expect(roomInput.props.value).toBe("101");
    });

    it("should validate the form before submission", async () => {
        const { getByTestId } = render(<ReportForm />);
        const submitButton = getByTestId("submitButton");

        fireEvent.press(submitButton);
        await waitFor(() => {
            expect(getByTestId("submitButtonText").children[0]).toBe("Submit Report");
        });

        fireEvent.changeText(getByTestId("buildingInput"), "Building A");
        fireEvent.changeText(getByTestId("roomInput"), "101");
        fireEvent.changeText(getByTestId("reportInput"), "Test report content");
        fireEvent.press(getByTestId("categoryButton-Safety Issue"));

        fireEvent.press(submitButton);
        await waitFor(() => {
            expect(getByTestId("submitButtonText").children[0]).toBe("Submitting...");
        });
    });

    it("should allow the user to upload an image", async () => {
        const { getByTestId } = render(<ReportForm />);
        const imageButton = getByTestId("imageButton");

        const mockImageUri = "file://path/to/image.jpg";
        const mockLaunchImageLibrary = jest.spyOn(ImagePicker, "launchImageLibraryAsync").mockResolvedValue({
            canceled: false,
            assets: [
                {
                    uri: mockImageUri,
                    width: 800, 
                    height: 600,
                },
            ],
        });

        fireEvent.press(imageButton);

        await waitFor(() => {
            expect(getByTestId("imageText").children[0]).toBe("Change Image");
            expect(getByTestId("previewImage").props.source.uri).toBe(mockImageUri);
        });

        mockLaunchImageLibrary.mockRestore();
    });

    it("should display error message when submitting an invalid form", async () => {
        const { getByTestId } = render(<ReportForm />);
        const submitButton = getByTestId("submitButton");

        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(getByTestId("submitButtonText").children[0]).toBe("Submit Report");
            expect(getByTestId("submitButton")).toBeDisabled();
        });
    });

    it("should handle the successful form submission", async () => {
        const { getByTestId } = render(<ReportForm />);
        const submitButton = getByTestId("submitButton");

        const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

        fireEvent.changeText(getByTestId("buildingInput"), "Building A");
        fireEvent.changeText(getByTestId("roomInput"), "101");
        fireEvent.changeText(getByTestId("reportInput"), "Test report content");
        fireEvent.press(getByTestId("categoryButton-Safety Issue"));

        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(getByTestId("submitButtonText").children[0]).toBe("Submitting...");
        });

        await act(async () => {
            jest.advanceTimersByTime(1500);
        });

        await waitFor(() => {
            expect(getByTestId("submitButtonText").children[0]).toBe("Submit Report");
        });

        expect(alertSpy).toHaveBeenCalledWith("Success", "Your report has been submitted.");

        alertSpy.mockRestore();
    });
});
