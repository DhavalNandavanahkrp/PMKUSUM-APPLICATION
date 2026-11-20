// import React, { useEffect, useState } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";
// import i18n from "i18n-js";
// import {
//   ActivityIndicator,
//   Keyboard,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   Alert,
//   TextInput,
//   View,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as Animatable from "react-native-animatable";
// import { Caption, Snackbar } from "react-native-paper";
// import {
//   RadioButton,
//   RadioButtonInput,
//   RadioButtonLabel,
// } from "react-native-simple-radio-button";
// import {
//   Feather as IconF,
//   MaterialIcons as IconM,
//   MaterialCommunityIcons as IconMC,
//   FontAwesome as IconFA,
//   FontAwesome5 as IconFA5,
//   AntDesign as IconA,
//   EvilIcons as IconE,
// } from "@expo/vector-icons";
// import * as APIHelper from "../Data/APIHelper";
// import { Colors } from "../Styles/Colors";
// import { Styles } from "../Styles/GlobalStyles";
// import NetInfo from "@react-native-community/netinfo";
// import SyncInspectionsoffline from "../Components/SyncInspectionsoffline";
// import { getDb } from "../db/db";

// const DiscomB = ({ navigation }) => {
//   const [isBusy, setIsBusy] = useState(false);

//   const [searchBy, setSearchBy] = useState(0);

//   const [searchText, setSearchText] = useState("");

//   const [validationError, setValidationError] = useState({
//     isVisible: false,
//     message: "",
//   });

//   const [snackbar, setSnackbar] = useState({
//     showSnackbar: false,
//     snackbarText: "",
//   });

//   const onDismissSnackBar = () => {
//     setSnackbar({
//       ...snackbar,
//       showSnackbar: false,
//       snackbarText: "",
//     });
//   };

//   const [dataLoaded, setDataLoaded] = useState(false);

//   const [farmerData, setFarmerData] = useState({
//     applicationNo: "",
//     mobileNo: "",
//     farmerName: "",
//     district: "",
//     eaName: "",
//     capacity: "",
//   });

//   const [statecode, setSatecode] = useState("");

//   const searchPressed = async () => {
//     setIsBusy(true);
//     if (searchBy === 0 && searchText.length === 0) {
//       setValidationError({
//         ...validationError,
//         isVisible: true,
//         message: i18n.t("ApplicationnoshouldnotbeEmpty"),
//       });
//     }

//     if (statecode !== "JK" && searchBy === 0 && searchText.length < 6) {
//       setValidationError({
//         ...validationError,
//         isVisible: true,
//         message: i18n.t("ApplicationNoShouldBeAtLeast6CharactersLong"),
//       });
//       setDataLoaded(false);
//     } else if (searchBy === 1 && searchText.length < 10) {
//       setValidationError({
//         ...validationError,
//         isVisible: true,
//         message: i18n.t("MobileNoShouldBeAtLeast10DigitLong"),
//       });
//       setDataLoaded(false);
//     } else {
//       const net = await NetInfo.fetch();
//       const apiUrl = await AsyncStorage.getItem("apiURL");
//       const stateCode = await AsyncStorage.getItem("stateCode");
//       const applicationNo = searchBy === 0 ? searchText : -1;
//       const mobileno = searchBy === 1 ? searchText : -1;
//       const authToken = await AsyncStorage.getItem("authToken");
//       const selectedComponent = await AsyncStorage.getItem("selectedComponent");
//       const Component =
//         selectedComponent === "ComponentB"
//           ? "b"
//           : null || selectedComponent === "ComponentC"
//           ? "c"
//           : "a";
//       const route = `${apiUrl}/api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${applicationNo}&mobileNo=${mobileno}&PROJCD=${Component}`;
//       const callResult = await APIHelper.Get(route, authToken);
//       if (callResult.Result) {
//         setFarmerData({
//           ...farmerData,
//           applicationNo:
//             stateCode === "HR"
//               ? callResult.Data.SaralId
//               : callResult.Data.ApplicationNo,
//           mobileNo: callResult.Data.MobileNO,
//           farmerName: `${callResult.Data.FarmerName} ${callResult.Data.FatherName}`,
//           district: `${callResult.Data.DistrictName}, ${stateCode}`,
//           eaName: callResult.Data.EAName,
//           capacity: `${callResult.Data.SPV_Capacity} KWp ${callResult.Data.RequiredPumpType} ${callResult.Data.RequiredPumpsubtype}`,
//         });
//         await AsyncStorage.setItem("SaralId", callResult.Data.SaralId);
//         await AsyncStorage.setItem(
//           "FarmerNameImage",
//           callResult.Data.FarmerName,
//         );
//         if (callResult.Data.FatherName) {
//           await AsyncStorage.setItem(
//             "FatherNameImage",
//             callResult.Data.FatherName,
//           );
//         } else {
//           await AsyncStorage.setItem("FatherNameImage", "");
//         }
//         await AsyncStorage.setItem("mobileNo", callResult.Data.MobileNO);
//         await AsyncStorage.setItem(
//           "requiredPumpType",
//           callResult.Data.RequiredPumpType,
//         );
//         await AsyncStorage.setItem(
//           "requiredPumpsubtype",
//           callResult.Data.RequiredPumpsubtype,
//         );
//         await AsyncStorage.setItem(
//           "farmerName",
//           `${callResult.Data.FarmerName} ${callResult.Data.FatherName}`,
//         );
//         await AsyncStorage.setItem(
//           "farmerComponent",
//           callResult.Data.DepartmentComp,
//         );
//         const data = callResult.Data;
//         if (data.UserId) {
//           await AsyncStorage.setItem("farmerUserId", data.UserId);
//         }
//         await AsyncStorage.setItem("applicationNo", data.ApplicationNo);
//         if (data.EAName) {
//           await AsyncStorage.setItem("eaName", data.EAName);
//         }
//         if (data.Latitude) {
//           await AsyncStorage.setItem("Latitude", data.Latitude);
//         }
//         if (data.Longitude) {
//           await AsyncStorage.setItem("Longitude", data.Longitude);
//         }
//         if (data.RequiredPumpCapacity) {
//           await AsyncStorage.setItem(
//             "RequiredPumpCapacity",
//             data.RequiredPumpCapacity,
//           );
//         }
//         if (data.SPV_Capacity) {
//           await AsyncStorage.setItem("SPVCapacity", data.SPV_Capacity);
//         }
//         await AsyncStorage.setItem("deviceId", data.DeviceId);
//         await AsyncStorage.setItem("farmerId", data.FarmerId.toString());
//         await AsyncStorage.setItem("groupId", data.GroupID);
//         await AsyncStorage.setItem("DistrictCode", data.DistrictCode);
//         if (data.IMEINo) {
//           await AsyncStorage.setItem("imeiNo", data.IMEINo);
//         }
//         await AsyncStorage.setItem("vHost", data.VHost);
//         await AsyncStorage.setItem("performanceTopic", data.Performance_Topic);
//         await AsyncStorage.setItem("performanceVHost", data.Performance_VHost);
//         await AsyncStorage.setItem(
//           "brokerUserName",
//           data.VHost + ":" + callResult.Data.UserId,
//         );
//         await AsyncStorage.setItem(
//           "brokerPassword",
//           data.VHost + ":" + callResult.Data.UserId,
//         );

