import { createStackNavigator } from "@react-navigation/stack";
import i18n from "i18n-js";
import LoginScreen from "./LoginScreen";
import StateSelection from "./StateSelection";
import LanguageSelection from "./LanguageSelection";
import ForgotPassword from "./ForgotPassword";
import FarmerRegistration from "./FarmerRegistration";
import ApplicationStatus from "./ApplicationStatus";
import SuccessfulAddeddFarmer from "./SuccessfulAddeddFarmer";
import { Colors } from "../Styles/Colors";
import HeaderTitle from "../Components/HeaderTitle";
import { View, Text } from "react-native";
import Irrigationrequirement from "../Screens/Irrigationrequirement";
import Systemhead from "../Screens/Systemhead";
import SIPSTool from "../Screens/SIPSTool";
import Cardanalysis from "../Screens/Cardanalysis";
import Location from "../Screens/Location";

const LoginStack = createStackNavigator();

const LoginStackScreens = ({ navigation }) => (
  <LoginStack.Navigator
    screenOptions={({ route }) => ({
      headerMode: "screen",
      headerTitleAlign: "left",
      animationEnabled: true,
      headerStyle: {
        backgroundColor: Colors.primaryOrange,
      },
      headerTintColor: Colors.white,
      headerBackTitleVisible: false,
    })}
  >
    <LoginStack.Screen
      name="StateSelection"
      component={StateSelection}
      initialParams={{ id: 0, name: "English" }}
      options={{
        headerTitle: (props) => (
          <HeaderTitle
            {...props}
            title="Select State and Language"
            icon="home-map-marker"
            iconType="MC"
          />
        ),
      }}
    />
    <LoginStack.Screen
      name="LanguageSelection"
      component={LanguageSelection}
      options={{
        headerTitle: (props) => (
          <HeaderTitle
            {...props}
            title={i18n.t("selectLanguage")}
            icon="language"
            iconType="FA"
          />
        ),
      }}
    />

    <LoginStack.Screen
      name="Login"
      component={LoginScreen}
      options={{
        headerTitle: (props) => (
          <HeaderTitle
            {...props}
            title={i18n.t("login")}
            icon="login"
            iconType="M"
          />
        ),
      }}
    />
    <LoginStack.Screen
      name="ApplicationStatus"
      component={ApplicationStatus}
      options={{
        headerTitle: (props) => (
          <HeaderTitle
            {...props}
            title={i18n.t("ApplicationStatus")}
            icon="file-document-outline"
            iconType="MC"
          />
        ),
      }}
    />
    <LoginStack.Screen
      name="FarmerRegistration"
      component={FarmerRegistration}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("FarmerRegistration")} />
        ),
      }}
    ></LoginStack.Screen>
    <LoginStack.Screen
      name="Irrigationrequirement"
      component={Irrigationrequirement}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("Irrigationrequirement")} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 35,
                height: 35,
                margin: 5,
                justifyContent: "center",
                borderRadius: 60 / 2,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: 19,
                }}
                color="#fff"
              >
                3
              </Text>
            </View>
          </View>
        ),
      }}
    />
    <LoginStack.Screen
      name="Systemhead"
      component={Systemhead}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("Systemheadrequirement")} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 35,
                height: 35,
                margin: 5,
                justifyContent: "center",
                borderRadius: 60 / 2,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: 19,
                }}
                color="#fff"
              >
                4
              </Text>
            </View>
          </View>
        ),
      }}
    />
    <LoginStack.Screen
      name="SIPSTool"
      component={SIPSTool}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("SIPSToolResults")} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 35,
                height: 35,
                margin: 5,
                justifyContent: "center",
                borderRadius: 60 / 2,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: 19,
                }}
                color="#fff"
              >
                5
              </Text>
            </View>
          </View>
        ),
      }}
    />
    <LoginStack.Screen
      name="Cardanalysis"
      component={Cardanalysis}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("Crooping")} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 35,
                height: 35,
                margin: 5,
                justifyContent: "center",
                borderRadius: 60 / 2,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: 19,
                }}
                color="#fff"
              >
                2
              </Text>
            </View>
          </View>
        ),
      }}
    />
    <LoginStack.Screen
      name="Location"
      component={Location}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("Location")} />
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 35,
                height: 35,
                margin: 5,
                justifyContent: "center",
                borderRadius: 60 / 2,
                backgroundColor: "white",
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: 19,
                }}
                color="#fff"
              >
                1
              </Text>
            </View>
          </View>
        ),
      }}
    />
    <LoginStack.Screen
      name="SuccessfulAddeddFarmer"
      component={SuccessfulAddeddFarmer}
      options={{
        headerTitle: (props) => (
          <HeaderTitle {...props} title={i18n.t("FarmerRegistration")} />
        ),
      }}
    ></LoginStack.Screen>
    <LoginStack.Screen
      name="ForgotPassword"
      component={ForgotPassword}
      options={{
        headerTitle: (props) => (
          <HeaderTitle
            {...props}
            title={i18n.t("changePassword")}
            icon="account-key-outline"
            iconType="MC"
          />
        ),
      }}
    />
  </LoginStack.Navigator>
);

export default LoginStackScreens;
