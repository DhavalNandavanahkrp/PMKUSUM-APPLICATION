import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign as IconA } from "@expo/vector-icons";
import i18n from "i18n-js";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConsentStep from "./ConsentStep";
import OTPVerification from "./OTPVerification";
import IDStep from "./IDStep";
// import FaceStep from "./FaceStep";

const BaseURL = `https://apipmk.mnre.gov.in`;

const AadhaarMain = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOTP, setShowOTP] = useState(false);
  const [idData, setIdData] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(
    route?.params?.attemptsUsed || 0
  );

  useEffect(() => {
    if (route?.params?.attemptsUsed !== undefined) {
      setAttemptsUsed(route.params.attemptsUsed);
    }
  }, [route?.params?.attemptsUsed]);

  useEffect(() => {
    loginAndStoreToken();
  }, []);

  const loginAndStoreToken = async () => {
    try {
      const loginUrl = `${BaseURL}/api/Token/LoginForAuth2`;
      const response = await axios.post(loginUrl, {
        Username: "AadhaarAdmin",
        Password: "Vault@787",
      });

      const accessToken = response?.data?.access_token;
      const tokenType = response?.data?.token_type || "Bearer";

      if (accessToken) {
        const authHeader = `${tokenType} ${accessToken}`;
        await AsyncStorage.setItem("aadharToken", authHeader);
      } else {
        console.warn("Login succeeded but no access_token found in response", response.data);
      }
    } catch (error) {
      console.log("Login Error Message:", error?.message);
      console.error("Login API call failed", error);
    } finally {
      loginInFlight.current = false;
    }
  };

  const handleNext = async (data) => {
    if (currentStep === 1) {
      // setShowOTP(true);
      if (data) {
        setIdData(data);
      }
      setCurrentStep(2);
    } else if (currentStep < 3) {
      const userId = await AsyncStorage.getItem("userId");
      const aadhartoken = await AsyncStorage.getItem("aadharToken");
      const stateId = await AsyncStorage.getItem("stateId");
      const mobileNo = await AsyncStorage.getItem("MobileNO");

      console.log('data', data)
      console.log('data', userId)
      console.log('data', aadhartoken)
      console.log('data', stateId)
      console.log('data', mobileNo)

      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
      const sendotpUrl = `${BaseURL}/api/Consumer/SendOTPForADV?state=${stateId}&MobileNo=${mobileNo}&PROJCD=${Component}`;

      console.log("apiUrl:", BaseURL);
      console.log("stateId:", stateId);
      console.log("userId:", userId);
      console.log("send URL:", sendotpUrl);

      try {
        const response = await axios.get(sendotpUrl, {
          headers: {
            Accept: "application/json",
            Authorization: aadhartoken,
            "Content-Type": "application/json",
          },
        });
        console.log(response.data);

        if (response.data?.Flag == true) {
          Alert.alert(
            "OTP Sent",
            "An OTP has been sent to your registered mobile number.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowOTP(true)
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Request Failed",
            response.data?.Message,
            [{
              text: "OK",
              onPress: () => {
                navigation.popToTop()
              },
            }]
          );
        }
      } catch (error) {
        console.log("Error Message:", error.status);
        console.log("Error Config:", error.config);
        console.error("API call failed", error);
        Alert.alert(
          "Request Failed",
          "We could not process your request at this time. Please try again later.",
          [{
            text: "OK",
            onPress: () => {
              navigation.popToTop()
            },
          }]
        );
      }

    }
  };

  const handleBack = () => {
    if (showOTP) {
      setShowOTP(false);
    } else if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const maskAadhaar = (aadhaarNumber) => {
    if (!aadhaarNumber) return "";
    const digits = String(aadhaarNumber).replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  // Format current date -> "28 Jul, 2026"
  const formatDate = (date = new Date()) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleOTPSuccess = async (otp) => {
    // 
    console.log("otp>>", otp);

    const token = await AsyncStorage.getItem("aadharToken");
    const applicationNo = await AsyncStorage.getItem("applicationNo");
    const salarId = await AsyncStorage.getItem("SaralId");
    const mobileNo = await AsyncStorage.getItem("MobileNO");
    const stateId = await AsyncStorage.getItem("stateId");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const cid = await AsyncStorage.getItem("farmerId");

    const number = salarId;

    if (stateCode !== 'HR') {
      number = applicationNo;
    }

    console.log('data', token)
    console.log('data', applicationNo)
    console.log('data', stateId)
    console.log('data', cid)

    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";

    const verifyUrl = `${BaseURL}/api/Consumer/ADVTokenize?aadharNo=${idData}&state=${stateId}&appNo=${number}&Cid=${cid}&Otp=${otp}&MobileNo=${mobileNo}&PROJCD=${Component}`;

    console.log("verify URL:", verifyUrl);

    try {
      const response = await axios.post(verifyUrl, {}, {
        headers: {
          Accept: "application/json",
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      console.log(response.data);

      const result = response.data?.Result;
      const data = response.data?.Data;

      if (result?.Flag) {
        const successData = {
          aadhaarMasked: maskAadhaar(idData),
          uidToken: data?.rtoken || "",
          transactionId: data?.txn || "",
          dateTime: formatDate(),
        };

        navigation.navigate("SuccessScreen", {
          data: successData,
        });
      } else {
        setShowOTP(false);
        navigation.navigate("FailedScreen", {
          errorData: {
            attemptsUsed: 3,
            totalAttempts: 3,
            errorTitle: "Verification Failed",
            errorHindi: "सत्यापन विफल कृपया पुनः प्रयास करें।",
            failedAt: "Capture Aadhaar",
            errorMessage: result?.Message || "We could not verify your OTP at this time. Please try again."
          }
        });
      }
    } catch (error) {
      console.log("Error Message:", error.message);
      console.log("Error Config:", error.config);
      console.error("Verify API call failed", error);

      setShowOTP(false);
      Alert.alert(
        "Verification Failed",
        "We could not verify your OTP at this time. Please try again.",
        [{ text: "OK" }]
      );
    }

    // setCurrentStep(2);
    // setCurrentStep(3);
  };

  const Stepper = () => (
    <View style={styles.stepperHeader}>
      {/* <StepItem label="Consent" active={currentStep === 1} completed={currentStep > 1} /> */}
      <StepItem label="ID" active={currentStep === 1} completed={currentStep > 1} />
      <View style={[styles.stepLine, currentStep > 1 && styles.lineActive]} />
      {/* <StepItem label="ID" number="2" active={currentStep === 2} completed={currentStep > 2} /> */}
      <StepItem label="Consent" number="2" active={currentStep === 2} completed={currentStep > 2} />
      {/* <View style={[styles.stepLine, currentStep > 2 && styles.lineActive]} />
      <StepItem label="Face" number="3" active={currentStep === 3} /> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stepper />

      <View style={{ flex: 1 }}>
        {showOTP ? (
          <OTPVerification onVerify={handleOTPSuccess} onBack={() => setShowOTP(false)} />
        ) : (
          <>
            {currentStep === 1 && <IDStep onProceed={handleNext} onBack={handleBack} />}
            {currentStep === 2 && <ConsentStep onProceed={handleNext} onBack={handleBack} />}
            {currentStep === 3 && (
              <FaceStep
                attemptsUsed={attemptsUsed}
                setAttemptsUsed={setAttemptsUsed}
                onComplete={() => console.log("Final Submit")}
                navigation={navigation}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const StepItem = ({ label, number, active, completed }) => (
  <View style={styles.stepContainer}>
    <View style={[styles.stepCircle, (active || completed) && styles.stepCircleActive]}>
      {completed ? (
        <IconA name="check" size={12} color="#fff" />
      ) : (
        <Text style={styles.stepNumber}>{number || 1}</Text>
      )}
    </View>
    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  stepperHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  stepContainer: { alignItems: "center", width: 100 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: "#4CAF50" },
  stepNumber: { fontSize: 12, color: "#ffffff", fontWeight: "bold" },
  stepLabel: { fontSize: 11, color: "#999" },
  stepLabelActive: { color: "#4CAF50", fontWeight: "bold" },
  stepLine: { width: 60, height: 2, backgroundColor: "#e0e0e0", marginBottom: 18 },
  lineActive: { backgroundColor: "#4CAF50" },
});

export default AadhaarMain;