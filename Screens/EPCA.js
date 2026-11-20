import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Caption } from "react-native-paper";
import {
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome5 as IconFA5,
} from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useIsFocused } from "@react-navigation/native";
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import i18n from "i18n-js";
import SyncSurveyoffline from "../Components/SyncSurveyoffline";
import { getDb } from "../db/db";

const EPCA = ({ navigation }) => {
  const [searchBy, setSearchBy] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [plantData, setPlantData] = useState({
    applicationNo: "1234567890",
    mobileNo: "9999999999",
    eaName: "Tata solar pumps pvt. ltd.",
  });
  const [statecode, setSatecode] = useState("");

  const searchPressed = () => {
    if (searchBy === 0 && searchText.length === 0) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationnoshouldnotbeEmpty"),
      });
    }

    if (statecode !== "JK" && searchBy === 0 && searchText.length < 10) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: "Application no should be at least 10 characters long",
      });
      return;
    }
    if (searchBy === 1 && searchText.length < 10) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: "Mobile no should be at least 10 digit long",
      });
      return;
    }
    Keyboard.dismiss();
    setDataLoaded(true);
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
    setValidationError({
      ...validationError,
      isVisible: false,
      validationError: "",
    });
  };

  const searchOptions = [
    {
      label:
        statecode === "JK"
          ? i18n.t("ApplicationNo&PumpId")
          : i18n.t("ApplicationNo"),
      value: 0,
    },
    {
      label: i18n.t("MobileNo"),
      value: 1,
    },
  ];

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      setSatecode(await AsyncStorage.getItem("stateCode"));
    })();
  }, [isFocused]);

  const handleSiteSurveySyncNavigation = async () => {
    try {
      const db = await getDb();

      // Use the direct query tool since we are only READING
      const results = await db.getAllAsync(
        "SELECT COUNT(*) as count FROM SiteSurveyChecklist",
      );

      const count = results[0]?.count || 0;

      if (count > 0) {
        navigation.navigate("SyncSurvey");
      } else {
        Alert.alert(
          i18n.t("syncDoes'tSuccessfully"),
          i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
          [{ text: i18n.t("OK") }],
        );
      }
    } catch (error) {
      Alert.alert(
        i18n.t("syncDoes'tSuccessfully"),
        i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
        [{ text: i18n.t("OK") }],
      );
    }
  };

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={styles.backPanel}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={[styles.captionText, { marginRight: 5, marginBottom: 5 }]}
          >
            Search By :
          </Text>
          <View style={{ flexDirection: "row" }}>
            <RadioButton labelHorizontal={true}>
              <RadioButtonInput
                obj={searchOptions[0]}
                index={0}
                isSelected={searchBy === 0}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                buttonInnerColor={Colors.graytone}
                buttonOuterColor={searchBy === 0 ? Colors.graytone : "#ccc"}
                buttonSize={12}
                buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
              />
              <RadioButtonLabel
                obj={searchOptions[0]}
                index={0}
                labelHorizontal={true}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                labelStyle={{
                  marginRight: 5,
                }}
              />
            </RadioButton>
            <RadioButton labelHorizontal={true}>
              <RadioButtonInput
                obj={searchOptions[1]}
                index={1}
                isSelected={searchBy === 1}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                buttonInnerColor={Colors.graytone}
                buttonOuterColor={searchBy === 1 ? Colors.graytone : "#ccc"}
                buttonSize={12}
                buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
              />
              <RadioButtonLabel
                obj={searchOptions[1]}
                index={1}
                labelHorizontal={true}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                labelStyle={{
                  marginRight: 5,
                }}
              />
            </RadioButton>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TextInput
            style={[Styles.flex1, styles.searchInput]}
            placeholder={
              searchBy === 0
                ? "Search by Application No"
                : "Search by Mobile No"
            }
            onChangeText={(value) => searchTextChanged(value)}
            value={searchText}
          ></TextInput>
          <Pressable onPress={() => searchPressed()}>
            <View style={styles.actionButtonSmall}>
              <IconM
                name="search"
                style={{ alignSelf: "center", alignItems: "center" }}
                size={25}
                color={Colors.white}
              />
            </View>
          </Pressable>
          <Pressable
            style={{ marginHorizontal: 10 }}
            onPress={() => {
              console.log("Advance Search Pressed");
            }}
          >
            <View style={styles.actionButtonSmall}>
              <IconMC
                name="account-search-outline"
                style={{ alignSelf: "center", alignItems: "center" }}
                size={25}
                color={Colors.white}
              />
            </View>
          </Pressable>
        </View>
        {validationError.isVisible && (
          <Animatable.View animation="slideInLeft" duration={1000}>
            <Text style={{ color: Colors.red }}>{validationError.message}</Text>
          </Animatable.View>
        )}
      </View>
      {dataLoaded ? (
        //   Plant Detail
        <ScrollView style={{ margin: "1%", flex: 1 }}>
          <View style={styles.sectionTitle}>
            <IconFA5
              name="industry"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconFA5>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              Plant Details
            </Text>
          </View>
          <View style={[styles.sectionView]}>
            <View style={{ marginTop: 20 }}>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <IconMC
                    name="numeric"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconMC>
                  <Text style={styles.cellTextRight}>
                    {plantData.applicationNo}
                  </Text>
                </View>
                <View style={styles.rightCell}>
                  <IconMC
                    name="cellphone"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconMC>
                  <Text style={styles.cellTextRight}>{plantData.mobileNo}</Text>
                </View>
              </View>
              <View style={styles.row}>
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
                    {plantData.eaName}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status */}
          <View style={[styles.sectionTitle, { marginTop: 10 }]}>
            <IconMC
              name="account-check-outline"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              Status
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
                console.log("Site Survey Pressed");
              }}
            >
              <View>
                <View style={styles.actionButton}>
                  <IconFA5
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="search-location"
                    size={30}
                    color={Colors.graytone}
                  ></IconFA5>
                </View>
                <Caption style={styles.captionText}>Site Survey</Caption>
              </View>
            </Pressable>
            <Pressable
              style={[styles.pressable, { flex: 0.33 }]}
              onPress={() => {
                console.log("Site Inspection Pressed");
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
                <Caption style={styles.captionText}>Current Status</Caption>
              </View>
            </Pressable>
          </Animatable.View>

          {/* Information */}
          <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
            <IconMC
              name="sitemap"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              Mapping
            </Text>
          </View>
          <Animatable.View
            animation="slideInRight"
            duration={1000}
            style={[styles.sectionView, { flexDirection: "row" }]}
          >
            <Pressable
              style={styles.pressable}
              onPress={() => {
                console.log("IMEI Mapping Pressed");
              }}
            >
              <View style={styles.actionButton}>
                <IconM
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="sim-card"
                  size={30}
                  color={Colors.graytone}
                ></IconM>
              </View>
              <Caption style={styles.captionText}>IMEI Mapping</Caption>
            </Pressable>
          </Animatable.View>

          {/* Application Status Update */}
          <View style={[styles.sectionTitle, { marginTop: 10 }]}>
            <IconMC
              name="information-variant"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              Application Status Update
            </Text>
          </View>
          <Animatable.View
            animation="slideInLeft"
            duration={1000}
            style={[Styles.sectionView, { flexDirection: "row" }]}
          >
            <Pressable
              style={styles.pressable}
              onPress={() => {
                console.log("Structure Pressed");
              }}
            >
              <View style={styles.actionButton}>
                <IconM
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="foundation"
                  size={30}
                  color={Colors.graytone}
                ></IconM>
              </View>
              <Caption style={styles.captionText}>Structure</Caption>
            </Pressable>
            <Pressable
              style={styles.pressable}
              onPress={() => {
                console.log("Foundation Pressed");
              }}
            >
              <View style={styles.actionButton}>
                <IconM
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="foundation"
                  size={30}
                  color={Colors.graytone}
                ></IconM>
              </View>
              <Caption style={styles.captionText}>Foundation</Caption>
            </Pressable>
          </Animatable.View>
        </ScrollView>
      ) : (
        <View style={{ margin: "1%", flex: 1 }}>
          <View>
            {/* Sync offline */}
            <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
              <IconMC
                name="information-variant"
                size={Platform.OS === "ios" ? 20 : 15}
                color={Colors.white}
                style={{ marginHorizontal: 5, alignSelf: "center" }}
              ></IconMC>
              <Text style={{ color: Colors.white, alignSelf: "center" }}>
                {i18n.t("syncoffline")}
              </Text>
            </View>
            <Animatable.View
              animation="slideInRight"
              duration={1000}
              style={[Styles.sectionView, { flexDirection: "row" }]}
            >
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={async () => await handleSiteSurveySyncNavigation()}
              >
                <View style={Styles.actionButton}>
                  <IconMC
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="file-sync-outline"
                    size={30}
                    color={Colors.graytone}
                  ></IconMC>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("SyncSurvey")}
                </Caption>
              </Pressable>
            </Animatable.View>
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                textAlign: "center",
                color: Colors.graytone,
                fontFamily: "roboto-regular",
                fontSize: 16,
              }}
            >
              {i18n.t("LoadConnectionDetailsUsingSearchPanelAbove")}
            </Text>
          </View>
        </View>
        // <>
        //   {/* Sync Survey offline */}
        //   <SyncSurveyoffline />
        // </>
      )}
    </SafeAreaView>
  );
};

export default EPCA;

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
    //marginLeft: "auto",
    marginRight: 5,
  },
});
