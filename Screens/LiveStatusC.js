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

// initialization for MQTT connection
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 60,
  enableCache: false,
  reconnect: false,
  sync: {},
});

const LiveStatusC = ({ navigation }) => {
  let configData = null;
  let valueData = null;
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
    currentStatus: "",
    // inverterStatus: "Stop",
    inverterStatus: 0,
    showSnackbar: false,
    snackbarText: "",
    isBusy: false,
    isError: false,
    capacity: `{RequiredPumpCapacity} HP`,
    gridStatus: 0,
    CumulativeStatus: 0.0,
    CumulativeUnit: "",
    CumulativeExportStatusTime: "",
    CumulativeImportStatus: 0.0,
    CumulativeImportUnit: "",
    CumulativeImportStatusTime: "",
    CumulativeNetStatus: 0.0,
    CumulativeNetUnit: "",
    CumulativeImportStatusTime: "",
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
    try {
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
        password: brokerUserName,
        onSuccess: () => {
          console.log("Client connected");
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
                        // latitude
                        case "LAT":
                          dummyData.latitude = element.value;
                          break;
                        // longitude
                        case "LONG":
                          dummyData.longitude = element.value;
                          break;
                        // solarGeneration
                        case "POW2":
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
                        // Pump Status
                        case "PMPST":
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
                        case "POW1":
                          dummyData.currentStatus = element.value;
                          break;
                        // Inverter Status
                        case "ISTS1":
                          dummyData.inverterStatus = element.value;
                          break;
                        // Grid Status
                        case "GRIDST":
                          dummyData.gridStatus = element.value;
                          break;
                        // Cumulative Export
                        case "KWHEXP1":
                          dummyData.CumulativeStatus = element.value;
                          dummyData.CumulativeUnit = element.unit;
                          dummyData.CumulativeExportStatusTime = element.time;
                          break;
                        // Cumulative Import
                        case "KWHIMP1":
                          dummyData.CumulativeImportStatus = element.value;
                          dummyData.CumulativeImportUnit = element.unit;
                          dummyData.CumulativeImportStatusTime = element.time;
                          break;
                        // Cumulative Net
                        case "NET":
                          dummyData.CumulativeNetStatus = CumulativeNetStatus;
                          dummyData.CumulativeNetUnit = element.unit;
                          dummyData.CumulativeNetStatusTime = element.time;
                          break;
                      }
                    });
                  } catch (error) {
                    console.log("error", error);
                  }
                  const currentStatus =
                    dummyData.currentStatus == 0
                      ? "No Status"
                      : dummyData.pumpControllerStatus > 0
                      ? "Import"
                      : "Export";

                  const inverterText =
                    dummyData.inverterStatus == 0 ? "Stop" : "Running";

                  const statusText =
                    dummyData.pumpControllerStatus === 0
                      ? i18n.t("Stop")
                      : dummyData.pumpControllerStatus === 1
                      ? i18n.t("Running")
                      : dummyData.pumpControllerStatus === 2
                      ? i18n.t("Sleep")
                      : "Protection Operated";

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

                  const CumulativeNetStatus = (
                    dummyData.CumulativeImportStatus -
                    dummyData.CumulativeStatus
                  ).toFixed(1);

                  // const solarGenerationRating = starRatingValue(
                  //   spvCapacity,
                  //   dummyData.runtime,
                  //   dummyData.solarGeneration
                  // );

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
                    //solarGenerationRating: solarGenerationRating,
                    solarGenerationTime: moment(
                      dummyData.solarGenerationTime,
                      "YYYY-MM-DD HH:mm:ss",
                    ).format("DD-MM-YYYY HH:mm"),
                    // waterDischarge: dummyData.waterDischarge,
                    // waterDischargeTime: moment(
                    //   dummyData.waterDischargeTime,
                    //   "YYYY-MM-DD HH:mm:ss"
                    // ).format("DD-MM-YYYY HH:mm"),
                    pumpControllerStatus: dummyData.pumpControllerStatus,
                    pumpControllerStatusStr: statusText,
                    pumpColor: pumpColor,
                    pumpIcon: pumpIcon,
                    pumpControllerStatusTime: moment(
                      dummyData.pumpControllerStatusTime,
                      "YYYY-MM-DD HH:mm:ss",
                    ).format("DD-MM-YYYY HH:mm"),
                    // runtime: dummyData.runtime,
                    // runtimeTime: moment(
                    //   dummyData.runtimeTime,
                    //   "YYYY-MM-DD HH:mm:ss"
                    // ).format("DD-MM-YYYY HH:mm"),
                    // runtimePercentage: dummyData.runtimePercentage,
                    geolocationStatus: distance > 10 ? 0 : 1,
                    geolocationStatusStr:
                      distance > 10 ? i18n.t("Mismatch") : i18n.t("Match"),
                    // energy: dummyData.energy,
                    // energyTime: moment(
                    //   dummyData.energyTime,
                    //   "YYYY-MM-DD HH:mm:ss"
                    // ).format("DD-MM-YYYY HH:mm"),
                    // todayWaterDischarge: dummyData.todayWaterDischarge,
                    // todayWaterDischargeTime: moment(
                    //   dummyData.todayWaterDischargeTime,
                    //   "YYYY-MM-DD HH:mm:ss"
                    // ).format("DD-MM-YYYY HH:mm"),
                    // scheduleEnable: dummyData.scheduleEnable,
                    // scheduleTime: dummyData.scheduleTime,
                    // scheduleDuration: dummyData.scheduleDuration,
                    // scheduleMode: dummyData.scheduleMode,
                    // scheduleDayConfigurtion: dummyData.scheduleDayConfigurtion,
                    currentStatus: currentStatus,
                    inverterStatus: inverterText,
                    gridStatus: dummyData.gridStatus,
                    CumulativeStatus: dummyData.CumulativeStatus,
                    CumulativeUnit: dummyData.CumulativeUnit,
                    CumulativeExportStatusTime: moment(
                      dummyData.CumulativeExportStatusTime,
                      "YYYY-MM-DD HH:mm:ss",
                    ).format("DD-MM-YYYY HH:mm"),
                    CumulativeImportStatus: dummyData.CumulativeImportStatus,
                    CumulativeImportUnit: dummyData.CumulativeImportUnit,
                    CumulativeImportStatusTime: moment(
                      dummyData.CumulativeImportStatusTime,
                      "YYYY-MM-DD HH:mm:ss",
                    ).format("DD-MM-YYYY HH:mm"),
                    CumulativeNetStatus: CumulativeNetStatus,
                    CumulativeNetUnit: dummyData.CumulativeNetUnit,
                    CumulativeNetStatusTime: moment(
                      dummyData.CumulativeNetStatusTime,
                      "YYYY-MM-DD HH:mm:ss",
                    ).format("DD-MM-YYYY HH:mm"),
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
          console.log("Inside onFailure", error);
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
      // main catch block
      setData({
        ...data,
        isBusy: false,
        showSnackbar: true,
        snackbarText:
          i18n.t("FailedToConnectWithMQTTBrokerServer") + JSON.stringify(error),
      });
    }
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

  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    ApplicationNo: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    selectedComponent: "",
    stateCode: "",
  });

  const farmerdetails = async () => {
    const farmerName = await AsyncStorage.getItem("farmerName");
    const SaralId = await AsyncStorage.getItem("SaralId");
    const ApplicationNo = await AsyncStorage.getItem("applicationNo");
    const RequiredPumpType = await AsyncStorage.getItem("RequiredPumpType");
    const RequiredPumpCapacity = await AsyncStorage.getItem(
      "RequiredPumpCapacity",
    );
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const stateCode = await AsyncStorage.getItem("stateCode");

    setFarmerdata({
      ...Farmerdata,
      farmerName: farmerName,
      SaralId: SaralId,
      ApplicationNo: ApplicationNo,
      RequiredPumpCapacity: RequiredPumpCapacity,
      RequiredPumpType: RequiredPumpType,
      SPVCapacity: SPVCapacity,
      selectedComponent: selectedComponent,
      stateCode: stateCode,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();
    (async () => {
      await farmerdetails();
      await connectBroker();
      const department = await AsyncStorage.getItem("departmentRole");
      setDepartment(department);
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
      <View style={{ margin: 10 }}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconF
              name="user"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
              style={styles.icon}
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
              style={styles.icon}
            ></IconA>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {Farmerdata.stateCode === "HR"
                ? Farmerdata.SaralId
                : Farmerdata.ApplicationNo}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconMC
              name="view-grid"
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
              {Farmerdata.SPVCapacity} KWp
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pump Operation */}
        {department.toUpperCase() === "FARMER" && (
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
              onPress={() => {
                if (
                  data.scheduleEnable &&
                  data.scheduleTime &&
                  data.scheduleDuration &&
                  data.scheduleMode &&
                  data.scheduleDayConfigurtion
                ) {
                  navigation.navigate("PumpSchedule", {
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

        {/* Live Status */}
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
                  <Text style={styles.reading}>
                    {Farmerdata.selectedComponent === "ComponentC"
                      ? data.solarGeneration
                      : 0.8}
                  </Text>
                )}
                <Caption style={[styles.readingUnit, { marginLeft: "auto" }]}>
                  {Farmerdata.selectedComponent === "ComponentC"
                    ? " KW"
                    : " MW"}
                </Caption>
                {/* {Farmerdata.selectedComponent === "ComponentC" && (
                  <Rating
                    readonly={true}
                    imageSize={20}
                    startingValue={data.solarGenerationRating}
                    style={{ paddingVertical: 5 }}
                  />
                )} */}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* current Status1 */}
        {Farmerdata.stateCode === "KL" && (
          <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentView}>
                <View style={{ flex: 1 }}>
                  <View style={Styles.itemTitleView}>
                    <IconM
                      style={styles.icon}
                      name="event-note"
                      size={Platform.OS === "ios" ? 35 : 30}
                    ></IconM>
                    <Title style={[styles.title, { marginTop: -5 }]}>
                      {i18n.t("currentStatus1")}
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
                    <Text
                      style={[
                        styles.reading,
                        {
                          color:
                            data.currentStatus == 0
                              ? Colors.black
                              : data.currentStatus > 0
                              ? Colors.red
                              : Colors.green,
                        },
                      ]}
                    >
                      {data.currentStatus}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Grid Status */}
        {Farmerdata.stateCode !== "KL" && (
          <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentView}>
                <View style={{ flex: 1 }}>
                  <View style={Styles.itemTitleView}>
                    <IconM
                      style={styles.icon}
                      name="electrical-services"
                      size={Platform.OS === "ios" ? 35 : 30}
                    ></IconM>
                    <Title style={[styles.title, { marginTop: -5 }]}>
                      {i18n.t("GridStatus")}
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
                    <Text style={styles.reading}>{data.gridStatus} Phase</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Inverter Status */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={styles.icon}
                    name="application-export"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconMC>
                  <Title style={[styles.title, { marginTop: -5 }]}>
                    {i18n.t("InverterStatus")}
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
                  <Text
                    style={[
                      styles.reading,
                      {
                        color:
                          data.inverterStatus == 0 ? Colors.red : Colors.green,
                      },
                    ]}
                  >
                    {data.inverterStatus}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Cumulative Export */}
        <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.contentView}>
              <View style={{ flex: 1 }}>
                <View style={Styles.itemTitleView}>
                  <IconMC
                    style={styles.icon}
                    name="export"
                    size={Platform.OS === "ios" ? 35 : 30}
                  ></IconMC>
                  <Title style={styles.title}>
                    {i18n.t("ComulativeExport")}
                  </Title>
                </View>
                <View style={styles.timestampContainer}>
                  <IconMC
                    name="clock-outline"
                    size={25}
                    color={Colors.clockIcon}
                  ></IconMC>
                  <Caption style={{ marginLeft: 5 }}>
                    {data.CumulativeExportStatusTime}
                  </Caption>
                </View>
              </View>
              <View style={{ alignSelf: "center", flex: 1 }}>
                {data.isError ? (
                  <Text style={styles.errorReading}>*****</Text>
                ) : (
                  <Text style={[styles.reading, { color: Colors.black }]}>
                    {data.CumulativeStatus}
                  </Text>
                )}
                <Caption style={[styles.readingUnit, { marginLeft: "auto" }]}>
                  {data.CumulativeUnit}
                </Caption>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Cumulative Import */}
        {Farmerdata.stateCode === "KL" && (
          <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentView}>
                <View style={{ flex: 1 }}>
                  <View style={Styles.itemTitleView}>
                    <IconMC
                      style={styles.icon}
                      name="import"
                      size={Platform.OS === "ios" ? 35 : 30}
                    ></IconMC>
                    <Title style={styles.title}>
                      {i18n.t("ComulativeImport")}
                    </Title>
                  </View>
                  <View style={styles.timestampContainer}>
                    <IconMC
                      name="clock-outline"
                      size={25}
                      color={Colors.clockIcon}
                    ></IconMC>
                    <Caption style={{ marginLeft: 5 }}>
                      {data.CumulativeImportStatusTime}
                    </Caption>
                  </View>
                </View>
                <View style={{ alignSelf: "center", flex: 1 }}>
                  {data.isError ? (
                    <Text style={styles.errorReading}>*****</Text>
                  ) : (
                    <Text style={[styles.reading, { color: Colors.black }]}>
                      {data.CumulativeImportStatus}
                    </Text>
                  )}
                  <Caption style={[styles.readingUnit, { marginLeft: "auto" }]}>
                    {data.CumulativeImportUnit}
                  </Caption>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Cumulative Net */}
        {Farmerdata.stateCode === "KL" && (
          <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentView}>
                <View style={{ flex: 1 }}>
                  <View style={Styles.itemTitleView}>
                    <IconMC
                      style={styles.icon}
                      name="lan"
                      size={Platform.OS === "ios" ? 35 : 30}
                    ></IconMC>
                    <Title style={styles.title}>
                      {i18n.t("ComulativeNet")}
                    </Title>
                  </View>
                  <View style={styles.timestampContainer}>
                    <IconMC
                      name="clock-outline"
                      size={25}
                      color={Colors.clockIcon}
                    ></IconMC>
                    <Caption style={{ marginLeft: 5 }}>
                      {data.CumulativeNetStatusTime}
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
                          color:
                            data.CumulativeNetStatus < 0
                              ? Colors.green
                              : Colors.red,
                        },
                      ]}
                    >
                      {data.CumulativeNetStatus}
                    </Text>
                  )}
                  <Caption style={[styles.readingUnit, { marginLeft: "auto" }]}>
                    KWH
                  </Caption>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Pump Status */}
        {Farmerdata.stateCode !== "KL" && (
          <Card style={[styles.card, { borderLeftColor: Colors.shadowBorder }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentView}>
                <View style={{ flex: 1 }}>
                  <View style={Styles.itemTitleView}>
                    <IconMC
                      style={styles.icon}
                      name="state-machine"
                      size={Platform.OS === "ios" ? 35 : 30}
                    ></IconMC>
                    <Title style={styles.title}>{i18n.t("PumpStatus")}</Title>
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
        )}

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

export default LiveStatusC;

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
    color: Colors.green,
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
