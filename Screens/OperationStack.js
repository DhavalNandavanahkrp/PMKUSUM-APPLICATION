import React from "react";
import { View, Pressable, Platform, Alert } from "react-native";
import i18n from "i18n-js";
import { createStackNavigator } from "@react-navigation/stack";
import {
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
} from "@expo/vector-icons";
import { Colors } from "../Styles/Colors";
import HeaderTitle from "../Components/HeaderTitle";
import ComponentSelection from "../Screens/ComponentSelection";
import DiscomA from "../Screens/DiscomA";
import DiscomB from "../Screens/DiscomB";
import DiscomC from "../Screens/DiscomC";
import FarmerB from "../Screens/FarmerB";
import FarmerC from "../Screens/FarmerC";
import EPCA from "../Screens/EPCA";
import EPCB from "../Screens/EPCB";
import EPCC from "../Screens/EPCC";
import Settings from "../Screens/Settings";
import StateSelection from "../Screens/StateSelection";
import LanguageSelection from "../Screens/LanguageSelection";
import SiteInspection from "../Screens/SiteInspection";
import SiteSurvey from "../Screens/SiteSurvey";
import LiveStatus from "./LiveStatus";
import QuarterVisit from "./QuarterVisit";
import LiveStatusC from "./LiveStatusC";
import AssetDetail from "../Screens/AssetDetail";
import AssetMapping from "../Screens/AssetMapping";
import IMEIMapping from "../Screens/IMEIMapping";
import Insurance from "../Screens/Insurance";
import InstallationCommission from "../Screens/InstallationCommission";
import ApplicationStatus from "../Screens/ApplicationStatus";
import Analysis from "./Analysis";
import AnalysisC from "./AnalysisC";
import ServiceCenter from "../Screens/ServiceCenter";
import UserProfile from "./UserProfile";
import UserProfileFarmer from "./UserProfileFarmer";
import ForgotPassword from "./ForgotPassword";
import Complaint from "../Screens/Complaint";
import Help from "../Screens/Help";
import Notification from "../Screens/Notification";
import PumpSchedule from "../Screens/PumpSchedule";
import Performance from "./Performance";
import PerformanceC from "./PerformanceC";
import BackgroundFetchScreen from "./BackgroundTask";
import CropSelection from "./CropSelection";
import SyncInspections from "./SyncInspections";
import SyncSurvey from "./SyncSurvey";
import SyncQuarterVisit from "./SyncQuarterVisit";
import Imagecapture from "./Imagecapture";
import AdvanceSearch from "./AdvanceSearch";
import Weatherdata from "./Weatherdata";
import { AuthContext } from "../Components/context";
import JCRdocument from "./JCRdocument";

import AadhaarMain from "./AadhaarMain";
import ConsentStep from "./ConsentStep";
import OTPVerification from "./OTPVerification";
import IDStep from "./IDStep";
import FaceStep from "./FaceStep";
import VerificationProgress from "./VerificationProgress";
import SuccessScreen from "./SuccessScreen";
import FailedScreen from "./FailedScreen";

const OperationStack = createStackNavigator();

