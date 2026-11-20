import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons as IconMC } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIHelper from "../Data/APIHelper";

const VerificationProgress = ({ route, navigation }) => {
  const { req, xmlResult, aadhaarNumber, attemptsUsed = 0 } = route.params;
  const MAX_ATTEMPTS = 3;

  const [overallProgress, setOverallProgress] = useState(0.1);
  const [steps, setSteps] = useState([
    {
      id: 0,
      title: "Face PID received",
      sub: "AadhaarFaceRD — Data ready",
      status: "done",
    },
    {
      id: 1,
      title: "UIDAI face match",
      sub: "UIDAI चेहरा सत्यापित कर रहा है...",
      status: "live",
    },
    {
      id: 2,
      title: "Success Notification",
      sub: "Will be sent to registered mobile",
      status: "pending",
    },
  ]);

  useEffect(() => {
    console.log("Verification Progress", req);
    runVerification();
  }, []);

  const runVerification = async () => {
    try {
      setOverallProgress(0.3);
      setOverallProgress(0.6);

      // const routeUrl = `https://apipmk.mnre.gov.in/api/Compb_Consumer/perform-test`;

      // const callResult = await APIHelper.Get(routeUrl, null);
      console.log("res", req);

      // if (callResult.Result) {
      // updateStep(1, "done");
      // updateStep(2, "done");
      // setOverallProgress(1.0);

      setTimeout(() => {
        navigation.navigate("SuccessScreen");
        // navigation.navigate("FailedScreen");

        // const attemptsUsed = (route?.params?.attemptsUsed || 0) + 1;

        /*  const newAttempts = (attemptsUsed || 0) + 1;

          console.log("attempt used >>", newAttempts);

          navigation.navigate("FailedScreen", {
            errorData: {
              attemptsUsed: newAttempts,
              totalAttempts: MAX_ATTEMPTS,
              errorTitle: "Face Verification Failed",
              errorHindi: "सत्यापन असफल — Biometric mismatch (Step 2)",
              failedAt: "Face Biometric",
              errorMessage:
                "Face verification failed — biometric mismatch. Please retry in better lighting with face directly facing camera."
            }
          }); */
      }, 1500);
      // } else {
      //   throw new Error(callResult.Message || "Face Match Failed");
      // }
    } catch (error) {
      Alert.alert("Verification Failed", error.message, [
        { text: "Retry", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const updateStep = (id, status) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <IconMC name="face-recognition" size={40} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Verifying Face Biometric</Text>
        <Text style={styles.subTitle}>UIDAI चेहरा सत्यापित कर रहा है...</Text>
      </View>

      <View style={styles.card}>
        {steps.map((step, index) => (
          <View
            key={step.id}
            style={[styles.stepRow, index < 2 && styles.borderBottom]}
          >
            <View style={styles.iconArea}>
              {step.status === "done" ? (
                <View style={styles.doneCircle}>
                  <IconMC name="check" size={14} color="#4CAF50" />
                </View>
              ) : step.status === "live" ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <View style={styles.pendingCircle}>
                  <Text style={styles.pendingDot}>•</Text>
                </View>
              )}
            </View>
            <View style={styles.labelArea}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSub}>{step.sub}</Text>
            </View>
            <View style={styles.statusArea}>
              <Text
                style={[
                  styles.statusText,
                  step.status === "done" && { color: "#4CAF50" },
                  step.status === "live" && { color: "#FFA000" },
                ]}
              >
                {step.status === "done"
                  ? "Done"
                  : step.status === "live"
                  ? "Live..."
                  : "Pending"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Processing...</Text>
          <Text style={styles.progressPercent}>
            {Math.round(overallProgress * 100)}%
          </Text>
        </View>
        <Progress.Bar
          progress={overallProgress}
          width={null}
          color="#4CAF50"
          unfilledColor="#E0E0E0"
          borderWidth={0}
          height={8}
          borderRadius={4}
        />
      </View>

      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          Face encrypted by AadhaarFaceRD • Biometric never leaves UIDAI system
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  header: { alignItems: "center", marginVertical: 40 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderContext: 2,
    borderColor: "#4CAF50",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subTitle: { fontSize: 13, color: "#666", marginTop: 5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
    overflow: "hidden",
  },
  stepRow: { flexDirection: "row", alignItems: "center", padding: 20 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  iconArea: { width: 30 },
  doneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingDot: { color: "#ccc", fontSize: 20 },
  labelArea: { flex: 1, paddingHorizontal: 12 },
  stepTitle: { fontSize: 15, fontWeight: "bold", color: "#333" },
  stepSub: { fontSize: 11, color: "#999", marginTop: 2 },
  statusArea: { minWidth: 60, alignItems: "flex-end" },
  statusText: { fontSize: 12, fontWeight: "700", color: "#bbb" },
  progressSection: { marginTop: 40 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 12, color: "#666", fontWeight: "600" },
  progressPercent: { fontSize: 12, color: "#4CAF50", fontWeight: "bold" },
  footerNote: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
  },
  footerText: { fontSize: 10, color: "#888", textAlign: "center" },
});

export default VerificationProgress;
