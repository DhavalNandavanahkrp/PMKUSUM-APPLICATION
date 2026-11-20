import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { Title, Paragraph, Snackbar } from "react-native-paper";
import { Table, Row, Rows } from "react-native-table-component";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import i18n from "i18n-js";
import * as APIHelper from "../Data/APIHelper";
import { useIsFocused } from "@react-navigation/native";

const UserProfile = ({ navigation }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [data, setData] = useState({});
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });
  const onDismissSnackBar = () => {
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await getProfileData();
    })();
  }, [isFocused]);

  const getProfileData = async () => {
    setIsBusy(true);
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("authToken");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/UserAuth/GetUserProfile?userId=${userId}&PROJCD=${Component}`;
    const callResult = await APIHelper.Get(route, token);
    const uniqueObjArray = [];
    if (callResult.Result) {
      setData({
        ...data,
        stateCode: stateCode,
        name: `${callResult.Data.UserData.Farmer_Name} ${callResult.Data.UserData.Father_Name}`,
        appNo:
          stateCode === "HR"
            ? callResult.Data.UserData.SaralNo
            : callResult.Data.ApplicationNO,
        contactDetail: [
          [i18n.t("Mobile"), callResult.Data.PhoneNumber],
          [i18n.t("Email"), callResult.Data.Email],
          [i18n.t("Component"), callResult.Data.Comp.toUpperCase()],
          [i18n.t("Department"), callResult.Data.DepartmentType],
          [i18n.t("Designation"), callResult.Data.Designation],
        ],
        importantDates: [
          [
            i18n.t("Commissioning&GoLiveDate"),
            callResult.Data.UserData.CommissioningDate,
          ],
          [i18n.t("InspectionDate"), callResult.Data.UserData.InspectionDate],
        ],
        address: [
          [i18n.t("Address"), callResult.Data.UserData.Address],
          [i18n.t("Latitude"), callResult.Data.UserData.Latitude],
          [i18n.t("Longitude"), callResult.Data.UserData.Longitude],
          [i18n.t("District"), callResult.Data.UserData.District],
          [i18n.t("Taluka"), callResult.Data.UserData.Taluka],
          [i18n.t("Town"), callResult.Data.UserData.Town],
          [i18n.t("LandSurveyNo"), callResult.Data.UserData.LanSurveyNo],
        ],
        pumpDetail: [
          [i18n.t("PumpType"), callResult.Data.UserData.RequiredPumpType],
          [i18n.t("PumpSubtype"), callResult.Data.UserData.RequiredPumpsubtype],
          [
            i18n.t("PumpCapacity"),
            `${callResult.Data.UserData.RequiredPumpCapacity} hp`,
          ],
          [
            i18n.t("PumpCategory"),
            callResult.Data.UserData.RequiredPumpCategory,
          ],
        ],
        irrigationDetail: [
          [i18n.t("SourceofWater"), callResult.Data.UserData.SourceOfWater],
          [i18n.t("IrrigationMode"), callResult.Data.UserData.IrrigationMode],
        ],
      });
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
    setIsBusy(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={{ margin: 15 }}>
        <View style={{ flexDirection: "row" }}>
          <Image source={require("../assets/Avatar.png")} width="120" />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Title style={{ color: Colors.graytone }}>{data.name}</Title>
            {data.stateCode === "HR" ? (
              <Paragraph>
                {i18n.t("SaralNo")} : {data.appNo}
              </Paragraph>
            ) : (
              <Paragraph>
                {i18n.t("ApplicationNo")} : {data.appNo}
              </Paragraph>
            )}
          </View>
        </View>
      </View>
      <ScrollView style={{ marginHorizontal: "3%" }}>
        <View>
          {/* Contact Details */}
          <Table>
            <Row
              data={[i18n.t("ContactDetails")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
            <Rows
              data={data.contactDetail}
              flexArr={[1, 2]}
              textStyle={styles.itemNameText}
            />
          </Table>

          {/* important dates */}
          <Table style={{ marginTop: 10 }}>
            <Row
              data={[i18n.t("ImportantDates")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
            <Rows
              data={data.importantDates}
              flexArr={[1.5, 1]}
              textStyle={styles.itemNameText}
            />
          </Table>
          {/* Location and Address */}
          <Table style={{ marginTop: 10 }}>
            <Row
              data={[i18n.t("FarmLocationAddress")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
            <Rows
              data={data.address}
              flexArr={[1, 2]}
              textStyle={styles.itemNameText}
            />
          </Table>
          {/* Pump Details */}
          <Table style={{ marginTop: 10 }}>
            <Row
              data={[i18n.t("PumpDetails")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
            <Rows
              data={data.pumpDetail}
              flexArr={[1, 2]}
              textStyle={styles.itemNameText}
            />
          </Table>
          {/* Irrigation Details */}
          <Table style={{ marginTop: 10 }}>
            <Row
              data={[i18n.t("IrrigationDetails")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table
            style={{ marginBottom: 20 }}
            borderStyle={{
              borderWidth: 1,
              borderColor: "#aaa",
            }}
          >
            <Rows
              data={data.irrigationDetail}
              flexArr={[1.1, 2]}
              textStyle={styles.itemNameText}
            />
          </Table>
        </View>
      </ScrollView>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  head: { backgroundColor: Colors.graytone, padding: 10 },
  headerText: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
  itemNameText: {
    fontSize: 15,
    margin: 10,
    flexWrap: "wrap",
  },
});
