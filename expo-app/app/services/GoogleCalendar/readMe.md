# Setting Up Google Calendar

## Sign in to Google Calendar
1. Go to [Google Calendar](https://calendar.google.com).
2. Sign in with your Google account. If you don't have one, create it.

## Create a New Calendar
1. On the left side, click on the `+` sign next to "Other calendars".
2. Select "Create new calendar".
3. Name it `Concordia_Class_Schedule`
4. Click "Create calendar".

** Important that you follow naming convention

## Add Events to Your Calendar
1. Click on a time slot in the calendar view.
2. Enter the event details such as title, date, time, and location.
3. For location, it's important that you add the location following the type in `RoomLocation` in `@/app/utils/types`

    Example for entering location,
    `{"room":"h830", "building":"Hall Building", "campus":"SGW"}`

    Make sure to follow the name of the building

4. Click "Save".

## Share Your Calendar
1. On the left side, find the calendar you want to share under "My calendars".
2. Click on the three dots next to the calendar name and select "Settings and sharing".
3. Under "Share with specific people", add the email addresses of the people you want to share with.
4. Set the permissions for each person (e.g., see only free/busy, make changes to events).
5. Click "Send".

## Sync with Mobile Devices
1. Download the Google Calendar app from the App Store (iOS) or Google Play Store (Android).
2. Sign in with your Google account.
3. Your calendar events will automatically sync with the app.