const OperationStackScreens = ({ params }) => {
  const { signOut } = React.useContext(AuthContext);
  const getInitialRouteName = (params) => {
    let routeName = "";

    if (
      !params ||
      params.selectedComponent === null ||
      params.selectedComponent === "" ||
      params.components.length > 1
    ) {
      routeName = "ComponentSelection";
    } else {
      if (params.department.toUpperCase() === "FARMER") {
        if (params.selectedComponent === "ComponentB") {
          routeName = "FarmerB";
        } else {
          routeName = "FarmerC";
        }
      } else if (params.department.toUpperCase() === "DISCOM") {
        if (params.selectedComponent === "ComponentA") {
          routeName = "DiscomA";
        } else if (params.selectedComponent === "ComponentB") {
          routeName = "DiscomB";
        } else {
          routeName = "DiscomC";
        }
      } else {
        if (params.selectedComponent === "ComponentA") {
          routeName = "EPCA";
        } else if (params.selectedComponent === "ComponentB") {
          routeName = "EPCB";
        } else {
          routeName = "EPCC";
        }
      }
    }
    console.log("Initial Route Name : " + routeName);
    return routeName;
  };

  return (
    <OperationStack.Navigator
      initialRouteName={getInitialRouteName(params)}
      screenOptions={({ navigation }) => ({
        headerMode: "screen",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: Colors.primaryOrange,
        },
        headerTintColor: Colors.white,
        headerBackTitle: " ",
        // headerTitleContainerStyle: {
        //   left: 40,
        // },
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={{ marginHorizontal: 5 }}
              onPress={() => navigation.navigate("Settings")}
              color={Colors.white}
            >
              <IconMC
                name="account-cog-outline"
                color={Colors.white}
                size={Platform.OS === "ios" ? 35 : 30}
              ></IconMC>
            </Pressable>
            {/* <Pressable
              style={{ marginHorizontal: 5 }}
              onPress={() => navigation.navigate("Notification")}
              title="Info"
              color="#fff"
            >
              <IconM
                name="notifications-none"
                color={Colors.white}
                size={Platform.OS === "ios" ? 35 : 30}
              ></IconM>
            </Pressable> */}
            <Pressable
              style={{ marginHorizontal: 5 }}
              onPress={() => {
                Alert.alert(
                  i18n.t("LogOut"),
                  i18n.t("AreYouSureWantToLogOut"),
                  [
                    { text: i18n.t("No") },
                    { text: i18n.t("Yes"), onPress: () => signOut() },
                  ],
                );
              }}
              color="#fff"
            >
              <IconM
                name="logout"
                color={Colors.white}
                size={Platform.OS === "ios" ? 35 : 30}
              ></IconM>
            </Pressable>
          </View>
        ),
      })}
    >
      <OperationStack.Screen
        name="ComponentSelection"
        component={ComponentSelection}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("componentSelection")}
              icon="cube-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="AdvanceSearch"
        component={AdvanceSearch}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("AdvanceSearch")}
              icon="account-search-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="DiscomA"
        component={DiscomA}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} title={i18n.t("DiscomCompA")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="DiscomB"
        component={DiscomB}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("DiscomCompB")}
              icon="cube-outline"
              //   iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="DiscomC"
        component={DiscomC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("DiscomCompC")}
              icon="cube-outline"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="FarmerB"
        component={FarmerB}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} title={i18n.t("FarmerCompB")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="FarmerC"
        component={FarmerC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} vtitle={i18n.t("FarmerCompC")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="EPCA"
        component={EPCA}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} title={i18n.t("EPCCompA")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="EPCB"
        component={EPCB}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} title={i18n.t("EPCCompB")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="EPCC"
        component={EPCC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle {...props} title={i18n.t("EPCCompC")} />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("settings")}
              icon="account-cog-outline"
              iconType="MC"
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  Alert.alert(
                    i18n.t("LogOut"),
                    i18n.t("AreYouSureWantToLogOut"),
                    [
                      { text: i18n.t("No") },
                      { text: i18n.t("Yes"), onPress: () => signOut() },
                    ],
                  );
                }}
                color={Colors.white}
              >
                <IconM
                  name="logout"
                  color={Colors.white}
                  size={Platform.OS === "ios" ? 35 : 30}
                ></IconM>
              </Pressable>
            </View>
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="StateSelection1"
        component={StateSelection}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title="Select State and Language"
              icon="home-map-marker"
              iconType="MC"
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  Alert.alert(
                    i18n.t("LogOut"),
                    i18n.t("AreYouSureWantToLogOut"),
                    [
                      { text: i18n.t("No") },
                      { text: i18n.t("Yes"), onPress: () => signOut() },
                    ],
                  );
                }}
                color={Colors.white}
              >
                <IconM
                  name="logout"
                  color={Colors.white}
                  size={Platform.OS === "ios" ? 35 : 30}
                ></IconM>
              </Pressable>
            </View>
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
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
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  Alert.alert(
                    i18n.t("LogOut"),
                    i18n.t("AreYouSureWantToLogOut"),
                    [
                      { text: i18n.t("No") },
                      { text: i18n.t("Yes"), onPress: () => signOut() },
                    ],
                  );
                }}
                color={Colors.white}
              >
                <IconM
                  name="logout"
                  color={Colors.white}
                  size={Platform.OS === "ios" ? 35 : 30}
                ></IconM>
              </Pressable>
            </View>
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="SiteInspection"
        component={SiteInspection}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("siteInspection")}
              icon="search-location"
              iconType="FA5"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="LiveStatus"
        component={LiveStatus}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("currentStatus")}
              icon="text-box-check-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="LiveStatusC"
        component={LiveStatusC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("currentStatus")}
              icon="text-box-check-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="AssetDetail"
        component={AssetDetail}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("assetDetails")}
              icon="solar-panel"
              iconType="FA5"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="ApplicationStatus"
        component={ApplicationStatus}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("applicationStatus")}
              icon="file-document-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="SiteSurvey"
        component={SiteSurvey}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("siteSurvey")}
              icon="search-location"
              iconType="FA5"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="AssetMapping"
        component={AssetMapping}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("assetMapping")}
              icon="solar-panel"
              iconType="FA5"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="IMEIMapping"
        component={IMEIMapping}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("IMEIMapping")}
              icon="sim-card"
              iconType="M"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Insurance"
        component={Insurance}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Insurance")}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="JCRdocument"
        component={JCRdocument}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("JCRdocument")}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="InstallationCommission"
        component={InstallationCommission}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Installation&CommissioningStatus")}
              icon="tools"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="QuarterVisit"
        component={QuarterVisit}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Quarter Visit"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="AadhaarMain"
        component={AadhaarMain}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Capture Aadhaar"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="ConsentStep"
        component={ConsentStep}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Capture Aadhaar"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"OTP Verification"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="IDStep"
        component={IDStep}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Capture Aadhaar"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="FaceStep"
        component={FaceStep}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Capture Aadhaar"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="VerificationProgress"
        component={VerificationProgress}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Capture Aadhaar"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Verification Complete"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="FailedScreen"
        component={FailedScreen}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Verification Failed"}
              icon="wpforms"
              iconType="FA"
            />
          ),
        }}
      ></OperationStack.Screen>

      <OperationStack.Screen
        name="Analysis"
        component={Analysis}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Analysis")}
              icon="bar-chart"
              iconType="M"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="AnalysisC"
        component={AnalysisC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Analysis")}
              icon="bar-chart"
              iconType="M"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="ServiceCenter"
        component={ServiceCenter}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("serviceCenter")}
              icon="help-network-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Complaint"
        component={Complaint}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Complaints")}
              icon="comment-text-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Help"
        component={Help}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("help")}
              icon="help-circle-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Notification"
        component={Notification}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("help")}
              icon="help-circle-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="SyncQuarterVisit"
        component={SyncQuarterVisit}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={"Sync Quarter Visit"}
              icon="file-sync-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("userProfile")}
              icon="user"
              iconType="F"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="UserProfileFarmer"
        component={UserProfileFarmer}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("userProfile")}
              icon="user"
              iconType="F"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
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
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="CropSelection"
        component={CropSelection}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("CropSelection")}
              icon="corn"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="PumpSchedule"
        component={PumpSchedule}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("pumpScheduler")}
              icon="calendar"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Performance"
        component={Performance}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Performance")}
              icon="calendar"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="PerformanceC"
        component={PerformanceC}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Performance")}
              icon="calendar"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="BackgroundFetchScreen"
        component={BackgroundFetchScreen}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title="Performance"
              icon="calendar"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="SyncInspections"
        component={SyncInspections}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("SyncInspections")}
              icon="file-sync-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="SyncSurvey"
        component={SyncSurvey}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("SyncSurvey")}
              icon="file-sync-outline"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Imagecapture"
        component={Imagecapture}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Imagecapture")}
              icon="image"
              iconType="MC"
            />
          ),
        }}
      ></OperationStack.Screen>
      <OperationStack.Screen
        name="Weatherdata"
        component={Weatherdata}
        options={{
          headerTitle: (props) => (
            <HeaderTitle
              {...props}
              title={i18n.t("Weatherdata")}
              icon="download-circle-outline"
              iconType="MC"
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  Alert.alert(
                    i18n.t("LogOut"),
                    i18n.t("AreYouSureWantToLogOut"),
                    [
                      { text: i18n.t("No") },
                      { text: i18n.t("Yes"), onPress: () => signOut() },
                    ],
                  );
                }}
                color={Colors.white}
              >
                <IconM
                  name="logout"
                  color={Colors.white}
                  size={Platform.OS === "ios" ? 35 : 30}
                ></IconM>
              </Pressable>
            </View>
          ),
        }}
      ></OperationStack.Screen>
    </OperationStack.Navigator>
  );
};

export default OperationStackScreens;
