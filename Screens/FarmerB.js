import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Caption } from "react-native-paper";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import i18n from "i18n-js";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FarmerB = ({ navigation }) => {
  const [farmerData, setFarmerData] = useState({
    applicationNo: "",
    mobileNo: "",
    farmerName: "",
    district: "",
    eaName: "",
    capacity: "",
    stateCode: "",
    requiredPumpType: "",
    requiredPumpsubtype: "",
  });
  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      const applicationNo = await AsyncStorage.getItem("SaralId");
      const farmerName = await AsyncStorage.getItem("farmerName");
      const district = await AsyncStorage.getItem("districtName");
      const capacity = await AsyncStorage.getItem("RequiredPumpCapacity");
      const mobileNo = await AsyncStorage.getItem("mobilenO");
      const eaName = await AsyncStorage.getItem("eaname");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const requiredPumpType = await AsyncStorage.getItem("requiredPumpType");
      const requiredPumpsubtype = await AsyncStorage.getItem(
        "requiredPumpsubtype",
      );
      setFarmerData({
        ...farmerData,
        applicationNo: applicationNo,
        farmerName: farmerName,
        district: district,
        mobileNo: mobileNo,
        capacity: `${capacity} HP`,
        eaName: eaName,
        stateCode: stateCode,
        requiredPumpType: requiredPumpType,
        requiredPumpsubtype: requiredPumpsubtype,
      });
    })();
  }, [isFocused]);

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={{ margin: "1%", flex: 1 }}>
        <View style={Styles.sectionTitle}>
          <IconMC
            name="account-details-outline"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconMC>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("FarmerDetails")}
          </Text>
        </View>
        <View style={[Styles.sectionView]}>
          <View style={{ marginTop: 15 }}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <IconA
                  name="solution"
                  size={Platform.OS === "ios" ? 30 : 25}
                  color={Colors.graytone}
                  style={styles.icon}
                ></IconA>
                <Text style={styles.cellTextRight}>
                  {farmerData.applicationNo}
                </Text>
              </View>
              <View style={styles.rightCell}>
                <IconMC
                  name="cellphone"
                  size={Platform.OS === "ios" ? 30 : 25}
                  color={Colors.graytone}
                  style={styles.icon}
                ></IconMC>
                <Text style={styles.cellTextRight}>{farmerData.mobileNo}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <IconF
                  name="user"
                  size={Platform.OS === "ios" ? 30 : 25}
                  color={Colors.graytone}
                  style={styles.icon}
                ></IconF>
                <Text
                  style={{
                    alignSelf: "center",
                    flexWrap: "wrap",
                    flex: 1,
                  }}
                >
                  {farmerData.farmerName}
                </Text>
              </View>
              <View style={styles.rightCell}>
                <IconMC
                  name="office-building"
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
                  {farmerData.eaName}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <IconM
                  name="location-pin"
                  size={Platform.OS === "ios" ? 30 : 25}
                  color={Colors.graytone}
                  style={styles.icon}
                ></IconM>
                <Text
                  style={{
                    alignSelf: "center",
                    flexWrap: "wrap",
                    flex: 1,
                  }}
                >
                  {`${farmerData.district}, ${farmerData.stateCode}`}
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
                  {`${farmerData.capacity} ${farmerData.requiredPumpType} ${farmerData.requiredPumpsubtype}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monitoring */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconMC
            name="eye-outline"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconMC>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("Monitoring")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={async () => {
              const deviceId = await AsyncStorage.getItem("deviceId");
              const GroupID = await AsyncStorage.getItem("groupId");
              const VHost = await AsyncStorage.getItem("vHost");
              deviceId === null || GroupID === null || VHost === null
                ? Alert.alert(
                    "Alert",
                    "DeviceId or GroupID or VHost Values are null",
                    [
                      {
                        text: i18n.t("OK"),
                      },
                    ],
                  )
                : navigation.navigate("LiveStatus");
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="text-box-check-outline"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={styles.captionText}>
                {i18n.t("LiveStatus")}
              </Caption>
            </View>
          </Pressable>
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("Performance");
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="chart-line"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={styles.captionText}>
                {i18n.t("Performance")}
              </Caption>
            </View>
          </Pressable>
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={async () => {
              const performanceVHost = await AsyncStorage.getItem(
                "performanceVHost",
              );
              const performanceTopic = await AsyncStorage.getItem(
                "performanceTopic",
              );
              performanceVHost === null || performanceTopic === null
                ? Alert.alert(
                    "Alert",
                    "PerformanceVHost or PerformanceTopic Values are null",
                    [
                      {
                        text: i18n.t("OK"),
                      },
                    ],
                  )
                : navigation.navigate("Analysis");
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconM
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="bar-chart"
                  size={30}
                  color={Colors.graytone}
                ></IconM>
              </View>
              <Caption style={styles.captionText}>{i18n.t("Analysis")}</Caption>
            </View>
          </Pressable>
        </Animatable.View>

        {/* Tracking */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconMC
            name="state-machine"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconMC>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("Tracking")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("AssetDetail");
            }}
          >
            <View style={styles.actionButton}>
              <IconFA5
                style={{ alignSelf: "center", alignItems: "center" }}
                name="solar-panel"
                size={30}
                color={Colors.graytone}
              ></IconFA5>
            </View>
            <Caption style={styles.captionText}>{i18n.t("Assets")}</Caption>
          </Pressable>
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={() => navigation.navigate("Insurance")}
          >
            <View style={Styles.actionButton}>
              <IconFA
                style={{ alignSelf: "center", alignItems: "center" }}
                name="wpforms"
                size={30}
                color={Colors.graytone}
              ></IconFA>
            </View>
            <Caption style={Styles.captionText}>{i18n.t("Insurance")}</Caption>
          </Pressable>
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={() => navigation.navigate("JCRdocument")}
          >
            <View style={styles.actionButton}>
              <IconFA
                style={{ alignSelf: "center", alignItems: "center" }}
                name="wpforms"
                size={30}
                color={Colors.graytone}
              ></IconFA>
            </View>
            <Caption style={styles.captionText}>
              {i18n.t("JCRdocument")}
            </Caption>
          </Pressable>
        </Animatable.View>

        {/* Services */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconA
            name="customer-service"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconA>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("Services")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("Complaint", {});
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="comment-text-outline"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={styles.captionText}>
                {i18n.t("Complaint")}
              </Caption>
            </View>
          </Pressable>
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={async () => {
              var eaId = await AsyncStorage.getItem("eaId");
              eaId === null
                ? Alert.alert("Alert", "EaId Value are null", [
                    {
                      text: i18n.t("OK"),
                    },
                  ])
                : navigation.navigate("ServiceCenter");
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="help-network-outline"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={styles.captionText}>
                {i18n.t("ServiceCenter")}
              </Caption>
            </View>
          </Pressable>
          <Pressable
            style={[styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("Help");
            }}
          >
            <View>
              <View style={styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="help"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={styles.captionText}>{i18n.t("Help")}</Caption>
            </View>
          </Pressable>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
};

export default FarmerB;

const styles = StyleSheet.create({
  backPanel: {
    margin: "1%",
    backgroundColor: "#ddd",
    padding: 5,
    borderRadius: 5,
    paddingVertical: 10,
  },
  searchBy: {
    alignSelf: "center",
    fontWeight: "bold",
    fontFamily: "roboto-regular",
    marginRight: 5,
    color: Colors.graytone,
  },
  searchInput: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayAAA,
    height: 40,
    paddingBottom: 0,
    marginRight: 5,
  },
  sectionTitle: {
    zIndex: 100,
    backgroundColor: Colors.primaryOrange,
    alignSelf: "flex-start",
    marginLeft: 15,
    marginTop: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: Colors.white,
    fontFamily: "roboto-regular",
    flexDirection: "row",
  },
  sectionView: {
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.grayAAA,
    marginTop: -15,
  },
  actionButton: {
    borderColor: Colors.graytone,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  actionButtonSmall: {
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  captionText: {
    textAlign: "center",
    color: Colors.graytone,
    alignSelf: "center",
  },
  pressable: { flex: 0.5, marginTop: 15 },
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
  icon: {
    marginHorizontal: 5,
    alignSelf: "center",
    color: Colors.graytone,
  },
  cellTextRight: {
    alignSelf: "center",
    marginRight: 5,
  },
});