//         Keyboard.dismiss();
//         setDataLoaded(true);
//       } else {
//         setSnackbar({
//           ...snackbar,
//           showSnackbar: true,
//           snackbarText: !net.isConnected
//             ? i18n.t("Pleaseturnoninternetconnection")
//             : callResult.Message,
//         });
//       }
//     }
//     setIsBusy(false);
//     Keyboard.dismiss();
//   };

//   const searchTextChanged = (value) => {
//     setSearchText(value);
//     setValidationError({
//       ...validationError,
//       isVisible: false,
//       validationError: "",
//     });
//   };

//   const searchOptions = [
//     {
//       label:
//         statecode === "JK"
//           ? i18n.t("ApplicationNo&PumpId")
//           : i18n.t("ApplicationNo"),
//       value: 0,
//     },
//     {
//       label: i18n.t("MobileNo"),
//       value: 1,
//     },
//   ];

//   const isFocused = useIsFocused();
//   useEffect(() => {
//     (async () => {
//       setSatecode(await AsyncStorage.getItem("stateCode"));
//     })();
//   }, [isFocused]);

//   const handleSiteInspectionSyncNavigation = async () => {
//     try {
//       const db = await getDb();

//       // Use the direct query tool since we are only READING
//       const results = await db.getAllAsync(
//         "SELECT COUNT(*) as count FROM SiteInspectionChecklist",
//       );

//       const count = results[0]?.count || 0;

