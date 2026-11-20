import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useState, useEffect, useRef } from "react";
import { Text, View, Platform, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Caption } from "react-native-paper";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import { Ionicons as IconI } from "@expo/vector-icons";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

Notifications.setNotificationCategoryAsync("daily_question", [
  {
    actionId: "yes",
    buttonTitle: "Yes",
    data: { id: "111" },
  },
  {
    actionId: "no",
    buttonTitle: "No",
  },
]);
Notifications.setNotificationCategoryAsync("infoCategory", [
  {
    // actionId: "yes",
    buttonTitle: "Current Status",
    data: { id: "111" },
  },
]);
Notifications.setNotificationCategoryAsync("complaintCategory", [
  {
    // actionId: "yes",
    buttonTitle: "Raise Complaint",
    data: { id: "111" },
  },
]);

const Notification = ({ navigation }) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      AsyncStorage.setItem("ExpoToken", token);
      setExpoPushToken(token);
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

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

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Pressable
          style={Styles.pressable}
          onPress={async () => {
            await sendInfoNotification(expoPushToken);
          }}
        >
          <View>
            <View style={Styles.actionButton}>
              <IconI
                style={{ alignSelf: "center", alignItems: "center" }}
                name="notifications-outline"
                size={30}
                color={Colors.graytone}
              ></IconI>
            </View>
            <Caption style={Styles.captionText}>Information</Caption>
          </View>
        </Pressable>
        <Pressable
          style={Styles.pressable}
          onPress={async () => {
            await sendPumpControllerNotification(expoPushToken);
          }}
        >
          <View>
            <View style={Styles.actionButton}>
              <IconI
                style={{ alignSelf: "center", alignItems: "center" }}
                name="notifications-outline"
                size={30}
                color={Colors.graytone}
              ></IconI>
            </View>
            <Caption style={Styles.captionText}>Pump Controller</Caption>
          </View>
        </Pressable>
        <Pressable
          style={Styles.pressable}
          onPress={async () => {
            await sendComplaintNotification(expoPushToken);
          }}
        >
          <View>
            <View style={Styles.actionButton}>
              <IconI
                style={{ alignSelf: "center", alignItems: "center" }}
                name="notifications-outline"
                size={30}
                color={Colors.graytone}
              ></IconI>
            </View>
            <Caption style={Styles.captionText}>RMS</Caption>
          </View>
        </Pressable>
      </View>
      <View>
        <View style={styles.messageContainer}>
          <Text style={{ fontWeight: "bold" }}>Daily Summary</Text>
          <Caption>08 June 2021 10:43:29</Caption>
          <Text>Solar Generation (KWH) : 4</Text>
          <Text>Water Output (Liters) : 4000</Text>
          <Text>Pump Controller Run Hours : 02 :30</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={{ fontWeight: "bold" }}>Pump Controller Status</Text>
          <Caption>08 June 2021 10:43:29</Caption>
          <Text>Your pump controller has started</Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={{ fontWeight: "bold" }}>RMS Connectivity</Text>
          <Caption>08 June 2021 10:43:29</Caption>
          <Text>Your RMS has not connected with server since last 10 days</Text>
        </View>
      </View>
      {/* <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View> */}
    </View>
  );
};

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/notifications
// async function sendInfoNotification(expoPushToken) {
//   const message = {
//     to: expoPushToken,
//     sound: "default",
//     title: "Daily Summary",
//     subtitle: "Sub Title",
//     body:
//       "Solar Generation (KWH) : 4\nWater Output (Liters) : 4000\nPump Controller Run Hours : 2.3",
//     data: { someData: "goes here" },
//     categoryId: "daily_question",
//     bigText: "abd\r\nabd",
//   };
//   const infoMessage = {
//     to: expoPushToken,
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
//   log(json);
// }

async function sendInfoNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Daily Summary",
    subtitle: "Sub Title",
    body: "Solar Generation (KWH) : 4\nWater Output (Liters) : 4000\nPump Controller Run Hours : 2.3",
    data: { someData: "goes here" },
    categoryId: "daily_question",
    bigText: "abd\r\nabd",
  };
  const infoMessage = {
    to: expoPushToken,
    sound: "default",
    title: "Daily Summary",
    subtitle: "Sub Title",
    body: "Solar Generation (KWH) : 4\nWater Output (Liters) : 4000\nPump Controller Run Hours : 2.3",
    categoryId: "infoCategory",
    data: { farmeId: "123q21" },
  };
  const response1 = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(infoMessage),
  });
  const json = await response1.json();
}

async function sendPumpControllerNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Pump Controller Status",
    subtitle: "",
    body: "Your pump controller has started",
    data: { someData: "goes here" },
    categoryId: "infoCategory",
  };
  const response1 = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  const json = await response1.json();
}

async function sendComplaintNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "RMS Connectivity",
    subtitle: "",
    body: "Your RMS is not connected to server since last 10 days",
    data: { someData: "goes here" },
    categoryId: "complaintCategory",
  };
  const response1 = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  const json = await response1.json();
}

async function registerForPushNotificationsAsync() {
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
}

export default Notification;

const styles = StyleSheet.create({
  messageContainer: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: Colors.primaryOrange,
    marginHorizontal: "2%",
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
