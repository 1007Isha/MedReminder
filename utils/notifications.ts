import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// import * as Device from 'expo-device';
import { Medication } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  console.log("Registering for push notifications...");
  let token: string | null = null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  console.log("Existing permission status:", existingStatus);

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("Requested permission status:", finalStatus);
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted. Returning null.");
    return null;
  }

  // try {
    const response = await Notifications.getExpoPushTokenAsync();
    token = response.data;
    console.log("Received push token:", token);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1a8e2d",
      });
      console.log("Android notification channel set.");
    }

    return token;
  // } catch (error) {
  //   console.error("Error getting push token:", error);
  //   return null;
  // }
}



export async function scheduleMedicationReminder(
  medication: Medication
): Promise<string | undefined> {
  if (!medication.reminderEnabled) {
    console.log("Reminder is not enabled for this medication:", medication.name);
    return;
  }

  try {
    for (const time of medication.times) {
      console.log(`Scheduling reminder for ${medication.name} at ${time}`);
      const [hours, minutes] = time.split(":").map(Number);

      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      if (today < new Date()) {
        today.setDate(today.getDate() + 1);
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time to take ${medication.name} (${medication.dosage})`,
          data: { medicationId: medication.id },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return identifier;
    }
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
    return undefined;
  }
}

export async function scheduleRefillReminder(
  medication: Medication
): Promise<string | undefined> {
  if (!medication.refillReminder) return;

  try {
    // Schedule a notification when supply is low
    if (medication.currentSupply <= medication.refillAt) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Refill Reminder",
          body: `Your ${medication.name} supply is running low. Current supply: ${medication.currentSupply}`,
          data: { medicationId: medication.id, type: "refill" },
        },
        trigger: null, // Show immediately
      });

      return identifier;
    }
  } catch (error) {
    console.error("Error scheduling refill reminder:", error);
    return undefined;
  }
}


export async function cancelMedicationReminders(
  medicationId: string
): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Found scheduled notifications:", scheduledNotifications.length);

    for (const notification of scheduledNotifications) {
      const data = notification.content.data as {
        medicationId?: string;
      } | null;

      if (data?.medicationId === medicationId) {
        console.log("Cancelling notification with ID:", notification.identifier);
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error("Error canceling medication reminders:", error);
  }
}

export async function updateMedicationReminders(
  medication: Medication
): Promise<void> {
  try {
    console.log("Updating reminders for medication:", medication.name);
    await cancelMedicationReminders(medication.id);
    await scheduleMedicationReminder(medication);
  } catch (error) {
    console.error("Error updating medication reminders:", error);
  }
}