//       if (count > 0) {
//         navigation.navigate("SyncInspections");
//       } else {
//         Alert.alert(
//           i18n.t("syncDoes'tSuccessfully"),
//           i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
//           [{ text: i18n.t("OK") }],
//         );
//       }
//     } catch (error) {
//       Alert.alert(
//         i18n.t("syncDoes'tSuccessfully"),
//         i18n.t("dataDoes'tStoredsuccessfully!PleaseStoredIt"),
//         [{ text: i18n.t("OK") }],
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
//       <View style={styles.backPanel}>
//         <View style={{ flexDirection: "row" }}>
//           <Text
//             style={[Styles.captionText, { marginRight: 5, marginBottom: 5 }]}
//           >
//             {i18n.t("SearchBy")} :
//           </Text>
//           <View style={{ flexDirection: "row" }}>
//             <RadioButton labelHorizontal={true}>
//               <RadioButtonInput
//                 obj={searchOptions[0]}
//                 index={0}
//                 isSelected={searchBy === 0}
//                 onPress={(value) => {
//                   setSearchBy(value);
//                   setValidationError({
//                     ...validationError,
//                     isVisible: false,
//                     message: "",
//                   });
//                 }}
//                 buttonInnerColor={Colors.graytone}
//                 buttonOuterColor={searchBy === 0 ? Colors.graytone : "#ccc"}
//                 buttonSize={12}
//                 buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
//               />
//               <RadioButtonLabel
//                 obj={searchOptions[0]}
//                 index={0}
//                 labelHorizontal={true}
//                 onPress={(value) => {
//                   setSearchBy(value);
//                   setValidationError({
//                     ...validationError,
//                     isVisible: false,
//                     message: "",
//                   });
//                 }}
//                 labelStyle={{
//                   marginRight: 5,
//                 }}
//               />
//             </RadioButton>
//             <RadioButton labelHorizontal={true}>
//               <RadioButtonInput
//                 obj={searchOptions[1]}
//                 index={1}
//                 isSelected={searchBy === 1}
//                 onPress={(value) => {
//                   setSearchBy(value);
//                   setValidationError({
//                     ...validationError,
//                     isVisible: false,
//                     message: "",
//                   });
//                 }}
//                 buttonInnerColor={Colors.graytone}
//                 buttonOuterColor={searchBy === 1 ? Colors.graytone : "#ccc"}
//                 buttonSize={12}
//                 buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
//               />
//               <RadioButtonLabel
//                 obj={searchOptions[1]}
//                 index={1}
//                 labelHorizontal={true}
//                 onPress={(value) => {
//                   setSearchBy(value);
//                   setValidationError({
//                     ...validationError,
//                     isVisible: false,
//                     message: "",
//                   });
//                 }}
//                 labelStyle={{
//                   marginRight: 5,
//                 }}
//               />
//             </RadioButton>
//           </View>
//         </View>
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TextInput
//             style={[Styles.flex1, styles.searchInput]}
//             placeholder={
//               searchBy === 0
//                 ? i18n.t("SearchByApplicationNo")
//                 : i18n.t("SearchByMobileNo")
//             }
//             keyboardType={searchBy === 0 ? "default" : "number-pad"}
//             onChangeText={(value) => searchTextChanged(value)}
//             value={searchText}
//           ></TextInput>
//           <Pressable onPress={() => searchPressed()}>
//             <View style={Styles.actionButtonSmall}>
//               <IconM
//                 name="search"
//                 style={{ alignSelf: "center", alignItems: "center" }}
//                 size={25}
//                 color={Colors.white}
//               />
//             </View>
//           </Pressable>
//           <Pressable
//             style={{ marginHorizontal: 10 }}
//             onPress={() => {
//               navigation.navigate("AdvanceSearch");
//             }}
//           >
//             <View style={Styles.actionButtonSmall}>
//               <IconMC
//                 name="account-search-outline"
//                 style={{ alignSelf: "center", alignItems: "center" }}
//                 size={25}
//                 color={Colors.white}
//               />
//             </View>
//           </Pressable>
//         </View>
//         {validationError.isVisible && (
//           <Animatable.View animation="slideInLeft" duration={1000}>
//             <Text style={{ color: Colors.red }}>{validationError.message}</Text>
//           </Animatable.View>
//         )}
//       </View>
//       {dataLoaded ? (
//         //   Farmer Detail
//         <ScrollView style={{ margin: "1%", flex: 1 }}>
//           <View style={Styles.sectionTitle}>
//             <IconMC
//               name="account-details-outline"
//               size={Platform.OS === "ios" ? 20 : 15}
//               color={Colors.white}
//               style={{ marginHorizontal: 5, alignSelf: "center" }}
//             ></IconMC>
//             <Text style={{ color: Colors.white, alignSelf: "center" }}>
//               {i18n.t("FarmerDetails")}
//             </Text>
//           </View>
//           <View style={[Styles.sectionView]}>
//             <View style={{ marginTop: 15 }}>
//               <View style={styles.row}>
//                 <View style={styles.cell}>
//                   <IconA
//                     name="solution"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={styles.icon}
//                   ></IconA>
//                   <Text style={styles.cellTextRight}>
//                     {farmerData.applicationNo}
//                   </Text>
//                 </View>
//                 <View style={styles.rightCell}>
//                   <IconMC
//                     name="cellphone"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={styles.icon}
//                   ></IconMC>
//                   <Text style={styles.cellTextRight}>
//                     {farmerData.mobileNo}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.row}>
//                 <View style={styles.cell}>
//                   <IconF
//                     name="user"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={styles.icon}
//                   ></IconF>
//                   <Text
//                     style={{
//                       alignSelf: "center",
//                       flexWrap: "wrap",
//                       flex: 1,
//                     }}
//                   >
//                     {farmerData.farmerName}
//                   </Text>
//                 </View>
//                 <View style={styles.rightCell}>
//                   <IconMC
//                     name="office-building"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={{ marginHorizontal: 5, alignSelf: "center" }}
//                   ></IconMC>
//                   <Text
//                     style={{
//                       alignSelf: "center",
//                       flexWrap: "wrap",
//                       flex: 1,
//                     }}
//                   >
//                     {farmerData.eaName}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.row}>
//                 <View style={styles.cell}>
//                   <IconM
//                     name="location-pin"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={styles.icon}
//                   ></IconM>
//                   <Text
//                     style={{
//                       alignSelf: "center",
//                       flexWrap: "wrap",
//                       flex: 1,
//                     }}
//                   >
//                     {farmerData.district}
//                   </Text>
//                 </View>
//                 <View style={styles.rightCell}>
//                   <IconMC
//                     name="view-grid"
//                     size={Platform.OS === "ios" ? 30 : 25}
//                     color={Colors.graytone}
//                     style={{ marginHorizontal: 5, alignSelf: "center" }}
//                   ></IconMC>
//                   <Text
//                     style={{
//                       alignSelf: "center",
//                       flexWrap: "wrap",
//                       flex: 1,
//                     }}
//                   >
//                     {farmerData.capacity}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* Monitoring */}
//           <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
//             <IconMC
//               name="eye-outline"
//               size={Platform.OS === "ios" ? 20 : 15}
//               color={Colors.white}
//               style={{ marginHorizontal: 5, alignSelf: "center" }}
//             ></IconMC>
//             <Text style={{ color: Colors.white, alignSelf: "center" }}>
//               {i18n.t("Monitoring")}
//             </Text>
//           </View>
//           <Animatable.View
//             animation="slideInLeft"
//             duration={1000}
//             style={[Styles.sectionView, { flexDirection: "row" }]}
//           >
//             <Pressable
//               style={[Styles.pressable, { flex: 0.33 }]}
//               onPress={() => {
//                 navigation.navigate("LiveStatusC");
//               }}
//             >
//               <View>
//                 <View style={Styles.actionButton}>
//                   <IconMC
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="text-box-check-outline"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconMC>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("LiveStatus")}
//                 </Caption>
//               </View>
//             </Pressable>
//             <Pressable
//               style={[Styles.pressable, { flex: 0.33 }]}
//               onPress={() => {
//                 navigation.navigate("PerformanceC");
//               }}
//             >
//               <View>
//                 <View style={Styles.actionButton}>
//                   <IconMC
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="chart-line"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconMC>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("Peformance")}
//                 </Caption>
//               </View>
//             </Pressable>
//             <Pressable
//               style={[Styles.pressable, { flex: 0.33 }]}
//               onPress={() => {
//                 navigation.navigate("AnalysisC");
//               }}
//             >
//               <View>
//                 <View style={Styles.actionButton}>
//                   <IconM
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="bar-chart"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconM>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("Analysis")}
//                 </Caption>
//               </View>
//             </Pressable>
//           </Animatable.View>

