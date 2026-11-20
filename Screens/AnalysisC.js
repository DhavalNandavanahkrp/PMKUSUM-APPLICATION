import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import i18n from "i18n-js";
import SolarGenerationTab from "./SolarGenerationTab";
import PumpConsumptionTab from "./PumpConsumptionTab";
import NetExportTab from "./NetExportTab";
import NetImportTab from "./NetImportTab";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";
import { Colors } from "../Styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialBottomTabNavigator();

const AnalysisC = ({ navigation }) => {
  const [data, setData] = useState({ selection: 0 });
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
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");
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
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await farmerdetails();
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

      <Tab.Navigator
        initialRouteName="SolarGeneration"
        activeColor="#fff"
        inactiveColor="#344955"
        shifting="true"
        barStyle={{
          backgroundColor: "#F9AA33",
          height: 65,
        }}
      >
        <Tab.Screen
          name="SolarGeneration"
          children={() => (
            <SolarGenerationTab
              configuration={{
                text: i18n.t("SolarGenerationKWH"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("SolarGeneration"),
            tabBarIcon: ({ color }) => (
              <IconMC name="solar-power" color={color} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="PumpConsumption"
          children={() => (
            <PumpConsumptionTab
              configuration={{
                text: i18n.t("PumpConsumption"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("Consumption"),
            tabBarIcon: ({ color }) => (
              <IconMC name="water-pump" color={color} size={25}></IconMC>
            ),
          }}
        />
        <Tab.Screen
          name="NetExport"
          children={() => (
            <NetExportTab
              configuration={{
                text: i18n.t("NetExport"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("NetExport"),
            tabBarIcon: ({ color }) => (
              <IconMC name="export" color={color} size={25}></IconMC>
            ),
          }}
        />
        <Tab.Screen
          name="NetImport"
          children={() => (
            <NetImportTab
              configuration={{
                text: i18n.t("NetImport"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("NetImport"),
            tabBarIcon: ({ color }) => (
              <IconMC name="import" color={color} size={25}></IconMC>
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default AnalysisC;

const styles = StyleSheet.create({
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
