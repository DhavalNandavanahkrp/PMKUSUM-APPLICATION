import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar } from "react-native-paper";
import i18n from "i18n-js";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import CustomDropdown from "../Components/Dropdown";
import { Feather as IconF } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const FarmerRegistration = ({ navigation }) => {
  const [stateName, setStateName] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [splCharError, setSplCharError] = useState({
    FarmerNameError: false,
    FarmerFatherNameError: false,
    FarmerSurnameError: false,
    MobileNumberError: false,
    FarmPincodeError: false,
  });
  const [isScreenBusy, setIsScreenBusy] = useState(false);
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

  useEffect(() => {
    (async () => {
      const SName = await AsyncStorage.getItem("stateName");
      setStateName(SName);
      DistrictList();
    })();
  }, []);

  const [data, setData] = useState({
    farmerName: "",
    showError: false,
    fatherName: "",
    farmerSurname: "",
    gender: {
      list: [
        { label: i18n.t("Male"), value: "male" },
        { label: i18n.t("Female"), value: "female" },
        { label: i18n.t("Transgender"), value: "transgender" },
      ],
    },
    selectedGender: "",
    applicationCategoryList: [
      { label: i18n.t("Farmer"), value: "farmer" },
      { label: i18n.t("Gaushala"), value: "gaushala" },
      {
        label: i18n.t("WaterUserAssociationAndCommunity"),
        value: "WaterUserAssociationAndCommunity",
      },
      { label: i18n.t("Others"), value: "others" },
    ],
    selectedApplicationCategory: "",
    applicantCategoryList: [
      { label: i18n.t("ST"), value: "st" },
      { label: i18n.t("SC"), value: "sc" },
      { label: i18n.t("OBC"), value: "obc" },
      { label: i18n.t("General"), value: "general" },
      { label: i18n.t("Others"), value: "other" },
    ],
    selectedApplicantCategory: "",
    applicantTypeList: [
      { label: i18n.t("Owner"), value: "owner" },
      { label: i18n.t("OnLease"), value: "onLess" },
    ],
    selectedApplicantType: "",
    selectedState: stateName,
    districtList: [],
    selectedDistrict: "",
    talukaList: [],
    selectedTaluka: "",
    townList: [],
    selectedTown: "",
    mobileNumber: "",
    farmPincode: "",
    farmLocationAddress: "",
    havingAGConnection: [
      { label: i18n.t("Yes"), value: true },
      { label: i18n.t("No"), value: false },
    ],
    AGConnection: "",
    pumpTypeList: [
      { label: i18n.t("AC"), value: "AC" },
      { label: i18n.t("DC"), value: "Dc" },
    ],
    selectedPumpType: "",
    pumpSubType: [
      { label: i18n.t("Submersible"), value: "Submersible" },
      { label: i18n.t("Surface"), value: "Surface" },
    ],
    selectedPumpSubTYpe: "",
    pumpCategoryList: [
      { label: i18n.t("WaterFilled"), value: "WaterFilled" },
      { label: i18n.t("Oilfilled"), value: "Oilfilled" },
    ],
    selectedPumpCategory: "",
    pumpCapacityList: [
      { label: "1 HP", value: 1 },
      { label: "2 HP", value: 2 },
      { label: "3 HP", value: 3 },
      { label: "5 HP", value: 5 },
      { label: "7.5 HP", value: 7.5 },
      { label: "10 HP", value: 10 },
    ],
    selectedPumpCapacity: "",
    componentList: [
      { label: i18n.t("DistributedSolarPV"), value: 1 },
      { label: i18n.t("OffGridSolarPump"), value: 2 },
      { label: i18n.t("GridConnectedSolarPump"), value: 3 },
    ],
    selectedComponet: 2,
  });

  function genderHandle(val) {
    setData({
      ...data,
      selectedGender: val,
    });
  }

  function appCategoryHandle(val) {
    setData({
      ...data,
      selectedApplicationCategory: val,
    });
  }

  const DistrictList = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const stateId = await AsyncStorage.getItem("stateId");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/District/Map_GetKeyValuePair?stateCode=${stateId}&PROJCD=${Component}`;
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
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      const districtId = val;
      const route = `${apiUrl}/api/${stateCode}/Taluka/M_GetList?State_Code=${stateId}&District_Code=${districtId}&PROJCD=${Component}`;
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
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      const talukaId = val;
      const route = `${apiUrl}/api/${stateCode}/Town/M_GetList?State_Code=${stateId}&District_Code=${districtId}&Taluka_Code=${talukaId}&PROJCD=${Component}`;
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

  function AGHandle(val) {
    setData({
      ...data,
      AGConnection: val,
    });
  }

  function pumpTypeHandle(val) {
    setData({
      ...data,
      selectedPumpType: val,
    });
  }

  function pumpSubTypeHandle(val) {
    setData({
      ...data,
      selectedPumpSubTYpe: val,
    });
  }

  function pumpCategoryHandle(val) {
    setData({
      ...data,
      selectedPumpCategory: val,
    });
  }

  function pumpCapacityHandle(val) {
    setData({
      ...data,
      selectedPumpCapacity: val,
    });
  }

  function ApplicationHandle(val) {
    setData({
      ...data,
      selectedApplicantType: val,
    });
  }

  function componetHandle(val) {
    setData({
      ...data,
      selectedComponet: val,
    });
  }

  function applicantCategoryHandel(val) {
    setData({
      ...data,
      selectedApplicantCategory: val,
    });
  }

  const farmerRegister = async () => {
    try {
      if (data.selectedComponet === 1) {
        if (
          !data.selectedComponet ||
          !data.farmerName ||
          !data.farmerSurname ||
          !data.selectedDistrict ||
          !data.mobileNumber ||
          data.mobileNumber.length < 10 ||
          data.mobileNumber.length > 10 ||
          !data.selectedComponet ||
          !data.selectedPumpType ||
          !data.selectedPumpSubTYpe ||
          !data.selectedPumpCapacity
        ) {
          setData({
            ...data,
            showError: true,
          });
        } else {
          setIsScreenBusy(true);
          const stateCode = await AsyncStorage.getItem("stateCode");
          const stateId = await AsyncStorage.getItem("stateId");
          const payload = {
            Id: 0,
            FarmerName: data.farmerName,
            FarmerFatherName: data.fatherName,
            FarmerSurname: data.farmerSurname,
            Gender: data.selectedGender,
            ApplicationCategory: data.selectedApplicationCategory,
            MobileNumber: data.mobileNumber,
            State: stateId,
            StateCode: stateCode,
            FarmDistrict: data.selectedDistrict,
            FarmTaluka: data.selectedTaluka,
            FarmTown: data.selectedTown,
            FarmPincode: data.farmPincode,
            FarmLocationAddress: data.farmLocationAddress,
            AGConnection: data.AGConnection,
            ReqPumpType: null,
            ReqPumpSubType: null,
            ReqPumpCategory: null,
            ReqPumpCapacity: null,
            Component: data.selectedComponet,
            // ApplicantCategory:data.selectedApplicantCategory,
            // ApplicantType:data.selectedApplicantType
          };
          const callResult = await APIHelper.FarmerRegister(payload);
          if (callResult.Result) {
            navigation.navigate("SuccessfulAddeddFarmer");
          } else {
            setSnackbar({
              ...snackbar,
              showSnackbar: true,
              snackbarText: callResult.Message,
            });
          }
          setIsScreenBusy(false);
        }
      } else if (data.selectedComponet === 2) {
        if (
          !data.selectedComponet ||
          !data.farmerName ||
          !data.farmerSurname ||
          !data.selectedDistrict ||
          !data.mobileNumber ||
          data.mobileNumber.length < 10 ||
          data.mobileNumber.length > 10 ||
          !data.selectedComponet ||
          !data.selectedPumpType ||
          !data.selectedPumpSubTYpe ||
          !data.selectedPumpCapacity
        ) {
          setData({
            ...data,
            showError: true,
          });
        } else {
          setIsScreenBusy(true);
          const stateCode = await AsyncStorage.getItem("stateCode");
          const stateId = await AsyncStorage.getItem("stateId");
          const payload = {
            Id: 0,
            FarmerName: data.farmerName,
            FarmerFatherName: data.fatherName,
            FarmerSurname: data.farmerSurname,
            Gender: data.selectedGender,
            ApplicationCategory: data.selectedApplicationCategory,
            MobileNumber: data.mobileNumber,
            State: stateId,
            StateCode: stateCode,
            FarmDistrict: data.selectedDistrict,
            FarmTaluka: data.selectedTaluka,
            FarmTown: data.selectedTown,
            FarmPincode: data.farmPincode,
            FarmLocationAddress: data.farmLocationAddress,
            AGConnection: data.AGConnection,
            ReqPumpType: data.selectedPumpType,
            ReqPumpSubType: data.selectedPumpSubTYpe,
            ReqPumpCategory:
              data.selectedPumpSubTYpe === "Surface"
                ? null
                : data.selectedPumpCategory,
            ReqPumpCapacity: data.selectedPumpCapacity,
            Component: data.selectedComponet,
            // ApplicantCategory:data.selectedApplicantCategory,
            // ApplicantType:data.selectedApplicantType
          };
          const callResult = await APIHelper.FarmerRegister(payload);
          if (callResult.Result) {
            navigation.navigate("SuccessfulAddeddFarmer");
          } else {
            setSnackbar({
              ...snackbar,
              showSnackbar: true,
              snackbarText: callResult.Message,
            });
          }
          setIsScreenBusy(false);
        }
      } else {
        if (
          !data.selectedComponet ||
          !data.farmerName ||
          !data.farmerSurname ||
          !data.selectedDistrict ||
          !data.mobileNumber ||
          data.mobileNumber.length < 10 ||
          data.mobileNumber.length > 10 ||
          !data.selectedComponet ||
          !data.selectedPumpType ||
          !data.selectedPumpSubTYpe ||
          !data.selectedPumpCapacity
        ) {
          setData({
            ...data,
            showError: true,
          });
        } else {
          setIsScreenBusy(true);
          const stateCode = await AsyncStorage.getItem("stateCode");
          const stateId = await AsyncStorage.getItem("stateId");
          const payload = {
            Id: 0,
            FarmerName: data.farmerName,
            FarmerFatherName: data.fatherName,
            FarmerSurname: data.farmerSurname,
            Gender: data.selectedGender,
            ApplicationCategory: data.selectedApplicationCategory,
            MobileNumber: data.mobileNumber,
            State: stateId,
            StateCode: stateCode,
            FarmDistrict: data.selectedDistrict,
            FarmTaluka: data.selectedTaluka,
            FarmTown: data.selectedTown,
            FarmPincode: data.farmPincode,
            FarmLocationAddress: data.farmLocationAddress,
            AGConnection: data.AGConnection,
            ReqPumpType: data.selectedPumpType,
            ReqPumpSubType: data.selectedPumpSubTYpe,
            ReqPumpCategory:
              data.selectedPumpSubTYpe === "Surface"
                ? null
                : data.selectedPumpCategory,
            ReqPumpCapacity: data.selectedPumpCapacity,
            Component: data.selectedComponet,
            // ApplicantCategory:data.selectedApplicantCategory,
            // ApplicantType:data.selectedApplicantType
          };
          const callResult = await APIHelper.FarmerRegister(payload);
          if (callResult.Result) {
            navigation.navigate("SuccessfulAddeddFarmer");
          } else {
            setSnackbar({
              ...snackbar,
              showSnackbar: true,
              snackbarText: callResult.Message,
            });
          }
          setIsScreenBusy(false);
        }
      }
    } catch (error) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: error,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, Styles.flex1]} edges={["bottom"]}>
      <ScrollView>
        <View style={{ marginBottom: 20 }}>
          <View style={Platform.OS !== "android" && { zIndex: 99 }}>
            {data.selectedComponet ? (
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={styles.inputTitle}>{i18n.t("Component")}</Text>
                <Text style={styles.redTitle}>*</Text>
              </View>
            ) : null}
            <CustomDropdown
              items={data.componentList}
              placeholder={i18n.t("Component")}
              selection={componetHandle}
              zIndex={99}
              loading={isBusy}
              defaultDropdownValue={2}
            />
            {!data.selectedComponet && data.showError ? (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>{i18n.t("invalidComponet")}</Text>
              </Animatable.View>
            ) : null}
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          {data.farmerName ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmerName")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("FarmerName")}
              style={styles.textInput}
              onChangeText={(val) => {
                const filteredVal = val.replace(/[^a-zA-Z0-9]/g, "");
                if (val !== filteredVal) {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerNameError: true,
                  }));
                } else {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerNameError: false,
                  }));
                  setData({ ...data, farmerName: filteredVal });
                }
              }}
            ></TextInput>
          </View>
          {splCharError.FarmerNameError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Special characters are not allowed.
              </Text>
            </Animatable.View>
          ) : null}
          {data.farmerName.length > 50 && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                {i18n.t("FarmerNameShouldBe")}
              </Text>
            </Animatable.View>
          ) : null}
          {!data.farmerName && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidFarmerName")}</Text>
            </Animatable.View>
          ) : null}
        </View>
        <View style={{ marginBottom: 20 }}>
          {data.fatherName ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FatherName")}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("FatherName")}
              style={styles.textInput}
              onChangeText={(val) => {
                const filteredVal = val.replace(/[^a-zA-Z0-9]/g, "");
                if (val !== filteredVal) {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerFatherNameError: true,
                  }));
                } else {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerFatherNameError: false,
                  }));
                  setData({ ...data, fatherName: filteredVal });
                }
              }}
            ></TextInput>
          </View>
          {splCharError.FarmerFatherNameError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Special characters are not allowed.
              </Text>
            </Animatable.View>
          ) : null}
          {data.fatherName.length > 50 && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidFatherName")}</Text>
            </Animatable.View>
          ) : null}
        </View>
        <View style={{ marginBottom: 10 }}>
          {data.farmerSurname ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmerSurname")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("FarmerSurname")}
              style={styles.textInput}
              onChangeText={(val) => {
                const filteredVal = val.replace(/[^a-zA-Z0-9]/g, "");
                if (val !== filteredVal) {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerSurnameError: true,
                  }));
                } else {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmerSurnameError: false,
                  }));
                  setData({ ...data, farmerSurname: filteredVal });
                }
              }}
            ></TextInput>
          </View>
          {splCharError.FarmerSurnameError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Special characters are not allowed.
              </Text>
            </Animatable.View>
          ) : null}
          {data.farmerSurname.length > 50 && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("SurnameShouldBE")}</Text>
            </Animatable.View>
          ) : null}
          {!data.farmerSurname && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidSurName")}</Text>
            </Animatable.View>
          ) : null}
        </View>
        {/* <View style={{ marginBottom: 20 }}> */}
        <View
          style={[
            Platform.OS !== "android" && {
              zIndex: 9999999999999999999999999,
            },
          ]}
        >
          {data.selectedGender ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("Gender")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ marginBottom: 20 }}>
            <CustomDropdown
              items={data.gender.list}
              placeholder={i18n.t("Gender")}
              selection={genderHandle}
              zIndex={99999999999999999999999999999}
            />
          </View>
        </View>
        {/* </View> */}
        {/* <View style={{ marginBottom: 20 }}> */}
        <View style={Platform.OS !== "android" && { zIndex: 999999999 }}>
          {data.selectedApplicationCategory ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>
                {i18n.t("ApplicationCategory")}
              </Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ marginBottom: 20 }}>
            <CustomDropdown
              items={data.applicationCategoryList}
              placeholder={i18n.t("ApplicationCategory")}
              selection={appCategoryHandle}
              zIndex={999999999}
            />
          </View>
        </View>
        {/* </View> */}
        <View style={{ marginBottom: 20 }}>
          <View style={Platform.OS !== "android" && { zIndex: 99999999 }}>
            {data.selectedApplicantCategory ? (
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={styles.inputTitle}>
                  {i18n.t("ApplicantCategory")}
                </Text>
                <Text style={styles.redTitle}>*</Text>
              </View>
            ) : null}
            <CustomDropdown
              items={data.applicantCategoryList}
              placeholder={i18n.t("ApplicantCategory")}
              selection={applicantCategoryHandel}
              zIndex={99999999}
            />
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text style={styles.inputTitle}>{i18n.t("State")}</Text>
            <Text style={styles.redTitle}>*</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              editable={false}
              value={stateName}
              style={styles.textInput}
            ></TextInput>
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          <View style={Platform.OS !== "android" && { zIndex: 9999999 }}>
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
              zIndex={9999999}
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
          <View style={Platform.OS !== "android" && { zIndex: 999999 }}>
            {data.selectedTaluka ? (
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Text style={styles.inputTitle}>{i18n.t("FarmTaluka")}</Text>
                <Text style={styles.redTitle}>*</Text>
              </View>
            ) : null}
            <CustomDropdown
              items={data.talukaList}
              placeholder={i18n.t("FarmTaluka")}
              selection={talukaHandle}
              zIndex={999999}
              loading={isBusy}
            />
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          <View style={Platform.OS !== "android" && { zIndex: 99999 }}>
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
              zIndex={99999}
              loading={isBusy}
            />
          </View>
        </View>
        <View style={{ marginBottom: 20 }}>
          {data.mobileNumber ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("MobileNumber")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("MobileNumber")}
              style={styles.textInput}
              keyboardType={"number-pad"}
              onChangeText={(val) => {
                const filteredVal = val.replace(/[^a-zA-Z0-9]/g, "");
                if (val !== filteredVal) {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    MobileNumberError: true,
                  }));
                } else {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    MobileNumberError: false,
                  }));
                  setData({ ...data, mobileNumber: filteredVal });
                }
              }}
            ></TextInput>
            {data.mobileNumber.length === 10 ? (
              <Animatable.View animation="bounceIn">
                <IconF
                  name="check-circle"
                  style={{ marginTop: 15 }}
                  color={Colors.green}
                  size={20}
                />
              </Animatable.View>
            ) : null}
          </View>
          {splCharError.MobileNumberError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Special characters are not allowed.
              </Text>
            </Animatable.View>
          ) : null}
          {!data.mobileNumber && data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("mobileNoRequired")}</Text>
            </Animatable.View>
          ) : (data.mobileNumber.length < 10 ||
              data.mobileNumber.length > 10) &&
            data.showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>{i18n.t("invalidMobileNo")}</Text>
            </Animatable.View>
          ) : null}
        </View>
        <View style={{ marginBottom: 20 }}>
          {data.farmPincode ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>{i18n.t("FarmPincode")}</Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("FarmPincode")}
              style={styles.textInput}
              keyboardType={"number-pad"}
              onChangeText={(val) => {
                const filteredVal = val.replace(/[^a-zA-Z0-9]/g, "");
                if (val !== filteredVal) {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmPincodeError: true,
                  }));
                } else {
                  setSplCharError((prevErrors) => ({
                    ...prevErrors,
                    FarmPincodeError: false,
                  }));
                  setData({ ...data, farmPincode: filteredVal });
                }
              }}
            ></TextInput>
            {data.farmPincode.length === 6 ? (
              <Animatable.View animation="bounceIn">
                <IconF
                  name="check-circle"
                  style={{ marginTop: 15 }}
                  color={Colors.green}
                  size={20}
                />
              </Animatable.View>
            ) : null}
          </View>
          {splCharError.FarmPincodeError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Special characters are not allowed.
              </Text>
            </Animatable.View>
          ) : null}
        </View>
        <View style={{ marginBottom: 20 }}>
          {data.farmLocationAddress ? (
            <View style={{ display: "flex", flexDirection: "row" }}>
              <Text style={styles.inputTitle}>
                {i18n.t("FarmLocationAddress")}
              </Text>
              <Text style={styles.redTitle}>*</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <TextInput
              placeholder={i18n.t("FarmLocationAddress")}
              style={styles.textInput}
              numberOfLines={2}
              onChangeText={(val) => {
                setData({ ...data, farmLocationAddress: val });
              }}
            ></TextInput>
          </View>
        </View>
        {data.selectedComponet !== 1 ? (
          <View>
            <View style={{ marginBottom: 20 }}>
              <View
                style={
                  Platform.OS !== "android" && {
                    zIndex: 99999999999999999999999999999,
                  }
                }
              >
                {data.AGConnection === true || data.AGConnection === false ? (
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <Text style={styles.inputTitle}>
                      {i18n.t("AGConnection")}
                    </Text>
                    <Text style={styles.redTitle}>*</Text>
                  </View>
                ) : null}
                <CustomDropdown
                  items={data.havingAGConnection}
                  placeholder={i18n.t("HavingAGConnection")}
                  selection={AGHandle}
                  loading={isBusy}
                  zIndex={99999999999}
                />
              </View>
            </View>
            <View style={{ marginBottom: 20 }}>
              <View style={Platform.OS !== "android" && { zIndex: 999999999 }}>
                {data.selectedPumpType ? (
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <Text style={styles.inputTitle}>{i18n.t("PumpType")}</Text>
                    <Text style={styles.redTitle}>*</Text>
                  </View>
                ) : null}
                <CustomDropdown
                  items={data.pumpTypeList}
                  placeholder={i18n.t("RequiredPumpType")}
                  selection={pumpTypeHandle}
                  zIndex={999999999}
                  loading={isBusy}
                />
                {!data.selectedPumpType && data.showError ? (
                  <Animatable.View animation="fadeInLeft" duration={500}>
                    <Text style={styles.errorMsg}>
                      {i18n.t("invalidPumpCapacity")}
                    </Text>
                  </Animatable.View>
                ) : null}
              </View>
            </View>
            <View style={{ marginBottom: 20 }}>
              <View style={Platform.OS !== "android" && { zIndex: 99999999 }}>
                {data.selectedPumpSubTYpe ? (
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <Text style={styles.inputTitle}>
                      {i18n.t("PumpSubtype")}
                    </Text>
                    <Text style={styles.redTitle}>*</Text>
                  </View>
                ) : null}
                <CustomDropdown
                  items={data.pumpSubType}
                  placeholder={i18n.t("RequiredPumpSubtype")}
                  selection={pumpSubTypeHandle}
                  zIndex={99999999}
                  loading={isBusy}
                />
                {!data.selectedPumpSubTYpe && data.showError ? (
                  <Animatable.View animation="fadeInLeft" duration={500}>
                    <Text style={styles.errorMsg}>
                      {i18n.t("invalidPumpCapacity")}
                    </Text>
                  </Animatable.View>
                ) : null}
              </View>
            </View>
            <View
              style={
                data.selectedPumpSubTYpe === "Surface"
                  ? { marginBottom: 200 }
                  : { marginBottom: 20 }
              }
            >
              <View style={Platform.OS !== "android" && { zIndex: 9999999 }}>
                {data.selectedPumpCapacity ? (
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <Text style={styles.inputTitle}>
                      {i18n.t("PumpCapacity")}
                    </Text>
                    <Text style={styles.redTitle}>*</Text>
                  </View>
                ) : null}
                <CustomDropdown
                  items={data.pumpCapacityList}
                  placeholder={i18n.t("RequiredPumpCapacity")}
                  selection={pumpCapacityHandle}
                  zIndex={9999999}
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
            {data.selectedPumpSubTYpe !== "Surface" ? (
              <View style={{ marginBottom: 200 }}>
                <View style={Platform.OS !== "android" && { zIndex: 999999 }}>
                  {data.selectedPumpCategory ? (
                    <View style={{ display: "flex", flexDirection: "row" }}>
                      <Text style={styles.inputTitle}>
                        {i18n.t("PumpCategory")}
                      </Text>
                      <Text style={styles.redTitle}>*</Text>
                    </View>
                  ) : null}
                  <CustomDropdown
                    items={data.pumpCategoryList}
                    placeholder={i18n.t("RequiredPumpCategory")}
                    selection={pumpCategoryHandle}
                    zIndex={999999}
                    loading={isBusy}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
        {data.selectedComponet === 1 ? (
          <View style={{ marginBottom: 90 }}>
            <View
              style={
                Platform.OS !== "android" && {
                  zIndex: 99999999999999999999999999999,
                }
              }
            >
              {data.selectedApplicantType ? (
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Text style={styles.inputTitle}>
                    {i18n.t("applicantType")}
                  </Text>
                  <Text style={styles.redTitle}>*</Text>
                </View>
              ) : null}
              <CustomDropdown
                items={data.applicantTypeList}
                placeholder={i18n.t("applicantType")}
                selection={ApplicationHandle}
                loading={isBusy}
                zIndex={99999999999999999999999999999}
              />
              {!data.selectedApplicantType && data.showError ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    {i18n.t("invalidApplicantType")}
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <Button
        // icon={() => (
        //   <IconFA5 name="plus-circle" size={20} color={Colors.white} />
        // )}
        mode="outlined"
        compact={true}
        color={Colors.white}
        style={styles.signin}
        onPress={() => farmerRegister()}
      >
        {i18n.t("Register")}
      </Button>
      <Snackbar
        visible={snackbar.showSnackbar}
        onDismiss={onDismissSnackBar}
        style={{ bottom: 0 }}
      >
        {snackbar.snackbarText}
      </Snackbar>
      {isScreenBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default FarmerRegistration;

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