//           {/* Tracking */}
//           <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
//             <IconMC
//               name="state-machine"
//               size={Platform.OS === "ios" ? 20 : 15}
//               color={Colors.white}
//               style={{ marginHorizontal: 5, alignSelf: "center" }}
//             ></IconMC>
//             <Text style={{ color: Colors.white, alignSelf: "center" }}>
//               {i18n.t("Tracking")}
//             </Text>
//           </View>
//           <Animatable.View
//             animation="slideInLeft"
//             duration={1000}
//             style={[Styles.sectionView]}
//             // style={[Styles.sectionView, { flexDirection: "row" }]}
//           >
//             <View style={{ flexDirection: "row" }}>
//               <Pressable
//                 style={[Styles.pressable, { flex: 0.33 }]}
//                 onPress={() => {
//                   navigation.navigate("AssetDetail");
//                 }}
//               >
//                 <View style={Styles.actionButton}>
//                   <IconFA5
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="solar-panel"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconFA5>
//                 </View>
//                 <Caption style={Styles.captionText}>{i18n.t("Assets")}</Caption>
//               </Pressable>
//               <Pressable
//                 style={[Styles.pressable, { flex: 0.33 }]}
//                 onPress={() => {
//                   navigation.navigate("SiteInspection");
//                 }}
//               >
//                 <View>
//                   <View style={Styles.actionButton}>
//                     <IconFA5
//                       style={{ alignSelf: "center", alignItems: "center" }}
//                       name="search-location"
//                       size={30}
//                       color={Colors.graytone}
//                     ></IconFA5>
//                   </View>
//                   <Caption style={Styles.captionText}>
//                     {i18n.t("Inspection")}
//                   </Caption>
//                 </View>
//               </Pressable>
//               <Pressable
//                 style={[Styles.pressable, { flex: 0.33 }]}
//                 onPress={() => navigation.navigate("Insurance")}
//               >
//                 <View style={Styles.actionButton}>
//                   <IconFA
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="wpforms"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconFA>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("Insurance")}
//                 </Caption>
//               </Pressable>
//             </View>
//             <View style={{ flexDirection: "row" }}>
//               <Pressable
//                 style={[styles.pressable, { flex: 0.33 }]}
//                 onPress={() => navigation.navigate("JCRdocument")}
//               >
//                 <View style={styles.actionButton}>
//                   <IconFA
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="wpforms"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconFA>
//                 </View>
//                 <Caption style={styles.captionText}>
//                   {i18n.t("JCRdocument")}
//                 </Caption>
//               </Pressable>
//               <Pressable
//                 style={[Styles.pressable, { flex: 0.33 }]}
//                 onPress={() => {
//                   navigation.navigate("SiteSurvey");
//                 }}
//               >
//                 <View>
//                   <View style={Styles.actionButton}>
//                     <IconFA5
//                       style={{ alignSelf: "center", alignItems: "center" }}
//                       name="search-location"
//                       size={30}
//                       color={Colors.graytone}
//                     ></IconFA5>
//                   </View>
//                   <Caption style={Styles.captionText}>
//                     {i18n.t("Survey")}
//                   </Caption>
//                 </View>
//               </Pressable>
//             </View>
//           </Animatable.View>

