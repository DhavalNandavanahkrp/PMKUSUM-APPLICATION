import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import i18n from "i18n-js";
import { Caption } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as Animatable from "react-native-animatable";
import { MaterialCommunityIcons as IconMC } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { queryAll } from "../db/exec";

const SyncSurveyoffline = () => {
  const navigation = useNavigation();

  const handleSiteSurveySyncNavigation = async () => {
    try {
      const results = await queryAll(
        "SELECT COUNT(*) as count FROM SiteSurveyChecklist",
      );

      const count = results[0]?.count || 0;

      if (count > 0) {
        navigation.navigate("SyncSurvey");
      } else {
        Alert.alert(
          i18n.t("syncDoes'tSuccessfully"),
          i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
          [{ text: i18n.t("OK") }],
        );
      }
    } catch (error) {
      Alert.alert(
        i18n.t("syncDoes'tSuccessfully"),
        i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
        [{ text: i18n.t("OK") }],
      );
    }
  };

  return (
    <View style={{ margin: "1%", flex: 1 }}>
      <View>
        {/* Sync offline */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconMC
            name="information-variant"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconMC>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("syncoffline")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={handleSiteSurveySyncNavigation}
          >
            <View style={Styles.actionButton}>
              <IconMC
                style={{ alignSelf: "center", alignItems: "center" }}
                name="file-sync-outline"
                size={30}
                color={Colors.graytone}
              ></IconMC>
            </View>
            <Caption style={Styles.captionText}>{i18n.t("SyncSurvey")}</Caption>
          </Pressable>
        </Animatable.View>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            textAlign: "center",
            color: Colors.graytone,
            fontFamily: "roboto-regular",
            fontSize: 16,
          }}
        >
          {i18n.t("LoadConnectionDetailsUsingSearchPanelAbove")}
        </Text>
      </View>
    </View>
  );
};

export default SyncSurveyoffline;

const styles = StyleSheet.create({});
