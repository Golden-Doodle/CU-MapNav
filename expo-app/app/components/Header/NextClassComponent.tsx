import { AuthContext } from "@/app/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { GoogleCalendarEvent } from "@/app/utils/types";
import { useTranslation } from "react-i18next";

interface NextClassComponentProps {
  calendarEvents: GoogleCalendarEvent[];
  style?: any;
  nextClass: GoogleCalendarEvent | null;
  setNextClass: (nextClass: GoogleCalendarEvent | null) => void;
  testID?: string;
}

export default function NextClassComponent({
  calendarEvents,
  style,
  nextClass,
  setNextClass,
  testID,
}: NextClassComponentProps) {

  const { t } = useTranslation('HomePageScreen');
  
  const auth = React.useContext(AuthContext);
  const user = auth?.user ?? null; 
  
  const [timeUntilNextClass, setTimeUntilNextClass] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      setNextClass(null);
      setTimeUntilNextClass(t("please_login_to_see_the_next_class"));
      return;
    }

    if (!calendarEvents || calendarEvents.length === 0) {
      setNextClass(null);
      setTimeUntilNextClass(t("no_classes_scheduled_for_today"));
      return;
    }

    const upcomingOrOngoingClass = getNextClass(calendarEvents);
    if (upcomingOrOngoingClass) {
      setNextClass(upcomingOrOngoingClass);
      const timeDiff = getTimeUntilClass(
        upcomingOrOngoingClass.start.dateTime,
        upcomingOrOngoingClass.end.dateTime
      );
      setTimeUntilNextClass(timeDiff);
    } else {
      setNextClass(null);
      setTimeUntilNextClass(t("no_classes_scheduled_for_today"));
    }
  }, [calendarEvents, user]);

  const getTimeUntilClass = (startTime: string, endTime: string): string => {
    const now = new Date();
    const classStart = new Date(startTime);
    const classEnd = new Date(endTime);

    if (classStart <= now && classEnd > now) {
      return `${t("class_is_ongoing")} (${t("started_at")} ${classStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })})`;
    }

    const timeDiffMs = classStart.getTime() - now.getTime();
    const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

    if (timeDiffMinutes <= 0) {
      return `${t("class_started")} ${Math.abs(timeDiffMinutes)} minutes ago`; // Need to fix for translation
    } else if (timeDiffMinutes <= 60) {
      return `${t("next_class_in")} ${timeDiffMinutes} minutes at ${classStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`; // Need to fix for translation
    } else {
      return `${t("next_class_in")} ${Math.floor(timeDiffMinutes / 60)} hours at ${classStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`; // Need to fix for translation
    }
  };

  const getNextClass = (events: GoogleCalendarEvent[]): GoogleCalendarEvent | null => {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayEvents = events.filter((event) => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      return (
        (eventStart >= now || (eventStart <= now && eventEnd > now)) &&
        eventStart <= endOfDay
      );
    });

    if (todayEvents.length === 0) return null;

    return todayEvents.sort(
      (a, b) =>
        new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    )[0];
  };

  return (
    <Text style={style} testID={testID}>
      {nextClass && timeUntilNextClass
        ? `${timeUntilNextClass} (${nextClass.summary})`
        : timeUntilNextClass}
    </Text>
  );
}