//           {/* Services */}
//           <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
//             <IconA
//               name="customer-service"
//               size={Platform.OS === "ios" ? 20 : 15}
//               color={Colors.white}
//               style={{ marginHorizontal: 5, alignSelf: "center" }}
//             ></IconA>
//             <Text style={{ color: Colors.white, alignSelf: "center" }}>
//               {i18n.t("Services")}
//             </Text>
//           </View>
//           <Animatable.View
//             animation="slideInRight"
//             duration={1000}
//             style={[Styles.sectionView, { flexDirection: "row" }]}
//           >
//             <Pressable
//               style={[Styles.pressable, { flex: 0.33 }]}
//               onPress={() => {
//                 navigation.navigate("Complaint", {});
//               }}
//             >
//               <View>
//                 <View style={Styles.actionButton}>
//                   <IconMC
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="comment-text-outline"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconMC>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("Complaint")}
//                 </Caption>
//               </View>
//             </Pressable>
//           </Animatable.View>
//         </ScrollView>
//       ) : (
//         <View style={{ margin: "1%", flex: 1 }}>
//           <View>
//             <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
//               <IconMC
//                 name="information-variant"
//                 size={Platform.OS === "ios" ? 20 : 15}
//                 color={Colors.white}
//                 style={{ marginHorizontal: 5, alignSelf: "center" }}
//               ></IconMC>
//               <Text style={{ color: Colors.white, alignSelf: "center" }}>
//                 {i18n.t("syncoffline")}
//               </Text>
//             </View>
//             <Animatable.View
//               animation="slideInRight"
//               duration={1000}
//               style={[Styles.sectionView, { flexDirection: "row" }]}
//             >
//               <Pressable
//                 style={[Styles.pressable, { flex: 0.33 }]}
//                 onPress={async () => await handleSiteInspectionSyncNavigation()}
//               >
//                 <View style={Styles.actionButton}>
//                   <IconMC
//                     style={{ alignSelf: "center", alignItems: "center" }}
//                     name="file-sync-outline"
//                     size={30}
//                     color={Colors.graytone}
//                   ></IconMC>
//                 </View>
//                 <Caption style={Styles.captionText}>
//                   {i18n.t("SyncInspections")}
//                 </Caption>
//               </Pressable>
//             </Animatable.View>
//           </View>
//           <View
//             style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//           >
//             <Text
//               style={{
//                 textAlign: "center",
//                 color: Colors.graytone,
//                 fontFamily: "roboto-regular",
//                 fontSize: 16,
//               }}
//             >
//               {i18n.t("LoadConnectionDetailsUsingSearchPanelAbove")}
//             </Text>
//           </View>
//         </View>
//         // <>
//         //   {/* Sync Inspections offline */}
//         //   <SyncInspectionsoffline />
//         // </>
//       )}
//       <Snackbar
//         visible={snackbar.showSnackbar}
//         onDismiss={onDismissSnackBar}
//         style={{ bottom: 0 }}
//       >
//         {snackbar.snackbarText}
//       </Snackbar>
//       {isBusy && (
//         <View style={Styles.loading}>
//           <ActivityIndicator size="large" color={Colors.primaryOrange} />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default DiscomB;

// const styles = StyleSheet.create({
//   backPanel: {
//     margin: "1%",
//     backgroundColor: "#ddd",
//     padding: 5,
//     borderRadius: 5,
//     paddingVertical: 10,
//   },
//   searchBy: {
//     alignSelf: "center",
//     fontWeight: "bold",
//     fontFamily: "roboto-regular",
//     marginRight: 5,
//     color: Colors.graytone,
//   },
//   searchInput: {
//     borderBottomWidth: 2,
//     borderBottomColor: Colors.grayAAA,
//     height: 40,
//     paddingBottom: 0,
//     marginRight: 5,
//   },
//   row: {
//     flexDirection: "row",
//     minHeight: 40,
//     borderColor: Colors.grayAAA,
//     borderWidth: 1,
//   },
//   cell: {
//     flex: 1,
//     flexDirection: "row",
//     padding: 5,
//   },
//   rightCell: {
//     flex: 1,
//     flexDirection: "row",
//     padding: 5,
//     borderLeftColor: Colors.grayAAA,
//     borderLeftWidth: 1,
//   },
//   icon: {
//     marginHorizontal: 5,
//     alignSelf: "center",
//     color: Colors.graytone,
//   },
//   cellTextRight: {
//     alignSelf: "center",
//     // marginLeft: "auto",
//     marginRight: 5,
//   },
//   sectionTitle: {
//     zIndex: 100,
//     backgroundColor: Colors.primaryOrange,
//     alignSelf: "flex-start",
//     marginLeft: 15,
//     paddingVertical: 2,
//     paddingHorizontal: 5,
//     color: Colors.white,
//     fontFamily: "roboto-regular",
//     flexDirection: "row",
//   },
//   sectionView: {
//     borderRadius: 7,
//     borderWidth: 1.5,
//     borderColor: Colors.grayAAA,
//     marginTop: -15,
//   },
//   actionButton: {
//     borderColor: Colors.graytone,
//     borderWidth: 2,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     height: 50,
//     width: 50,
//     borderRadius: 25,
//   },
//   actionButtonSmall: {
//     backgroundColor: Colors.green,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     height: 36,
//     width: 36,
//     borderRadius: 18,
//   },
//   captionText: {
//     textAlign: "center",
//     color: Colors.graytone,
//     alignSelf: "center",
//   },
//   pressable: { flex: 0.5, marginTop: 15 },
// });












import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import i18n from "i18n-js";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import { Caption, Snackbar } from "react-native-paper";
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  EvilIcons as IconE,
} from "@expo/vector-icons";
import * as APIHelper from "../Data/APIHelper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import NetInfo from "@react-native-community/netinfo";
import SyncInspectionsoffline from "../Components/SyncInspectionsoffline";
import { getDb } from "../db/db";

