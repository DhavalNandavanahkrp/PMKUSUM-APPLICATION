import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { Snackbar } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import i18n from "i18n-js";

const ServiceCenter = () => {
  const [isBusy, setIsBusy] = useState(false);
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
  const [data, setData] = useState({
    agencyName: "",
    centerName: "",
    address: "",
    city: "",
    district: "",
    state: "",
    personName: "",
    email: "",
    contactNo: "",
    eaid: "",
    check_textInputChange: false,
  });

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await getMasterServiceData();
    })();
  }, [isFocused]);

  const getMasterServiceData = async () => {
    setIsBusy(true);
    const userName = await AsyncStorage.getItem("userName");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const token = await AsyncStorage.getItem("authToken");
    const stateCode = await AsyncStorage.getItem("stateCode");
    var eaId = await AsyncStorage.getItem("eaId");
    var District = await AsyncStorage.getItem("District");
    var State = await AsyncStorage.getItem("State");
    const route = `${apiUrl}api/${stateCode}/ServiceCenter/GetAll_M?VenderId=${eaId}&State=${State}&District=${District}`;
    const callResult = await APIHelper.Get(route, token);
    if (callResult.Result) {
      setData({
        agencyName: callResult.Data[0].Vendor_Name,
        centerName: callResult.Data[0].ServiceCenterName,
        address: callResult.Data[0].Address,
        city: callResult.Data[0].City,
        district: callResult.Data[0].District_Name,
        state: callResult.Data[0].State_Name,
        personName: callResult.Data[0].ContactPerson,
        email: callResult.Data[0].Email,
        //eaid: callResult.Data[0].EaId,
        contactNo: callResult.Data[0].ContactDetails,
        whatsAppNo: callResult.Data[0].WhatsAppNumber,
        check_textInputChange: true,
      });
      //await AsyncStorage.setItem("eaid", callResult.Data[0].EaId);
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
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={{ margin: "1%" }}>
        <View
          style={{
            height: 40,
            backgroundColor: Colors.graytone,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.white,
              fontWeight: "bold",
            }}
          >
            {i18n.t("ServiceCenterDetail")}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("EmpanelledAgency")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text ellipsizeMode={"tail"}>{data.agencyName}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ServiceCenterName")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text numberOfLines={2} ellipsizeMode={"middle"}>
              {data.centerName}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ServiceCenterAddress")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.address}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ServiceCenterCity")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.city}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ServiceCenterDistrict")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.district}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ServiceCenterState")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.state}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ContactPersonName")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.personName}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("EmailAddress")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text>{data.email}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("ContactNumber")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text
              style={styles.contact}
              onPress={() => {
                Linking.openURL(`tel:${data.contactNo}`);
              }}
            >
              {data.contactNo}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.nameCell}>
            <Text style={{ color: Colors.graytone }}>
              {i18n.t("WhatsAppNumber")}
            </Text>
          </View>
          <View style={styles.valueCell}>
            <Text
              style={styles.contact}
              onPress={() => {
                Linking.openURL(`tel://${data.whatsAppNo}`);
              }}
            >
              {data.whatsAppNo}
            </Text>
          </View>
        </View>
      </View>
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

export default ServiceCenter;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cellBackground,
    minHeight: 40,
  },
  nameCell: {
    borderRightWidth: 1,
    borderRightColor: Colors.cellBackground,
    width: "45%",
    justifyContent: "center",
    paddingLeft: 5,
  },
  valueCell: {
    justifyContent: "center",
    paddingLeft: 5,
    // paddingRight:10,
    width: "50%",
  },
  contact: {
    textDecorationLine: "underline",
    color: Colors.red,
  },
});
