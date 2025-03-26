import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ScheduleScreen from '../ScheduleScreen';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as GoogleCalendar from '../../../services/GoogleCalendar/fetchingUserCalendarData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from 'react-test-renderer'; // Import act

// Mock AsyncStorage and GoogleCalendar functions
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    getTokens: jest.fn().mockResolvedValue({ accessToken: "mockAccessToken" }),
    signIn: jest.fn(),
    signInSilently: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/GoogleCalendar/fetchingUserCalendarData', () => ({
  ...jest.requireActual('../../../services/GoogleCalendar/fetchingUserCalendarData'),
  fetchGoogleCalendarEvents: jest.fn(),
  fetchCalendarEvents: jest.fn(),
}));

// Mocking router from expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    back: jest.fn(), // Mock the back function
  }),
}));

describe('<ScheduleScreen />', () => {
  beforeEach(() => {
    // Mock AsyncStorage.getItem to return mocked values
    AsyncStorage.getItem = jest.fn()
      .mockResolvedValueOnce('mockScheduleID') // Mock for selectedScheduleID
      .mockResolvedValueOnce('My Schedule'); // Mock for selectedScheduleName

    // Mock fetchGoogleCalendarEvents to return mock events
    (GoogleCalendar.fetchGoogleCalendarEvents as jest.Mock).mockResolvedValue([
      {
        id: '1',
        summary: 'Meeting with team',
        start: { dateTime: '2025-02-28T09:00:00Z' },
        end: { dateTime: '2025-02-28T10:00:00Z' },
      },
    ]);

    // Mock fetchCalendarEvents to return the mock data
    (GoogleCalendar.fetchCalendarEvents as jest.Mock).mockResolvedValue({
      scheduleName: 'My Schedule',
      events: [
        {
          id: '1',
          summary: 'Meeting with team',
          start: { dateTime: '2025-02-28T09:00:00Z' },
          end: { dateTime: '2025-02-28T10:00:00Z' },
        },
      ],
    });
  });

  it('should render the loading spinner initially', async () => {
    const { getByTestId } = render(
      <NavigationContainer> {/* Wrap the component with NavigationContainer */}
        <ScheduleScreen />
      </NavigationContainer>
    );
    await waitFor(() => expect(getByTestId('loader')).toBeTruthy());
  });

  it('should render the calendar after events are fetched', async () => {
    render(
      <NavigationContainer> {/* Wrap the component with NavigationContainer */}
        <ScheduleScreen />
      </NavigationContainer>
    );

    // Ensure the calendar component is rendered
    const calendar = await screen.findByTestId('calendar');
    expect(calendar).toBeTruthy();

    // Wait for the calendar name to appear
    await waitFor(() => screen.findByText('My Schedule'));
  });

  it('should handle back button press', async () => {
    const { getByTestId } = render(
      <NavigationContainer> {/* Wrap the component with NavigationContainer */}
        <ScheduleScreen />
      </NavigationContainer>
    );
    const backButton = getByTestId('backButton');

    // Wrap the fireEvent.press inside act() to properly handle state updates
    await act(async () => {
      fireEvent.press(backButton);
    });

    // Ensure that the back function has been called
    const { back } = require('expo-router').useRouter();
    await waitFor(() => expect(back).toHaveBeenCalled());
  });

  it('should handle calendar date selection', async () => {
    render(
      <NavigationContainer> {/* Wrap the component with NavigationContainer */}
        <ScheduleScreen />
      </NavigationContainer>
    );

    // Wait for the calendar element to render
    const calendar = await screen.findByTestId('calendar');
    expect(calendar).toBeTruthy();

    // Wrap the calendar date selection interaction in act() to ensure state updates
    await act(async () => {
      fireEvent(calendar, 'onDayPress', { dateString: '2025-02-28' });
    });

    // Check if the selected date is updated
    expect(screen.getByTestId('dateTitle')).toHaveTextContent('Events on 2025-02-28:');
  });
});
