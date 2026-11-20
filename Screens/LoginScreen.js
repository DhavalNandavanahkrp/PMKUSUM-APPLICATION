import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar } from "react-native-paper";
import * as Animatable from "react-native-animatable";
import OTPTextInput from "react-native-otp-textinput";
import i18n from "i18n-js";
import { AuthContext } from "../Components/context";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import CryptoJS from "crypto-js";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  Fontisto as IconFo,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreventScreenCapture } from "expo-screen-capture";
import * as APIHelper from "../Data/APIHelper";
import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";

import axios from "axios";
import { queryAll } from "../db/exec";
import { withTransaction } from "../db/transaction";

const LoginScreen = ({ navigation, route }) => {
  usePreventScreenCapture();
  const Statedata = route?.params || {};

  const [isBusy, setIsBusy] = useState(false);
  const [dataload, setDataload] = useState(false);
  const [loginType, setLoginType] = useState(0);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [data, setData] = useState({
    userName: "Coopa_energy", //8130991801
    userId: "",
    password: "Admin@123", //Sharma@9898
    applicationNo: "1167809017714",
    mobileNo: "",
    inputOTP: "",
    applicationNoEntered: false,
    mobileNoEntered: false,
    secureTextEntry: true,
    showUserIdError: false,
    showEmailIdError: false,
    showPasswordError: false,
    showApplicationNoError: false,
    farmerName: "",
    email: "",
  });
  const [FarmerData, setFarmerData] = useState({
    applicationNo: "",
    mobileNo: "",
    farmerName: "",
  });
  /* #region  Snackbar configuration */
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

  const [reqdata, setReqdata] = useState({
    StateId: "",
    stateCode: "",
    apiUrl: "",
  });

  useEffect(() => {
    (async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setReqdata({
          ...reqdata,
          StateId: Statedata.StateId,
          stateCode: Statedata.StateCode,
          apiUrl: Statedata.APIUrl,
        });
      } else {
        let StateId = await AsyncStorage.getItem("stateId");
        let stateCode = await AsyncStorage.getItem("stateCode");
        let apiUrl = await AsyncStorage.getItem("apiURL");
        setReqdata({
          ...reqdata,
          StateId: StateId,
          stateCode: stateCode,
          apiUrl: apiUrl,
        });
      }
    })();
  }, []);

  /* #endregion */
  const loginSelectorPressed = (type) => {
    setLoginType(type);
  };

  const { signInUserId, signInMobile, signInApplicationNo } =
    React.useContext(AuthContext);

  /* #region  User Id tab handlers */
  const userNameChanged = (val) => {
    setData({
      ...data,
      userName: val,
      showUserIdError: false,
    });
  };

  const emailChanged = (val) => {
    setData({
      ...data,
      email: val,
    });
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const passwordChanged = (val) => {
    setData({
      ...data,
      password: val,
      showPasswordError: false,
    });
  };

  const encrypttext = (text) => {
    var key = CryptoJS.enc.Utf8.parse("5278458978956123");
    var iv = CryptoJS.enc.Utf8.parse("5278458978956123");
    var options = {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    };
    var encrypted_Value = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(text),
      key,
      options,
    ).toString();
    return encrypted_Value;
  };

  const debugFetch = async (url, options = {}) => {
    const api = axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for debugging
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log("Error Message:", error.message);
        console.log("Error Config:", error.config);
        if (error.response) {
          console.log("Server Data:", error.response.data);
        }
        return Promise.reject(error);
      },
    );

    /*  try {e
       const res = await axios.get(url);
       console.log("Data:", res.data);
     } catch (err) {
       if (err.response) {
         console.log("Server responded with error:", err.response.status, err.response.data);
       } else if (err.request) {
         console.log("No response received. Request:", err.request);
       } else {
         console.log("Error setting up request:", err.message);
       }
     } */

    try {
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error) {
      console.log("URL", url);
      console.log("Error Message:", error.message);
      console.log("Error Config:", error.config);
      console.error("API call failed", error);
    }
    // axios
    //   .get(url)
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.log("URL", url);
    //     console.error("API call failed", error);
    //   });

    setIsBusy(false);
  };

  const verifyVersion = async () => {
    const stateCodeData = await AsyncStorage.getItem("stateCode");
    if (stateCodeData == "GJ") {
      const apiUrl = await AsyncStorage.getItem("apiURL");

      console.log("API Url>>", apiUrl);
      /*  if (Constants.expoConfig.version) {
         const route = apiUrl + `api/UserAuth/CheckMobileAppVersion?Version=${Constants.expoConfig.version}`;
         console.log('Route', route)
         const resultData = await APIHelper.Get2(route, null, null);
         console.log("Result Data>>", resultData);
         setIsBusy(false);
         if (resultData.Flag == true) {
           return true;
         } else {
           if (resultData.Message) {
             Alert.alert("", resultData.Message, [{ text: "OK", onPress: () => BackHandler.exitApp() }])
           }
 
           const net = await NetInfo.fetch();
           if (!net.isConnected) {
             setSnackbar({
               showSnackbar: true,
               snackbarText: "Please turn on your internet connection!",
             });
             setIsBusy(false);
             return; // Exit function if there's no internet connection
           }
 
           return false;
         }
       } */
    } else {
      return true;
    }
  };

  const userNameSignIn = async () => {
    if (data.userName.length < 6) {
      setData({
        ...data,
        showUserIdError: true,
      });
      return;
    }
    if (data.password.length === 0) {
      setData({
        ...data,
        showPasswordError: true,
      });
      return;
    }

    setIsBusy(true);

    // const versionValid = await verifyVersion();
    // if (versionValid == true) {
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const route = apiUrl + "api/UserAuth/ValidateLoginUser1";

    console.log("route>>", route);

    // await debugFetch(
    //   "https://pmkapi.guvnl.com/api/UserAuth/CheckMobileAppVersion?Version=1.22.0",
    // );

    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Please turn on your internet connection!",
      });
      setIsBusy(false);
      return;
    }

    console.log(
      "login>>",
      encrypttext(data.userName),
      encrypttext(data.password),
    );
    // Proceed with sign-in process
    signInUserId(encrypttext(data.userName), encrypttext(data.password), route);

    // }
    setIsBusy(false);
  };

  /* #endregion */
  const InputOTP = (val) => {
    setData({
      ...data,
      inputOTP: val,
    });
  };

  /* #region  Application No tab handlers */
  const applicationNoChanged = (val) => {
    setData({
      ...data,
      applicationNo: val,
      showApplicationNoError: false,
    });
  };

  const ForgotPassword = async () => {
    usePreventScreenCapture();
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");

    if (data.userName.length < 6) {
      Alert.alert(
        i18n.t("forgotPassword"),
        i18n.t("invalidUserName"),
        i18n.t("invalidEmail"),
      );
      return;
    }
    const route = `${apiUrl}api/${stateCode}/User/M_ForgotPassword?userName=${data.userName}&Email=${data.email}`;
    setIsBusy(true);
    const callResult = await APIHelper.Authenticate(route, {});
    setIsBusy(false);
    Alert.alert(i18n.t("forgotPassword"), callResult.Data.Message);
  };

  const appNoOTPRequest = async () => {
    if (data.applicationNo.length < 6) {
      setData({
        ...data,
        showApplicationNoError: true,
      });
      return;
    }
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const route = `${apiUrl}/api/UserAuth/SendOTPForConsumerGetData?ApplicationNo=${data.applicationNo}`;
    const callResult = await APIHelper.Get2(route);

    if (callResult.Flag) {
      setData({
        ...data,
        applicationNoEntered: true,
      });

      signInApplicationNo(route);
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("UserDoesnotExistApplicationNo"),
      });
    }
    setIsBusy(false);
  };

  const appNoSignIn = async () => {
    if (data.applicationNo.length < 6) {
      setData({
        ...data,
        showApplicationNoError: true,
      });
      return;
    }
    setIsBusy(true);

    const versionValid = await verifyVersion();
    if (versionValid == true) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      // await AsyncStorage.setItem("apiURL", item.APIUrl);
      // await AsyncStorage.setItem("broker", item.BrokerIp);
      // await AsyncStorage.setItem("brokerPort", item.BrokerPort);
      // await AsyncStorage.setItem("stateCode", item.StateCode);

      const route = `${apiUrl}/api/UserAuth/VerifyOTPAndGetUserData?OTP=${data.inputOTP}&ApplicatioNo=${data.applicationNo}`;
      const payload = {
        applicationNo: data.applicationNo,
        inputOTP: data.inputOTP,
      };
      signInUserId(data.applicationNo, data.inputOTP, route);
    }
    setIsBusy(false);
  };

  const reenterAppNo = () => {
    // clear otp here as well
    setData({
      ...data,
      applicationNo: "",
      applicationNoEntered: false,
    });
  };

  const mobileNoChanged = (val) => {
    setData({
      ...data,
      mobileNo: val,
      showMobileNoError: false,
    });
  };

  const mobileNoOTPRequest = async () => {
    if (data.mobileNo.length !== 10) {
      setData({
        ...data,
        showMobileNoError: true,
      });
      return;
    }

    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const route = `${apiUrl}/api/UserAuth/SendOTPForConsumerGetData?mobileNo=${data.mobileNo}`;
    console.log("route", route);
    const callResult = await APIHelper.Get2(route);
    console.log("callResult", callResult);
    if (callResult.Flag) {
      setData({
        ...data,
        mobileNoEntered: true,
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

  const mobileNoSignIn = async () => {
    if (data.mobileNo.length !== 10) {
      setData({
        ...data,
        showMobileNoError: true,
      });
      return;
    }
    setIsBusy(true);

    const versionValid = await verifyVersion();
    if (versionValid == true) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const route = `${apiUrl}/api/UserAuth/VerifyOTPAndGetUserData?OTP=${data.inputOTP}&MobileNo=${data.mobileNo}`;
      const payload = {
        mobileNo: data.mobileNo,
        inputOTP: data.inputOTP,
      };
      signInUserId(data.mobileNo, data.inputOTP, route);
    }
    setIsBusy(false);
  };

  const reenterMobileNo = () => {
    // clear otp here as well
    setData({
      ...data,
      mobileNo: "",
      mobileNoEntered: false,
    });
  };

  const Tilebutton = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          bottom: 0,
          alignSelf: "flex-end",
        }}
      >
        {/* SIPSTOOL */}
        <View style={[styles.tile, { marginLeft: 8 }]}>
          <Pressable onPress={async () => await Checkdata()}>
            <View style={{ alignItems: "center" }}>
              <IconMC
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
                name="chart-line"
                size={40}
                color={Colors.graytone}
              ></IconMC>
            </View>
            <Text style={styles.bottomTileText}>{i18n.t("Sizing")}</Text>
          </Pressable>
        </View>
        {/* ApplicationStatus */}
        <View style={styles.tile}>
          <Pressable onPress={() => navigation.navigate("ApplicationStatus")}>
            <View style={{ alignItems: "center" }}>
              <IconMC
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
                name="file-document-outline"
                size={40}
                color={Colors.graytone}
              />
            </View>
            <Text style={styles.bottomTileText}>
              {i18n.t("TrackApplication")}
            </Text>
          </Pressable>
        </View>
        {/* FarmerRegistration */}
        <View style={styles.tile}>
          <Pressable onPress={() => navigation.navigate("FarmerRegistration")}>
            <View style={{ alignItems: "center" }}>
              <IconA
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
                name="plus-circle"
                size={40}
                color={Colors.graytone}
              />
            </View>
            <Text style={[styles.bottomTileText, { fontSize: 14 }]}>
              {i18n.t("ApplyForPM-KUSUMScheme")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const Checkdata = async () => {
    try {
      const weatherRows = await queryAll(
        "SELECT * FROM Weatherdata WHERE statecode = ?",
        [reqdata.StateId],
      );

      const districtRows = await queryAll(
        "SELECT * FROM Districtlist WHERE Statecode = ?",
        [reqdata.StateId],
      );

      if (weatherRows.length === 0 || districtRows.length === 0) {
        const net = await NetInfo.fetch();

        if (!net.isConnected) {
          setSnackbar({
            showSnackbar: true,
            snackbarText: "Please turn on internet and sync data",
          });
          setTimeout(() => setSnackbar(false), 2000);
        } else {
          setDataload(true);
          await Weatherdatabase(reqdata, navigation, setDataload, setSnackbar);
        }
      } else {
        navigation.navigate("Location");
      }
    } catch (error) {
      console.error("Checkdata failed:", error);
      alert("Database Error: " + error.message);
    }
  };

  const Weatherdatabase = async () => {
    try {
      // A. Prepare API Routes and Data
      const DistrictDeletequery = `DELETE FROM Districtlist WHERE stateCode = ${reqdata.StateId}`;
      const districtRoute = `${reqdata.apiUrl}api/${reqdata.stateCode}/District/Map_GetKeyValuePair?stateCode=${reqdata.StateId}`;

      // Fetch and construct query strings
      const Districtinsertquery = await DistrictConstruct(districtRoute, null);

      // B. Execute everything in a single Transaction for Atomicity
      await withTransaction(async (tx) => {
        // Handle Districts
        await tx.executeSql(DistrictDeletequery);
        if (Array.isArray(Districtinsertquery)) {
          for (const query of Districtinsertquery) {
            await tx.executeSql(query);
          }
        }

        const WeatherdataDeletequery = `DELETE FROM Weatherdata`;
        const InsertWeatherdataquery = await InsertWeatherdata(reqdata.StateId);
        // Handle Weather
        await tx.executeSql(WeatherdataDeletequery);
        if (Array.isArray(InsertWeatherdataquery)) {
          for (const query of InsertWeatherdataquery) {
            await tx.executeSql(query);
          }
        }
      });

      setDataload(false);
      navigation.navigate("Location");
    } catch (error) {
      setDataload(false);
      console.error("Sync Transaction Failed:", error);
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Sync Failed: " + error.message,
      });
      setTimeout(() => setSnackbar(false), 2000);
    }
  };

  const pagination = (arr, size) => {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size);
      let page = acc[idx] || (acc[idx] = []);
      page.push(val);
      return acc;
    }, []);
  };

  const InsertWeatherdata = async () => {
    const latlongResult = await APIHelper.Weatherdata(reqdata.StateId);

    let temp = [];

    if (latlongResult.Result) {
      let Wheatherdata = [];

      latlongResult.Data.forEach((item) => {
        let dateList = item.date_string.replace(/ 12:00:00 AM/g, "").split(",");
        const Startdate = dateList[0];
        const Enddate = dateList[dateList.length - 1];
        const Tmin = item.tmin
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();
        const Tmax = item.tmax
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();
        const Rainfall = item.rainfall
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();

        const obejct = {
          startdate: Startdate,
          enddate: Enddate,
          latitude: item.lat,
          longitude: item.lon,
          soiltype: item.soil_type,
          statecode: item.state_code,
          tmin: Tmin,
          tmax: Tmax,
          rainfall: Rainfall,
          districtcode: item.district_code,
        };
        Wheatherdata.push(obejct);
      });
      let page_size = 10;
      let pages = pagination(Wheatherdata, page_size);

      pages.forEach((element) => {
        let Insertweather = constructQueryString(
          element,
          [
            "startdate",
            "enddate",
            "latitude",
            "longitude",
            "soiltype",
            "statecode",
            "tmin",
            "tmax",
            "rainfall",
            "districtcode",
          ],
          "Weatherdata",
        );
        temp.push(Insertweather);
      });
    }
    return temp;
  };

  const DistrictConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let Insertdistrict = constructQueryString(
          element,
          ["Key", "Value", "StateCode"],
          "Districtlist",
        );
        temp.push(Insertdistrict);
      });
    }
    return temp;
  };

  const constructQueryString = (collection, properties, tablename) => {
    var result = collection.map((item, index) => {
      let str = "";
      for (let i = 0; i < properties.length; i++) {
        str += `'${item[properties[i]]}',`;
      }
      str = str.slice(0, -1);
      return `(${str})`;
    });
    const response =
      `INSERT into ${tablename}(${properties}) VALUES` + result.toString();
    return response;
  };

  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   style={[Styles.flex1]}
    // >
    <SafeAreaView style={[Styles.flex1]} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[Styles.m1h, { marginVertical: 10, flex: 1 }]}>
          <View style={styles.optionContainer}>
            <Pressable
              onPress={() => loginSelectorPressed(0)}
              style={{ flex: 0.27 }}
            >
              <View
                style={
                  loginType === 0
                    ? styles.activeOptionNameView
                    : styles.inactiveOptionNameView
                }
              >
                <IconA
                  name="mobile"
                  size={22}
                  color={loginType === 0 ? Colors.graytone : Colors.grayAAA}
                />
                <Text
                  style={
                    loginType === 0
                      ? styles.activeOptionNameText
                      : styles.inactiveOptionNameText
                  }
                >
                  {i18n.t("mobile")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => loginSelectorPressed(1)}
              style={{ flex: 0.43 }}
            >
              <View
                style={
                  loginType === 1
                    ? styles.activeOptionNameView
                    : styles.inactiveOptionNameView
                }
              >
                <IconA
                  name="solution"
                  size={22}
                  color={loginType === 1 ? Colors.graytone : Colors.grayAAA}
                />
                <Text
                  style={
                    loginType === 1
                      ? styles.activeOptionNameText
                      : styles.inactiveOptionNameText
                  }
                >
                  {i18n.t("appNo")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => loginSelectorPressed(2)}
              style={{ flex: 0.3 }}
            >
              <View
                style={
                  loginType === 2
                    ? styles.activeOptionNameView
                    : styles.inactiveOptionNameView
                }
              >
                <IconF
                  name="user"
                  size={22}
                  color={loginType === 2 ? Colors.graytone : Colors.grayAAA}
                />
                <Text
                  style={
                    loginType === 2
                      ? styles.activeOptionNameText
                      : styles.inactiveOptionNameText
                  }
                >
                  {i18n.t("userId")}
                </Text>
              </View>
            </Pressable>
          </View>

          {loginType === 0 && (
            <View style={Styles.m2h}>
              {/* Mobile No */}
              <Text style={styles.inputTitle}>{i18n.t("mobileNo")}</Text>
              <View style={styles.action}>
                <IconA
                  name="mobile"
                  color={Colors.graytone}
                  size={26}
                  style={{ alignSelf: "center" }}
                />
                {data.mobileNoEntered ? (
                  <TextInput
                    editable={false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    value={data.mobileNo}
                  />
                ) : (
                  <TextInput
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => mobileNoChanged(val)}
                    keyboardType="numeric"
                    value={data.mobileNo}
                    maxLength={10}
                  />
                )}
                {data.mobileNo.length === 10 ? (
                  <Animatable.View animation="bounceIn">
                    <IconF name="check-circle" color={Colors.green} size={20} />
                  </Animatable.View>
                ) : null}
              </View>
              {data.showMobileNoError ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    {i18n.t("invalidMobileNo")}
                  </Text>
                </Animatable.View>
              ) : null}
              {data.mobileNoEntered ? (
                <View style={{ marginHorizontal: "2%" }}>
                  <Text style={styles.otpInputText}>{i18n.t("inputOTP")}</Text>
                  <OTPTextInput
                    handleTextChange={InputOTP}
                    inputCount={4}
                    textInputStyle={{
                      width: 45,
                      borderWidth: 2,
                      borderRadius: 5,
                      borderBottomWidth: 2,
                    }}
                    tintColor={Colors.graytone}
                  />
                  <TouchableOpacity
                    style={{ alignItems: "center", marginTop: 10 }}
                    onPress={() => mobileNoOTPRequest()}
                  >
                    <Text style={styles.resendOTPText}>
                      {i18n.t("resendOTP")}
                    </Text>
                  </TouchableOpacity>
                  <Button
                    icon={() => (
                      <IconM name="login" size={24} color={Colors.white} />
                    )}
                    mode="outlined"
                    color={Colors.white}
                    style={styles.signin}
                    onPress={() => mobileNoSignIn()}
                  >
                    {i18n.t("signin")}
                  </Button>
                  <Button
                    icon={() => (
                      <IconM name="keyboard" size={24} color={Colors.white} />
                    )}
                    mode="outlined"
                    color={Colors.white}
                    style={[styles.signin, { borderColor: Colors.white }]}
                    onPress={() => reenterMobileNo()}
                  >
                    {i18n.t("reenterMobile")}
                  </Button>
                </View>
              ) : (
                <Button
                  icon={() => (
                    <IconFA5 name="sms" size={24} color={Colors.white} />
                  )}
                  mode="outlined"
                  compact={true}
                  color={Colors.white}
                  style={styles.signin}
                  onPress={() => mobileNoOTPRequest()}
                >
                  {i18n.t("getOTP")}
                </Button>
              )}
            </View>
          )}

          {loginType === 1 && (
            <View style={Styles.m2h}>
              {/* Application No */}
              <Text style={styles.inputTitle}>{i18n.t("appNo")}</Text>
              <View style={styles.action}>
                <IconA
                  name="solution"
                  color={Colors.graytone}
                  size={26}
                  style={{ alignSelf: "center" }}
                />
                {data.applicationNoEntered ? (
                  <TextInput
                    editable={false}
                    style={styles.textInput}
                    autoCapitalize="none"
                    value={data.applicationNo}
                  />
                ) : (
                  <TextInput
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(val) => applicationNoChanged(val)}
                    value={data.applicationNo}
                  />
                )}
                {data.applicationNo.length >= 10 ? (
                  <Animatable.View animation="bounceIn">
                    <IconF name="check-circle" color={Colors.green} size={20} />
                  </Animatable.View>
                ) : (
                  <IconF name="check-circle" color={Colors.white} size={20} />
                )}
              </View>
              {data.showApplicationNoError ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    {i18n.t("invalidApplicationNo")}
                  </Text>
                </Animatable.View>
              ) : null}
              {data.applicationNoEntered ? (
                <View style={{ marginHorizontal: "2%" }}>
                  <Text style={styles.otpInputText}>{i18n.t("inputOTP")}</Text>
                  <OTPTextInput
                    handleTextChange={InputOTP}
                    inputCount={4}
                    textInputStyle={{
                      width: 45,
                      borderWidth: 2,
                      borderRadius: 5,
                      borderBottomWidth: 2,
                    }}
                    tintColor={Colors.graytone}
                  />
                  <TouchableOpacity
                    style={{ alignItems: "center", marginTop: 10 }}
                    onPress={() => mobileNoOTPRequest()}
                  >
                    <Text style={styles.resendOTPText}>
                      {i18n.t("resendOTP")}
                    </Text>
                  </TouchableOpacity>
                  <Button
                    icon={() => (
                      <IconM name="login" size={24} color={Colors.white} />
                    )}
                    mode="outlined"
                    color={Colors.white}
                    style={styles.signin}
                    onPress={() => appNoSignIn()}
                  >
                    {i18n.t("signin")}
                  </Button>
                  <Button
                    icon={() => (
                      <IconM name="keyboard" size={24} color={Colors.white} />
                    )}
                    mode="outlined"
                    color={Colors.white}
                    style={[styles.signin, { borderColor: Colors.white }]}
                    onPress={() => reenterAppNo()}
                  >
                    {i18n.t("reenterAppNo")}
                  </Button>
                </View>
              ) : (
                <Button
                  icon={() => (
                    <IconFA5 name="sms" size={24} color={Colors.white} />
                  )}
                  mode="outlined"
                  compact={true}
                  color={Colors.white}
                  style={styles.signin}
                  onPress={() => appNoOTPRequest()}
                >
                  {i18n.t("getOTP")}
                </Button>
              )}
            </View>
          )}

          {loginType === 2 && (
            <View style={{ marginHorizontal: "2%" }}>
              {/* User Name */}
              <Text style={styles.inputTitle}>{i18n.t("userId")}</Text>
              <View style={styles.action}>
                <IconF
                  name="user"
                  color={Colors.graytone}
                  size={26}
                  style={{ alignSelf: "center" }}
                />
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => userNameChanged(val)}
                  value={data.userName}
                />
                {data.userName.length >= 6 ? (
                  <Animatable.View animation="bounceIn">
                    <IconF name="check-circle" color={Colors.green} size={20} />
                  </Animatable.View>
                ) : (
                  <IconF name="check-circle" color={Colors.white} size={20} />
                )}
              </View>
              {data.showUserIdError ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    {i18n.t("invalidUserName")}
                  </Text>
                </Animatable.View>
              ) : null}

              {/* Password */}
              <Text style={styles.inputTitle}>{i18n.t("password")}</Text>
              <View style={styles.action}>
                <IconF name="lock" color={Colors.graytone} size={26} />
                <TextInput
                  secureTextEntry={data.secureTextEntry}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => passwordChanged(val)}
                  value={data.password}
                />
                <TouchableOpacity onPress={updateSecureTextEntry}>
                  {data.secureTextEntry ? (
                    <IconF name="eye-off" color="grey" size={20} />
                  ) : (
                    <IconF name="eye" color="grey" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {data.showPasswordError ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    {i18n.t("passwordRequired")}
                  </Text>
                </Animatable.View>
              ) : null}

              {/* Forgot password */}
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  marginTop: 20,
                  marginRight: 20,
                }}
                onPress={() => setisModalVisible(true)}
              >
                <Text style={styles.forgotPasswordText}>
                  {i18n.t("forgotPassword")}
                </Text>
              </TouchableOpacity>

              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View>
                      <Text style={styles.inputTitle}>{i18n.t("userId")}</Text>
                      <View style={styles.action}>
                        <IconF
                          name="user"
                          color={Colors.graytone}
                          size={26}
                          style={{ alignSelf: "center" }}
                        />
                        <TextInput
                          style={styles.textInput}
                          autoCapitalize="none"
                          value={data.userName}
                        />
                        {data.userName.length >= 6 ? (
                          <Animatable.View animation="bounceIn">
                            <IconF
                              name="check-circle"
                              color={Colors.green}
                              size={20}
                            />
                          </Animatable.View>
                        ) : (
                          <IconF
                            name="check-circle"
                            color={Colors.white}
                            size={20}
                          />
                        )}
                      </View>
                      {data.showUserIdError ? (
                        <Animatable.View animation="fadeInLeft" duration={500}>
                          <Text style={styles.errorMsg}>
                            {i18n.t("invalidUserName")}
                          </Text>
                        </Animatable.View>
                      ) : null}
                      <Text style={styles.inputTitle}>{i18n.t("Email")}</Text>
                      <View style={styles.action}>
                        <IconFo
                          name="email"
                          color={Colors.graytone}
                          size={26}
                          style={{ alignSelf: "center" }}
                        />
                        <TextInput
                          style={styles.textInput}
                          autoCapitalize="none"
                          onChangeText={(val) => emailChanged(val)}
                        >
                          <Text>{data.email}</Text>
                        </TextInput>
                      </View>
                      <View style={{ marginHorizontal: "2%" }}>
                        <Button
                          icon={() => (
                            <IconMC
                              name="key-outline"
                              size={24}
                              color={Colors.white}
                            />
                          )}
                          mode="outlined"
                          color={Colors.white}
                          style={styles.signin}
                          onPress={() => ForgotPassword()}
                        >
                          {i18n.t("reset")}
                        </Button>
                      </View>
                    </View>
                    <Button
                      icon="cancel"
                      mode="contained"
                      style={{
                        marginTop: 10,
                        backgroundColor: Colors.cellBackground,
                        borderRadius: 30,
                      }}
                      onPress={() => {
                        setisModalVisible(false);
                      }}
                    >
                      {i18n.t("Cancel")}
                    </Button>
                  </View>
                </View>
              </Modal>

              <Button
                disabled={data.isBusy}
                icon={() => (
                  <IconM name="login" size={24} color={Colors.white} />
                )}
                mode="contained"
                color={Colors.green}
                style={styles.signin}
                labelStyle={{ color: Colors.white }}
                onPress={() => userNameSignIn()}
              >
                {i18n.t("signin")}
              </Button>
            </View>
          )}

          <Tilebutton />
        </View>
        <Text style={styles.versionText}>
          {" "}
          Version: {Constants.expoConfig.version}{" "}
        </Text>
      </ScrollView>
      <Snackbar
        visible={snackbar.showSnackbar}
        onDismiss={onDismissSnackBar}
        style={{ bottom: 0 }}
      >
        {snackbar.snackbarText}
      </Snackbar>
      {dataload && (
        <Modal animationType="slide" transparent={true} visible={dataload}>
          <View style={styles.SIPScenteredView}>
            <View style={styles.SIPSmodalView}>
              <Text style={styles.modalText}>Please wait data is sync</Text>
              <ActivityIndicator size="large" color={Colors.primaryOrange} />
            </View>
          </View>
        </Modal>
      )}
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
    // </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    borderWidth: 1.25,
    borderRadius: 5,
    borderColor: Colors.grayAAA,
    height: 50,
  },
  activeOptionNameView: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.grayAAA,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  activeOptionNameText: {
    color: Colors.graytone,
    fontWeight: "bold",
    marginLeft: 5,
  },
  inactiveOptionNameView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  inactiveOptionNameText: {
    color: Colors.grayAAA,
    fontWeight: "bold",
    marginLeft: 5,
  },
  enabledLabelStyle: {
    fontFamily: "roboto-regular",
    alignSelf: "center",
    textAlign: "center",
    alignItems: "center",
  },
  disabledLabelStyle: {
    color: Colors.cellBackground,
    fontFamily: "roboto-regular",
  },
  contentStyle: { height: "100%" },
  action: {
    flexDirection: "row",
    marginTop: 5,
  },
  inputTitle: {
    color: Colors.graytone,
    marginLeft: 30,
    marginTop: 20,
    fontSize: 14,
    fontFamily: "roboto-regular",
  },
  textInput: {
    flex: 1,
    color: Colors.graytone,
    borderBottomColor: Colors.graytone,
    borderBottomWidth: 1,
    marginLeft: 5,
    fontSize: 16,
    paddingBottom: 3,
    fontFamily: "roboto-regular",
  },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
    fontSize: 14,
    marginLeft: 30,
  },
  forgotPasswordText: {
    color: Colors.graytone,
    textDecorationLine: "underline",
  },
  otpInputText: {
    textAlign: "center",
    alignItems: "center",
    marginTop: 30,
    color: Colors.graytone,
  },
  resendOTPText: {
    color: Colors.graytone,
    marginTop: 20,
    textDecorationLine: "underline",
  },
  getOTP: {
    borderColor: Colors.graytone,
    borderWidth: 2,
    marginTop: 30,
    width: "35%",
    alignSelf: "center",
  },
  signin: {
    marginTop: 30,
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
  },
  mobilebutton: {
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
    bottom: -400,
  },
  applicationbutton: {
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
    bottom: -400,
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
  centeredView: {
    flex: 1,
    padding: 15,
    marginTop: 200,
  },
  modalView: {
    padding: 50,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#aaa",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 30,
  },
  tile: {
    width: "31%",
    borderRadius: 10,
    borderWidth: 1.7,
    borderColor: Colors.graytone,
    minHeight: 90,
    margin: 3,
  },
  numberText: {
    fontSize: 24,
    textAlign: "center",
  },
  bottomTileText: {
    textAlign: "center",
    color: Colors.graytone,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "roboto-regular",
    marginTop: 12,
  },
  SIPScenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  SIPSmodalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  versionText: {
    color: Colors.graytone,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "roboto-regular",
    textAlign: "center",
  },
});
