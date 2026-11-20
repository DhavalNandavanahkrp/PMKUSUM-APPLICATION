import React from "react";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import { AadhaarService } from './AadhaarService';
import { Feather as IconF } from "@expo/vector-icons";
import { XMLParser } from 'fast-xml-parser';

const FaceStep = ({ onComplete, navigation, attemptsUsed, setAttemptsUsed }) => {

  const [isBusy, setIsBusy] = useState(false);
  const instructions = [
    { id: 1, text: "Face the camera directly in good lighting" },
    { id: 2, text: "Remove glasses or face coverings" },
    { id: 3, text: "Keep still for 3-5 seconds when prompted" }
  ];

  const handleAadharVerification = async () => {
    setIsBusy(true);
    // const isAppReady = await AadhaarService.checkFaceRDInstallation();

    console.log('app ready>>>>', isAppReady);
    
    if (isAppReady) {
      // const xmlResult = await AadhaarService.performFaceCapture();
      console.log('Facerd object>>', xmlResult);

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });

      const pidObj = parser.parse(xmlResult);

      console.log('parse>>', pidObj);
      const pidData = pidObj.PidData;

      console.log('PID>>', pidData);
      const payload = {
        txnId: pidData.CustOpts.Param.find(p => p.name === 'txnId')?.value,
        uidType: 'AADHAAR',
        uid: 'XXE901',
        authType: 'OTP',
        pidBlock: {
          encryptedPid: pidData.Data['#text'] || pidData.Data,
          sessionKey: pidData.Skey['#text'] || pidData.Skey,
          hmac: pidData.Hmac['#text'] || pidData.Hmac,
          pidDataType: pidData.Data.type,
          timestamp: new Date().toISOString(),
        },
        options: {
          includeLocalLanguage: true,
          includePhoto: true,
          includePrintFormat: true,
        },
        consentGiven: true,
        meta: {
          ipAddress: '',
          locationType: '',
          locationValue: '',
          fingerDeviceCode: pidData.DeviceInfo.dc,
          irisDeviceCode: '',
          deviceCode: pidData.DeviceInfo.dc,
        },
      };

      console.log('Payload =>', JSON.stringify(payload, null, 2));

      // Alert.alert('Face Capture request', JSON.stringify(payload, null, 2));
      /* Alert.alert(
        'Face Capture request',
        JSON.stringify(payload, null, 2)
      ); */

      let requestObj = JSON.stringify(payload, null, 2);

      if (requestObj) {
        /* setTimeout(() => {
          navigation.navigate("VerificationProgress", {
            xmlResult: {data: 'ss'},
            aadhaarNumber: "9012",
            attemptsUsed,
          });
        }, 500); */
        setTimeout(() => {
          navigation.navigate("VerificationProgress", {
            req: requestObj,
            xmlResult: xmlResult,
            aadhaarNumber: "9012"
          });
        }, 500);
      }
    }

    setIsBusy(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.faceIconContainer}>
        <View style={styles.dashedCircle}>
          <Text>
            <IconF
              name={"user"}
              size={40}
              color="#fcb33e"
            />
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Position face in the frame</Text>
      <Text style={styles.subTitle}>Continue to AadhaarFaceRD App for Aadhaar authentication.</Text>

      <View style={styles.list}>
        {instructions.map(item => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.numBadge}><Text style={styles.numText}>{item.id}</Text></View>
            <Text style={styles.listText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={() => handleAadharVerification()}>
        <Text style={styles.scanBtnText}>Start Face Scan</Text>
      </TouchableOpacity>
      <Text style={styles.footerNote}>20 second window · Auto-encrypted</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, alignItems: 'center' },
  faceIconContainer: { marginTop: 25, marginBottom: 20 },
  dashedCircle: { width: 100, height: 100, borderRadius: 70, borderWidth: 2, borderStyle: 'dashed', borderColor: '#FFA000', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9E7' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { textAlign: 'center', color: '#666', fontSize: 11, paddingHorizontal: 20 },
  list: { width: '100%', marginTop: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  numBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  numText: { color: '#FFA000', fontWeight: 'bold', fontSize: 12 },
  listText: { fontSize: 13, color: '#444' },
  scanBtn: { backgroundColor: '#4CAF50', width: '100%', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerNote: { fontSize: 11, color: '#999', marginTop: 10 }
});

export default FaceStep;