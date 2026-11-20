import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as IconMC } from "@expo/vector-icons";

const OTPVerification = ({ onVerify, onBack }) => {
  const [otp, setOtp] = useState("");

  const pressKey = (key) => {
    if (otp.length < 6) setOtp((prev) => prev + key);
  };

  const removeKey = () => setOtp((prev) => prev.slice(0, -1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <IconMC name="cellphone-cog" size={28} color="#FFA000" />
        </View>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subTitle}>
          OTP sent to your pm-kusum registered mobile {"\n"}
          <Text style={{ color: "#333", fontWeight: "bold" }}>
            +91 ******67
          </Text>
        </Text>
      </View>

      {/* OTP Display Boxes */}
      <View style={styles.otpRow}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}
          >
            <Text style={styles.otpText}>{otp[i] || ""}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.resendText}>
        Resend OTP in <Text style={{ color: "#FFA000" }}>01:42</Text>
      </Text>

      {/* Custom Keypad */}
      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0].map((k) => (
          <TouchableOpacity
            key={k}
            style={styles.key}
            onPress={() => pressKey(k)}
          >
            <Text style={styles.keyText}>{k}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={removeKey}>
          <IconMC name="backspace-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.verifyBtn,
          otp.length < 6 && { backgroundColor: "#ccc" },
        ]}
        onPress={() => otp.length === 6 && onVerify(otp)}
      >
        <Text style={styles.verifyBtnText}>Verify OTP & Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: { alignItems: "center", marginTop: 6 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFA000",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subTitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 5,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  otpBox: {
    width: 45,
    height: 52,
    backgroundColor: "#fdfbf8",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxActive: { borderColor: "#FFA000" },
  otpText: { fontSize: 22, fontWeight: "bold" },
  resendText: { textAlign: "center", color: "#999", marginBottom: 14 },
  keypad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  key: { width: "30%", paddingVertical: 8, alignItems: "center" },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    paddingHorizontal: 26,
    paddingVertical: 6,
  },
  verifyBtn: {
    backgroundColor: "#FFA000",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },
  verifyBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default OTPVerification;