const DiscomB = ({ navigation }) => {
  const [isBusy, setIsBusy] = useState(false);

  const [searchBy, setSearchBy] = useState(0);

  const [searchText, setSearchText] = useState("");

  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });

  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });

  const onDismissSnackBar = () => {
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  };

  const [dataLoaded, setDataLoaded] = useState(false);

  const [farmerData, setFarmerData] = useState({
    applicationNo: "",
    mobileNo: "",
    farmerName: "",
    district: "",
    eaName: "",
    capacity: "",
  });

  const [statecode, setSatecode] = useState("");

  const searchPressed = async () => {
    setIsBusy(true);
    if (searchBy === 0 && searchText.length === 0) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationnoshouldnotbeEmpty"),
      });
    }

    if (statecode !== "JK" && searchBy === 0 && searchText.length < 6) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationNoShouldBeAtLeast6CharactersLong"),
      });
      setDataLoaded(false);
    } else if (searchBy === 1 && searchText.length < 10) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("MobileNoShouldBeAtLeast10DigitLong"),
      });
      setDataLoaded(false);
    } else {
      const net = await NetInfo.fetch();
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const applicationNo = searchBy === 0 ? searchText : -1;
      const mobileno = searchBy === 1 ? searchText : -1;
      const authToken = await AsyncStorage.getItem("authToken");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      const route = `${apiUrl}/api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${applicationNo}&mobileNo=${mobileno}&PROJCD=${Component}`;
      const callResult = await APIHelper.Get(route, authToken);
      if (callResult.Result) {
        setFarmerData({
          ...farmerData,
          applicationNo:
            stateCode === "HR"
              ? callResult.Data.SaralId
              : callResult.Data.ApplicationNo,
          mobileNo: callResult.Data.MobileNO,
          farmerName: `${callResult.Data.FarmerName} ${callResult.Data.FatherName}`,
          district: `${callResult.Data.DistrictName}, ${stateCode}`,
          eaName: callResult.Data.EAName,
          capacity: `${callResult.Data.SPV_Capacity} KWp ${callResult.Data.RequiredPumpType} ${callResult.Data.RequiredPumpsubtype}`,
        });
        await AsyncStorage.setItem("SaralId", callResult.Data.SaralId);
        await AsyncStorage.setItem(
          "FarmerNameImage",
          callResult.Data.FarmerName,
        );
        if (callResult.Data.FatherName) {
          await AsyncStorage.setItem(
            "FatherNameImage",
            callResult.Data.FatherName,
          );
        } else {
          await AsyncStorage.setItem("FatherNameImage", "");
        }
        await AsyncStorage.setItem("mobileNo", callResult.Data.MobileNO);
        if (callResult.Data.RequiredPumpType) {
          await AsyncStorage.setItem(
            "requiredPumpType",
            callResult.Data.RequiredPumpType,
          );
        } else {
          await AsyncStorage.setItem("requiredPumpType", "");
        }
        if (callResult.Data.RequiredPumpsubtype) {
          await AsyncStorage.setItem(
            "requiredPumpsubtype",
            callResult.Data.RequiredPumpsubtype,
          );
        } else {
          await AsyncStorage.setItem("requiredPumpsubtype", "");
        }
        await AsyncStorage.setItem(
          "farmerName",
          `${callResult.Data.FarmerName} ${callResult.Data.FatherName}`,
        );
        await AsyncStorage.setItem(
          "farmerComponent",
          callResult.Data.DepartmentComp,
        );
        const data = callResult.Data;
        if (data.UserId) {
          await AsyncStorage.setItem("farmerUserId", data.UserId);
        }
        await AsyncStorage.setItem("applicationNo", data.ApplicationNo);
        if (data.EAName) {
          await AsyncStorage.setItem("eaName", data.EAName);
        }
        if (data.Latitude) {
          await AsyncStorage.setItem("Latitude", data.Latitude);
        }
        if (data.Longitude) {
          await AsyncStorage.setItem("Longitude", data.Longitude);
        }
        if (data.RequiredPumpCapacity) {
          await AsyncStorage.setItem(
            "RequiredPumpCapacity",
            data.RequiredPumpCapacity,
          );
        }
        if (data.SPV_Capacity) {
          await AsyncStorage.setItem("SPVCapacity", data.SPV_Capacity);
        }
        await AsyncStorage.setItem("deviceId", data.DeviceId);
        await AsyncStorage.setItem("farmerId", data.FarmerId.toString());
        await AsyncStorage.setItem("groupId", data.GroupID);
        await AsyncStorage.setItem("DistrictCode", data.DistrictCode);
        if (data.IMEINo) {
          await AsyncStorage.setItem("imeiNo", data.IMEINo);
        }
        await AsyncStorage.setItem("vHost", data.VHost);
        await AsyncStorage.setItem("performanceTopic", data.Performance_Topic);
        await AsyncStorage.setItem("performanceVHost", data.Performance_VHost);
        await AsyncStorage.setItem(
          "brokerUserName",
          data.VHost + ":" + callResult.Data.UserId,
        );
        await AsyncStorage.setItem(
          "brokerPassword",
          data.VHost + ":" + callResult.Data.UserId,
        );

        Keyboard.dismiss();
        setDataLoaded(true);
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: !net.isConnected
            ? i18n.t("Pleaseturnoninternetconnection")
            : callResult.Message,
        });
      }
    }
    setIsBusy(false);
    Keyboard.dismiss();
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
    setValidationError({
      ...validationError,
      isVisible: false,
      validationError: "",
    });
  };

  const searchOptions = [
    {
      label:
        statecode === "JK"
          ? i18n.t("ApplicationNo&PumpId")
          : i18n.t("ApplicationNo"),
      value: 0,
    },
    {
      label: i18n.t("MobileNo"),
      value: 1,
    },
  ];

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      setSatecode(await AsyncStorage.getItem("stateCode"));
    })();
  }, [isFocused]);

  const handleSiteInspectionSyncNavigation = async () => {
    try {
      const db = await getDb();

      // Use the direct query tool since we are only READING
      const results = await db.getAllAsync(
        "SELECT COUNT(*) as count FROM SiteInspectionChecklist",
      );

      const count = results[0]?.count || 0;

      if (count > 0) {
        navigation.navigate("SyncInspections");
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
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={styles.backPanel}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={[Styles.captionText, { marginRight: 5, marginBottom: 5 }]}
          >
            {i18n.t("SearchBy")} :
          </Text>
          <View style={{ flexDirection: "row" }}>
            <RadioButton labelHorizontal={true}>
              <RadioButtonInput
                obj={searchOptions[0]}
                index={0}
                isSelected={searchBy === 0}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                buttonInnerColor={Colors.graytone}
                buttonOuterColor={searchBy === 0 ? Colors.graytone : "#ccc"}
                buttonSize={12}
                buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
              />
              <RadioButtonLabel
                obj={searchOptions[0]}
                index={0}
                labelHorizontal={true}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                labelStyle={{
                  marginRight: 5,
                }}
              />
            </RadioButton>
            <RadioButton labelHorizontal={true}>
              <RadioButtonInput
                obj={searchOptions[1]}
                index={1}
                isSelected={searchBy === 1}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                buttonInnerColor={Colors.graytone}
                buttonOuterColor={searchBy === 1 ? Colors.graytone : "#ccc"}
                buttonSize={12}
                buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
              />
              <RadioButtonLabel
                obj={searchOptions[1]}
                index={1}
                labelHorizontal={true}
                onPress={(value) => {
                  setSearchBy(value);
                  setValidationError({
                    ...validationError,
                    isVisible: false,
                    message: "",
                  });
                }}
                labelStyle={{
                  marginRight: 5,
                }}
              />
            </RadioButton>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TextInput
            style={[Styles.flex1, styles.searchInput]}
            placeholder={
              searchBy === 0
                ? i18n.t("SearchByApplicationNo")
                : i18n.t("SearchByMobileNo")
            }
            keyboardType={searchBy === 0 ? "default" : "number-pad"}
            onChangeText={(value) => searchTextChanged(value)}
            value={searchText}
          ></TextInput>
          <Pressable onPress={() => searchPressed()}>
            <View style={Styles.actionButtonSmall}>
              <IconM
                name="search"
                style={{ alignSelf: "center", alignItems: "center" }}
                size={25}
                color={Colors.white}
              />
            </View>
          </Pressable>
          <Pressable
            style={{ marginHorizontal: 10 }}
            onPress={() => {
              navigation.navigate("AdvanceSearch");
            }}
          >
            <View style={Styles.actionButtonSmall}>
              <IconMC
                name="account-search-outline"
                style={{ alignSelf: "center", alignItems: "center" }}
                size={25}
                color={Colors.white}
              />
            </View>
          </Pressable>
        </View>
        {validationError.isVisible && (
          <Animatable.View animation="slideInLeft" duration={1000}>
            <Text style={{ color: Colors.red }}>{validationError.message}</Text>
          </Animatable.View>
        )}
      </View>
      {dataLoaded ? (
        //   Farmer Detail
        <ScrollView style={{ margin: "1%", flex: 1 }}>
          <View style={Styles.sectionTitle}>
            <IconMC
              name="account-details-outline"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("FarmerDetails")}
            </Text>
          </View>
          <View style={[Styles.sectionView]}>
            <View style={{ marginTop: 15 }}>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <IconA
                    name="solution"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconA>
                  <Text style={styles.cellTextRight}>
                    {farmerData.applicationNo}
                  </Text>
                </View>
                <View style={styles.rightCell}>
                  <IconMC
                    name="cellphone"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconMC>
                  <Text style={styles.cellTextRight}>
                    {farmerData.mobileNo}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <IconF
                    name="user"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconF>
                  <Text
                    style={{
                      alignSelf: "center",
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {farmerData.farmerName}
                  </Text>
                </View>
                <View style={styles.rightCell}>
                  <IconMC
                    name="office-building"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={{ marginHorizontal: 5, alignSelf: "center" }}
                  ></IconMC>
                  <Text
                    style={{
                      alignSelf: "center",
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {farmerData.eaName}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <IconM
                    name="location-pin"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={styles.icon}
                  ></IconM>
                  <Text
                    style={{
                      alignSelf: "center",
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {farmerData.district}
                  </Text>
                </View>
                <View style={styles.rightCell}>
                  <IconMC
                    name="view-grid"
                    size={Platform.OS === "ios" ? 30 : 25}
                    color={Colors.graytone}
                    style={{ marginHorizontal: 5, alignSelf: "center" }}
                  ></IconMC>
                  <Text
                    style={{
                      alignSelf: "center",
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {farmerData.capacity}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Monitoring */}
          <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
            <IconMC
              name="eye-outline"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("Monitoring")}
            </Text>
          </View>
          <Animatable.View
            animation="slideInLeft"
            duration={1000}
            style={[Styles.sectionView, { flexDirection: "row" }]}
          >
            <Pressable
              style={[Styles.pressable, { flex: 0.33 }]}
              onPress={() => {
                navigation.navigate("LiveStatusC");
              }}
            >
              <View>
                <View style={Styles.actionButton}>
                  <IconMC
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="text-box-check-outline"
                    size={30}
                    color={Colors.graytone}
                  ></IconMC>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("LiveStatus")}
                </Caption>
              </View>
            </Pressable>
            <Pressable
              style={[Styles.pressable, { flex: 0.33 }]}
              onPress={() => {
                navigation.navigate("PerformanceC");
              }}
            >
              <View>
                <View style={Styles.actionButton}>
                  <IconMC
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="chart-line"
                    size={30}
                    color={Colors.graytone}
                  ></IconMC>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("Peformance")}
                </Caption>
              </View>
            </Pressable>
            <Pressable
              style={[Styles.pressable, { flex: 0.33 }]}
              onPress={() => {
                navigation.navigate("AnalysisC");
              }}
            >
              <View>
                <View style={Styles.actionButton}>
                  <IconM
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="bar-chart"
                    size={30}
                    color={Colors.graytone}
                  ></IconM>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("Analysis")}
                </Caption>
              </View>
            </Pressable>
          </Animatable.View>

          {/* Tracking */}
          <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
            <IconMC
              name="state-machine"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("Tracking")}
            </Text>
          </View>
          <Animatable.View
            animation="slideInLeft"
            duration={1000}
            style={[Styles.sectionView]}
            // style={[Styles.sectionView, { flexDirection: "row" }]}
          >
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => {
                  navigation.navigate("AssetDetail");
                }}
              >
                <View style={Styles.actionButton}>
                  <IconFA5
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="solar-panel"
                    size={30}
                    color={Colors.graytone}
                  ></IconFA5>
                </View>
                <Caption style={Styles.captionText}>{i18n.t("Assets")}</Caption>
              </Pressable>
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => {
                  navigation.navigate("SiteInspection");
                }}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconFA5
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="search-location"
                      size={30}
                      color={Colors.graytone}
                    ></IconFA5>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("Inspection")}
                  </Caption>
                </View>
              </Pressable>
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => navigation.navigate("Insurance")}
              >
                <View style={Styles.actionButton}>
                  <IconFA
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="wpforms"
                    size={30}
                    color={Colors.graytone}
                  ></IconFA>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("Insurance")}
                </Caption>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[styles.pressable, { flex: 0.33 }]}
                onPress={() => navigation.navigate("JCRdocument")}
              >
                <View style={styles.actionButton}>
                  <IconFA
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="wpforms"
                    size={30}
                    color={Colors.graytone}
                  ></IconFA>
                </View>
                <Caption style={styles.captionText}>
                  {i18n.t("JCRdocument")}
                </Caption>
              </Pressable>
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => {
                  navigation.navigate("SiteSurvey");
                }}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconFA5
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="search-location"
                      size={30}
                      color={Colors.graytone}
                    ></IconFA5>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("Survey")}
                  </Caption>
                </View>
              </Pressable>
            </View>
          </Animatable.View>

          {/* Services */}
          <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
            <IconA
              name="customer-service"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconA>
            <Text style={{ color: Colors.white, alignSelf: "center" }}>
              {i18n.t("Services")}
            </Text>
          </View>
          <Animatable.View
            animation="slideInRight"
            duration={1000}
            style={[Styles.sectionView, { flexDirection: "row" }]}
          >
            <Pressable
              style={[Styles.pressable, { flex: 0.33 }]}
              onPress={() => {
                navigation.navigate("Complaint", {});
              }}
            >
              <View>
                <View style={Styles.actionButton}>
                  <IconMC
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="comment-text-outline"
                    size={30}
                    color={Colors.graytone}
                  ></IconMC>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("Complaint")}
                </Caption>
              </View>
            </Pressable>
          </Animatable.View>
        </ScrollView>
      ) : (
        <View style={{ margin: "1%", flex: 1 }}>
          <View>
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
                onPress={async () => await handleSiteInspectionSyncNavigation()}
              >
                <View style={Styles.actionButton}>
                  <IconMC
                    style={{ alignSelf: "center", alignItems: "center" }}
                    name="file-sync-outline"
                    size={30}
                    color={Colors.graytone}
                  ></IconMC>
                </View>
                <Caption style={Styles.captionText}>
                  {i18n.t("SyncInspections")}
                </Caption>
              </Pressable>
            </Animatable.View>
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
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
        // <>
        //   {/* Sync Inspections offline */}
        //   <SyncInspectionsoffline />
        // </>
      )}
      <Snackbar
        visible={snackbar.showSnackbar}
        onDismiss={onDismissSnackBar}
        style={{ bottom: 0 }}
      >
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default DiscomB;

