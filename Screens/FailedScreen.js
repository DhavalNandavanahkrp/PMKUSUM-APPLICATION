import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as IconMC, Feather as IconF } from "@expo/vector-icons";

const COLORS = {
  errorRed: '#D32F2F',
  errorLight: '#FFEBEE',
  warningAmber: '#FFA000',
  textMain: '#333333',
  textSecondary: '#666666',
  background: '#F8F9FA',
  divider: '#EEEEEE',
  btnAction: '#4CAF50'
};

const FailedScreen = ({ route, navigation }) => {

  /* const dummyFailure = {
    errorTitle: "Verification Failed",
    errorHindi: "सत्यापन विफल कृपया पुनः प्रयास करें।",
    failedAt: "Face Biometric",
    attemptsUsed: 0,
    totalAttempts: 0,
    errorMessage: "Face verification failed — biometric mismatch. Please retry in better lighting with face directly facing camera."
  }; */

  const errorData = route?.params?.errorData;
  const { attemptsUsed = 3, totalAttempts = 3 } = errorData;

  console.log('err', errorData)

  const AttemptIndicator = ({ used, total }) => {
    let dots = [];
    for (let i = 1; i <= total; i++) {
      dots.push(
        <View
          key={i}
          style={[styles.dot, i <= used ? styles.dotActive : styles.dotInactive]}
        />
      );
    }
    return <View style={styles.dotRow}>{dots}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>

        {/* Main Error Icon & Title */}
        <View style={styles.centerSection}>
          <View style={styles.errorCircle}>
            <IconF name="x" size={36} color={COLORS.errorRed} />
          </View>
          <Text style={styles.mainTitle}>{errorData.errorTitle}</Text>
          <Text style={styles.hindiSub}>{errorData.errorHindi}</Text>
        </View>

        {/* Failure Detail Card */}
        <View style={styles.failureCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderLabel}>Failed at: </Text>
            <Text style={styles.cardHeaderValue}>{errorData.failedAt}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.errorDescription}>{errorData.errorMessage}</Text>

            {/* <View style={styles.attemptRow}>
              <AttemptIndicator used={attemptsUsed} total={totalAttempts} />
              <Text style={styles.attemptText}>
                {attemptsUsed} of {totalAttempts} attempts used
              </Text>
            </View> */}
          </View>
        </View>


        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.retryBtnText}>Retry Aadhaar Capture</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollPadding: { paddingHorizontal: 16, paddingBottom: 30 },

  // Header Section
  centerSection: { alignItems: 'center', marginVertical: 35 },
  errorCircle: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.errorRed, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 2 },
  mainTitle: { fontSize: 22, fontWeight: '700', color: COLORS.errorRed, marginBottom: 5 },
  hindiSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  // Failure Card
  failureCard: { backgroundColor: '#fff', borderRadius: 8, elevation: 2, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#FFEBEE' },
  cardHeader: { flexDirection: 'row', backgroundColor: COLORS.errorLight, paddingVertical: 8, paddingHorizontal: 15, justifyContent: 'center' },
  cardHeaderLabel: { fontSize: 12, color: COLORS.errorRed, fontWeight: '600' },
  cardHeaderValue: { fontSize: 12, color: COLORS.errorRed, fontWeight: 'bold' },
  cardBody: { padding: 15 },
  errorDescription: { fontSize: 13, color: COLORS.textMain, lineHeight: 20, marginBottom: 15 },

  // Attempt Indicator Logic
  attemptRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { backgroundColor: COLORS.warningAmber },
  dotInactive: { backgroundColor: '#E0E0E0' },
  attemptText: { fontSize: 12, color: COLORS.textSecondary },

  // Common Causes Box
  commonCausesBox: { backgroundColor: '#fff', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#eee', elevation: 1 },
  causesTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 12 },
  causeItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.errorLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoChar: { color: COLORS.errorRed, fontWeight: 'bold', fontSize: 12 },
  causeText: { fontSize: 13, color: COLORS.textSecondary },

  // Action Button
  footer: { marginTop: 30, alignItems: 'center' },
  retryBtn: { backgroundColor: COLORS.errorRed, width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', elevation: 4 },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  attemptsLeftText: { marginTop: 15, color: COLORS.errorRed, fontSize: 13, fontWeight: '600' }
});

export default FailedScreen;