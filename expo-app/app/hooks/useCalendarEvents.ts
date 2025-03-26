import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchGoogleCalendarEvents } from "@/app/services/GoogleCalendar/fetchingUserCalendarData";
import type { GoogleCalendarEvent } from "@/app/utils/types";

export function useCalendarEvents(userId: string | null) {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const calendarId = await AsyncStorage.getItem("selectedScheduleID");
      if (!calendarId) {
        setEvents([]);
        return;
      }
      const data = await fetchGoogleCalendarEvents(calendarId, 7);
      setEvents(data);
    } catch (error) {
      console.error("useCalendarEvents error:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
