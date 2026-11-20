import React from "react";
import { View, Text, StyleSheet, Linking, Platform } from "react-native";
import { Button } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import IconFA5 from "@expo/vector-icons/FontAwesome5";
import * as Animatable from "react-native-animatable";
import i18n from "i18n-js";

const SuccessfulAddeddFarmer = ({ navigation }) => {
  return (
    <Animatable.View
      animation="fadeInDownBig"
      duration={1500}
      style={[Styles.m1h, { marginVertical: 10, flex: 1 }]}
    >
      <View
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <IconFA5
          name="thumbs-up"
          size={40}
          color={Colors.green}
          style={{ marginBottom: 10 }}
        /> */}
        <Text style={styles.text}>
          {i18n.t("ThankYouForRegisterInPM-KUSUMScheme")}
        </Text>
        <Text
          style={styles.hypertext}
          onPress={() =>
            Linking.openURL(
              "https://pmkusum.mnre.gov.in/State_Implementing_Agencies.html",
            )
          }
        >
          {i18n.t("ContactUsPage")}
        </Text>
        <Text style={styles.text}>{i18n.t("ForMoreDetails")}</Text>
      </View>
      <View style={styles.bottomView}>
        <Button
          icon={() => <IconFA5 name="home" size={20} color={Colors.white} />}
          mode="outlined"
          compact={true}
          color={Colors.white}
          style={styles.registerbtn}
          onPress={() => navigation.navigate("Login")}
        >
          Home
        </Button>
      </View>
    </Animatable.View>
  );
};

export default SuccessfulAddeddFarmer;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: Platform.OS === "ios" ? 10 : 0,
    paddingTop: Platform.OS === "ios" ? 20 : 10,
  },
  text: {
    color: Colors.primaryOrange,
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    fontFamily: "roboto-regular",
    textShadowRadius: 4,
    textTransform: "uppercase",
    textAlignVertical: "top",
  },
  hypertext: {
    color: Colors.green,
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    fontFamily: "roboto-regular",
    textShadowRadius: 2,
    textTransform: "uppercase",
    textAlignVertical: "top",
    borderBottomWidth: 2,
    borderColor: Colors.lightGreen,
  },
  bottomView: {
    width: "100%",
    height: 50,
    position: "absolute", //Here is the trick
    bottom: 0, //Here is the trick
  },
  registerbtn: {
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
  },
});
