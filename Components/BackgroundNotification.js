import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as APIHelper from "../Data/APIHelper";
import { Platform } from "react-native";
const BACKGROUND_FETCH_TASK = "background-fetch-debug";

let buttonTitle = "";
let spaceRefId = 0;
let mqttClient = null;

Notifications.setNotificationCategoryAsync("infoCategory", [
  {
    buttonTitle: buttonTitle,
  },
]);

Notifications.setNotificationCategoryAsync("alertCategory", [
  {
    buttonTitle: "Raise Complaint",
    data: { referenceId: spaceRefId },
  },
]);

const BackgroundNotification = () => {
  useEffect(() => {
    (async () => {
      //   // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      //   responseListener.current = Notifications.addNotificationResponseReceivedListener(
      //     (response) => {
      //       console.log(response.notification.request.content.categoryIdentifier);
      //       console.log("Response Received : ", response);
      //       if (
      //         response.notification.request.content.categoryIdentifier ===
      //         "alertCategory"
      //       ) {
      //         console.log("Complaint");
      //         navigation.navigate("Complaint", { showDialog: true });
      //       } else {
      //         navigation.navigate("LiveStatus");
      //       }
      //     }
      //   );
    })();
  }, []);
};

exports.getPermissionsForPushNotificationsAsync = async () => {
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
};

exports.checkStatusAsync = async () => {
  const status = await BackgroundFetch.getStatusAsync();
  return status;
};

exports.checkBackgroundTaskRegisteredAsync = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK,
  );

  return isRegistered;
};

exports.registerBackgroundFetchAsync = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
};

exports.unregisterBackgroundFetchAsync = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK,
  );
  if (isRegistered)
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log("method triggered");

  const broker = await AsyncStorage.getItem("broker");
  const brokerPort = await AsyncStorage.getItem("brokerPort");
  const brokerUserName = "test";
  const brokerPassword = "test";
  const userId = await AsyncStorage.getItem("userId");

  try {
    // create mqtt client
    const client = new Paho.MQTT.Client(
      broker,
      parseInt(brokerPort),
      "/ws",
      Math.random().toString(36).substr(2, 9),
    );

    // connect to client
    client.connect({
      useSSL: true,
      userName: brokerUserName,
      password: brokerPassword,
      reconnect: true,
      onSuccess: () => {
        // subscribe for push notification topic
        const topic = `pushnotification/${userId}`;
        client.subscribe(topic, {
          qos: 0,
          timeout: 60,
          onSuccess: function () {
            console.log(
              `Topic ${topic} subscribed successfully from background`,
            );
          },
          onFailure: function () {
            console.log(`Failed to subscribe topic ${topic}`);
          },
        });

        client.onMessageArrived = async (message) => {
          console.log("notification from background");
          const notificationData = JSON.parse(message.payloadString);
          let msg = {};
          let token = await AsyncStorage.getItem("ExpoPushToken");
          if (notificationData.msgtype === "Alert") {
            msg = {
              to: token,
              sound: "default",
              title: notificationData.title,
              body: notificationData.msg,
              categoryId: "alertCategory",
              data: {
                screen: notificationData.space,
                dataId: notificationData.Spacerefid,
              },
            };
          } else if (notificationData.msgtype === "Info") {
            msg = {
              to: token,
              sound: "default",
              title: notificationData.title,
              body: notificationData.msg,
              categoryId: "infoCategory",
              data: {
                screen: notificationData.space,
                dataId: notificationData.spacerefid,
              },
            };
          }

          const response1 = await fetch(
            "https://exp.host/--/api/v2/push/send",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(msg),
            },
          );
          const json = await response1.json();

          client.disconnect();
        };
      },
      onFailure: (error) => {
        console.log("failed to connect with client", JSON.stringify(error));
      },
    });
  } catch (error) {
    console.log("failed to connect with client", JSON.stringify(error));
  }
  // Be sure to return the successful result type!
  return BackgroundFetch.Result.NewData;
});

exports.getRegisteredTasksAsync = async () => {
  const tasks = await TaskManager.getRegisteredTasksAsync();
  return tasks;
};

exports.enableForegroundNotification = async () => {
  const broker = await AsyncStorage.getItem("broker");
  const brokerPort = await AsyncStorage.getItem("brokerPort");
  const brokerUserName = "test";
  const brokerPassword = "test";
  const userId = await AsyncStorage.getItem("userId");
  mqttClient = new Paho.MQTT.Client(
    broker,
    parseInt(brokerPort),
    "/ws",
    Math.random().toString(36).substr(2, 9),
  );

  mqttClient.connect({
    useSSL: true,
    userName: brokerUserName,
    password: brokerPassword,
    reconnect: true,
    onSuccess: () => {
      // subscribe for push notification topic
      const topic = `pushnotification/${userId}`;
      mqttClient.subscribe(topic, {
        qos: 0,
        timeout: 60,
        onSuccess: async function () {
          // set allow notification key to true so that notification can be restored at the time of restarting the application
          await AsyncStorage.setItem("allowNotification", "true");
          console.log(`Topic ${topic} subscribed successfully from app.js`);
        },
        onFailure: function () {
          console.log(`Failed to subscribe topic ${topic}`);
        },
      });
      mqttClient.onMessageArrived = async (message) => {
        const notificationData = JSON.parse(message.payloadString);
        console.log("notification from foreground");
        let msg = {};
        let token = await AsyncStorage.getItem("ExpoPushToken");
        if (notificationData.msgtype === "Alert") {
          msg = {
            to: token,
            sound: "default",
            title: notificationData.title,
            body: notificationData.msg,
            categoryId: "alertCategory",
            data: {
              screen: notificationData.space,
              dataId: notificationData.Spacerefid,
            },
          };
        } else if (notificationData.msgtype === "Info") {
          msg = {
            to: token,
            sound: "default",
            title: notificationData.title,
            body: notificationData.msg,
            categoryId: "infoCategory",
            data: {
              screen: notificationData.space,
              dataId: notificationData.spacerefid,
            },
          };
        }
        await APIHelper.NotificationPost(msg);
      };
      mqttClient.onConnectionLost = () => {
        console.log("connection lost!");
      };
    },
    onFailure: (error) => {
      console.log("failed to connect with client", JSON.stringify(error));
    },
  });
};

exports.disableForegroundNotification = () => {
  mqttClient.disconnect();
};

export default BackgroundNotification;
