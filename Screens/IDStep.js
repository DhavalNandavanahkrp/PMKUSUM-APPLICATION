import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as IconMC } from "@expo/vector-icons";
import { validateVerhoeff } from "../Components/verhoeff";

const IDStep = ({ onProceed }) => {
  const [isVid, setIsVid] = useState(false);
  const [idValue, setIdValue] = useState("");

  const isLengthValid = idValue.length === (isVid ? 16 : 12);
  const isChecksumValid = isLengthValid && validateVerhoeff(idValue, isVid);

  const getErrorMessage = () => {
    if (idValue.length > 0 && (idValue[0] === '0' || idValue[0] === '1')) {
      return "ID cannot start with 0 or 1";
    }
    if (isLengthValid && !isChecksumValid) {
      return "Invalid Number. Please check digits.";
    }
    return null;
  };

  const errorMsg = getErrorMessage();

  const getMaskedDisplay = (value) => {
    const clean = value.replace(/\D/g, "");
    const len = isVid ? 16 : 12;
    let masked = "";

    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) masked += "  ";
      if (i < len - 4) {
        masked += "•";
      } else {
        masked += clean[i];
      }
    }
    return masked;
  };

  const hasError = isLengthValid && !isChecksumValid;

  const handleInputChange = (text) => {
    const cleanText = text.replace(/\D/g, "");
    const limit = isVid ? 16 : 12;
    if (cleanText.length <= limit) {
      setIdValue(cleanText);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

      
        <View style={styles.inputCard}>
          <Text style={styles.label}>
            {isVid ? "Virtual ID (VID) / वर्चुअल आईडी" : "Aadhaar Number / आधार संख्या"}
          </Text>

          <View style={[
            styles.inputRow,
            isChecksumValid && styles.inputRowValid,
            errorMsg && styles.inputRowError
          ]}>
            <IconMC
              name={isVid ? "shield-key-outline" : "card-account-details-outline"}
              size={22}
              color={errorMsg ? "#D32F2F" : "#666"}
            />

            <TextInput
              style={styles.hiddenInput}
              keyboardType="numeric"
              maxLength={isVid ? 16 : 12}
              value={idValue}
              onChangeText={handleInputChange}
              caretHidden
            />

            <View style={styles.maskOverlay} pointerEvents="none">
              <Text style={[
                styles.maskedText,
                !idValue && { color: '#ccc' },
                errorMsg && { color: '#D32F2F'}
              ]}>
                {idValue ? getMaskedDisplay(idValue) : (isVid ? "Enter 16-digit VID" : "Enter 12-digit Aadhaar")}
              </Text>
            </View>

            {/* Dynamic Icons based on state */}
            {isChecksumValid ? (
              <IconMC name="check-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
            ) : errorMsg ? (
              <IconMC name="alert-circle" size={20} color="#D32F2F" style={styles.checkIcon} />
            ) : null}
          </View>

          <Text style={[styles.hintText, errorMsg && styles.errorTextLabel]}>
            {errorMsg ? errorMsg : `Enter ${isVid ? "16" : "12"} digits • Masked for security`}
          </Text>
        </View>



        {/* Toggle Section */}
        {/* <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Use Virtual ID (VID)</Text>
            <Text style={styles.switchSub}>वर्चुअल आईडी — 16-digit alternative</Text>
          </View>
          <Switch
            value={isVid}
            onValueChange={(val) => {
              setIsVid(val);
              setIdValue(""); // Reset value for security when switching
            }}
            trackColor={{ true: '#A5D6A7', false: '#ddd' }}
            thumbColor={isVid ? '#4CAF50' : '#f4f3f4'}
          />
        </View> */}

        {/* Government Compliance VID Info Box */}
        {isVid && (
          <View style={styles.vidInfoCard}>
            <Text style={styles.vidInfoTitle}>VID क्या है? (What is VID?)</Text>
            <Text style={styles.vidInfoText}>
              UIDAI द्वारा जारी 16-अंकीय अस्थायी आईडी। UIDAI वेबसाइट या mAadhaar ऐप से प्राप्त करें।
            </Text>
            <Text style={styles.vidInfoTextEnglish}>
              VID is a temporary 16-digit number. Get it from the UIDAI website or mAadhaar app.
            </Text>
          </View>
        )}

        {/* Privacy Note */}
        <View style={styles.infoBox}>
          <IconMC name="shield-lock-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            Your Actual {isVid ? 'VID' : 'Aadhaar'} number is never stored on this device or our servers. All data is encrypted in transit.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.continueBtn, !isChecksumValid && styles.btnDisabled]}
          onPress={() => onProceed(idValue)}
          disabled={!isChecksumValid}
        >
          <Text style={styles.continueBtnText}>Continue to OTP Verification Steps</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8f9fa' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 13, color: '#555', fontWeight: '600', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#FFA000', paddingBottom: 8, position: 'relative' },
  inputRowValid: { borderBottomColor: '#4CAF50' },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 2 },
  maskOverlay: { flex: 1, marginLeft: 15 },
  maskedText: { fontSize: 20, fontWeight: '700', letterSpacing: 1.5, color: '#333' },
  checkIcon: { marginLeft: 10 },
  hintText: { fontSize: 11, color: '#999', marginTop: 8, fontStyle: 'italic' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#eee' },
  switchTitle: { fontWeight: '700', fontSize: 14, color: '#333' },
  switchSub: { fontSize: 11, color: '#666', marginTop: 2 },

  vidInfoCard: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, marginTop: 15, borderLeftWidth: 4, borderLeftColor: '#FFA000' },
  vidInfoTitle: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 5 },
  vidInfoText: { fontSize: 12, color: '#555', lineHeight: 18 },
  vidInfoTextEnglish: { fontSize: 11, color: '#777', lineHeight: 16, marginTop: 4, fontStyle: 'italic' },

  infoBox: { flexDirection: 'row', padding: 15, backgroundColor: '#E8F5E9', borderRadius: 10, marginTop: 25, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 11, color: '#2E7D32', marginLeft: 12, lineHeight: 16, fontWeight: '500' },

  continueBtn: { backgroundColor: '#4CAF50', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginTop: 30, marginBottom: 20, elevation: 2 },
  btnDisabled: { backgroundColor: '#A5D6A7' },
  continueBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  inputRowError: {
    borderBottomColor: '#D32F2F',
  },
  errorTextLabel: {
    color: '#D32F2F',
    fontWeight: '600',
    fontStyle: 'normal',
  }
});

export default IDStep;