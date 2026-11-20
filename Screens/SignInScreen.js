import React, { useEffect, useState } from "react";
import i18n from "i18n-js";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, Snackbar } from "react-native-paper";
import ModalSelector from "react-native-modal-selector";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  SimpleLineIcons as SIcon,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../Components/context";
import { Execute } from "../Data/APIHelper";
import * as globalStyles from "../Styles/GlobalStyles";

let loginurl = "";

const languagesList = [];
languagesList.push(
  { Key: 0, section: true, Value: "Languages" },
  { Key: 1, Value: "English" },
  { Key: 2, Value: "Gujarati" },
  { Key: 3, Value: "Hindi" },
  { Key: 4, Value: "Punjabi" },
  { Key: 5, Value: "Tamil" },
);

const SignInScreen = ({ navigation }) => {
  const [data, setData] = useState({
    userId: null,
    username: "SWPS201903235",
    password: "SWPs201903235@123",
    states: [],
    selectedState: null,
    languages: languagesList,
    selectedLanguage: null,
    apiURL: null,
    check_textInputChange: false,
    secureTextEntry: true,
    // isValidUser: true,
    isValidPassword: true,
    showSnackbar: false,
    snackbarText: "",
    isBusy: false,
    broker: "122.170.101.98",
    brokerPort: "35675",
    brokerUserName: "instantaneous:test",
    brokerPassword: "test",
  });

  useEffect(() => {
    (async () => {
      setData({
        ...data,
        isBusy: true,
      });
      let result = await Execute("api/State/Map_GetKeyValuePair", "GET");

      if (result.Result) {
        setData({
          ...data,
          states: result.Data,
          isBusy: false,
        });
      } else {
        setData({
          ...data,
          showSnackbar: true,
          snackbarText: i18n.t("Failedtofetchstatelistr") + result.Message,
          isBusy: false,
        });
      }
    })();
  }, []);
  const { colors } = useTheme();

  const { signIn } = React.useContext(AuthContext);

  // clear snackbar text and boolean flag to show it when snack bar dismisses
  const onDismissSnackBar = () =>
    setData({
      ...data,
      showSnackbar: false,
      snackbarText: "",
    });

  const textInputChange = (val) => {
    if (val.trim().length >= 13) {
      setData({
        ...data,
        username: val,
        check_textInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        username: val,
        check_textInputChange: false,
        isValidUser: false,
      });
    }
  };

  const handlePasswordChange = (val) => {
    if (val.trim().length >= 8) {
      setData({
        ...data,
        password: val,
        isValidPassword: true,
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false,
      });
    }
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const handleValidUser = (val) => {
    if (val.trim().length >= 4) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };

  // sign in button pressed handler
  const loginHandle = async () => {
    if (data.username.length == 0 || data.password.length == 0) {
      Alert.alert(
        i18n.t("signin"),
        i18n.t("Usernameorpasswordfieldcannotbeempty"),
        [{ text: i18n.t("OK") }],
      );
      return;
    }

    // check state is selected before proceeding
    if (data.selectedState === null) {
      Alert.alert(
        i18n.t("selectState"),
        i18n.t("Pleaseselectstatebeforeproceeding"),
        [{ text: i18n.t("OK") }],
      );
      return;
    }

    // check language is selected before proceeding
    if (data.selectedState === null || data.selectedLanguage === null) {
      Alert.alert(
        i18n.t("selectLanguage"),
        i18n.t("Pleaseselectpreferredlanguagebeforeproceeding"),
        [{ text: i18n.t("OK") }],
      );
      return;
    }

    setData({ ...data, isBusy: true });

    const result = await signIn(data.username, data.password, loginurl);
    if (!result.Result) {
      setData({
        ...data,
        isBusy: false,
        showSnackbar: true,
        snackbarText: i18n.t("Failedtovalidateuser") + result.Message,
      });
    } else {
      try {
        await AsyncStorage.setItem("broker", data.broker);
        await AsyncStorage.setItem("brokerPort", data.brokerPort);
        await AsyncStorage.setItem("brokerUserName", data.brokerUserName);
        await AsyncStorage.setItem("brokerPassword", data.brokerPassword);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // set state selection
  const stateChangeHandler = (option) => {
    loginurl = option.State_API_URL;
    setData({
      ...data,
      broker: data.broker,
      brokerPort: data.brokerPort,
      brokerUserName: data.brokerUserName,
      brokerPassword: data.brokerPassword,
    });
    // broker = option.broker;
    // brokerPort = option.brokerPort;
    // brokerUserName = option.brokerUserName;
    // brokerPassword = option.brokerPassword;

    setData({
      ...data,
      selectedState: option,
      apiURL: loginurl,
    });
  };

  // set language selection
  const languageChangeHandler = (option) => {
    setData({ ...data, selectedLanguage: option });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar backgroundColor="#F9AA33" barStyle="light-content" />
      <View style={[styles.header, { justifyContent: "flex-start" }]}>
        <Text style={styles.text_subheader}>Sign in to proceed</Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={[styles.footer]}>
        <ScrollView>
          <Text
            style={[
              styles.text_footer,
              {
                color: "#344955",
              },
            ]}
          >
            State
          </Text>
          <View style={styles.action}>
            <IconM name="location-pin" size={25} color="#344955"></IconM>
            <ModalSelector
              style={styles.picker}
              data={data.states}
              keyExtractor={(item) => item.Key}
              labelExtractor={(item) => item.Value}
              initValue="Select State"
              onChange={stateChangeHandler}
            />
          </View>
          <Text
            style={[
              styles.text_footer,
              {
                color: "#344955",
                marginTop: 10,
              },
            ]}
          >
            Language
          </Text>
          <View style={styles.action}>
            <IconFA name="language" size={20} color="#232F34"></IconFA>
            <ModalSelector
              style={[styles.picker, { marginLeft: 5 }]}
              data={data.languages}
              keyExtractor={(item) => item.Key}
              labelExtractor={(item) => item.Value}
              initValue="Select Language"
              onChange={languageChangeHandler}
            />
          </View>
          <Text
            style={[
              styles.text_footer,
              {
                color: "#344955",
                marginTop: 20,
              },
            ]}
          >
            UserName / SARAL No
          </Text>
          <View style={styles.action}>
            <FontAwesome name="user-o" color="#344955" size={26} />
            <TextInput
              placeholderTextColor="#666666"
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  borderBottomColor: "#F9AA33",
                  borderBottomWidth: 2,
                  marginLeft: 5,
                },
              ]}
              autoCapitalize="none"
              onChangeText={(val) => textInputChange(val)}
              onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
              value={data.username}
            />
            {data.check_textInputChange ? (
              <Animatable.View animation="bounceIn">
                <IconF name="check-circle" color="green" size={20} />
              </Animatable.View>
            ) : null}
          </View>
          {data.isValidUser ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Username / Saral No must be 13 characters long.
              </Text>
            </Animatable.View>
          )}
          <Text
            style={[
              styles.text_footer,
              {
                color: "#344955",
                marginTop: 20,
              },
            ]}
          >
            Password
          </Text>
          <View style={styles.action}>
            <IconF name="lock" color="#344955" size={26} />
            <TextInput
              secureTextEntry={data.secureTextEntry ? true : false}
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  borderBottomWidth: 2,
                  borderBottomColor: "#F9AA33",
                  marginLeft: 5,
                },
              ]}
              autoCapitalize="none"
              onChangeText={(val) => handlePasswordChange(val)}
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
          {data.isValidPassword ? null : (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Password must be 8 characters long.
              </Text>
            </Animatable.View>
          )}

          <TouchableOpacity style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: "#344955",
                marginTop: 15,
                fontSize: 16,
              }}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signIn}
              onPress={() => {
                loginHandle();
              }}
            >
              <LinearGradient
                colors={["#F9AA33", "#F9AA33"]}
                style={styles.signIn}
              >
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: "#344955",
                    },
                  ]}
                >
                  Sign In
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 20,
                width: 200,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: "#344955",
                }}
              />
              <View>
                <Text
                  style={{
                    width: 50,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#344955",
                  }}
                >
                  OR
                </Text>
              </View>
              <View
                style={{ flex: 1, height: 2, backgroundColor: "#344955" }}
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUpScreen")}
              style={[
                styles.signIn,
                {
                  borderColor: "#F9AA33",
                  borderWidth: 1,
                  marginTop: 0,
                  flexDirection: "row",
                },
              ]}
            >
              <IconFA5 name="sms" color="#344955" size={28} />
              <Text
                style={[
                  styles.textSign,
                  {
                    color: "#344955",
                    marginLeft: 10,
                  },
                ]}
              >
                Sign in using OTP
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
      <Snackbar visible={data.showSnackbar} onDismiss={onDismissSnackBar}>
        {data.snackbarText}
      </Snackbar>
      {data.isBusy && (
        <View style={globalStyles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9AA33",
  },
  header: {
    // flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 80,
  },
  footer: {
    flex: 4,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: "#232F34",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  text_subheader: {
    fontSize: 25,
    marginVertical: 10,
    color: "#344955",
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
  },
  action: {
    flexDirection: "row",
    marginTop: 15,
    // borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    // marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    marginTop: 15,
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  picker: {
    width: "92%",
    // alignSelf: "stretch",
    // height: 35,
    borderBottomColor: "#F9AA33",
    // borderBottomWidth: 2,
    marginTop: -5,
  },
});
