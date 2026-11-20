import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar, List } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import StatusTile from "../Components/StatusTile";
import RadioForm from "react-native-simple-radio-button";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";

const ApplicationStatus = (route, navigation) => {
  const [data, setData] = useState({
    farmerName: "",
    applicationNo: "",
    saralNo: "",
    mobileNo: "",
    Status_data: [
      {
        displayName: "",
        Timestamp: "",
        PhoneNumber: "",
        LMBName: "",
      },
    ],
    tableTitle: [],
    tableData: [],
  });
  const [isBusy, setIsBusy] = useState(false);
  const [searchBy, setSearchBy] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchcomp, setSearchCom] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });

  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  const onDismissSnackBar = () => {
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  };

  const [Farmerdata, setFarmerdata] = useState({
    Fname: "",
    Mobile_No: "",
    SaralNo: "",
    ApplicationNo: "",
    selectedComponent: "",
  });

  const searchPressed = async () => {
    setIsBusy(true);
    if (searchBy === 0 && searchText.length < 6) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationNoShouldBeAtLeast6CharactersLong"),
      });
      setDataLoaded(false);
      setIsBusy(false);
      setSearched(false);
      return;
    } else if (searchBy === 1 && searchText.length < 10) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("MobileNoShouldBeAtLeast10DigitLong"),
      });
      setDataLoaded(false);
      setIsBusy(false);
      setSearched(false);
      return;
    }
    setIsBusy(false);
    Keyboard.dismiss();
    getAppStatusData();
    //setSearched(true);
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
    setValidationError({
      ...validationError,
      isVisible: false,
      validationError: "",
    });
  };

  const getAppStatusData = async () => {
    setIsBusy(true);
    const stateCode = await AsyncStorage.getItem("stateCode");
    let statusData = [];
    let newTableData = [];
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const authToken = await AsyncStorage.getItem("authToken");
    let route = "";
    if (searchcomp === 0) {
      route = `${apiUrl}api/${stateCode}/Compa_SchemeProgress/GetSchemeProgressList_dnamic?`;
    } else if (searchcomp === 1) {
      route = `${apiUrl}api/${stateCode}/Compb_SchemeProgress/GetSchemeProgressList_dnamic?`;
    } else {
      route = `${apiUrl}api/${stateCode}/Compc_SchemeProgress/GetSchemeProgressList_dnamic?`;
    }
    if (searchBy === 0) {
      route = route + "ApplicationNo=" + searchText;
    } else if (searchBy === 1) {
      route = route + "PhoneNumber=" + searchText;
    }
    const callResult = await APIHelper.Get(route, authToken);
    if (callResult.Result) {
      await AsyncStorage.setItem("Fname", callResult.Data[0].Fname);
      await AsyncStorage.setItem("Mobile_No", callResult.Data[0].Mobile_No);
      await AsyncStorage.setItem("SaralNo", callResult.Data[0].SaralNo);
      await AsyncStorage.setItem(
        "ApplicationNo",
        callResult.Data[0].ApplicationNo,
      );

      setFarmerdata({
        ...Farmerdata,
        Fname: callResult.Data[0].Fname,
        Mobile_No: callResult.Data[0].Mobile_No,
        SaralNo: callResult.Data[0].SaralNo,
        ApplicationNo: callResult.Data[0].ApplicationNo,
        selectedComponent:
          searchcomp === 0
            ? "Component A"
            : searchcomp === 1
            ? "Component B"
            : "Component C",
      });
      statusData = callResult.Data[0].Status_data.map((item) => {
        const { displayName, Timestamp, PhoneNumber, LMBName } = item;
        return {
          displayName: displayName,
          Timestamp: Timestamp,
          PhoneNumber: PhoneNumber,
          LMBName: LMBName,
        };
      });
      setSearched(true);
    } else {
      setSearched(false);
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
    const tableTitle = [
      i18n.t("FarmerName"),
      stateCode === "HR" ? i18n.t("SaralNo") : i18n.t("ApplicationNo"),
      i18n.t("MobileNumber"),
    ];

    setData({
      ...data,
      tableTitle: tableTitle,
      tableData: newTableData,
      Status_data: statusData,
    });
    setIsBusy(false);
  };

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      {/* Search Information*/}
      <List.Accordion
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        title="Get Application Status"
        theme={{ colors: { primary: "gray" } }}
      >
        <View style={styles.backPanel}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={[Styles.captionText, { marginRight: 5, marginBottom: 5 }]}
            >
              {i18n.t("SearchBy")} :
            </Text>
            <TextInput
              style={[Styles.flex1, styles.searchInput]}
              placeholder={
                searchBy === 0
                  ? i18n.t("SearchByApplicationNo")
                  : i18n.t("SearchByMobileNo")
              }
              keyboardType={searchBy === 0 ? "default" : "number-pad"}
              onChangeText={(value) => searchTextChanged(value)}
              value={searchText}
            ></TextInput>
            <Pressable onPress={() => searchPressed()}>
              <View style={Styles.actionButtonSmall}>
                <IconM
                  name="search"
                  style={{ alignSelf: "center", alignItems: "center" }}
                  size={25}
                  color={Colors.white}
                />
              </View>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <RadioForm
              radio_props={[
                { label: i18n.t("ApplicationNo"), value: 0 },
                { label: i18n.t("MobileNo"), value: 1 },
              ]}
              initial={0}
              formHorizontal={true}
              labelHorizontal={true}
              buttonColor={"#ccc"}
              selectedButtonColor={Colors.graytone}
              buttonInnerColor={Colors.graytone}
              buttonSize={12}
              style={{
                alignSelf: "center",
                marginLeft: 3,
              }}
              buttonStyle={{ margin: 0 }}
              buttonWrapStyle={{ margin: 0 }}
              labelStyle={{ marginRight: 5 }}
              animation={true}
              onPress={(value) => {
                setSearchBy(value);
                setValidationError({
                  ...validationError,
                  isVisible: false,
                  message: "",
                });
              }}
            />
          </View>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <RadioForm
              radio_props={[
                { label: i18n.t("ComponentA"), value: 0 },
                { label: i18n.t("ComponentB"), value: 1 },
                { label: i18n.t("ComponentC"), value: 2 },
              ]}
              initial={0}
              formHorizontal={true}
              labelHorizontal={true}
              buttonColor={"#ccc"}
              selectedButtonColor={Colors.graytone}
              buttonInnerColor={Colors.graytone}
              buttonSize={12}
              style={{
                alignSelf: "center",
                marginLeft: 3,
              }}
              buttonStyle={{ margin: 0 }}
              buttonWrapStyle={{ margin: 0 }}
              labelStyle={{ marginRight: 5 }}
              animation={true}
              onPress={(value) => {
                setSearchCom(value);
                setValidationError({
                  ...validationError,
                  isVisible: false,
                  message: "",
                });
              }}
            />
          </View>
          {validationError.isVisible && (
            <Animatable.View animation="slideInLeft" duration={1000}>
              <Text style={{ color: Colors.red }}>
                {validationError.message}
              </Text>
            </Animatable.View>
          )}
        </View>
      </List.Accordion>

      {/* Basic data*/}
      {searched && (
        <View style={{ margin: 10 }}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <IconF
                name="user"
                size={Platform.OS === "ios" ? 30 : 25}
                color={Colors.graytone}
                style={styles.icon}
              ></IconF>
              <Text style={styles.cellTextRight}>{Farmerdata.Fname}</Text>
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
                {Farmerdata.SaralNo}
              </Text>
            </View>
            <View style={styles.rightCell}>
              <IconMC
                name="cellphone"
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
                {Farmerdata.Mobile_No}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cell}>
              <IconMC
                name="application"
                size={Platform.OS === "ios" ? 30 : 25}
                color={Colors.graytone}
                style={styles.icon}
              ></IconMC>
              <Text style={styles.cellTextRight}>
                {Farmerdata.ApplicationNo}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Status data */}
      <View
        style={{
          padding: 10,
          flexDirection: "column",
          alignItems: "stretch",
          flex: 1,
        }}
      >
        <Animatable.View animation="fadeInDownBig">
          {searched && (
            <View style={{ marginVertical: "1%" }}>
              <FlatList
                data={data.Status_data}
                renderItem={({ item, index }) => (
                  <StatusTile
                    Timestamp={item.Timestamp}
                    StatusTitle={item.displayName}
                    PhoneNumber={item.PhoneNumber}
                    LMBName={item.LMBName}
                  ></StatusTile>
                )}
                numColumns={1}
                contentContainerStyle={{ flexGrow: 1 }}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}
        </Animatable.View>
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

export default ApplicationStatus;

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row" },
  title: { backgroundColor: Colors.grayAAA },
  text: { textAlign: "left", paddingVertical: 7, paddingHorizontal: 10 },
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
  backPanel: {
    margin: "1%",
    backgroundColor: "#ddd",
    padding: 5,
    borderRadius: 5,
    paddingVertical: 10,
  },
  searchInput: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayAAA,
    height: 40,
    paddingBottom: 0,
    marginRight: 5,
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
});
