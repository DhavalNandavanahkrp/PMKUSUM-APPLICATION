import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Caption } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { ScrollView } from "react-native-gesture-handler";
import { Styles } from "../Styles/GlobalStyles";
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
const PerformanceC = ({ navigation }) => {
  let capacity;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(false);
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
  });
  const isFocused = useIsFocused();

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
    (async () => {
      await farmerdetails();
      capacity = await AsyncStorage.getItem("RequiredPumpCapacity");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    })();
  }, [isFocused]);

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

      <ScrollView style={{ flex: 1 }}>
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
              {i18n.t("SolarGeneration")}{" "}
              {Farmerdata.selectedComponent === "ComponentC"
                ? "(KWh)"
                : "(MWh)"}
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
          <Caption style={styles.captionText}>
            {i18n.t("PlantDCCapacity")} : {performanceData.capacity} kw
          </Caption>
        </Animatable.View>

        {/* Energy Yield */}
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[styles.sectionContainer, { borderColor: "#FF99CC" }]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: "#FF99CC" }]}
          >
            <Title style={{ color: "#fff" }}>{i18n.t("EnergyYield")}</Title>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
            <Title style={styles.durationText}>{i18n.t("CurrentMonth")}</Title>
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

        {/* Pump Consumption */}
        {Farmerdata.selectedComponent === "ComponentC" && (
          <Animatable.View
            animation="slideInRight"
            duration={1000}
            style={[styles.sectionContainer, { borderColor: "#3399FF" }]}
          >
            <View
              style={[styles.headerContainer, { backgroundColor: "#3399FF" }]}
            >
              <Title style={{ color: "#fff" }}>
                {i18n.t("PumpConsumption")}
              </Title>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
              <Title style={styles.durationText}>
                {i18n.t("CurrentMonth")}
              </Title>
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
        )}

        {/* Import  */}
        {Farmerdata.selectedComponent === "ComponentC" && (
          <Animatable.View
            animation="slideInLeft"
            duration={1000}
            style={[styles.sectionContainer, { borderColor: Colors.red }]}
          >
            <View
              style={[styles.headerContainer, { backgroundColor: Colors.red }]}
            >
              <Title style={{ color: "#fff" }}>{i18n.t("Import")}</Title>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Title style={styles.durationText}>{i18n.t("Yesterday")}</Title>
              <Title style={styles.durationText}>
                {i18n.t("CurrentMonth")} ({i18n.t("Avg")})
              </Title>
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
            </View>
          </Animatable.View>
        )}

        {/* Net Details (Import/Export)  */}
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[styles.sectionContainer, { borderColor: "#00ABF0" }]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: "#00ABF0" }]}
          >
            <Title style={{ color: "#fff" }}>{i18n.t("NetDetails")}</Title>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerformanceC;

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
