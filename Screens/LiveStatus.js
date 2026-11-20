import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Title, Caption, Button, Snackbar } from "react-native-paper";
import * as Progress from "react-native-progress";
import { Rating } from "@kolking/react-native-rating";
import moment from "moment";
import { Styles } from "../Styles/GlobalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";
import * as mqttParser from "../Data/MQTTParser";
import { Colors } from "../Styles/Colors";
import * as APIHelper from "../Data/APIHelper";
import i18n from "i18n-js";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  AntDesign as IconA,
  SimpleLineIcons as SIcon,
} from "@expo/vector-icons";
import { decode } from "base-64";
import pako from "pako";

// initialization for MQTT connection
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 60,
  enableCache: false,
  reconnect: false,
  sync: {},
});

const LiveStatus = ({ navigation }) => {
  const [department, setDepartment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    latitude: 0.0,
    longitude: 0.0,
    solarGeneration: 0.0,
    solarGenerationRating: 0,
    solarGenerationTime: "",
    waterDischarge: 0.0,
    waterDischargeTime: "",
    pumpControllerStatus: "",
    pumpControllerStatusStr: "",
    pumpControllerStatusTime: "",
    pumpColor: Colors.green,
    pumpIcon: "water-pump",
    geolocationStatus: 0,
    geolocationStatusStr: "Mismatch",
    runtime: 0.0,
    runtimeTime: "",
    runtimePercentage: 0.0,
    runtimePercentageTime: "",
    energy: 0.0,
    energyTime: "",
    todayWaterDischarge: 0.0,
    todayWaterDischargeTime: "",
    scheduleEnable: 0,
    scheduleTime: "",
    scheduleDuration: 0,
    scheduleMode: 0,
    scheduleDayConfigurtion: "0000000",
    showSnackbar: false,
    snackbarText: "",
    isBusy: true,
    isError: true,
    capacity: `{RequiredPumpCapacity} HP`,
  });

  const zeroPad = (num, places) => String(num).padStart(places, "0");

  // clear snackbar text and boolean flag to show it when snack bar dismisses
  const onDismissSnackBar = () =>
    setData({
      ...data,
      showSnackbar: false,
      snackbarText: "",
    });
  const isFocused = useIsFocused();

  const connectBroker = async () => {
    console.log("connectBroker");
    try {
      // debugger;
      const stateCode = await AsyncStorage.getItem("stateCode");
      const broker = await AsyncStorage.getItem("broker");
      const brokerPort = await AsyncStorage.getItem("brokerPort");
      const brokerUserName = await AsyncStorage.getItem("brokerUserName");
      const brokerPassword = await AsyncStorage.getItem("brokerPassword");
      const vHost = await AsyncStorage.getItem("vHost");
      const groupId = await AsyncStorage.getItem("groupId");

      const latitude = await AsyncStorage.getItem("Latitude");
      const longitude = await AsyncStorage.getItem("Longitude");
      const capacity = await AsyncStorage.getItem("RequiredPumpCapacity");
      const spvCapacity = await AsyncStorage.getItem("SPVCapacity");

      // console.log("Broker data >>: ", broker);
      // console.log("Broker port >>: ", brokerPort);
      // console.log("Broker user name >>: ", brokerUserName);
      // console.log("Broker password >>: ", brokerPassword);

      // create mqtt client
      const client = new Paho.MQTT.Client(
        broker,
        parseInt(brokerPort),
        "/ws",
        Math.random().toString(36).substr(2, 9),
      );

      // console.log("Creating MQTT client with Test:");
      // console.log("Broker: ", broker);
      // console.log("Port: ", brokerPort);

      const configclient = new Paho.MQTT.Client(
        broker,
        parseInt(brokerPort),
        "/ws",
        Math.random().toString(36).substr(2, 9),
      );

      // const clientId = Math.random().toString(36).substr(2, 9);

      const valueclient = new Paho.MQTT.Client(
        broker,
        parseInt(brokerPort),
        "/ws",
        Math.random().toString(36).substr(2, 9),
      );
      // console.log('valueclient', valueclient);

      // console.log("Broker: ", broker);
      // console.log('stateCode', stateCode);

      if (stateCode === "HR") {
        let configData = null;
        let valueData = null;

        // debugger;

        // connect to client  for configData
        configclient.connect({
          useSSL: true,
          userName: "instantaneous1:test",
          password: "test",
          onSuccess: () => {
            // disable activity indicator
            setData({
              ...data,
              isBusy: false,
            });

            //Process when message arrives for subscribed topic
            configclient.onMessageArrived = (message) => {
              let topicArray = message.destinationName.split("/");
              if (topicArray.length == 3) {
                if (topicArray[0] === vHost) {
                  if (topicArray[2] == "config") {
                    try {
                      const decompressedData = decompressGzipString(
                        message.payloadString,
                      );

                      configData =
                        mqttParser.ReadConfiguration(decompressedData);

                      // connect to client for valueData
                      valueclient.connect({
                        useSSL: true,
                        userName: "instantaneous:test",
                        password: "test",
                        onSuccess: () => {
                          // disable activity indicator
                          setData({
                            ...data,
                            isBusy: false,
                          });

                          //Process when message arrives for subscribed topic
                          valueclient.onMessageArrived = (message) => {
                            let topicArray = message.destinationName.split("/");
                            if (topicArray.length == 3) {
                              if (topicArray[0] === "instantaneous") {
                                if (topicArray[2] == "values") {
                                  try {
                                    valueData = mqttParser.ReadValues(
                                      message.payloadString,
                                    );

                                    if (
                                      configData !== null &&
                                      valueData !== null
                                    ) {
                                      var dataValues = mqttParser.MatchValues(
                                        configData,
                                        valueData,
                                      );

                                      let dummyData = {};
                                      try {
                                        dataValues.forEach((element) => {
                                          switch (element.dnm) {
                                            case "LAT":
                                              dummyData.latitude =
                                                element.value;
                                              break;
                                            case "LONG":
                                              dummyData.longitude =
                                                element.value;
                                              break;
                                            case "POPKW1":
                                              dummyData.solarGeneration =
                                                element.value;
                                              dummyData.solarGenerationTime =
                                                element.time;
                                              break;
                                            case "PDKWH1":
                                              dummyData.energy = element.value;
                                              dummyData.energyTime =
                                                element.time;
                                              break;
                                            case "POPFLW1":
                                              dummyData.waterDischarge =
                                                element.value;
                                              dummyData.waterDischargeTime =
                                                element.time;
                                              break;
                                            case "PRUNST1":
                                              dummyData.pumpControllerStatus =
                                                element.value;
                                              dummyData.pumpControllerStatusTime =
                                                element.time;
                                              break;
                                            case "PDHR1":
                                              dummyData.runtime = moment
                                                .utc(
                                                  parseFloat(element.value) *
                                                    3600 *
                                                    1000,
                                                )
                                                .format("HH:mm");
                                              dummyData.runtimeTime =
                                                element.time;
                                              dummyData.runtimePercentage =
                                                (element.value / 24) * 100;
                                              //(80)

                                              break;
                                            case "POPDWD1":
                                              dummyData.todayWaterDischarge =
                                                element.value;
                                              dummyData.todayWaterDischargeTime =
                                                element.time;
                                              break;
                                            case "SCHEN":
                                              dummyData.scheduleEnable =
                                                element.value;
                                              break;
                                            case "SCHSTTM":
                                              dummyData.scheduleTime =
                                                element.value;
                                              break;
                                            case "SCHDUR":
                                              dummyData.scheduleDuration =
                                                element.value;
                                              break;
                                            case "SCHMODE":
                                              dummyData.scheduleMode =
                                                element.value;
                                              break;
                                            case "SCHCST":
                                              dummyData.scheduleDayConfigurtion =
                                                element.value;
                                              break;
                                          }
                                        });
                                      } catch (error) {
                                        console.log("error", error);
                                      }
                                      const statusText =
                                        dummyData.pumpControllerStatus === 0
                                          ? i18n.t("Stop")
                                          : dummyData.pumpControllerStatus === 1
                                          ? i18n.t("Running")
                                          : dummyData.pumpControllerStatus === 2
                                          ? i18n.t("Sleep")
                                          : "Drive Protection";

                                      const pumpColor =
                                        dummyData.pumpControllerStatus === 0
                                          ? Colors.red
                                          : dummyData.pumpControllerStatus === 1
                                          ? Colors.green
                                          : dummyData.pumpControllerStatus === 2
                                          ? Colors.grayAAA
                                          : Colors.lightGreen;

                                      const pumpIcon =
                                        dummyData.pumpControllerStatus === 0
                                          ? "water-pump-off"
                                          : dummyData.pumpControllerStatus === 1
                                          ? "water-pump"
                                          : dummyData.pumpControllerStatus === 2
                                          ? "water-pump-off"
                                          : "water-pump";

                                      const distance = getDistanceBetweenPoints(
                                        dummyData.latitude,
                                        dummyData.longitude,
                                        latitude,
                                        longitude,
                                      );
                                      const solarGenerationRating =
                                        starRatingValue(
                                          spvCapacity,
                                          dummyData.runtime,
                                          dummyData.solarGeneration,
                                        );

                                      if (
                                        dummyData.scheduleEnable === undefined
                                      ) {
                                        dummyData.scheduleEnable = "0";
                                      }
                                      if (
                                        dummyData.scheduleTime === undefined
                                      ) {
                                        dummyData.scheduleTime = "000000";
                                      }
                                      if (
                                        dummyData.scheduleDuration === undefined
                                      ) {
                                        dummyData.scheduleDuration = "0";
                                      }
                                      if (
                                        dummyData.scheduleMode === undefined
                                      ) {
                                        dummyData.scheduleMode = "3";
                                      }
                                      if (
                                        dummyData.scheduleDayConfigurtion ===
                                        undefined
                                      ) {
                                        dummyData.scheduleDayConfigurtion =
                                          "0000000";
                                      }

                                      setData({
                                        ...data,
                                        isError: false,
                                        isBusy: false,
                                        latitude: dummyData.latitude,
                                        longitude: dummyData.longitude,
                                        solarGeneration:
                                          dummyData.solarGeneration,
                                        solarGenerationRating:
                                          solarGenerationRating,
                                        solarGenerationTime: moment(
                                          dummyData.solarGenerationTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        waterDischarge:
                                          dummyData.waterDischarge,
                                        waterDischargeTime: moment(
                                          dummyData.waterDischargeTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        pumpControllerStatus:
                                          dummyData.pumpControllerStatus,
                                        pumpControllerStatusStr: statusText,
                                        pumpColor: pumpColor,
                                        pumpIcon: pumpIcon,
                                        pumpControllerStatusTime: moment(
                                          dummyData.pumpControllerStatusTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        runtime: dummyData.runtime,
                                        runtimeTime: moment(
                                          dummyData.runtimeTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        runtimePercentage:
                                          dummyData.runtimePercentage,
                                        geolocationStatus:
                                          distance > 10 ? 0 : 1,
                                        geolocationStatusStr:
                                          distance > 10
                                            ? i18n.t("Mismatch")
                                            : i18n.t("Match"),
                                        energy: dummyData.energy,
                                        energyTime: moment(
                                          dummyData.energyTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        todayWaterDischarge:
                                          dummyData.todayWaterDischarge,
                                        todayWaterDischargeTime: moment(
                                          dummyData.todayWaterDischargeTime,
                                          "YYYY-MM-DD HH:mm:ss",
                                        ).format("DD-MM-YYYY HH:mm"),
                                        scheduleEnable:
                                          dummyData.scheduleEnable,
                                        scheduleTime: dummyData.scheduleTime,
                                        scheduleDuration:
                                          dummyData.scheduleDuration,
                                        scheduleMode: dummyData.scheduleMode,
                                        scheduleDayConfigurtion:
                                          dummyData.scheduleDayConfigurtion,
                                      });

                                      configData = null;
                                      valueData = null;
                                      configclient.disconnect();
                                      valueclient.disconnect();
                                    }
                                  } catch (error) {
                                    setData({
                                      ...data,
                                      isBusy: false,
                                      showSnackbar: true,
                                      snackbarText:
                                        i18n.t("FailedToParseMQTTResponse") +
                                        JSON.stringify(error),
                                    });
                                  }
                                }
                              }
                            }
                          };

                          // subscribe for value topic
                          valueclient.subscribe(
                            `instantaneous/${groupId}/values`,
                            {
                              qos: 0,
                              timeout: 60,
                              onSuccess: function () {
                                console.log(
                                  `Client Subscription value Successful..!!instantaneous/${groupId}/values`,
                                );
                              },
                              onFailure: function () {
                                setData({
                                  ...data,
                                  isError: true,
                                  isBusy: false,
                                  showSnackbar: true,
                                  snackbarText: i18n.t(
                                    "FailedToSubscribeForValuesTopic",
                                  ),
                                });
                                console.log(
                                  "client Subscribtion values Failed...!!",
                                );
                              },
                            },
                          );
                        },
                        onFailure: (error) => {
                          console.log(
                            "Error in connectBroker - Inside Error 395 : ",
                            error,
                          );
                          "Inside Error", error;
                          setData({
                            ...data,
                            isBusy: false,
                            showSnackbar: true,
                            snackbarText:
                              i18n.t("FailedToConnectWithMQTTBrokerServer") +
                              JSON.stringify(error),
                          });
                        },
                      });
                    } catch (error) {
                      setData({
                        ...data,
                        isBusy: false,
                        showSnackbar: true,
                        snackbarText:
                          i18n.t("FailedToParseMQTTResponse") +
                          JSON.stringify(error),
                      });
                    }
                  }
                }
              }
            };

            // subscribe for config topic
            configclient.subscribe(`${vHost}/${groupId}/config`, {
              qos: 0,
              timeout: 60,
              onSuccess: function () {
                console.log(
                  `Client Subscription config Successful..!!${vHost}/${groupId}/config`,
                );
              },
              onFailure: function () {
                setData({
                  ...data,
                  isError: true,
                  isBusy: false,
                  showSnackbar: true,
                  snackbarText: i18n.t("FailedToSubscribeForConfigTopic"),
                });
                console.log("client Subscribtion config Failed...!!");
              },
            });
          },
          onFailure: (error) => {
            console.log(
              "Error in connectBroker - Inside Error 463 : ",
              JSON.stringify(error, null, 2),
            );
            "Inside Error", error;
            setData({
              ...data,
              isBusy: false,
              showSnackbar: true,
              snackbarText:
                i18n.t("FailedToConnectWithMQTTBrokerServer") +
                JSON.stringify(error),
            });
          },
        });

        /*  console.log("===========================================");
         const brokerTest = "test.mosquitto.org";
         const brokerPortTest = 8081;
         const pathTest = "/mqtt";
   
         const configTest = new Paho.MQTT.Client(
           brokerTest,
           parseInt(brokerPortTest),
           pathTest,
           Math.random().toString(36).substr(2, 9)
         );
   
         console.log("Creating MQTT client with Test:");
         console.log("Broker: ", brokerTest);
         console.log("Port: ", brokerPortTest);
         console.log("Path: ", pathTest);
         console.log(`MQTT Client => broker: ${brokerTest}, port: ${brokerPortTest}, path:, ${pathTest}`);
   
         configTest.connect({
           useSSL: true,
           onSuccess: () => console.log("Test Success Connected!"),
           onFailure: (err) => console.error("Failed: 157", JSON.stringify(err, null, 2)),
         });
 
         console.log("==========================================="); */
      } else {
        let configData = null;
        let valueData = null;

        // connect to client Without HR
        client.connect({
          useSSL: true,
          userName: brokerUserName,
          password: brokerUserName,
          onSuccess: () => {
            // disable activity indicator
            setData({
              ...data,
              isBusy: false,
            });

            //Process when message arrives for subscribed topic
            client.onMessageArrived = (message) => {
              let topicArray = message.destinationName.split("/");
              if (topicArray.length == 3) {
                if (topicArray[0] === vHost) {
                  if (topicArray[2] == "config") {
                    try {
                      configData = mqttParser.ReadConfiguration(
                        message.payloadString,
                      );
                    } catch (error) {
                      setData({
                        ...data,
                        isBusy: false,
                        showSnackbar: true,
                        snackbarText:
                          i18n.t("FailedToParseMQTTResponse") +
                          JSON.stringify(error),
                      });
                    }
                  } else {
                    try {
                      valueData = mqttParser.ReadValues(message.payloadString);
                    } catch (error) {
                      setData({
                        ...data,
                        isBusy: false,
                        showSnackbar: true,
                        snackbarText:
                          i18n.t("FailedToParseMQTTResponse") +
                          JSON.stringify(error),
                      });
                    }
                  }

                  if (configData !== null && valueData !== null) {
                    var dataValues = mqttParser.MatchValues(
                      configData,
                      valueData,
                    );

                    let dummyData = {};
                    try {
                      dataValues.forEach((element) => {
                        switch (element.dnm) {
                          case "LAT":
                            dummyData.latitude = element.value;
                            break;
                          case "LONG":
                            dummyData.longitude = element.value;
                            break;
                          case "POPKW1":
                            dummyData.solarGeneration = element.value;
                            dummyData.solarGenerationTime = element.time;
                            break;
                          case "PDKWH1":
                            dummyData.energy = element.value;
                            dummyData.energyTime = element.time;
                            break;
                          case "POPFLW1":
                            dummyData.waterDischarge = element.value;
                            dummyData.waterDischargeTime = element.time;
                            break;
                          case "PRUNST1":
                            dummyData.pumpControllerStatus = element.value;
                            dummyData.pumpControllerStatusTime = element.time;
                            break;
                          case "PDHR1":
                            dummyData.runtime = moment
                              .utc(parseFloat(element.value) * 3600 * 1000)
                              .format("HH:mm");
                            dummyData.runtimeTime = element.time;
                            dummyData.runtimePercentage =
                              (element.value / 24) * 100;
                            //(80)

                            break;
                          case "POPDWD1":
                            dummyData.todayWaterDischarge = element.value;
                            dummyData.todayWaterDischargeTime = element.time;
                            break;
                          case "SCHEN":
                            dummyData.scheduleEnable = element.value;
                            break;
                          case "SCHSTTM":
                            dummyData.scheduleTime = element.value;
                            break;
                          case "SCHDUR":
                            dummyData.scheduleDuration = element.value;
                            break;
                          case "SCHMODE":
                            dummyData.scheduleMode = element.value;
                            break;
                          case "SCHCST":
                            dummyData.scheduleDayConfigurtion = element.value;
                            break;
                        }
                      });
                    } catch (error) {
                      console.log("error", error);
                    }
                    const statusText =
                      dummyData.pumpControllerStatus === 0
                        ? i18n.t("Stop")
                        : dummyData.pumpControllerStatus === 1
                        ? i18n.t("Running")
                        : dummyData.pumpControllerStatus === 2
                        ? i18n.t("Sleep")
                        : "Drive Protection";

                    const pumpColor =
                      dummyData.pumpControllerStatus === 0
                        ? Colors.red
                        : dummyData.pumpControllerStatus === 1
                        ? Colors.green
                        : dummyData.pumpControllerStatus === 2
                        ? Colors.grayAAA
                        : Colors.lightGreen;

                    const pumpIcon =
                      dummyData.pumpControllerStatus === 0
                        ? "water-pump-off"
                        : dummyData.pumpControllerStatus === 1
                        ? "water-pump"
                        : dummyData.pumpControllerStatus === 2
                        ? "water-pump-off"
                        : "water-pump";

                    const distance = getDistanceBetweenPoints(
                      dummyData.latitude,
                      dummyData.longitude,
                      latitude,
                      longitude,
                    );
                    const solarGenerationRating = starRatingValue(
                      spvCapacity,
                      dummyData.runtime,
                      dummyData.solarGeneration,
                    );

                    if (dummyData.scheduleEnable === undefined) {
                      dummyData.scheduleEnable = "0";
                    }
                    if (dummyData.scheduleTime === undefined) {
                      dummyData.scheduleTime = "000000";
                    }
                    if (dummyData.scheduleDuration === undefined) {
                      dummyData.scheduleDuration = "0";
                    }
                    if (dummyData.scheduleMode === undefined) {
                      dummyData.scheduleMode = "3";
                    }
                    if (dummyData.scheduleDayConfigurtion === undefined) {
                      dummyData.scheduleDayConfigurtion = "0000000";
                    }

                    setData({
                      ...data,
                      isError: false,
                      isBusy: false,
                      latitude: dummyData.latitude,
                      longitude: dummyData.longitude,
                      solarGeneration: dummyData.solarGeneration,
                      solarGenerationRating: solarGenerationRating,
                      solarGenerationTime: moment(
                        dummyData.solarGenerationTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      waterDischarge: dummyData.waterDischarge,
                      waterDischargeTime: moment(
                        dummyData.waterDischargeTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      pumpControllerStatus: dummyData.pumpControllerStatus,
                      pumpControllerStatusStr: statusText,
                      pumpColor: pumpColor,
                      pumpIcon: pumpIcon,
                      pumpControllerStatusTime: moment(
                        dummyData.pumpControllerStatusTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      runtime: dummyData.runtime,
                      runtimeTime: moment(
                        dummyData.runtimeTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      runtimePercentage: dummyData.runtimePercentage,
                      geolocationStatus: distance > 10 ? 0 : 1,
                      geolocationStatusStr:
                        distance > 10 ? i18n.t("Mismatch") : i18n.t("Match"),
                      energy: dummyData.energy,
                      energyTime: moment(
                        dummyData.energyTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      todayWaterDischarge: dummyData.todayWaterDischarge,
                      todayWaterDischargeTime: moment(
                        dummyData.todayWaterDischargeTime,
                        "YYYY-MM-DD HH:mm:ss",
                      ).format("DD-MM-YYYY HH:mm"),
                      scheduleEnable: dummyData.scheduleEnable,
                      scheduleTime: dummyData.scheduleTime,
                      scheduleDuration: dummyData.scheduleDuration,
                      scheduleMode: dummyData.scheduleMode,
                      scheduleDayConfigurtion:
                        dummyData.scheduleDayConfigurtion,
                    });

                    configData = null;
                    valueData = null;
                    client.disconnect();
                  }
                }
              }
            };

            // subscribe for config topic
            client.subscribe(`${vHost}/${groupId}/config`, {
              qos: 0,
              timeout: 60,
              onSuccess: function () {
                console.log(
                  `Client Subscription config Successful..!!${vHost}/${groupId}/config`,
                );
              },
              onFailure: function () {
                setData({
                  ...data,
                  isError: true,
                  isBusy: false,
                  showSnackbar: true,
                  snackbarText: i18n.t("FailedToSubscribeForConfigTopic"),
                });
                console.log("client Subscribtion config Failed...!!");
              },
            });

            // subscribe for value topic
            client.subscribe(`${vHost}/${groupId}/values`, {
              qos: 0,
              timeout: 60,
              onSuccess: function () {
                console.log(
                  `Client Subscription value Successful..!!${vHost}/${groupId}/values`,
                );
              },
              onFailure: function () {
                setData({
                  ...data,
                  isError: true,
                  isBusy: false,
                  showSnackbar: true,
                  snackbarText: i18n.t("FailedToSubscribeForValuesTopic"),
                });
                console.log("client Subscribtion values Failed...!!");
              },
            });
          },
          onFailure: (error) => {
            console.log("Error in connectBroker - Inside Error 778 : ", error);
            "Inside Error", error;
            setData({
              ...data,
              isBusy: false,
              showSnackbar: true,
              snackbarText:
                i18n.t("FailedToConnectWithMQTTBrokerServer") +
                JSON.stringify(error),
            });
          },
        });
      }
    } catch (error) {
      // main catch block

      console.log("Error in connectBroker - Main catch bloxk 748 : ", error);
      setData({
        ...data,
        isBusy: false,
        showSnackbar: true,
        snackbarText:
          i18n.t("FailedToConnectWithMQTTBrokerServer") + JSON.stringify(error),
      });
    }
  };

  const decompressGzipString = (gzipString) => {
    // Convert the gzip string to Uint8Array
    const gzipData = Uint8Array.from(decode(gzipString), (c) =>
      c.charCodeAt(0),
    );

    // Decompress the gzip data
    const decompressedData = pako.inflate(gzipData, { to: "string" });

    return decompressedData;
  };

  function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in meters
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const pumpOperateHandler = async () => {
    if (data.isBusy) return;

    const status = data.pumpControllerStatus;
    if (status > 2) {
      Alert.alert(
        i18n.t("PumpOperation"),
        i18n.t("PumpCannotBeOperatedInProtectedMode"),
        [
          {
            text: i18n.t("OK"),
            onPress: () => {
              return;
            },
          },
        ],
      );
    }
    const message =
      status === 1
        ? i18n.t("AreYouSureYouWantToStopThePump")
        : i18n.t("AreYouSureYouWantToStartThePump");
    Alert.alert(i18n.t("PumpOperation"), message, [
      {
        text: i18n.t("No"),
        style: "noStyle",
      },
      {
        text: i18n.t("Yes"),
        onPress: async () => {
          const msgType = 1;
          const priority = 1;
          const expireTime = moment()
            .add(60, "seconds")
            .format("yyyy-MM-DD HH:mm:ss");

          const deviceId = await AsyncStorage.getItem("deviceId");
          const payload = {
            device: [
              {
                deviceId: deviceId,
                msg: [
                  {
                    regAdd: "DO1",
                    val: status === 1 ? 0 : 1,
                    type: "number",
                    isWrite: true,
                  },
                ],
              },
            ],
          };
          const authToken = await AsyncStorage.getItem("authToken");
          const apiUrl = await AsyncStorage.getItem("apiURL");
          const stateCode = await AsyncStorage.getItem("stateCode");
          const selectedComponent = await AsyncStorage.getItem(
            "selectedComponent",
          );
          const Component =
            selectedComponent === "ComponentB"
              ? "b"
              : null || selectedComponent === "ComponentC"
              ? "c"
              : "a";
          const route = `${apiUrl}api/${stateCode}/OndemandReadWrite/OdandConfigReadWrite?msgType=${msgType}&priority=${priority}&ExpireTime=${expireTime}&PROJCD=${Component}`;

          setData({ ...data, isBusy: true });
          const callResult = await APIHelper.Post1(route, authToken, payload);
          setData({ ...data, isBusy: false });
          if (callResult.Result) {
            const data = JSON.parse(callResult.Data);
            let message = "";
            if (data[0].IsExpired) {
              message = i18n.t("FailedToOperatePumpAsCommandExpired");
            } else {
              if (data[0].IsAcknowledge) {
                message = i18n.t("PumpOperationSuccessful");
              } else {
                message = i18n.t("FailedToOperatePump");
              }
              Alert.alert(i18n.t("PumpOperation"), message, [
                {
                  text: i18n.t("OK"),
                  style: "noStyle",
                },
              ]);
            }
          }
        },
      },
    ]);
  };

  const [role, setRole] = useState("");
  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    requiredPumpType: "",
    requiredPumpsubtype: "",
  });

  const farmerdetails = async () => {
    const farmerName = await AsyncStorage.getItem("farmerName");
    const SaralId = await AsyncStorage.getItem("SaralId");
    const RequiredPumpType = await AsyncStorage.getItem("RequiredPumpType");
    const RequiredPumpCapacity = await AsyncStorage.getItem(
      "RequiredPumpCapacity",
    );
    const requiredPumpType = await AsyncStorage.getItem("requiredPumpType");
    const requiredPumpsubtype = await AsyncStorage.getItem(
      "requiredPumpsubtype",
    );
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");

    setFarmerdata({
      ...Farmerdata,
      farmerName: farmerName,
      SaralId: SaralId,
      RequiredPumpCapacity: RequiredPumpCapacity,
      RequiredPumpType: RequiredPumpType,
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
      SPVCapacity: SPVCapacity,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();
    (async () => {
      await farmerdetails();
      await connectBroker();

      const role1 = await AsyncStorage.getItem("departmentRole");
      setRole(role1.toUpperCase());
    })();
    return () => {
      abortController.abort();
    };
  }, [isFocused]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    await connectBroker();

    setRefreshing(false);
  }, [refreshing]);

  const starRatingValue = (capacity, runtime, solarGeneration) => {
    if (!capacity) return 0;

    let hour = parseInt(runtime.split(":")[0]);
    let min = parseFloat((runtime.split(":")[1] / 60).toFixed(2));
    hour = hour + min;

    const idealCapacity = (capacity * hour * 60 * 6.25) / 1000;

    const starValue = parseFloat(
      ((solarGeneration * 5) / idealCapacity).toFixed(2),
    );

    if (starValue >= 80) {
      return 5;
    } else if (starValue >= 60) {
      return 4;
    } else if (starValue >= 40) {
      return 3;
    } else if (starValue >= 20) {
      return 2;
    } else if (starValue < 20 && starValue > 0) {
      return 1;
    } else return 0;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      {/* Farmer Basic  details */}
      {(role.toUpperCase() === "DISCOM" || role.toUpperCase() === "EPC") && (
        <View style={{ margin: 10 }}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <IconF
                name="user"
                size={Platform.OS === "ios" ? 30 : 25}
                color={Colors.graytone}
              ></IconF>
              <Text style={styles.cellTextRight}>{Farmerdata.farmerName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cell}>
              <IconA
                name="solution"
                size={Platform.OS === "ios" ? 30 : 25}
                color={Colors.graytone}
              ></IconA>
              <Text
                style={{
                  alignSelf: "center",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                {Farmerdata.SaralId}
              </Text>
            </View>
            <View style={styles.rightCell}>
              <IconMC
                name="water-pump"
                size={Platform.OS === "ios" ? 30 : 25}
                color={Colors.graytone}
                style={{ marginHorizontal: 5, alignSelf: "center" }}
              ></IconMC>
              <Text
                style={{
                  alignSelf: "center",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                {`${Farmerdata.RequiredPumpCapacity} ${"HP"} ${
                  Farmerdata.requiredPumpType
                } ${Farmerdata.requiredPumpsubtype}`}
              </Text>
            </View>
          </View>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pump Operation */}
        {role.toUpperCase() === "FARMER" && (
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.header, { color: "#FF6347" }]}>
                {i18n.t("PumpOperation")}
              </Text>
            </View>
            <Card style={[styles.card, { borderLeftColor: "#FF6347" }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.contentView}>
                  <View style={{ flex: 1 }}>
                    <Title style={[styles.title]}>
                      {i18n.t("PressTheIconToOperate")}
                    </Title>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <IconMC
                        name="clock-outline"
                        size={25}
                        color={Colors.clockIcon}
                      ></IconMC>
                      <Caption style={{ marginLeft: 5 }}>
                        {data.pumpControllerStatusTime}
                      </Caption>
                    </View>
                  </View>
                  <Button
                    disabled={data.isBusy}
                    style={{ marginRight: -20, alignSelf: "center" }}
                    icon={() => (
                      <IconMC
                        name={data.pumpIcon}
                        size={65}
                        color={data.pumpColor}
                      ></IconMC>
                    )}
                    mode="text"
                    onPress={() => pumpOperateHandler()}
                  ></Button>
                </View>
              </Card.Content>
            </Card>
            <Button
              disabled={data.isBusy}
              icon={() => (
                <IconMC name="calendar" size={25} color={Colors.white} />
              )}
              mode="contained"
              color={Colors.green}
              style={{
                borderRadius: 20,
                height: 40,
                marginHorizontal: 15,
              }}
              labelStyle={{ color: Colors.white }}
              onPress={async () => {
                if (
                  data.scheduleEnable &&
                  data.scheduleTime &&
                  data.scheduleDuration &&
                  data.scheduleMode &&
                  data.scheduleDayConfigurtion
                ) {
                  const deviceId = await AsyncStorage.getItem("deviceId");
                  deviceId === null
                    ? Alert.alert("Alert", "DeviceId Values are null", [
                        {
                          text: i18n.t("OK"),
                        },
                      ])
                    : navigation.navigate("PumpSchedule", {
                        SCHEN: data.scheduleEnable,
                        SCHSTTM: data.scheduleTime,
                        SCHDUR: data.scheduleDuration,
                        SCHMODE: data.scheduleMode,
                        SCHCST: data.scheduleDayConfigurtion,
                      });
                } else {
                  Alert.alert(
                    i18n.t("SchedulePumpOperation"),
                    i18n.t("SchedulePumpConfigurationNotAvailable"),
                    [
                      {
                        text: i18n.t("OK"),
                        onPress: () => {
                          return;
                        },
                      },
                    ],
                  );
                }
              }}
            >
              {i18n.t("SchedulePumpOperation")}
            </Button>
          </View>
        )}

        <Text style={[styles.header, { color: Colors.shadowBorder }]}>
          {i18n.t("LiveStatus")}
        </Text>

        {/* Solar Generation */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={styles.icon}
                    name="solar-power"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconMC>
                  <Title style={[styles.title, { marginTop: -5 }]}>
                    {i18n.t("SolarGeneration")}
                  </Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {data.solarGenerationTime}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>***</Text>
                ) : (
                  <Text style={styles.reading}>{data.solarGeneration}</Text>
                )}
                <Caption style={[styles.readingUnit, { marginLeft: "auto" }]}>
                  {Farmerdata.selectedComponent === "ComponentB"
                    ? "KWh"
                    : "KW (Kilowatt)"}
                </Caption>
                <Rating
                  disabled
                  size={20}
                  startingValue={data.solarGenerationRating}
                  style={{ paddingVertical: 5 }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Water Discharge Flow Rate */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={styles.icon}
                    name="water-pump"
                    size={Platform.OS === "ios" ? 30 : 25}
                  ></IconMC>
                  <Title style={styles.title}>
                    {i18n.t("WaterDischargeFlowRate")}
                  </Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {/* {data.waterDischargeTime} */}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>***</Text>
                ) : data.waterDischarge ? (
                  <Text style={styles.reading}>{data.waterDischarge}</Text>
                ) : (
                  <Text style={styles.reading}>---</Text>
                )}
                <Caption
                  style={[
                    styles.readingUnit,
                    { marginLeft: "auto", minWidth: 50 },
                  ]}
                >
                  LPM (Liter Per Minute)
                </Caption>

                <Rating
                  disabled
                  size={20}
                  startingValue={0}
                  style={{
                    paddingVertical: 5,
                    alignSelf: "flex-end",
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Pump Controller Status */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={styles.icon}
                    name="state-machine"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconMC>
                  <Title style={styles.title}>
                    {i18n.t("PumpControllerStatus")}
                  </Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {data.pumpControllerStatusTime}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center", flex: 1 }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>*****</Text>
                ) : (
                  <Text
                    style={[
                      styles.reading,
                      {
                        fontSize: 22,
                        color: data.pumpColor,
                      },
                    ]}
                  >
                    {data.pumpControllerStatusStr}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Geolocation */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconM
                    style={styles.icon}
                    name="location-pin"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconM>
                  <Title style={styles.title}>{i18n.t("Geolocation")}</Title>
                </View>
                <View style={styles.timestampContainer}>
                  <Caption style={{ marginLeft: 5 }}>
                    <Text style={{ marginRight: 5 }}>
                      {i18n.t("Latitude")} :{" "}
                      {data.latitude ? data.latitude.toFixed(6) : ""}
                    </Text>
                  </Caption>
                  <Caption style={{ marginLeft: 5 }}>
                    <Text style={{ marginRight: 5 }}>
                      {i18n.t("Longitude")} :{" "}
                      {data.longitude ? data.longitude.toFixed(6) : ""}
                    </Text>
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>*****</Text>
                ) : (
                  <Text
                    style={[
                      styles.reading,
                      {
                        fontSize: 22,
                        color:
                          data.geolocationStatus === 0
                            ? Colors.red
                            : Colors.green,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        textAlign: "center",
                      },
                    ]}
                  >
                    {data.geolocationStatusStr}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Today's Parameters */}
        <Text style={[styles.header, { color: Colors.lightPink }]}>
          {i18n.t("TodaysParameters")}
        </Text>

        {/* Today's Runtime */}
        <Card style={[styles.card, { borderLeftColor: Colors.lightPink }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconFA
                    style={styles.icon}
                    name="hourglass-start"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconFA>
                  <Title style={styles.title}>{i18n.t("TodaysRuntime")}</Title>
                </View>
                <View
                  style={[styles.timestampContainer, { marginVertical: 10 }]}
                >
                  {data.isError ? (
                    <Text style={styles.errorReading}>**</Text>
                  ) : (
                    <Text
                      style={{
                        alignSelf: "center",
                        color: "#FF54A7",
                      }}
                    >
                      {data.runtimePercentage.toFixed(2)}%
                    </Text>
                  )}
                  <Progress.Bar
                    animated={true}
                    progress={data.runtimePercentage / 100}
                    style={styles.bar}
                    color={
                      data.runtimePercentage >= 80
                        ? "#00FF00"
                        : data.runtimePercentage >= 60 &&
                          data.runtimePercentage <= 60
                        ? "#FFFF00"
                        : "#FF0000"
                    }
                    unfilledColor={"#aaa"}
                    height={15}
                    width={null}
                  ></Progress.Bar>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {data.runtimeTime}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>*****</Text>
                ) : (
                  <Text style={styles.reading}>{data.runtime}</Text>
                )}
                <Caption style={styles.readingUnit}>{i18n.t("HHMM")}</Caption>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Today's Energy */}
        <Card style={[styles.card, { borderLeftColor: Colors.lightPink }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <SIcon
                    style={styles.icon}
                    name="energy"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></SIcon>
                  <Title style={styles.title}>{i18n.t("TodaysEnergy")}</Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>{data.energyTime}</Caption>
                </View>
              </View>
              <View
                style={{
                  alignSelf: "center",
                  minWidth: 45,
                }}
              >
                {data.isError ? (
                  <Text style={styles.errorReading}>***</Text>
                ) : (
                  <Text style={styles.reading}>{data.energy}</Text>
                )}
                <Caption style={styles.readingUnit}>{i18n.t("Kwh")}</Caption>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Today's WaterDischarge */}
        <Card
          style={[
            styles.card,
            { borderLeftColor: "#FF54A7", marginBottom: 40 },
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={[
                      styles.icon,
                      {
                        marginLeft: -5,
                        marginRight: 0,
                        marginTop: 0,
                      },
                    ]}
                    name="water-outline"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconMC>
                  <Title style={styles.title}>
                    {i18n.t("TodaysWaterDischarge")}
                  </Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {data.todayWaterDischargeTime}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>****</Text>
                ) : (
                  <Text style={styles.reading}>{data.todayWaterDischarge}</Text>
                )}
                <Caption style={styles.readingUnit}>{i18n.t("Liters")}</Caption>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar visible={data.showSnackbar} onDismiss={onDismissSnackBar}>
        {data.snackbarText}
      </Snackbar>
      {data.isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default LiveStatus;

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    flexWrap: "wrap",
    flex: 1,
    textAlign: "left",
    lineHeight: 18,
    marginLeft: 10,
  },
  card: {
    minHeight: 100,
    width: "94%",
    borderLeftWidth: 6,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 6,
    borderRightWidth: 3,
    borderRightColor: "#ddd",
    marginVertical: 7,
    marginLeft: "3%",
    paddingTop: 10,
    paddingBottom: 5,
  },
  cardContent: {
    paddingVertical: 1,
    flex: 1,
  },
  contentView: { flexDirection: "row", flex: 1 },
  timestampContainer: { flexDirection: "row" },
  header: {
    fontWeight: "bold",
    fontSize: 24,
    marginVertical: 10,
    alignSelf: "flex-start",
    marginLeft: "3%",
  },
  reading: {
    fontWeight: "bold",
    fontSize: 24,
    color: Colors.clockIcon,
    textAlign: "right",
  },
  errorReading: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#FF6347",
    textAlign: "right",
  },
  readingUnit: { textAlign: "right", color: Colors.clockIcon },
  bar: {
    flex: 1,
    height: 15,
    borderRadius: 15,
    borderWidth: 0,
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 15,
  },
  yesStyle: {
    fontWeight: "bold",
    color: Colors.green,
  },
  noStyle: {
    fontWeight: "bold",
    color: Colors.graytone,
  },
  roundButton1: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderRadius: 23,
    backgroundColor: Colors.green,
    marginLeft: "auto",
    marginRight: 15,
  },
  head: { backgroundColor: Colors.graytone, padding: 10, margin: 10 },
  row: {
    flexDirection: "row",
    minHeight: 40,
    borderColor: Colors.grayAAA,
    borderWidth: 1,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    alignSelf: "center",
  },
  rightCell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    borderLeftColor: Colors.grayAAA,
    borderLeftWidth: 1,
  },
  cellTextRight: {
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 5,
  },
});
