import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MaterialCommunityIcons as IconMC,
  Feather as IconF,
} from "@expo/vector-icons";

const COLORS = {
  primaryGreen: "#4CAF50",
  successCircle: "#E8F5E9",
  tableHeader: "#449D44",
  textMain: "#333333",
  textSecondary: "#666666",
  background: "#F8F9FA",
  divider: "#EEEEEE",
};

/* const getFormattedDateTime = () => {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }); // "Jul"
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 0 -> 12
  const hoursStr = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
};
    dateTime: getFormattedDateTime(), */

const SuccessScreen = ({ route, navigation }) => {
  const data = route?.params?.data;

  const DataCard = ({ title, icon, iconLib, children }) => {
    const IconComponent = iconLib || IconMC;
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <IconComponent name={icon} size={20} color="#fff" />
          <Text style={styles.cardHeaderText}>{title.toUpperCase()}</Text>
        </View>
        <View style={styles.cardContent}>{children}</View>
      </View>
    );
  };

  const DataRow = ({ label, value, isMasked, isBold }) => (
    <View style={styles.dataRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View
        style={[styles.rowValueContainer, isMasked && styles.maskedValueBox]}
      >
        <Text
          style={[
            styles.rowValue,
            isBold && styles.boldText,
            isMasked && styles.maskedText,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerSection}>
          <View style={styles.checkCircle}>
            <IconF name="check" size={36} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.mainTitle}>OTP Verification Successful!</Text>
          <Text style={styles.hindiSub}>
            सत्यापन सफल — लाभार्थी पहचान पुष्टि
          </Text>
        </View>

        <DataCard
          title="Capture Aadhaar Successful"
          icon="shield-check"
          iconLib={IconMC}
        >
          <DataRow label="Aadhaar" value={data.aadhaarMasked} isBold />
          <DataRow
            label="Ref Token"
            value={data.uidToken.substring(0, 15) + "..."}
            isMasked
          />
          <DataRow
            label="Transaction"
            value={data.transactionId.substring(0, 12) + "..."}
            isMasked
          />
          <DataRow label="Date / Time" value={data.dateTime} isBold />
        </DataCard>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.popToTop()}
        >
          <View style={styles.btnRow}>
            <IconF name="arrow-right" size={18} color="#fff" />
            <Text style={styles.continueBtnText}>Proceed to Continue</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 0,
    marginTop: 0,
  },
  scrollPadding: { paddingHorizontal: 12, paddingBottom: 20 },

  // Center Success Section
  centerSection: { alignItems: "center", marginVertical: 15 },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: COLORS.successCircle,
    borderWidth: 1.5,
    borderColor: COLORS.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primaryGreen,
    marginBottom: 5,
  },
  hindiSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center" },

  // Card and Table Styling
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tableHeader,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  cardHeaderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  cardContent: { paddingVertical: 5 },

  // Table Row Styling
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  rowValueContainer: { flex: 2, alignItems: "flex-end" },
  rowValue: { fontSize: 14, color: COLORS.textMain, textAlign: "right" },
  boldText: { fontWeight: "700", color: "#000" },

  // Masked/Boxed Values
  maskedValueBox: {
    backgroundColor: "#F0F3F7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1DBE8",
    alignSelf: "flex-end",
    marginLeft: 120,
  },
  maskedText: { fontSize: 11, color: "#555", letterSpacing: 0.8 },

  // Verification Pills
  pillContainer: { flexDirection: "row", gap: 10, alignSelf: "flex-end" },
  stepPill: {
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: COLORS.primaryGreen },

  // Disclaimer Box
  disclaimerBox: {
    position: "relative",
    backgroundColor: "#fff",
    padding: 15,
    paddingLeft: 20,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#eee",
  },
  leftGreenLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primaryGreen,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  disclaimerText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  // Continue Button
  continueBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  continueBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default SuccessScreen;
