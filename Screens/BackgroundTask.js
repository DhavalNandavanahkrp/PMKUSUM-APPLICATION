import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const BACKGROUND_FETCH_TASK = "background-fetch";

Notifications.setNotificationCategoryAsync("infoCategory", [
  {
    buttonTitle: "Current Status",
    data: { id: "111" },
  },
]);

const registerForPushNotificationsAsync = async () => {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem("ExpoPushToken", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
};

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   const now = Date.now();
//   let token = await AsyncStorage.getItem("ExpoPushToken");
//   const infoMessage = {
//     to: token,
//     sound: "default",
//     title: "Daily Summary",
//     subtitle: "Sub Title",
//     body:
//       "Solar Generation (KWH) : 4\nWater Output (Liters) : 4000\nPump Controller Run Hours : 2.3",
//     categoryId: "infoCategory",
//     data: { farmeId: "123q21" },
//   };
//   const response1 = await fetch("https://exp.host/--/api/v2/push/send", {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       "Accept-encoding": "gzip, deflate",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(infoMessage),
//   });
//   const json = await response1.json();
//   console.log(json);
//   console.log(
//     `Got background fetch call at date: ${new Date(now).toISOString()}`
//   );

//   // Be sure to return the successful result type!
//   return BackgroundFetch.Result.NewData;
// });

// 2. Register the task at some point in your app by providing the same name, and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 1, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const BackgroundFetchScreen = ({ navigation }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(1);
  const [count, setCount] = useState(0);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // This listener is fired whenever a notification is received while the app is foregrounded
  notificationListener.current = Notifications.addNotificationReceivedListener(
    (notification) => {
      setNotification(notification);
    },
  );

  // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
  responseListener.current =
    Notifications.addNotificationResponseReceivedListener((response) => {
      if (
        response.notification.request.content.categoryIdentifier ===
        "complaintCategory"
      ) {
        navigation.navigate("Complaint", { showDialog: true });
      } else {
        navigation.navigate("LiveStatus");
      }
    });

  useEffect(() => {
    (async () => {
      await checkStatusAsync();
      await registerForPushNotificationsAsync();
    })();
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK,
    );
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:
          <Text style={styles.boldText}>
            {status ? BackgroundFetch.Status[status] : null}
          </Text>
        </Text>
        <Text>
          Background fetch task name:
          <Text style={styles.boldText}>
            {isRegistered ? BACKGROUND_FETCH_TASK : "Not registered yet!"}
          </Text>
        </Text>
      </View>
      <View style={styles.textContainer}></View>
      <Text>{count}</Text>
      <Button
        title={
          isRegistered
            ? "Unregister BackgroundFetch task"
            : "Register BackgroundFetch task"
        }
        onPress={toggleFetchTask}
      />
    </View>
  );
};

export default BackgroundFetchScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    margin: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});
