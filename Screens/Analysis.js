import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import i18n from "i18n-js";
import SolarGenerationTab from "./SolarGenerationTab";
import WaterDischargeTab from "./WaterDischargeTab";
import PumpRunHoursTab from "./PumpRunHoursTab";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
  FontAwesome5 as IconFA5,
} from "@expo/vector-icons";
import { Colors } from "../Styles/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialBottomTabNavigator();

const Analysis = ({ navigation }) => {
  const [role, setRole] = useState("");
  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    RequiredPumpCapacity: 0,
    SPVCapacity: 0,
    selectedComponent: "",
    requiredPumpType: "",
    requiredPumpsubtype: "",
  });

  const farmerdetails = async () => {
    const farmerName = await AsyncStorage.getItem("farmerName");
    const SaralId = await AsyncStorage.getItem("SaralId");
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
      SPVCapacity: SPVCapacity,
      selectedComponent: selectedComponent,
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await farmerdetails();
      const role1 = await AsyncStorage.getItem("departmentRole");
      setRole(role1.toUpperCase());
    })();
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
              <IconM name="solar-power" color={color} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="WaterDischarge"
          children={() => (
            <WaterDischargeTab
              configuration={{
                text: i18n.t("WaterDischargeLITERS"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("WaterDischarge"),
            tabBarIcon: ({ color }) => (
              <IconFA5 name="water" color={color} size={25}></IconFA5>
            ),
          }}
        />
        <Tab.Screen
          name="PumpRunHours"
          children={() => (
            <PumpRunHoursTab
              configuration={{
                text: i18n.t("PumpRunHours"),
              }}
            />
          )}
          options={{
            tabBarLabel: i18n.t("PumpRunHours"),
            tabBarIcon: ({ color }) => (
              <IconFA5 name="hourglass-start" color={color} size={25}></IconFA5>
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default Analysis;

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
