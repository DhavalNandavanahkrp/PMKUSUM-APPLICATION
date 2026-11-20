import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather as IconF, MaterialCommunityIcons as IconMC, AntDesign as IconA } from "@expo/vector-icons";

const CONSENT_CONTENT = [
    {
        id: "purpose",
        title: "उपयोग का उद्देश्य (Purpose of Use)",
        icon: { library: IconMC, name: "shield-outline", color: "#4CAF50" },
        bgColor: "#E8F5E9",
        borderColor: "#C8E6C9",
        paragraphs: [
            "आपके आधार विवरण का उपयोग PM-KUSUM योजना के अंतर्गत लाभार्थी की पहचान एवं आधार प्रमाणीकरण तथा योजना के लिए पंजीकरण/लाभ प्राप्त करने की पात्रता सुनिश्चित करने के उद्देश्य से किया जाएगा। आधार जानकारी का उपयोग केवल निर्धारित योजना उद्देश्य के लिए किया जाएगा।",
            "Your Aadhaar information will be used for beneficiary identification and Aadhaar authentication under the PM-KUSUM scheme and to facilitate registration and eligibility for benefits under the scheme. Aadhaar information will be used only for the specified scheme purpose."
        ]
    },
    {
        id: "data_shared",
        title: "सहमति (Consent)",
        icon: { library: IconMC, name: "shield-check-outline", color: "#2196F3" },
        bgColor: "#FFF9E7",
        borderColor: "#F0E0B0",
        paragraphs: [
            // "UIDAI आपका नाम, लिंग और चेहरे का डेटा PM-KUSUM सत्यापन के लिए प्रदान करेगा।",
            // "UIDAI will share your Name, Gender and Face image for PM-KUSUM verification.",
            "मैं उपरोक्त जानकारी को पढ़कर और समझकर, PM-KUSUM योजना के लिए अपने आधार नंबर के संग्रह एवं आधार के लिए अपनी स्पष्ट सहमति प्रदान करता/करती हूँ।",
            "I have read and understood the above information and hereby provide my explicit consent for the collection and use of my Aadhaar number for the PM-KUSUM scheme."
        ]
    }, 
    
    /*
    {
        id: "alternative",
        title: "विकल्प (Alternative)",
        icon: { library: IconF, name: "zap", color: "#FFA000" },
        bgColor: "#FFF9E7",
        borderColor: "#F0E0B0",
        paragraphs: [
            "आप Aadhaar के स्थान पर Virtual ID (VID) का उपयोग कर सकते हैं।",
            "You may use a Virtual ID (VID) instead of your Aadhaar number."
        ]
    } */
];




export default function ConsentStep({ onProceed, onBack }) {
    const [isAgreed, setIsAgreed] = useState(false);
    const InfoCard = ({ item }) => {
        const IconComponent = item.icon.library;
        return (
            <View style={[localStyles.card, { backgroundColor: item.bgColor, borderColor: item.borderColor }]}>
                <View style={localStyles.cardHeader}>
                    <IconComponent name={item.icon.name} size={20} color={item.icon.color} />
                    <Text style={localStyles.cardTitle}>{item.title}</Text>
                </View>
                {item.paragraphs.map((text, index) => (
                    <Text key={index} style={[localStyles.cardText, index % 2 !== 0 && localStyles.italicText]}>
                        {text}
                    </Text>
                ))}
            </View>
        );
    };


    return (
        <ScrollView contentContainerStyle={localStyles.scrollPadding} showsVerticalScrollIndicator={false}>

            {CONSENT_CONTENT.map((item) => (
                <InfoCard key={item.id} item={item} />
            ))}

            {/* Consent Checkbox */}
            <TouchableOpacity
                style={[localStyles.checkSection, isAgreed && { borderColor: '#4CAF50' }]}
                onPress={() => setIsAgreed(!isAgreed)}
                activeOpacity={0.8}
            >
                <View style={[localStyles.checkbox, isAgreed && localStyles.checkboxSelected]}>
                    {isAgreed && <IconA name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={localStyles.checkTitle}>मैं उपरोक्त शर्तों को पढ़कर और समझकर, आधार नंबर साझा करने  के लिए अपनी सहमति प्रदान करता/करती हूँ।</Text>
                    <Text style={localStyles.checkSubTitle}>I have read and understood the above terms and provide my consent to share my Aadhaar number.</Text>
                </View>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => onProceed()} disabled={!isAgreed}  style={[localStyles.btnPrimary, !isAgreed && localStyles.btnDisabled]}>
                <Text style={localStyles.btnText}>I Agree — Proceed to OTP Verification</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={localStyles.btnSecondary} onPress={() => onBack()}>
                <Text style={localStyles.btnSecondaryText}>I Do Not Consent</Text>
            </TouchableOpacity> */}

            {/* RD Status */}
            {/* <View style={localStyles.statusBadge}>
                <View style={localStyles.greenDot} />
                <Text style={localStyles.statusLabel}>AadhaarFaceRD <Text style={{ fontWeight: '400' }}>active on this device</Text></Text>
                <TouchableOpacity onPress={() => console.log('Refresh Service')} style={{ marginLeft: 8 }}>
                    <IconF name="refresh-cw" size={14} color="#666" />
                </TouchableOpacity>
            </View> */}
        </ScrollView>
    );
}
const localStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    stepperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 15, elevation: 2 },
    stepContainer: { alignItems: 'center', width: 70 },
    stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    stepCircleActive: { backgroundColor: '#FFA000' },
    stepNumber: { fontSize: 12, color: '#999', fontWeight: 'bold' },
    stepLabel: { fontSize: 11, color: '#999' },
    stepLabelActive: { color: '#FFA000', fontWeight: 'bold' },
    stepLine: { width: 50, height: 2, backgroundColor: '#FFA000', marginBottom: 18 },
    scrollPadding: { padding: 16 },
    card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 12, fontWeight: '700', marginLeft: 10, color: '#333' },
    cardText: { fontSize: 10, color: '#444', lineHeight: 14, marginBottom: 4 },
    italicText: { fontStyle: 'italic', color: '#666', fontSize: 10, marginBottom: 10 },
    checkSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 18, borderColor: '#eee' },
    checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#4CAF50', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    checkboxSelected: { backgroundColor: '#4CAF50' },
    checkTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    checkSubTitle: { fontSize: 12, color: '#666', marginTop: 2 },
    btnPrimary: { backgroundColor: '#4CAF50', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    btnDisabled: { backgroundColor: '#A5D6A7' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    btnSecondary: { paddingVertical: 12, alignItems: 'center' },
    btnSecondaryText: { color: '#666', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 10 },
    statusLabel: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold' }
});
