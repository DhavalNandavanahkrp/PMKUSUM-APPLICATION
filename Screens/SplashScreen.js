import React from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import { Colors } from "react-native/Libraries/NewAppScreen";

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode={"stretch"}
        style={styles.header}
        source={require("../assets/SolarPanel.jpg")}
      >
        <View style={styles.imageContainer}>
          <Text style={styles.title}>PM-KUSUM</Text>
          <Animatable.Image
            animation="slideInDown"
            duraton="1000"
            source={require("../assets/NaMo.png")}
            style={styles.image}
            resizeMode="stretch"
          />
        </View>
      </ImageBackground>

      {/* Ministry logo */}
      <Animatable.Image
        animation="slideInUp"
        duraton="1000"
        source={require("../assets/MinistryLogo.png")}
        style={styles.footer}
      />
    </View>
  );
};

export default SplashScreen;

const { height } = Dimensions.get("screen");
const height_logo = height * 0.35;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flex: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: 10,
  },
  image: {
    width: height_logo,
    height: height_logo,
  },
  title: {
    color: "#F1A221",
    fontSize: 40,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "stretch",
    alignSelf: "stretch",
    textAlign: "center",
  },
});
