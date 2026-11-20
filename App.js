import React, { useEffect, useState, useRef, createRef, useMemo } from "react";
import {
  Alert,
  BackHandler,
  AppRegistry,
  Linking,
  ImageBackground,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Snackbar, Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Font from "expo-font";
import i18n from "i18n-js";
import Constants from "expo-constants";

// Internal Imports
import { parseString } from "./utils/ParseString";
import LoginStack from "./Screens/LoginStack";
import OperationStackScreens from "./Screens/OperationStack";
import { AuthContext } from "./Components/context";
import * as APIHelper from "./Data/APIHelper";
import { withTransaction } from "./db/transaction";
import { getDb } from "./db/db";

export const navigationRef = createRef();

SplashScreen.preventAutoHideAsync().catch(() => {});

const loadFonts = () =>
  Font.loadAsync({
    "roboto-bold": require("./assets/Fonts/Roboto-Bold.ttf"),
    "roboto-italic": require("./assets/Fonts/Roboto-Italic.ttf"),
    "roboto-regular": require("./assets/Fonts/Roboto-Regular.ttf"),
  });

const checkVersion = async (params) => {
  try {
    return { version: Constants.expoConfig.version };
  } catch (e) {
    return { version: Constants.expoConfig.version };
  }
};

const App = () => {
  const responseListener = useRef();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showFinalSplash, setShowFinalSplash] = useState(true);

  const [routeParams, setRouteParams] = useState({
    components: [],
    selectedComponent: "",
    department: "",
  });

  const [loginState, dispatch] = React.useReducer(
    (prev, action) => {
      switch (action.type) {
        case "SIGNIN":
          return {
            ...prev,
            userId: action.userId,
            userName: action.userName,
            authToken: action.authToken,
            isLoading: false,
          };
        case "SIGNOUT":
          return {
            userId: null,
            userName: null,
            authToken: null,
            isLoading: false,
          };
        case "RESTORE":
          return { ...prev, authToken: action.authToken, isLoading: false };
        default:
          return prev;
      }
    },
    { userId: null, userName: null, authToken: null, isLoading: true },
  );

  const [snackbar, setSnackbar] = useState({ visible: false, text: "" });

  /* ---------- Unified App Bootstrap ---------- */
  useEffect(() => {
    const prepare = async () => {
      try {
        await loadFonts();

        i18n.fallbacks = true;
        i18n.translations = {
          en: require("./Resources/En.json"),
          gu: require("./Resources/Gu.json"),
          hi: require("./Resources/Hi.json"),
          tn: require("./Resources/Tn.json"),
        };

        const isRooted = await Device.isRootedExperimentalAsync();
        if (isRooted) {
          Alert.alert("Security Alert", "App cannot run on rooted device", [
            { text: "Exit", onPress: () => BackHandler.exitApp() },
          ]);
          return;
        }

        const [storeversion, savedLocale] = await Promise.all([
          checkVersion({ bundleId: "com.novatrice.pmkusum" }),
          AsyncStorage.getItem("selectedLocale"),
        ]);

        const currentVersion = Constants.expoConfig.version;
        if (storeversion.version !== currentVersion) {
          Alert.alert(i18n.t("applicationupdate"), i18n.t("updateversion"), [
            {
              text: "Yes",
              onPress: () =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.novatrice.pmkusum",
                ),
            },
          ]);
        }

        i18n.locale = savedLocale || "en";
        if (!savedLocale) {
          await AsyncStorage.multiSet([
            ["selectedLocale", "en"],
            ["selectedLanguageName", "English"],
          ]);
        }

        const authToken = await AsyncStorage.getItem("authToken");
        dispatch({ type: "RESTORE", authToken: authToken });

        if (authToken) {
          const [components, selectedComp, deptRole] = await Promise.all([
            AsyncStorage.getItem("components"),
            AsyncStorage.getItem("selectedComponent"),
            AsyncStorage.getItem("departmentRole"),
          ]);
          await setupDatabase(deptRole);
          setRouteParams({
            components: parseString(components),
            selectedComponent: selectedComp,
            department: deptRole,
          });
        } else {
          await setupDatabase("GUEST");
        }
      } catch (e) {
        console.warn("Bootstrap error:", e);
      } finally {
        setIsAppReady(true);
      }
    };

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.screen) navigationRef.current?.navigate(data.screen);
      });

    prepare();
    return () => {
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  useEffect(() => {
    const hide = async () => {
      if (isAppReady) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn(e);
        }

        // Keep FinalSplashScreen visible for 2 seconds
        setTimeout(() => {
          setShowFinalSplash(false);
        }, 2000);
      }
    };

    hide();
  }, [isAppReady]);

  /* ---------- Auth Context ---------- */
  const authContext = useMemo(
    () => ({
      signInUserId: async (userId, password, route) => {
        try {
          const payload = {
            Username: userId,
            Password: password,
            Version: Constants.expoConfig.version,
          };
          const callResult = await APIHelper.PostAuth(route, null, payload);

          console.log("callresult>>", callResult);
          if (callResult?.Data) {
            const {
              UserId,
              UserName,
              access_token,
              Department,
              DepartmentRole,
              DepartmentComp,
              DepartmentName,
              Organization,
            } = callResult.Data;
            if (callResult.Result) {
              if (DepartmentRole.trim() === "") {
                setSnackbar({
                  visible: true,
                  text: i18n.t("NoDepartmentAssignedForLoggedInUser"),
                });
                return;
              }
              await AsyncStorage.multiSet([
                ["userId", UserId],
                ["userName", UserName],
                ["Organization", Organization],
                ["authToken", "bearer " + access_token],
                ["departmentId", Department],
                ["departmentName", DepartmentName],
                ["departmentRole", DepartmentRole],
                ["components", DepartmentComp],
              ]);
              await setupDatabase(DepartmentRole);
              const componentList = parseString(DepartmentComp);

              // error scenario
              if (
                DepartmentRole.toUpperCase() === "FARMER" &&
                DepartmentComp.toUpperCase() === "A"
              ) {
                setSnackbar({
                  ...snackbar,
                  showSnackbar: true,
                  snackbarText: i18n.t("InvaildUserIdPassword"),
                });
                return;
              }

              // if single component in response
              let selectedComponentRoute = "";
              if (componentList.length == 1) {
                if (DepartmentRole.toUpperCase() === "FARMER") {
                  if (componentList[0].toUpperCase() === "B") {
                    selectedComponentRoute = "ComponentB";
                  } else {
                    selectedComponentRoute = "ComponentC";
                  }
                }
                if (DepartmentRole.toUpperCase() === "EPC") {
                  if (componentList[0].toUpperCase() === "A") {
                    selectedComponentRoute = "ComponentA";
                  } else if (componentList[0].toUpperCase() === "B") {
                    selectedComponentRoute = "ComponentB";
                  } else {
                    selectedComponentRoute = "ComponentC";
                  }
                }
                if (DepartmentRole.toUpperCase() === "DISCOM") {
                  if (componentList[0].toUpperCase() === "A") {
                    selectedComponentRoute = "ComponentA";
                  } else if (componentList[0].toUpperCase() === "B") {
                    selectedComponentRoute = "ComponentB";
                  } else {
                    selectedComponentRoute = "ComponentC";
                  }
                }
              }

              if (componentList.length > 1) {
                selectedComponentRoute = "ComponentSelection";
              }

              await AsyncStorage.setItem(
                "selectedComponent",
                selectedComponentRoute,
              );

              if (DepartmentRole.toUpperCase() === "FARMER") {
                const apiUrl = await AsyncStorage.getItem("apiURL");
                const stateCode = await AsyncStorage.getItem("stateCode");
                const farmerComp =
                  selectedComponentRoute === "ComponentB"
                    ? "b"
                    : selectedComponentRoute === "ComponentC"
                    ? "c"
                    : "a";
                const farmerRoute = "";
                // if (selectedComponentRoute === "ComponentC") {
                //   farmerRoute = `${apiUrl}api/${stateCode}/Compc_Consumer/M_GetFarmerDataByAppMob?applicationNo=${UserName}&mobileNo=-1&PROJCD=${farmerComp}`;
                // } else {
                farmerRoute = `${apiUrl}api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${UserName}&mobileNo=-1&PROJCD=${farmerComp}`;
                // }

                const farmerDataResult = await APIHelper.Get(
                  farmerRoute,
                  "bearer " + access_token,
                  null,
                );
                if (farmerDataResult.Result) {
                  const data = farmerDataResult.Data;
                  const sanitize = (val) => (val != null ? String(val) : "");
                  await AsyncStorage.multiSet([
                    ["SaralId", sanitize(data.SaralId)],
                    ["farmerName", sanitize(data.FarmerName)],
                    ["districtName", sanitize(data.DistrictName)],
                    ["mobilenO", sanitize(data.MobileNO)],
                    ["eaname", sanitize(data.EAName)],
                    ["eaId", sanitize(data.EaId)],
                    ["applicationNo", sanitize(data.ApplicationNo)],
                    ["farmerId", sanitize(data.FarmerId)],
                    ["State", sanitize(data.State)],
                    ["District", sanitize(data.District)],
                    ["Latitude", sanitize(data.Latitude)],
                    ["Longitude", sanitize(data.Longitude)],
                    ["RMSLatitude", sanitize(data.RMSLatitude)],
                    ["RMSLongitude", sanitize(data.RMSLongitude)],
                    ["InstalledDate", sanitize(data.InstalledDate)],
                    ["deviceId", data.DeviceId],
                    ["groupId", data.GroupID],
                    ["DistrictCode", data.DistrictCode],
                    ["imeiNo", sanitize(data.IMEINo)],
                    ["vHost", sanitize(data.VHost)],
                    ["performanceTopic", sanitize(data.Performance_Topic)],
                    ["performanceVHost", sanitize(data.Performance_VHost)],
                    [
                      "brokerUserName",
                      sanitize(data.VHost + ":" + data.UserId),
                    ],
                    [
                      "brokerPassword",
                      sanitize(data.VHost + ":" + data.UserId),
                    ],
                  ]);
                  if (data.RequiredPumpType) {
                    console.log("setting value", data.RequiredPumpType);
                    await AsyncStorage.setItem(
                      "requiredPumpType",
                      data.RequiredPumpType,
                    );
                  }

                  if (data.RequiredPumpsubtype)
                    console.log("setting value", data.RequiredPumpsubtype);
                  await AsyncStorage.setItem(
                    "requiredPumpsubtype",
                    data.RequiredPumpsubtype,
                  );

                  if (data.RequiredPumpCapacity)
                    console.log("setting value", data.RequiredPumpCapacity);
                  await AsyncStorage.setItem(
                    "RequiredPumpCapacity",
                    data.RequiredPumpCapacity,
                  );
                }
              }
              setRouteParams({
                components: componentList,
                selectedComponent: selectedComponentRoute,
                department: DepartmentRole,
              });
              dispatch({
                type: "SIGNIN",
                userId: UserId,
                userName: UserName,
                authToken: access_token,
              });
            } else {
              setSnackbar({
                visible: true,
                text:
                  i18n.t("FailedToAuthenticateUser") +
                  (callResult.Message || ""),
              });
            }
          }
        } catch (err) {
          setSnackbar({ visible: true, text: "Login Failed: " + err.message });
        }
      },
      signOut: async () => {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("authToken");
        const apiUrl = await AsyncStorage.getItem("apiURL");
        const stateCode = await AsyncStorage.getItem("stateCode");
        const logoutUrl = `${apiUrl}/api/${stateCode}/Token/LogOutUser?userId=${userId}&bereartoken=${encodeURIComponent(
          token,
        )}`;

        console.log("apiUrl:", apiUrl);
        console.log("stateCode:", stateCode);
        console.log("userId:", userId);
        console.log("token:", token);
        console.log("token length:", token?.length);
        console.log("Logout URL:", logoutUrl);

        console.log("Request Headers:", {
          Authorization: token,
          "Content-Type": "application/json",
        });

        if (stateCode == "KA") {
          console.log("Sending logout request...");
          let response = await fetch(logoutUrl, {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();

          console.log("Response received");
          console.log("Status:", response.status);
          console.log("Status Text:", response.statusText);
          console.log("result:", result);

          try {
            result = JSON.parse(responseText);
            console.log("Parsed Response:", result);
          } catch (e) {
            console.log("JSON Parse Error:", e);
          }
          if (result) {
            await AsyncStorage.clear();
            dispatch({ type: "SIGNOUT" });
          }
        } else {
          await AsyncStorage.clear();
          dispatch({ type: "SIGNOUT" });
        }
      },
    }),
    [],
  );

  /* ---------- Database Setup ---------- */
  const setupDatabase = async (userType) => {
    if (userType?.toUpperCase() === "FARMER") return;
    try {
      const db = await getDb();
      await db.execAsync("PRAGMA journal_mode = WAL;");
      await withTransaction(async (tx) => {
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS SiteInspectionMaster(Id integer primary key AUTOINCREMENT, UserId text, Saral_Id text, Application_No text, FarmerName text, FatherName text, RequiredPumpCapacity text, RequiredPumpType text, RequiredPumpsubtype text, SPVCapacity text, Component text, Inspectiondate text, IsSiteInspectionSatisfy Boolean, FarmerId text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS SiteSurveyMaster(Id integer primary key AUTOINCREMENT, UserId text, Saral_Id text, Application_No text, FarmerName text, FatherName text, MobileNO text, RequiredPumpCapacity text, RequiredPumpType text, RequiredPumpsubtype text, RequiredPumpCategory text, Component text, SiteSurveyDate text, State integer, Department integer, latitude text, longitude text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS SiteInspectionChecklist(Id integer, Response text, Name text, IdealResponse text, Sign text, Sequence text, FieldType text, Comp text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS SiteSurveyChecklist(Id integer, Name text, IdealResponse text, FieldName text, IsEdit Boolean, FieldType text, DropDownAPI text, DropDownValues text, Sequence text, Response text, Argument text, Comp text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS MasterQuarterChecklist(Key integer primary key, Value text, Component text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS QuarterVisitMaster(Id integer primary key AUTOINCREMENT, UserId text, FarmerId text, FarmerName text, ApplicationNo text, SaralId text, Year text, Quarter integer, QuarterTitle text, RefLatitude text, RefLongitude text, Latitude text, Longitude text, DistMtr text, Remark text, DocType text, DocName text, FileString text, Component text, StateCode text, CreatedDate text);`,
        );
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS QuarterVisitChecklist(Id integer primary key AUTOINCREMENT, VisitId integer, ChecklistId integer, IsChecked integer, FOREIGN KEY (VisitId) REFERENCES QuarterVisitMaster (Id));`,
        );
        const qvColumns = [
          "ALTER TABLE QuarterVisitMaster ADD COLUMN FatherName text;",
          "ALTER TABLE QuarterVisitMaster ADD COLUMN RequiredPumpCapacity text;",
          "ALTER TABLE QuarterVisitMaster ADD COLUMN RequiredPumpType text;",
          "ALTER TABLE QuarterVisitMaster ADD COLUMN RequiredPumpsubtype text;",
          "ALTER TABLE QuarterVisitMaster ADD COLUMN SPVCapacity text;",
          "ALTER TABLE QuarterVisitMaster ADD COLUMN InstalledDate text;",
        ];
        for (const sql of qvColumns) {
          try {
            await tx.executeSql(sql);
          } catch (colErr) {
            // Column may already exist
          }
        }
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS QuarterVisitChecklist(Id integer primary key AUTOINCREMENT, VisitId integer, ChecklistId integer, IsChecked integer, FOREIGN KEY (VisitId) REFERENCES QuarterVisitMaster (Id));`,
        );
      });
    } catch (error) {
      console.error("Critical DB Failure:", error);
    }
  };

  if (showFinalSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <ImageBackground
          source={require("./assets/FinalSplashScreen.png")}
          style={styles.splashImage}
          resizeMode="stretch"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthContext.Provider value={authContext}>
          <NavigationContainer ref={navigationRef}>
            {loginState.authToken ? (
              <OperationStackScreens params={routeParams} />
            ) : (
              <LoginStack />
            )}
          </NavigationContainer>
          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          >
            {snackbar.text}
          </Snackbar>
        </AuthContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});

export default App;
AppRegistry.registerComponent("PMKUSUM", () => App);
