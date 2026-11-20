import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import i18n from "i18n-js";
import * as Animatable from "react-native-animatable";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
  Ionicons as IconI,
} from "@expo/vector-icons";
const Help = () => {
  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={{ margin: "1%" }}>
        <View
          style={{
            flexDirection: "row",
            zIndex: 100,
          }}
        >
          <View
            style={[Styles.sectionTitle, { marginTop: 10, marginLeft: 20 }]}
          >
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("HowToImproveCUF")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() =>
              Linking.openURL(
                "http://www.africau.edu/images/default/sample.pdf",
              )
            }
          >
            <IconI
              name="download-outline"
              size={25}
              color={Colors.white}
            ></IconI>
          </TouchableOpacity>
        </View>
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[
            Styles.sectionView,
            {
              marginHorizontal: 5,
              marginTop: -30,
              paddingTop: 20,
              paddingBottom: 10,
              paddingHorizontal: 10,
            },
          ]}
        >
          <View style={styles.row}>
            <IconF name="check-circle" color={Colors.green} size={20} />
            <Text style={styles.text}>
              {i18n.t("CleanWashYourSolarPanelOnRegularBasis")}
            </Text>
          </View>
          <View style={styles.row}>
            <IconF name="check-circle" color={Colors.green} size={20} />
            <Text style={styles.text}>
              {i18n.t(
                "MakeSureNoShadowOfAnyObjectLikeTreeOrHouseIsCastUponYourSolarPanel",
              )}
            </Text>
          </View>
        </Animatable.View>

        <View
          style={{
            flexDirection: "row",
            zIndex: 100,
            marginTop: 10,
          }}
        >
          <View
            style={[Styles.sectionTitle, { marginTop: 10, marginLeft: 20 }]}
          >
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("HowToReduceConsumption")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() =>
              Linking.openURL(
                "http://www.africau.edu/images/default/sample.pdf",
              )
            }
          >
            <IconI
              name="download-outline"
              size={25}
              color={Colors.white}
            ></IconI>
          </TouchableOpacity>
        </View>
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[
            Styles.sectionView,
            {
              marginHorizontal: 5,
              marginTop: -30,
              paddingTop: 20,
              paddingBottom: 10,
              paddingHorizontal: 10,
            },
          ]}
        >
          <View style={styles.row}>
            <IconF name="check-circle" color={Colors.green} size={20} />
            <Text style={styles.text}>
              {i18n.t("UseGoodQualityIrrigationSystem")}
            </Text>
          </View>
          <View style={styles.row}>
            <IconF name="check-circle" color={Colors.green} size={20} />
            <Text style={styles.text}>
              {i18n.t("UseEnergyEfficientPumposForIrrigation")}
            </Text>
          </View>
          <View style={styles.row}>
            <IconF name="check-circle" color={Colors.green} size={20} />
            <Text style={styles.text}>
              {i18n.t("UseYourPumpOnlyWhenNeeded")}
            </Text>
          </View>
        </Animatable.View>

        <Button
          icon={() => (
            <IconMC
              name="weather-partly-rainy"
              size={35}
              color={Colors.white}
            />
          )}
          mode="outlined"
          color={Colors.white}
          style={styles.signin}
          onPress={() =>
            Linking.openURL(
              "http://103.215.208.107/agrogis/index.php/Main/warning",
            )
          }
        >
          {i18n.t("WeatherAdvisory")}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Help;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 5,
    marginTop: 5,
    alignItems: "center",
  },
  text: { width: "95%", marginLeft: 10 },
  downloadButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryOrange,
    marginLeft: "auto",
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  signin: {
    // borderColor: Colors.graytone,
    // borderWidth: 2,
    marginTop: 30,
    marginHorizontal: "2%",
    borderRadius: 5,
    fontWeight: "bold",
    fontSize: 16,
    borderColor: Colors.graytone,
    backgroundColor: Colors.orange,
    height: 40,
  },
});