const styles = StyleSheet.create({
  backPanel: {
    margin: "1%",
    backgroundColor: "#ddd",
    padding: 5,
    borderRadius: 5,
    paddingVertical: 10,
  },
  searchBy: {
    alignSelf: "center",
    fontWeight: "bold",
    fontFamily: "roboto-regular",
    marginRight: 5,
    color: Colors.graytone,
  },
  searchInput: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayAAA,
    height: 40,
    paddingBottom: 0,
    marginRight: 5,
  },
  row: {
    flexDirection: "row",
    minHeight: 40,
    borderColor: Colors.grayAAA,
    borderWidth: 1,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
  },
  rightCell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    borderLeftColor: Colors.grayAAA,
    borderLeftWidth: 1,
  },
  icon: {
    marginHorizontal: 5,
    alignSelf: "center",
    color: Colors.graytone,
  },
  cellTextRight: {
    alignSelf: "center",
    // marginLeft: "auto",
    marginRight: 5,
  },
  sectionTitle: {
    zIndex: 100,
    backgroundColor: Colors.primaryOrange,
    alignSelf: "flex-start",
    marginLeft: 15,
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: Colors.white,
    fontFamily: "roboto-regular",
    flexDirection: "row",
  },
  sectionView: {
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.grayAAA,
    marginTop: -15,
  },
  actionButton: {
    borderColor: Colors.graytone,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  actionButtonSmall: {
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  captionText: {
    textAlign: "center",
    color: Colors.graytone,
    alignSelf: "center",
  },
  pressable: { flex: 0.5, marginTop: 15 },
});