import { AuthContext } from "@/app/contexts/AuthContext";
import { GoogleCalendarEvent } from "@/app/utils/types";
import React from "react";
import { Text } from "react-native"; // Make sure you import Text for displaying the message
import { fetchSameDayCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData"; // Assuming the function is exported here

export default function NextClassComponent({ style }: { style?: any }) {
  const auth = React.useContext(AuthContext);
  const user = auth?.user || null; // Check if the user is logged in
  const [nextClass, setNextClass] = React.useState<GoogleCalendarEvent | null>(
    null
  );
  const [timeUntilNextClass, setTimeUntilNextClass] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const getNextClassData = async () => {
      if (!user) {
        setNextClass(null);
        setTimeUntilNextClass("Please login to see the next class");
        return;
      }

      try {
        // Fetch events for the same day
        const events = await fetchSameDayCalendarEvents();
        if (events.length > 0) {
          // Get the next class event
          const upcomingClass = getNextClass(events);
          if (upcomingClass) {
            setNextClass(upcomingClass);
            const timeDiff = getTimeUntilClass(upcomingClass.start.dateTime);
            setTimeUntilNextClass(timeDiff);
          } else {
            setNextClass(null);
            setTimeUntilNextClass("No upcoming classes for today.");
          }
        } else {
          setNextClass(null);
          setTimeUntilNextClass("No events available.");
        }
      } catch (error) {
        setNextClass(null);
        setTimeUntilNextClass("Error fetching class data.");
      }
    };

    getNextClassData();
  }, [user]);

  // Function to calculate time until the class in hours or minutes
  const getTimeUntilClass = (startTime: string): string => {
    const now = new Date();
    const classStart = new Date(startTime);

    const timeDiffMs = classStart.getTime() - now.getTime();
    const timeDiffMinutes = Math.max(Math.floor(timeDiffMs / (1000 * 60)), 0); // Ensure positive time

    if (timeDiffMinutes >= 60) {
      const timeDiffHours = Math.floor(timeDiffMinutes / 60);
      return `Next class in ${timeDiffHours} hours`;
    } else {
      return `Next class in ${timeDiffMinutes} minutes`;
    }
  };

  // Function to get the next class from the filtered events
  const getNextClass = (
    events: GoogleCalendarEvent[]
  ): GoogleCalendarEvent | null => {
    const now = new Date();
    const futureEvents = events.filter((event) => {
      const eventStart = new Date(event.start.dateTime);
      return eventStart > now; // Only events in the future
    });

    // Sort by start time to get the earliest future event
    return (
      futureEvents.sort(
        (a, b) =>
          new Date(a.start.dateTime).getTime() -
          new Date(b.start.dateTime).getTime()
      )[0] || null
    );
  };

  return (
    <Text style={style}>
      {nextClass && timeUntilNextClass !== null
        ? `${timeUntilNextClass} (${nextClass.summary})`
        : timeUntilNextClass}
    </Text>
  );
}
