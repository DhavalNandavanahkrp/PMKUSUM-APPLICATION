import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Snackbar } from "react-native-paper";
import i18n from "i18n-js";
import * as APIHelper from "../Data/APIHelper";
import * as Animatable from "react-native-animatable";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
} from "@expo/vector-icons";
import { Colors } from "../Styles/Colors";
import { usePreventScreenCapture } from "expo-screen-capture";
import { Styles } from "../Styles/GlobalStyles";

import CryptoJS from "crypto-js";

const ForgotPassword = ({ navigation }) => {
  usePreventScreenCapture();
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
    oldPassword: "",
    oldPasswordSecureText: true,
    newPassword: "",
    newPasswordSecureText: true,
    confirmPassword: "",
    confirmPasswordSecureText: true,
  });

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

  const changePassword = async () => {
    const rowpayload = {
      OldPassword: data.oldPassword,
      NewPassword: data.newPassword,
      ConfirmPassword: data.confirmPassword,
    };
    setIsBusy(true);
    if (data.newPassword === data.confirmPassword) {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const token = await AsyncStorage.getItem("authToken");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      const route = `${apiUrl}/api/${stateCode}/User/ChangePassword?PROJCD=${Component}`;
      const payload = {
        OldPassword: encrypttext(data.oldPassword),
        NewPassword: encrypttext(data.newPassword),
        ConfirmPassword: encrypttext(data.confirmPassword),
      };

      const callResult = await APIHelper.Put(route, token, payload);
      if (callResult.Result) {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: i18n.t("changePasswordSuccessfully"),
        });
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("PasswordsDontMatch"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    }
    setIsBusy(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
      edges={["bottom"]}
    >
      <Animatable.View style={styles.container} animation="fadeInDownBig">
        {/* Old Password */}
        <View style={{ paddingBottom: 10 }}>
          <Text style={styles.inputTitle}>{i18n.t("oldPassword")}</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              secureTextEntry={data.oldPasswordSecureText}
              style={styles.textInput}
              value={data.oldPassword}
              onChangeText={(value) =>
                setData({
                  ...data,
                  oldPassword: value,
                })
              }
            ></TextInput>
            <TouchableOpacity
              onPress={() => {
                setData({
                  ...data,
                  oldPasswordSecureText: !data.oldPasswordSecureText,
                });
              }}
            >
              {data.oldPasswordSecureText ? (
                <IconF name="eye-off" color="grey" size={20} />
              ) : (
                <IconF name="eye" color="grey" size={20} />
              )}
            </TouchableOpacity>
          </View>
          {data.oldPassword.length == 0 ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                {i18n.t("OldPasswordIsRequired")}
              </Text>
            </Animatable.View>
          ) : null}
        </View>

        {/* New Password */}
        <View style={{ paddingBottom: 10 }}>
          <Text style={styles.inputTitle}>{i18n.t("newPassword")}</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              secureTextEntry={data.newPasswordSecureText}
              style={styles.textInput}
              value={data.newPassword}
              onChangeText={(value) =>
                setData({
                  ...data,
                  newPassword: value,
                })
              }
            ></TextInput>
            <TouchableOpacity
              onPress={() => {
                setData({
                  ...data,
                  newPasswordSecureText: !data.newPasswordSecureText,
                });
              }}
            >
              {data.newPasswordSecureText ? (
                <IconF name="eye-off" color="grey" size={20} />
              ) : (
                <IconF name="eye" color="grey" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={{ paddingBottom: 10 }}>
          <Text style={styles.inputTitle}>{i18n.t("confirmPassword")}</Text>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              secureTextEntry={data.confirmPasswordSecureText}
              style={styles.textInput}
              value={data.confirmPassword}
              onChangeText={(value) =>
                setData({
                  ...data,
                  confirmPassword: value,
                })
              }
            ></TextInput>
            <TouchableOpacity
              onPress={() => {
                setData({
                  ...data,
                  confirmPasswordSecureText: !data.confirmPasswordSecureText,
                });
              }}
            >
              {data.confirmPasswordSecureText ? (
                <IconF name="eye-off" color="grey" size={20} />
              ) : (
                <IconF name="eye" color="grey" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Button
          icon={() => (
            <IconMC
              name="account-key-outline"
              size={24}
              color={Colors.graytone}
            />
          )}
          mode="outlined"
          color={Colors.graytone}
          style={styles.signin}
          onPress={() => changePassword()}
        >
          {i18n.t("changePassword")}
        </Button>
      </Animatable.View>
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

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    margin: "10%",
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#ddd",
    padding: 20,
  },
  inputTitle: {
    color: Colors.graytone,
    marginTop: 20,
    fontSize: 14,
    fontFamily: "roboto-regular",
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
  },
  signin: {
    borderColor: Colors.graytone,
    borderWidth: 2,
    marginTop: 30,
  },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
  },
});
