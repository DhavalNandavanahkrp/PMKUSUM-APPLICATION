import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, RefreshControl, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Snackbar } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { ScrollView } from "react-native-gesture-handler";
import { Styles } from "../Styles/GlobalStyles";
import moment from "moment";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { useIsFocused } from "@react-navigation/native";

import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  AntDesign as IconA,
  SimpleLineIcons as SIcon,
} from "@expo/vector-icons";
const Performance = ({ navigation }) => {
  let capacity;
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState("");
  const [performanceData, setPerformanceData] = useState({
    solarGeneration: 0.0,
    solarGenerationNoData: true,
    solarGenerationMonth: 0.0,
    runHours: 0.0,
    runHoursNoData: true,
    runHoursMonth: 0.0,
    waterDischarge: 0.0,
    waterDischargeNoData: true,
    waterDischargeMonth: 0.0,
    cuf: 5.0,
    cufNoData: true,
    cufMonth: 0,
    capacity: 0,
    showSnackbar: false,
    snackbarText: "",
    isBusy: false,
    isError: true,
    capacity: "",
  });
  const onDismissSnackBar = () =>
    setPerformanceData({
      ...performanceData,
      showSnackbar: false,
      snackbarText: "",
    });
  const isFocused = useIsFocused();

  const connectBroker = async () => {
    try {
      const broker = await AsyncStorage.getItem("broker");
      const brokerPort = await AsyncStorage.getItem("brokerPort");
      let performanceVHost = await AsyncStorage.getItem("performanceVHost");
      let performanceTopic = await AsyncStorage.getItem("performanceTopic");
      const capacity = await AsyncStorage.getItem("RequiredPumpCapacity");
      const year = moment().format("YY");
      const month = moment().format("MM");
      performanceVHost = performanceVHost
        .replace("yy", year)
        .replace("MM", month);
      performanceTopic = performanceTopic
        .replace("yy", year)
        .replace("MM", month);
      const brokerUserName = performanceVHost + ":test";
      // const brokerUserName = 'instantaneous1:test';
      const brokerPassword = await AsyncStorage.getItem("brokerPassword");
      // create mqtt client
      const client = new Paho.MQTT.Client(
        broker,
        parseInt(brokerPort),
        "/ws",
        Math.random().toString(36).substr(2, 9),
      );

      console.log("Performance - Broker: ", broker);
      console.log("Performance - Broker User: ", brokerUserName);
      console.log("Performance - Broker Password: ", "test");
      // connect to client
      client.connect({
        useSSL: true,
        userName: brokerUserName,
        password: "test",
        onSuccess: () => {
          //Process when message arrives for subscribed topic
          client.onMessageArrived = (message) => {
            try {
              const dataArray = JSON.parse(message.payloadString);

              const yesterdayDate = moment()
                .subtract(1, "day")
                .format("YYMMDD");
              let solarGeneration = {};
              let waterDischarge = {};
              let runHours = {};
              let days = 0;
              dataArray.forEach((element) => {
                let yesterdayReading = 0;
                let yesterdayReadingError = true;
                let currentMonthReading = 0;

                const arrayString = element.data
                  .trim()
                  .replace("[", "")
                  .replace("]", "");

                const dailyData = arrayString.match(/[{][0-9.',]+[}]/g);

                const matchYesterdayRecords = dailyData.filter((s) =>
                  s.includes(yesterdayDate),
                );

                if (matchYesterdayRecords.length !== 0) {
                  const yesterdayReadingElement = matchYesterdayRecords[0]
                    .replace("{", "")
                    .replace("}", "")
                    .replace(/'/g, "");
                  yesterdayReading = parseFloat(
                    yesterdayReadingElement.split(",")[1],
                  );
                  yesterdayReadingError = false;
                } else {
                  yesterdayReading = 0;
                  yesterdayReadingError = true;
                }

                days = dailyData.length;

                dailyData.forEach((element) => {
                  const dailyReadings = element
                    .replace("{", "")
                    .replace("}", "")
                    .replace(/'/g, "");
                  currentMonthReading += parseFloat(
                    dailyReadings.split(",")[1],
                  );
                });

                if (element.dnm === "PTOTKWH1") {
                  solarGeneration = {
                    yesterdayReading: yesterdayReading,
                    yesterdayReadingError: yesterdayReadingError,
                    currentMonthReading: currentMonthReading,
                  };
                } else if (element.dnm === "PTOTHR1") {
                  runHours = {
                    yesterdayReading: yesterdayReading,
                    yesterdayReadingError: yesterdayReadingError,
                    currentMonthReading: currentMonthReading,
                  };
                } else if (element.dnm === "POPTOTWD1") {
                  waterDischarge = {
                    yesterdayReading: yesterdayReading,
                    yesterdayReadingError: yesterdayReadingError,
                    currentMonthReading: currentMonthReading,
                  };
                }
              });

              const cufMonth1 =
                (solarGeneration.currentMonthReading /
                  (capacity * days * 365)) *
                100;
              const cufYesterday = solarGeneration.yesterdayReadingError
                ? 0
                : (solarGeneration.yesterdayReading / (capacity * 365)) * 100;
              setPerformanceData({
                ...performanceData,
                solarGeneration: solarGeneration.yesterdayReading.toFixed(2),
                solarGenerationNoData: solarGeneration.yesterdayReadingError,
                solarGenerationMonth:
                  solarGeneration.currentMonthReading.toFixed(2),
                runHours: runHours.yesterdayReading,
                runHoursNoData: runHours.yesterdayReadingError,
                runHoursMonth: runHours.currentMonthReading,
                waterDischarge: waterDischarge.yesterdayReading,
                waterDischargeNoData: waterDischarge.yesterdayReadingError,
                waterDischargeMonth: waterDischarge.currentMonthReading,
                cuf: cufYesterday.toFixed(2),
                cufNoData: solarGeneration.yesterdayReadingError,
                cufMonth: cufMonth1.toFixed(2),
                capacity: capacity,
                isBusy: false,
                isError: false,
              });
            } catch (error) {
              setPerformanceData({
                ...performanceData,
                isBusy: false,
                isError: true,
                showSnackbar: true,
                snackbarText:
                  i18n.t("Failedtoparsedata") + JSON.stringify(error),
              });
            }
          };

          // subscribe for value topic
          client.subscribe(performanceTopic, {
            qos: 0,
            timeout: 60,
            onSuccess: function () {
              console.log(
                `${performanceTopic} Topic Subscription Successful..!!`,
              );
            },
            onFailure: function (error) {
              setPerformanceData({
                ...performanceData,
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
          console.log(
            "Error in connectBroker - Inside Error 229 : ",
            JSON.stringify(error, null, 2),
          );
          "Inside Error", error;
          setPerformanceData({
            ...performanceData,
            isBusy: false,
            isError: true,
            showSnackbar: true,
            snackbarText:
              i18n.t("FailedToConnectWithMQTTBrokerServer") +
              JSON.stringify(error),
          });
        },
      });
    } catch (error) {
      // main catch block

      console.log("Error in connectBroker - Main catch bloxk 246 : ", error);
      setPerformanceData({
        ...performanceData,
        isBusy: false,
        isError: true,
        showSnackbar: true,
        snackbarText:
          i18n.t("FailedToConnectWithMQTTBrokerServer") + JSON.stringify(error),
      });
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    capacity = await AsyncStorage.getItem("RequiredPumpCapacity");
    await connectBroker();

    setRefreshing(false);
  }, [refreshing]);
  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    selectedComponent: "",
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
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const requiredPumpType = await AsyncStorage.getItem("requiredPumpType");
    const requiredPumpsubtype = await AsyncStorage.getItem(
      "requiredPumpsubtype",
    );
    setFarmerdata({
      ...Farmerdata,
      farmerName: farmerName,
      SaralId: SaralId,
      RequiredPumpCapacity: RequiredPumpCapacity,
      RequiredPumpType: RequiredPumpType,
      SPVCapacity: SPVCapacity,
      selectedComponent: selectedComponent,
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();
    (async () => {
      await farmerdetails();
      capacity = await AsyncStorage.getItem("RequiredPumpCapacity");

      await connectBroker();
      const role1 = await AsyncStorage.getItem("departmentRole");
      setRole(role1.toUpperCase());
    })();
    return () => {
      abortController.abort();
    };
  }, [isFocused]);

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
                name={
                  Farmerdata.selectedComponent === "ComponentB"
                    ? "water-pump"
                    : "view-grid "
                }
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
        {/* Solar Generation */}
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[
            styles.sectionContainer,
            { borderColor: Colors.green, marginTop: 15 },
          ]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: Colors.green }]}
          >
            <IconMC style={styles.icon} name="solar-power" size={35}></IconMC>
            <Title style={{ color: "#fff" }}>
              {i18n.t("SolarGenerationKWH")}
            </Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
            <Title style={styles.durationText}>{i18n.t("CurrentMonth")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            {performanceData.isError ||
            performanceData.solarGenerationNoData ? (
              <Text
                style={[
                  Styles.errorReading,
                  { textAlign: "center", flex: 1, marginTop: 2 },
                ]}
              >
                ***
              </Text>
            ) : (
              <Text style={styles.readingText}>
                {performanceData.solarGeneration}
              </Text>
            )}

            <Text style={styles.readingText}>
              {performanceData.solarGenerationMonth}
            </Text>
          </View>
        </Animatable.View>

        {/* Running hours */}
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[styles.sectionContainer, { borderColor: Colors.red }]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: Colors.red }]}
          >
            <IconFA
              style={styles.icon}
              name="hourglass-start"
              size={25}
              color="#fff"
            ></IconFA>
            <Title style={{ color: "#fff" }}>{i18n.t("RunningHours")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
            <Title style={styles.durationText}>{i18n.t("CurrentMonth")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            {performanceData.isError || performanceData.runHoursNoData ? (
              <Text
                style={[
                  Styles.errorReading,
                  { textAlign: "center", flex: 1, marginTop: 2 },
                ]}
              >
                ***
              </Text>
            ) : (
              <Text style={styles.readingText}>
                {performanceData.runHours.toFixed(2)}
              </Text>
            )}
            <Text style={styles.readingText}>
              {performanceData.runHoursMonth.toFixed(2)}
            </Text>
          </View>
        </Animatable.View>

        {/* Water Discharge */}
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[styles.sectionContainer, { borderColor: "#00ABF0" }]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: "#00ABF0" }]}
          >
            <IconFA style={styles.icon} name="water" size={25}></IconFA>
            <Title style={{ color: "#fff" }}>
              {i18n.t("WaterDischargeLITERS")}
            </Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
            <Title style={styles.durationText}>{i18n.t("CurrentMonth")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            {performanceData.isError || performanceData.waterDischargeNoData ? (
              <Text
                style={[
                  Styles.errorReading,
                  { textAlign: "center", flex: 1, marginTop: 2 },
                ]}
              >
                ***
              </Text>
            ) : (
              <Text style={styles.readingText}>
                {performanceData.waterDischarge.toFixed(2)}
              </Text>
            )}
            <Text style={styles.readingText}>
              {performanceData.waterDischargeMonth.toFixed(2)}
            </Text>
          </View>
        </Animatable.View>

        {/* CUF */}
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[styles.sectionContainer, { borderColor: "#5416B4" }]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: "#5416B4" }]}
          >
            <Title style={{ color: "#fff" }}>
              {i18n.t("CapacityUtilizationFactor")} (%)
            </Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Title style={styles.durationText}>{i18n.t("LastYear")}</Title>
            <Title style={styles.durationText}>{i18n.t("CurrentYear")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              {performanceData.isError || performanceData.cufNoData ? (
                <Text
                  style={[
                    Styles.errorReading,
                    { textAlign: "center", flex: 1, marginTop: 2 },
                  ]}
                >
                  ***
                </Text>
              ) : (
                <Text style={styles.readingText}>{performanceData.cuf}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Title style={[styles.readingText, { marginVertical: 0 }]}>
                {performanceData.cufMonth}
              </Title>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
      <Snackbar
        visible={performanceData.showSnackbar}
        onDismiss={onDismissSnackBar}
      >
        {performanceData.snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
};

export default Performance;

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: "3%",
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    borderBottomEndRadius: 10,
    borderTopLeftRadius: 10,
  },
  head: {
    backgroundColor: Colors.graytone,
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderTopLeftRadius: 10,
  },
  icon: {
    marginRight: 5,
    alignSelf: "center",
    color: "#fff",
  },
  durationText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#344955",
  },
  readingText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    color: "#344955",
  },
  captionText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    marginVertical: 0,
    color: "#344955",
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
