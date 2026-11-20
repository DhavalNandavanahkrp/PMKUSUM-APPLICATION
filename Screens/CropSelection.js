import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar } from "react-native-paper";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import CustomDropdown from "../Components/Dropdown";

const CropSelection = () => {
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
  const [List, setList] = useState({
    list: [],
    selectedList: "",
    subTypeList: [],
    selectedValue: "",
  });

  useEffect(() => {
    (async () => {
      await GetAllCropType();
    })();
  }, []);

  const GetAllCropType = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
    const route = `${apiUrl}/api/${stateCode}/Master_CropType/GetAllCropType?PROJCD=${Component}`;

    const callResult = await APIHelper.Get(route, authToken);
    if (callResult.Result) {
      const APIDATA = callResult.Data.map((item) => {
        return {
          label: item.Name,
          value: item.Id,
        };
      });
      setList({
        ...List,
        list: APIDATA,
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

  async function listSelection(value) {
    setIsBusy(true);
    if (value) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const authToken = await AsyncStorage.getItem("authToken");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
      const selectedCroptypeId = value;
      const route = `${apiUrl}/api/${stateCode}/Master_CropSubType/GetCropSubTypesByCrop?cropTypeId=${selectedCroptypeId}&PROJCD=${Component}`;

      const callResult = await APIHelper.Get(route, authToken);

      if (callResult.Result) {
        const APIDATA = callResult.Data.map((item) => {
          return {
            label: item.Name,
            value: item.Id,
          };
        });
        setList({
          ...List,
          selectedList: value,
          subTypeList: APIDATA,
        });
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
    } else {
    }

    setIsBusy(false);
  }

  function Selection(value) {
    setList({
      ...List,
      selectedValue: value,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[Styles.m1h, { marginVertical: 10, flex: 1 }]}
        edges={["bottom"]}
      >
        <View style={{ marginBottom: 20 }}>
          <CustomDropdown
            items={List.list}
            zIndex={99999999999999}
            selection={listSelection}
          ></CustomDropdown>
        </View>
        <View style={{ marginBottom: 20 }}>
          <CustomDropdown
            items={List.subTypeList}
            zIndex={999999}
            selection={Selection}
          ></CustomDropdown>
        </View>
        <View style={styles.bottomView}>
          <Button
            mode="outlined"
            compact={true}
            color={Colors.white}
            style={styles.registerbtn}
          // onPress={() => navigation.navigate("FarmerRegistration")}
          >
            {i18n.t("Save")}
          </Button>
        </View>
      </View>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
};

export default CropSelection;
const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 1,
  },
  bottomView: {
    width: "100%",
    height: 50,
    position: "absolute",
    bottom: 0,
  },
  registerbtn: {
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.primaryOrange,
    height: 40,
  },
});
