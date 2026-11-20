import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import { Snackbar } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { Table, TableWrapper, Cell, Row } from "react-native-table-component";
import { ScrollView } from "react-native-gesture-handler";
import i18n from "i18n-js";
import {
  EvilIcons as IconE,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as APIHelper from "../Data/APIHelper";
import moment from "moment";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system/legacy";
import { withTransaction } from "../db/transaction";
import { queryAll } from "../db/exec";

let stateCode;

const SyncSurvey = ({ route, navigation }) => {
  const { response } = route?.params || {};
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [latLong, setLatLong] = useState({
    latitude: "*****",
    longitude: "*****",
  });
  const [isBusy, setIsBusy] = useState(false);
  const [data, setData] = useState({
    headers: [],
    tableData: [],
    widthArr: [50, 50, 160, 160, 160],
  });
  const [searchBy, setSearchBy] = useState(0);
  const [isSurveyDone, setIsSurveyDone] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });
  let userId = "";
  let component = "";
  let SanctionId = "";
  let TypeofControllerForPump = "";
  let FarmerContributionRs = "";
  let Underwaterstressarea = "";

  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });

  const searchPressed = async () => {
    setIsBusy(true);
    const net = await NetInfo.fetch();
    if (searchBy === 0 && searchText.length === 0) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationnoshouldnotbeEmpty"),
      });
    } else if (!net.isConnected) {
      Alert.alert(i18n.t("AlertMeaasge"), i18n.t("Farmerssearch"), [
        {
          text: i18n.t("OK"),
        },
      ]);
    } else {
      userId = await AsyncStorage.getItem("userId");
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const applicationNo = searchBy === 0 ? searchText : -1;
      const mobileno = searchBy === 1 ? searchText : -1;
      const authToken = await AsyncStorage.getItem("authToken");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const department = await AsyncStorage.getItem("departmentId");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";

      let route = `${apiUrl}api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${applicationNo}&mobileNo=${mobileno}&PROJCD=${Component}`;
      const callResult = await APIHelper.Get(route, authToken);
      component = callResult.Data.DepartmentComp;
      const SaralId = callResult.Data.SaralId;
      const APPNO = callResult.Data.ApplicationNo;
      let PDFData = {};
      if (callResult.Result) {
        stateCode == "HR"
          ? (route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/Mobile_GetByApplicationNo?SaralNo=${SaralId}&PROJCD=${Component}`)
          : (route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/Mobile_GetByApplicationNo?ApplicationNo=${applicationNo}&PROJCD=${Component}`);
        const callResult1 = await APIHelper.Get2(route, authToken);
        TypeofControllerForPump = callResult1.Data.TypeofControllerForPump;
        FarmerContributionRs = callResult1.Data.Farmer_Contribution_Rs;
        SanctionId = callResult1.Data.Sanction_Id;
        Underwaterstressarea = callResult1.Data.Underwaterstressarea;
        if (callResult1.Flag) {
          {
            /* fetch farmer consent photographss */
          }
          let consentphotographss = [];
          if (SanctionId === 5) {
            route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=42&DocTypeId=1&PROJCD=${Component}`;
            consentphotographss = await APIHelper.Get(route, authToken);
          } else {
            route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=24&DocTypeId=1&PROJCD=${Component}`;
            consentphotographss = await APIHelper.Get(route, authToken);
          }
          consentphotographss.Data.map((e) => {
            const fileName = e.DocName;
            const fileExtension = fileName.split(".").pop();
            if (fileExtension.toLowerCase() === "pdf") {
              PDFData.consent = {};
              PDFData.consent.DocType = e.DocType;
              PDFData.consent.SpaceID = e.SpaceId;
              PDFData.consent.src = e.ImgString;
              PDFData.consent.DocName = e.DocName;
            }
          });

          {
            /* fetch farmer Challan/Paymet Proof photographs */
          }
          route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=35&DocTypeId=1&PROJCD=${Component}`;
          let Challanphotographs = await APIHelper.Get(route, authToken);
          Challanphotographs.Data.map((e) => {
            const fileName = e.DocName;
            const fileExtension = fileName.split(".").pop();
            if (fileExtension.toLowerCase() === "pdf") {
              PDFData.Proof = {};
              PDFData.Proof.DocType = e.DocType;
              PDFData.Proof.SpaceID = e.SpaceId;
              PDFData.Proof.src = e.ImgString;
              PDFData.Proof.DocName = e.DocName;
            }
          });

          {
            /* fetch Proof Of Existing FarmPond photographs */
          }
          route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=36&DocTypeId=1&PROJCD=${Component}`;
          let FarmPondphotographs = await APIHelper.Get(route, authToken);
          FarmPondphotographs.Data.map((e) => {
            const fileName = e.DocName;
            const fileExtension = fileName.split(".").pop();
            if (fileExtension.toLowerCase() === "pdf") {
              PDFData.FarmPond = {};
              PDFData.FarmPond.DocType = e.DocType;
              PDFData.FarmPond.SpaceID = e.SpaceId;
              PDFData.FarmPond.src = e.ImgString;
              PDFData.FarmPond.DocName = e.DocName;
            }
          });

          {
            /* fetch Farmer Land Document photographs */
          }
          route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=38&DocTypeId=1&PROJCD=${Component}`;
          let Landphotographs = await APIHelper.Get(route, authToken);
          Landphotographs.Data.map((e) => {
            const fileName = e.DocName;
            const fileExtension = fileName.split(".").pop();
            if (fileExtension.toLowerCase() === "pdf") {
              PDFData.Land = {};
              PDFData.Land.DocType = e.DocType;
              PDFData.Land.SpaceID = e.SpaceId;
              PDFData.Land.src = e.ImgString;
              PDFData.Land.DocName = e.DocName;
            }
          });

          {
            /* fetch Farmer Site Survey Report */
          }
          route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${APPNO}&SpaceId=24&DocTypeId=35&PROJCD=${Component}`;
          let SiteSurveyReport = await APIHelper.Get(route, authToken);
          SiteSurveyReport.Data.map((e) => {
            const fileName = e.DocName;
            const fileExtension = fileName.split(".").pop();
            if (fileExtension.toLowerCase() === "pdf") {
              PDFData.Report = {};
              PDFData.Report.DocType = e.DocType;
              PDFData.Report.SpaceID = e.SpaceId;
              PDFData.Report.src = e.ImgString;
              PDFData.Report.DocName = e.DocName;
            }
          });

          const surveydone = callResult1.Data.IsSitSurveyDone;
          const savedone = callResult1.Data.IsSiteSurvey;
          if (!surveydone && !savedone) {
            try {
              const appNo = callResult.Data.ApplicationNo;

              const existing = await queryAll(
                "SELECT Id FROM SiteSurveyMaster WHERE Application_No = ?",
                [appNo],
              );

              if (existing && existing.length > 0) {
                Alert.alert(
                  i18n.t("AlertMeaasge"),
                  i18n.t("farmerhasbeenalreadyaddedforofflinesurvey"),
                  [{ text: i18n.t("OK") }],
                );
                return;
              }

              Alert.alert(
                "Farmer Details",
                `Application No : ${appNo}\nSaral No : ${callResult.Data.SaralId}\nFarmerName : ${callResult.Data.FarmerName}\n\nDo You Want To Add This Farmer For Offline Survey ?`,
                [
                  { text: i18n.t("No") },
                  {
                    text: i18n.t("Yes"),
                    onPress: () => processOfflineSurveyAddition(),
                  },
                ],
              );
            } catch (error) {
              console.error("Lookup Error:", error);
            }

            const processOfflineSurveyAddition = async () => {
              // Use your withTransaction helper
              await withTransaction(async (tx) => {
                try {
                  // 1. Insert into SiteSurveyMaster using the tx.executeSql provided by your helper
                  const masterSql = `
        INSERT into SiteSurveyMaster(
          UserId, Saral_Id, Application_No, FarmerName, FatherName, MobileNO, 
          RequiredPumpCapacity, RequiredPumpType, RequiredPumpsubtype, RequiredPumpCategory, 
          Component, State, Department, SanctionId, TypeofControllerForPump, 
          FarmerContributionRs, Underwaterstressarea, ConsetDocType, ConsetSpaceID, 
          Consetsrc, ConsetDocName, ProofDocType, ProofSpaceID, Proofsrc, ProofDocName, 
          LandDocType, LandSpaceID, Landsrc, LandDocName, FarmPondType, FarmPondSpaceID, 
          FarmPondsrc, FarmPondDocName, ReportType, ReportSpaceID, Reportsrc, ReportDocName
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

                  const masterParams = [
                    userId,
                    callResult.Data.SaralId,
                    callResult.Data.ApplicationNo,
                    callResult.Data.FarmerName,
                    callResult.Data.FatherName,
                    callResult.Data.MobileNO,
                    callResult.Data.RequiredPumpCapacity,
                    callResult.Data.RequiredPumpType,
                    callResult.Data.RequiredPumpsubtype,
                    callResult.Data.RequiredPumpCategory,
                    callResult.Data.DepartmentComp,
                    callResult.Data.State,
                    department,
                    SanctionId,
                    TypeofControllerForPump,
                    FarmerContributionRs,
                    Underwaterstressarea,
                    PDFData.consent?.DocType,
                    PDFData.consent?.SpaceID,
                    PDFData.consent?.src,
                    PDFData.consent?.DocName,
                    PDFData.Proof?.DocType,
                    PDFData.Proof?.SpaceID,
                    PDFData.Proof?.src,
                    PDFData.Proof?.DocName,
                    PDFData.Land?.DocType,
                    PDFData.Land?.SpaceID,
                    PDFData.Land?.src,
                    PDFData.Land?.DocName,
                    PDFData.FarmPond?.DocType,
                    PDFData.FarmPond?.SpaceID,
                    PDFData.FarmPond?.src,
                    PDFData.FarmPond?.DocName,
                    PDFData.Report?.DocType,
                    PDFData.Report?.SpaceID,
                    PDFData.Report?.src,
                    PDFData.Report?.DocName,
                  ];

                  const masterResult = await tx.executeSql(
                    masterSql,
                    masterParams,
                  );
                  const newMasterId = masterResult.lastInsertRowId;

                  // 2. Fetch Checklist and External API Data
                  const localChecklist = await queryAll(
                    "SELECT * FROM SiteSurveyChecklist WHERE Comp = ?",
                    [component],
                  );
                  const authToken = await AsyncStorage.getItem("authToken");
                  const selectedComp = await AsyncStorage.getItem(
                    "selectedComponent",
                  );

                  const compCode =
                    selectedComp === "ComponentB"
                      ? "b"
                      : selectedComp === "ComponentC"
                      ? "c"
                      : "a";
                  const compNum = selectedComp === "ComponentB" ? 2 : 3;

                  const apiRoute = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=${compNum}&AppNo=${APPNO}&PROJCD=${compCode}`;
                  const apiResponse = await APIHelper.Get(apiRoute, authToken);
                  const apiData = apiResponse.Data || [];

                  // 3. Prepare Checklist Batch Insert using the transaction object
                  for (const item of localChecklist) {
                    const match = apiData.find((ele) => ele.Id == item.Id);
                    const responseValue = match
                      ? match.Response
                      : item.Response;

                    await tx.executeSql(
                      "INSERT INTO SaveSiteSurvey (SurveyId, Checklist_Id, FieldName, FieldType, Response) VALUES (?, ?, ?, ?, ?)",
                      [
                        newMasterId,
                        item.Id,
                        item.FieldName,
                        item.FieldType,
                        responseValue,
                      ],
                    );
                  }

                  // 4. Update Global UI State
                  const newRow = [
                    userId,
                    newMasterId,
                    callResult.Data.FarmerName,
                    stateCode === "HR"
                      ? callResult.Data.SaralId
                      : callResult.Data.ApplicationNo,
                    null,
                  ];

                  setData((prev) => ({
                    ...prev,
                    tableData: [...prev.tableData, newRow],
                  }));
                } catch (error) {
                  console.error("Transaction Execution Error:", error);
                  throw error; // Essential for withTransaction to roll back
                }
              });
            };
          } else {
            if (surveydone) {
              setSnackbar({
                ...snackbar,
                showSnackbar: true,
                snackbarText: i18n.t("SiteSurveyalreadydone"),
              });
              setTimeout(() => {
                setSnackbar(false);
              }, 3000);
            } else {
              setSnackbar({
                ...snackbar,
                showSnackbar: true,
                snackbarText: i18n.t("SiteSurveyalreadysave"),
              });
              setTimeout(() => {
                setSnackbar(false);
              }, 3000);
            }
          }
        } else {
          setSnackbar({
            ...snackbar,
            showSnackbar: true,
            snackbarText: "SitSurveyDone data is not found",
          });
          setTimeout(() => {
            setSnackbar(false);
          }, 3000);
          setIsBusy(false);
        }
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
        setTimeout(() => {
          setSnackbar(false);
        }, 3000);
      }
    }
    setIsBusy(false);
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
    setValidationError({
      ...validationError,
      isVisible: false,
      validationError: "",
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      setIsBusy(true);
      const userId = await AsyncStorage.getItem("userId");
      stateCode = await AsyncStorage.getItem("stateCode");
      let temp = [];
      try {
        const isHR = stateCode === "HR";
        const identifierColumn = isHR ? "Saral_Id" : "Application_No";
        const identifierLabel = isHR ? "Saral No" : "Application No";

        const sql = `SELECT UserId, Id, FarmerName, ${identifierColumn}, SiteSurveyDate FROM SiteSurveyMaster WHERE UserId = ?`;

        const results = await queryAll(sql, [userId]);

        const tableData = results.map((row) => Object.values(row));

        setData({
          ...data,
          headers: ["", "", "Farmer Name", identifierLabel, "Survey Date"],
          tableData: tableData,
        });
      } catch (error) {
        console.error("Failed to fetch survey data:", error);
      }

      setIsBusy(false);
      return temp;
    })();
  }, [isFocused]);

  const syncdata = async (rowData) => {
    try {
      const surveyId = rowData[1];
      setIsBusy(true);

      const [userId, apiUrl, stateCode, authToken, selectedComponent] =
        await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("apiURL"),
          AsyncStorage.getItem("stateCode"),
          AsyncStorage.getItem("authToken"),
          AsyncStorage.getItem("selectedComponent"),
        ]);

      const masterResults = await queryAll(
        "SELECT * FROM SiteSurveyMaster WHERE UserId = ? AND Id = ?",
        [userId, surveyId],
      );
      const surveyDataResults = await queryAll(
        "SELECT * FROM SaveSiteSurvey WHERE SurveyId = ?",
        [surveyId],
      );
      const imageResults = await queryAll(
        "SELECT DocType, File_String, SpaceID FROM ImageUpload WHERE SurveyId = ?",
        [surveyId],
      );

      if (masterResults.length === 0) {
        throw new Error("Master record not found");
      }

      const master = masterResults[0];
      const componentKey =
        selectedComponent === "ComponentB"
          ? "b"
          : selectedComponent === "ComponentC"
          ? "c"
          : "a";

      const filesToDelete = imageResults.map((img) => img.File_String);

      for (const item of imageResults) {
        const base64 = await FileSystem.readAsStringAsync(item.File_String, {
          encoding: "base64",
        });

        const docNamePart =
          item.DocType == 0 && item.SpaceID == 24
            ? "Site"
            : item.DocType == 1 && item.SpaceID == 24
            ? "Consent"
            : item.DocType == 1 && item.SpaceID == 42
            ? "Suplier"
            : item.DocType == 1 && item.SpaceID == 35
            ? "ChallanProof"
            : item.DocType == 1 && item.SpaceID == 36
            ? "FarmPond"
            : item.DocType == 1 && item.SpaceID == 38
            ? "LandDoc"
            : item.DocType == 35 && item.SpaceID == 24
            ? "SiteSurveyReport"
            : "";

        const payload = {
          docspreffid: master.Application_No,
          docName: `${docNamePart}_${moment().valueOf()}.jpg`,
          version: "1",
          EnumValue: 0,
          DocType: item.DocType,
          docspid: item.SpaceID,
          File_String: base64,
        };

        const imgRoute = `${apiUrl}api/${stateCode}/Comp${componentKey}_SiteSurvey_Document/UploadDcoument_Base64_M?PROJCD=${componentKey}`;
        const imgRes = await axios.post(imgRoute, payload, {
          headers: { Authorization: authToken },
          maxBodyLength: 2000000,
        });

        if (!imgRes.data.Flag) {
          throw new Error(`Image Upload Failed: ${imgRes.data.Message}`);
        }
      }

      const saveData = {};
      surveyDataResults.forEach((item) => {
        saveData[item.FieldName] =
          item.FieldType === "Boolean"
            ? item.Response.toLowerCase() === "true"
            : item.Response;
      });

      if (saveData["IrrigationMode"] === "Micro Irrigation")
        saveData["IrrigationMode"] = "1";
      saveData["Latitude"] = master.latitude;
      saveData["Longitude"] = master.longitude;
      saveData["Installer"] = master.Department;
      if (master.SanctionId === 5) saveData["IsOfflineSiteSurvey"] = true;

      let postRoute =
        master.SanctionId === 5 && stateCode === "HR"
          ? `${apiUrl}api/${stateCode}/Comp${componentKey}_SiteSurvey/SaveSiteSurvey?PROJCD=${componentKey}`
          : `${apiUrl}api/${stateCode}/Comp${componentKey}_SiteSurvey/Post?PROJCD=${componentKey}`;

      const callResult = await APIHelper.Post1(postRoute, authToken, saveData);

      if (callResult.Result) {
        await withTransaction(async (tx) => {
          await tx.executeSql("DELETE FROM SaveSiteSurvey WHERE SurveyId = ?", [
            surveyId,
          ]);
          await tx.executeSql("DELETE FROM SiteSurveyMaster WHERE Id = ?", [
            surveyId,
          ]);
          await tx.executeSql("DELETE FROM ImageUpload WHERE SurveyId = ?", [
            surveyId,
          ]);
        });

        // Final UI and Media Cleanup
        for (const fileUri of filesToDelete) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
            }
          } catch (err) {
            console.warn("File delete failed:", fileUri);
          }
        }

        const dataCopy = data.tableData.filter((e) => e[1] !== surveyId);
        setData({ ...data, tableData: dataCopy });

        setSnackbar({
          showSnackbar: true,
          snackbarText: `${i18n.t("ResponseSaveSuccessfully")} ${i18n.t(
            "Imageuploadedsuccessfully",
          )}`,
        });
      } else {
        throw new Error(callResult.Message);
      }
    } catch (error) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Sync failed: " + error.message,
      });
    } finally {
      setIsBusy(false);
      setIsSurveyDone(false);
    }
  };

  const fetchAllAssets = async (cursor = 0, batchSize = 100) => {
    try {
      const dir = FileSystem.documentDirectory + "PMKUSUM/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        return {
          assets: [],
          hasNextPage: false,
          endCursor: null,
        };
      }

      const files = await FileSystem.readDirectoryAsync(dir);
      const start = cursor || 0;
      const end = start + batchSize;
      const slicedFiles = files.slice(start, end);

      const assets = slicedFiles.map((file, index) => ({
        id: `${start + index}`,
        filename: file,
        uri: dir + file,
        mediaType: "photo",
      }));

      return {
        assets,
        hasNextPage: end < files.length,
        endCursor: end < files.length ? end : null,
      };
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  };

  const deletedata = async (rowData) => {
    const surveyId = rowData[1];

    try {
      // Use your withTransaction helper for atomic deletion
      await withTransaction(async (tx) => {
        await tx.executeSql("DELETE FROM SaveSiteSurvey WHERE SurveyId = ?", [
          surveyId,
        ]);
        await tx.executeSql("DELETE FROM SiteSurveyMaster WHERE Id = ?", [
          surveyId,
        ]);
        await tx.executeSql("DELETE FROM ImageUpload WHERE SurveyId = ?", [
          surveyId,
        ]);
      });

      // Success Block
      const dataCopy = data.tableData.filter((item) => item[1] !== surveyId);

      setData({
        ...data,
        tableData: dataCopy,
      });

      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("yourinspectionisdone"),
      });
    } catch (error) {
      // Error Block
      console.error("Delete failed:", error);
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("dataDoes'tDeletePleaseCheckIt"),
      });
    }
  };

  const syncElement = (rowData, index) =>
    rowData[4] != null ? (
      <TouchableOpacity
        onPress={async () => {
          const net = await NetInfo.fetch();
          if (!net.isConnected) {
            Alert.alert(
              i18n.t("AlertMeaasge"),
              i18n.t("Pleaseturnoninternetconnection"),
              [
                {
                  text: i18n.t("OK"),
                },
              ],
            );
          } else {
            Alert.alert(i18n.t("SyncSurvey"), i18n.t("ConfirmSiteSurveySync"), [
              {
                text: i18n.t("Yes"),
                onPress: async () => {
                  await syncdata(rowData, index);
                },
              },
              {
                text: i18n.t("No"),
              },
            ]);
          }
        }}
        style={styles.btn}
      >
        <IconMC
          name="sync"
          size={30}
          color={Colors.green}
          style={styles.btnText}
        ></IconMC>
      </TouchableOpacity>
    ) : (
      ""
    );

  const deleteElement = (rowData, index) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(i18n.t("SyncSurvey"), i18n.t("DeleteSiteSurvey"), [
          {
            text: i18n.t("Yes"),
            onPress: () => {
              deletedata(rowData, index);
            },
          },
          {
            text: i18n.t("No"),
            style: "noStyle",
          },
        ]);
      }}
      style={styles.btn}
    >
      <IconE
        name="trash"
        size={30}
        color={Colors.red}
        style={{ margin: 5 }}
      ></IconE>
    </TouchableOpacity>
  );

  const navigateElement = (rowData) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          const isGPSEnabled = await checkAndEnableGPS();
          if (!isGPSEnabled) {
            Alert.alert(
              "Error",
              "Unable to fetch location. GPS Location is Off",
            );
            return;
          }

          const net = await NetInfo.fetch();
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            if (net.isConnected) {
              Alert.alert(
                i18n.t("AlertMeaasge"),
                i18n.t("Pleaseturnoffinternetconnection"),
                [
                  {
                    text: i18n.t("OK"),
                  },
                ],
              );
            } else {
              navigation.navigate("SiteSurvey", {
                Id: rowData[1],
                sanctionId: SanctionId,
              });
            }
          } else if (status === "denied") {
            Alert.alert(
              i18n.t("AlertMeaasge"),
              i18n.t("Pleaseturnonlocation"),
              [
                {
                  text: i18n.t("OK"),
                },
              ],
            );
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          Alert.alert("Error", "Unable to fetch location. Please try again.");
        }
      }}
      style={styles.btn}
    >
      <Text style={{ textDecorationLine: "underline" }}>{rowData[2]}</Text>
    </TouchableOpacity>
  );

  const checkAndEnableGPS = async () => {
    try {
      const isGPSAvailable = await Location.hasServicesEnabledAsync();
      if (!isGPSAvailable) {
        await Location.enableNetworkProviderAsync();
        return true; // GPS enabled
      }
      return true; // GPS was already enabled
    } catch (error) {
      console.error("Error enabling GPS:", error);
      Alert.alert("Error", "Unable to enable GPS. Please enable it manually.");
      return false;
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
        </View>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TextInput
            style={[Styles.flex1, styles.searchInput]}
            placeholder={
              stateCode === "JK"
                ? i18n.t("SearchByApplicationNo$Pumpid")
                : i18n.t("SearchByApplicationNo")
            }
            keyboardType={searchBy === 0 ? "default" : "number-pad"}
            onChangeText={(value) => searchTextChanged(value)}
            value={searchText}
          ></TextInput>
          <Pressable
            onPress={() => {
              searchPressed();
            }}
          >
            <View style={Styles.actionButtonSmall}>
              <IconM
                name="search"
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
      <Animatable.View animation="fadeInDownBig">
        <View style={{ margin: "1%" }}>
          <ScrollView horizontal={true}>
            <View>
              <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                <Row
                  data={data.headers}
                  widthArr={data.widthArr}
                  style={styles.head}
                  textStyle={styles.text}
                />
              </Table>
              <ScrollView style={styles.dataWrapper}>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                  {data.tableData.map((rowData, index) => (
                    <TableWrapper key={index} style={styles.row}>
                      {rowData.map((cellData, cellIndex) => (
                        <Cell
                          key={cellIndex}
                          data={
                            cellIndex === 0
                              ? syncElement(rowData, index)
                              : cellIndex === 1
                              ? deleteElement(rowData, index)
                              : cellIndex === 2
                              ? navigateElement(rowData, index)
                              : cellData
                          }
                          style={{
                            width:
                              cellIndex === 0 ? 50 : cellIndex === 1 ? 50 : 160,
                          }}
                          textStyle={styles.text}
                        />
                      ))}
                    </TableWrapper>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </Animatable.View>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
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

export default SyncSurvey;

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
    height: 30,
    paddingBottom: 0,
    marginRight: 5,
  },

  tablestyle: { borderWidth: 1, borderColor: "#C1C0B9" },
  head: { backgroundColor: "#808B97" },
  text: { margin: 10, paddingLeft: 6, fontSize: 15, textAlign: "center" },
  row: { flexDirection: "row" },
  btn: { alignItems: "center" },
  dataWrapper: { marginTop: -1 },
});
