import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "i18n-js";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import CustomDropdown from "../Components/Dropdown"
import { useIsFocused } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

const AdvanceSearch = ({ navigation }) => {
  const [stateName, setStateName] = useState("");
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

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      const SName = await AsyncStorage.getItem("stateName");
      setStateName(SName);
      DistrictList();
    })();
  }, [isFocused]);

  const [data, setData] = useState({
    districtList: [],
    selectedDistrict: "",
    townList: [],
    selectedTown: "",
    pumpCapacityList: [
      { label: "1 HP", value: 1 },
      { label: "2 HP", value: 2 },
      { label: "3 HP", value: 3 },
      { label: "5 HP", value: 5 },
      { label: "7.5 HP", value: 7.5 },
      { label: "10 HP", value: 10 },
    ],
    selectedPumpCapacity: "",
    FarmerSelectionList: [],
    selectedFarmer: "",
  });

  const DistrictList = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const stateId = await AsyncStorage.getItem("stateId");
    const route = `${apiUrl}/api/${stateCode}/District/Map_GetKeyValuePair?stateCode=${stateId}`;
    const callResult = await APIHelper.Get(route, null);
    if (callResult.Result) {
      const APIDATA = callResult.Data.map((item) => {
        return {
          label: item.Value,
          value: item.Key,
        };
      });
      setData({
        ...data,
        districtList: APIDATA,
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

  async function districtHandle(val) {
    setIsBusy(true);
    if (val) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const stateId = await AsyncStorage.getItem("stateId");
      const districtId = val;
      const route = `${apiUrl}/api/${stateCode}/Taluka/M_GetList?State_Code=${stateId}&District_Code=${districtId}`;
      const callResult = await APIHelper.Get(route, null);
      if (callResult.Result) {
        const APIDATA = callResult.Data.map((item) => {
          return {
            label: item.Taluka_Name,
            value: item.Taluka_Code,
          };
        });
        setData({
          ...data,
          selectedDistrict: val,
          talukaList: APIDATA,
        });
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
    } else {
      setData({
        ...data,
        talukaList: [],
      });
    }
    setIsBusy(false);
  }

  async function talukaHandle(val) {
    setIsBusy(true);
    if (val) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const stateId = await AsyncStorage.getItem("stateId");
      const districtId = data.selectedDistrict;
      const talukaId = val;
      const route = `${apiUrl}/api/${stateCode}/Town/M_GetList?State_Code=${stateId}&District_Code=${districtId}&Taluka_Code=${talukaId}`;
      const callResult = await APIHelper.Get(route, null);
      if (callResult.Result) {
        const APIDATA = callResult.Data.map((item) => {
          return {
            label: item.Town_Name,
            value: item.Town_Code,
          };
        });
        setData({
          ...data,
          selectedTaluka: val,
          townList: APIDATA,
        });
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
    } else {
      setData({
        ...data,
        townList: [],
      });
    }
    setIsBusy(false);
  }

  function townHandle(val) {
    setData({
      ...data,
      selectedTown: val,
    });
  }

  function FarmerSelectionHandle(val) { }

  function pumpCapacityHandle(val) {
    setData({
      ...data,
      selectedPumpCapacity: val,
    });
  }

  return (
    <SafeAreaView style={[styles.container, Styles.flex1]} edges={["bottom"]}>
      <View style={{ marginBottom: 20 }}>
        <View style={Platform.OS !== "android" && { zIndex: 0 }}>
          {data.selectedDistrict ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmDistrict")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <CustomDropdown
            items={data.districtList}
            placeholder={i18n.t("FarmDistrict")}
            selection={districtHandle}
            zIndex={0}
            loading={isBusy}
          />
          {!data.selectedDistrict && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidDistrict")}</Text>
            </Animatable.View>
          ) : null}
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={Platform.OS !== "android" && { zIndex: 999999999 }}>
          {data.selectedTown ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmTown")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <CustomDropdown
            items={data.townList}
            placeholder={i18n.t("FarmTown")}
            selection={townHandle}
            zIndex={999999999}
            loading={isBusy}
          />
          {!data.selectedTown && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidTown")}</Text>
            </Animatable.View>
          ) : null}
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={Platform.OS !== "android" && { zIndex: 999999 }}>
          {data.selectedPumpCapacity ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("PumpCapacity")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <CustomDropdown
            items={data.pumpCapacityList}
            placeholder={i18n.t("RequiredPumpCapacity")}
            selection={pumpCapacityHandle}
            zIndex={999999}
            loading={isBusy}
          />
          {!data.selectedPumpCapacity && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                {i18n.t("invalidPumpCapacity")}
              </Text>
            </Animatable.View>
          ) : null}
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <View style={Platform.OS !== "android" && { zIndex: 99999 }}>
          {data.selectedFarmer ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmerSelection")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <CustomDropdown
            items={data.FarmerSelectionList}
            placeholder={i18n.t("FarmerSelection")}
            selection={FarmerSelectionHandle}
            zIndex={99999}
            loading={isBusy}
          />
          {!data.selectedFarmer && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidTown")}</Text>
            </Animatable.View>
          ) : null}
        </View>
      </View>

      <Snackbar
        visible={snackbar.showSnackbar}
        onDismiss={onDismissSnackBar}
        style={{ bottom: 0 }}
      >
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default AdvanceSearch;
const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  inputTitle: {
    color: Colors.grayAAA,
    marginLeft: 6,
    fontSize: 12,
    fontFamily: "roboto-regular",
  },
  redTitle: {
    color: Colors.red,
    marginLeft: 6,
    fontSize: 12,
    fontFamily: "roboto-regular",
  },
  signin: {
    marginTop: 20,
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
  },
  dropDownContainer: {
    backgroundColor: Colors.WHITE,
    borderWidth: 0,
    borderBottomColor: Colors.graytone,
    borderBottomWidth: 1,
    padding: 0,
    margin: 0,
    color: Colors.graytone,
    fontFamily: "roboto-regular",
    fontSize: 16,
    marginBottom: 20,
  },
  textInput: {
    color: Colors.graytone,
    borderBottomColor: Colors.graytone,
    borderBottomWidth: 1,
    fontSize: 16,
    paddingBottom: 3,
    fontFamily: "roboto-regular",
    height: 40,
    flex: 1,
    alignSelf: "stretch",
    margin: 5,
  },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
    fontSize: 14,
    marginLeft: 7,
    zIndex: 9,
  },
});
