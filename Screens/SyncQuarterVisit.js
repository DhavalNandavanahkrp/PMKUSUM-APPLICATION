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
import * as APIHelper from "../Data/APIHelper";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { withTransaction } from "../db/transaction";
import { queryAll } from "../db/exec";

const formatCoord = (coord) => {
  if (
    coord === null ||
    coord === undefined ||
    coord === "" ||
    coord === "*****"
  ) {
    return "*****";
  }
  const num = parseFloat(coord);
  return isNaN(num) ? String(coord) : num.toFixed(6);
};

const SyncQuarterVisit = ({ route, navigation }) => {
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [isBusy, setIsBusy] = useState(false);
  const [data, setData] = useState({
    headers: [],
    tableData: [],
    widthArr: [50, 50, 160, 160],
  });
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });

  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });

  // Search by Application No - fetch farmer data from API and store in SQLite for offline use
  const searchPressed = async () => {
    setIsBusy(true);
    const net = await NetInfo.fetch();
    if (searchText.length === 0) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationnoshouldnotbeEmpty"),
      });
      setIsBusy(false);
      return;
    }

    if (!net.isConnected) {
      Alert.alert(i18n.t("AlertMeaasge"), i18n.t("Farmerssearch"), [
        { text: i18n.t("OK") },
      ]);
      setIsBusy(false);
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const authToken = await AsyncStorage.getItem("authToken");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : selectedComponent === "ComponentC"
          ? "c"
          : "a";

      // Step 1: Fetch farmer data
      const applicationNo = searchText;
      console.log("=== SEARCH PRESSED ===", {
        applicationNo,
        Component,
        stateCode,
      });

      const farmerRoute = `${apiUrl}api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${applicationNo}&mobileNo=-1&PROJCD=${Component}`;
      const farmerResult = await APIHelper.Get(farmerRoute, authToken);
      console.log("1. Farmer Search Result:", JSON.stringify(farmerResult));

      if (!farmerResult.Result) {
        setSnackbar({
          showSnackbar: true,
          snackbarText: farmerResult.Message || "Farmer not found",
        });
        setIsBusy(false);
        return;
      }

      const farmerData = farmerResult.Data;
      const farmerId = farmerData.FarmerId?.toString();
      console.log("Farmer Details Fetched:", {
        FarmerId: farmerId,
        FarmerName: farmerData.FarmerName,
        ApplicationNo: farmerData.ApplicationNo,
        SaralId: farmerData.SaralId,
        InstalledDate: farmerData.InstalledDate,
        RMSLatitude: farmerData.RMSLatitude,
        RMSLongitude: farmerData.RMSLongitude,
      });

      // Check if installed 5 or more years ago
      const installedDateStr = farmerData.InstalledDate;
      if (installedDateStr) {
        const installedDate = new Date(installedDateStr);
        const installedYear = installedDate.getFullYear();
        const currentYear = new Date().getFullYear();

        if (currentYear - installedYear >= 10) {
          Alert.alert(
            i18n.t("AlertMeaasge") || "Alert",
            "This system was installed 5 years ago, that is why it cannot be accessed.",
            [{ text: i18n.t("OK") || "OK" }],
          );
          setIsBusy(false);
          return;
        }
      }

      // Step 2: Fetch quarter checklist template
      const checklistRoute = `${apiUrl}api/${stateCode}/Master_Quarter/GetMasterQuarterKeyValueResult?PROJCD=${Component}`;
      const checklistResult = await APIHelper.Get(checklistRoute, authToken);
      // Print full API response for debugging
      console.log("Checklist API Response:", checklistResult);
      console.log(
        "2. Checklist Template Result:",
        JSON.stringify(checklistResult),
      );

      if (!checklistResult.Result) {
        setSnackbar({
          showSnackbar: true,
          snackbarText: "Failed to fetch quarter checklist",
        });
        setIsBusy(false);
        return;
      }

      const checklistData = checklistResult.Data || [];

      // Save/cache questions in MasterQuarterChecklist table
      await withTransaction(async (tx) => {
        for (const item of checklistData) {
          await tx.executeSql(
            `INSERT OR REPLACE INTO MasterQuarterChecklist (Key, Value, Component) VALUES (?, ?, ?)`,
            [item.Key, item.Value || "", Component],
          );
        }
      });

      // Step 3: Fetch installed date for year calculation
      const installedDate = new Date(installedDateStr);
      const installedYear = installedDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const maxPossibleYears = currentYear - installedYear + 1;
      const totalYears = Math.min(5, maxPossibleYears);

      // Step 4: Fetch existing quarter data for each year
      const refLat = formatCoord(farmerData.RMSLatitude || "");
      const refLng = formatCoord(farmerData.RMSLongitude || "");

      // Check if this farmer's current active quarter already exists in offline storage for the current year
      const currentMonth = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);
      // currentYear is already defined earlier in the function

      const existing = await queryAll(
        "SELECT Id, DocName FROM QuarterVisitMaster WHERE ApplicationNo = ? AND Quarter = ? AND Year = ?",
        [farmerData.ApplicationNo, currentQuarter, currentYear],
      );

      // If a record already exists with an associated document, prevent duplicate save
      if (
        existing &&
        existing.length > 0 &&
        existing[0].DocName &&
        existing[0].DocName !== ""
      ) {
        console.log("Duplicate with document found:", existing[0].DocName);
        Alert.alert(
          i18n.t("AlreadyCompleted") || "Visit Already Completed",
          i18n.t("QuarterAlreadyCompleted") ||
            "Quarter Visit for this period has already been completed and submitted offline.",
          [{ text: i18n.t("OK") || "OK" }],
        );
        setIsBusy(false);
        return;
      }

      // Additional debug logs
      console.log(
        "Query params:",
        farmerData.ApplicationNo,
        currentQuarter,
        currentYear,
      );
      console.log("Existing rows count:", existing ? existing.length : 0);

      if (existing && existing.length > 0) {
        // Fetch the existing master record and its checklist for debugging
        const existingId = existing[0].Id;
        const existingMaster = await queryAll(
          "SELECT * FROM QuarterVisitMaster WHERE Id = ?",
          [existingId],
        );
        const existingChecklist = await queryAll(
          "SELECT * FROM QuarterVisitChecklist WHERE VisitId = ?",
          [existingId],
        );
        console.log("Duplicate record found. Existing master:", existingMaster);
        console.log("Existing checklist items:", existingChecklist);
        Alert.alert(
          i18n.t("AlreadyInOffline") || "Already Saved in Offline",
          i18n.t("DuplicateOfflineMessage") ||
            "This farmer's Quarter Visit for the current active quarter is already saved in offline storage.",
          [{ text: i18n.t("OK") || "OK" }],
        );
        setIsBusy(false);
        return;
      }

      // Step 5: Fetch quarter data for current year
      const quarterRoute = `${apiUrl}api/${stateCode}/Master_Quarter/GetFarmerQuarterDetails?CId=${farmerId}&Year=${currentYear}&PROJCD=${Component}`;
      const quarterResult = await APIHelper.Get(quarterRoute, authToken);
      console.log(
        "4. Farmer Quarter Details Result:",
        JSON.stringify(quarterResult),
      );

      const QUARTER_TITLES = {
        1: "Quarter 1 (January - March)",
        2: "Quarter 2 (April - June)",
        3: "Quarter 3 (July - September)",
        4: "Quarter 4 (October - December)",
      };

      const apiQuarters = Array.isArray(quarterResult?.Data?.Quarters)
        ? quarterResult.Data.Quarters
        : Array.isArray(quarterResult?.Data)
        ? quarterResult.Data
        : Array.isArray(quarterResult)
        ? quarterResult
        : [];

      const existingQuarterOnServer = apiQuarters.find(
        (aq) =>
          Number(aq.Quarter) === Number(currentQuarter) &&
          ((aq.QuarterId !== undefined &&
            aq.QuarterId !== null &&
            aq.QuarterId !== 0) ||
            (aq.Document && aq.Document.DocId)),
      );

      console.log("5. Existing Quarter On Server Check:", {
        apiQuarters,
        currentQuarter,
        existingQuarterOnServer,
      });

      // If server already has a document for this quarter, prevent offline save
      if (
        existingQuarterOnServer &&
        existingQuarterOnServer.Document &&
        existingQuarterOnServer.Document.DocName
      ) {
        console.log(
          "Duplicate document on server found:",
          existingQuarterOnServer.Document.DocName,
        );
        Alert.alert(
          i18n.t("AlreadyCompleted") || "Visit Already Completed",
          i18n.t("QuarterAlreadyCompleted") ||
            "Quarter Visit for the current active quarter is already completed and submitted on the server.",
          [{ text: i18n.t("OK") || "OK" }],
        );
        setIsBusy(false);
        return;
      }

      const q = currentQuarter;
      Alert.alert(
        "Farmer Details",
        `Application No : ${farmerData.ApplicationNo}\nFarmer Name : ${farmerData.FarmerName}\n\nDo you want to add this farmer for offline Quarter Visit?`,
        [
          { text: i18n.t("No") },
          {
            text: i18n.t("Yes"),
            onPress: async () => {
              try {
                await withTransaction(async (tx) => {
                  console.log("Saving to SQLite:", {
                    Quarter: q,
                    Title: QUARTER_TITLES[q],
                  });

                  const masterResult = await tx.executeSql(
                    `INSERT INTO QuarterVisitMaster(
                        UserId, FarmerId, FarmerName, FatherName, ApplicationNo, SaralId,
                        Year, Quarter, QuarterTitle, RefLatitude, RefLongitude,
                        Latitude, Longitude, DistMtr, Remark, DocType,
                        DocName, FileString, Component, StateCode,
                        RequiredPumpCapacity, RequiredPumpType, RequiredPumpsubtype, SPVCapacity, InstalledDate, CreatedDate
                      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      userId,
                      farmerId,
                      farmerData.FarmerName || "",
                      farmerData.FatherName || "",
                      farmerData.ApplicationNo || "",
                      farmerData.SaralId || "",
                      currentYear.toString(),
                      q,
                      QUARTER_TITLES[q],
                      refLat,
                      refLng,
                      "", // Latitude - to be filled during visit
                      "", // Longitude - to be filled during visit
                      "", // DistMtr - to be filled during visit
                      "", // Remark
                      "", // DocType
                      "", // DocName
                      "", // FileString
                      Component,
                      stateCode,
                      farmerData.RequiredPumpCapacity
                        ? farmerData.RequiredPumpCapacity.toString()
                        : "",
                      farmerData.RequiredPumpType || "",
                      farmerData.RequiredPumpsubtype || "",
                      (
                        farmerData.SPV_Capacity ||
                        farmerData.SPVCapacity ||
                        ""
                      ).toString(),
                      farmerData.InstalledDate || "",
                      moment().format("YYYY-MM-DD HH:mm:ss"),
                    ],
                  );

                  // Also cache immediately in AsyncStorage
                  await AsyncStorage.multiSet([
                    ["farmerId", farmerId || ""],
                    ["farmerName", farmerData.FarmerName || ""],
                    ["FarmerNameImage", farmerData.FarmerName || ""],
                    ["FatherNameImage", farmerData.FatherName || ""],
                    ["fatherName", farmerData.FatherName || ""],
                    ["applicationNo", farmerData.ApplicationNo || ""],
                    ["SaralId", farmerData.SaralId || ""],
                    ["RMSLatitude", refLat || ""],
                    ["RMSLongitude", refLng || ""],
                    [
                      "RequiredPumpCapacity",
                      farmerData.RequiredPumpCapacity
                        ? farmerData.RequiredPumpCapacity.toString()
                        : "",
                    ],
                    ["requiredPumpType", farmerData.RequiredPumpType || ""],
                    ["RequiredPumpType", farmerData.RequiredPumpType || ""],
                    [
                      "requiredPumpsubtype",
                      farmerData.RequiredPumpsubtype || "",
                    ],
                    [
                      "RequiredPumpsubtype",
                      farmerData.RequiredPumpsubtype || "",
                    ],
                    [
                      "SPVCapacity",
                      (
                        farmerData.SPV_Capacity ||
                        farmerData.SPVCapacity ||
                        ""
                      ).toString(),
                    ],
                    ["InstalledDate", farmerData.InstalledDate || ""],
                  ]);

                  const newVisitId = masterResult.lastInsertRowId;
                  console.log("5. Inserted QuarterVisitMaster ID:", newVisitId);

                  // Insert checklist items for this quarter
                  for (const item of checklistData) {
                    await tx.executeSql(
                      "INSERT INTO QuarterVisitChecklist (VisitId, ChecklistId, IsChecked) VALUES (?, ?, ?)",
                      [newVisitId, item.Key, 0],
                    );
                  }
                  console.log(
                    "6. Inserted Checklist Items Count:",
                    checklistData.length,
                  );
                });

                // Refresh the table data
                await loadTableData();

                setSnackbar({
                  showSnackbar: true,
                  snackbarText:
                    "Farmer added for offline Quarter Visit successfully!",
                });
              } catch (error) {
                setSnackbar({
                  showSnackbar: true,
                  snackbarText: "Failed to store data: " + error.message,
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Search failed: " + error.message,
      });
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

  const loadTableData = async () => {
    try {
      const net = await NetInfo.fetch();
      const userId = await AsyncStorage.getItem("userId");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const isHR = stateCode === "HR";
      const identifierColumn = isHR ? "SaralId" : "ApplicationNo";
      const identifierLabel = isHR ? "Saral No" : "Application No";

      const currentYear = new Date().getFullYear().toString();
      const currentMonth = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      // Automatic cleanup: purge any non-current quarter uncompleted records for the current year from SQLite
      await withTransaction(async (tx) => {
        await tx.executeSql(
          `DELETE FROM QuarterVisitChecklist WHERE VisitId IN (
            SELECT Id FROM QuarterVisitMaster WHERE Year = ? AND Quarter != ? AND (FileString IS NULL OR FileString = '')
          )`,
          [currentYear, currentQuarter],
        );
        await tx.executeSql(
          `DELETE FROM QuarterVisitMaster WHERE Year = ? AND Quarter != ? AND (FileString IS NULL OR FileString = '')`,
          [currentYear, currentQuarter],
        );
      });

      let sql = "";
      let params = [];

      if (!net.isConnected) {
        // OFFLINE CASE: Query ONLY the single current Quarter record
        sql = `
          SELECT 
            UserId, 
            MAX(Id) as Id, 
            FarmerName, 
            ${identifierColumn}, 
            SUM(CASE WHEN FileString != '' THEN 1 ELSE 0 END) as CompletedCount
          FROM QuarterVisitMaster 
          WHERE UserId = ? AND Quarter = ? AND Year = ?
          GROUP BY ${identifierColumn}, FarmerName, UserId 
          ORDER BY MAX(Id) DESC
        `;
        params = [userId, currentQuarter, currentYear];
      } else {
        // ONLINE CASE: Query ALL Quarter records
        sql = `
          SELECT 
            UserId, 
            MAX(Id) as Id, 
            FarmerName, 
            ${identifierColumn}, 
            SUM(CASE WHEN FileString != '' THEN 1 ELSE 0 END) as CompletedCount
          FROM QuarterVisitMaster 
          WHERE UserId = ? 
          GROUP BY ${identifierColumn}, FarmerName, UserId 
          ORDER BY MAX(Id) DESC
        `;
        params = [userId];
      }

      const results = await queryAll(sql, params);
      const tableData = results.map((row) => Object.values(row));

      setData({
        ...data,
        headers: ["", "", "Farmer Name", identifierLabel],
        tableData: tableData,
      });
    } catch (error) {}
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      setIsBusy(true);
      await loadTableData();
      setIsBusy(false);
    })();
  }, [isFocused]);

  // Sync quarter visit data to server
  const syncdata = async (rowData) => {
    try {
      const appNo = rowData[3];
      const completedCount = rowData[4];

      if (!completedCount || completedCount === 0) {
        setSnackbar({
          showSnackbar: true,
          snackbarText: "Cannot sync: No completed offline data to sync.",
        });
        return;
      }

      setIsBusy(true);

      const [userId, apiUrl, stateCode, authToken, selectedComponent] =
        await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("apiURL"),
          AsyncStorage.getItem("stateCode"),
          AsyncStorage.getItem("authToken"),
          AsyncStorage.getItem("selectedComponent"),
        ]);

      const isHR = stateCode === "HR";
      const identifierColumn = isHR ? "SaralId" : "ApplicationNo";

      const componentKey =
        selectedComponent === "ComponentB"
          ? "b"
          : selectedComponent === "ComponentC"
          ? "c"
          : "a";

      // Fetch all completed master data for this farmer from SQLite
      const masterResults = await queryAll(
        `SELECT * FROM QuarterVisitMaster WHERE ${identifierColumn} = ? AND FileString != ''`,
        [appNo],
      );

      if (masterResults.length === 0) {
        throw new Error("No completed quarter visits found to sync.");
      }

      const str = (v) => (v !== undefined && v !== null ? String(v) : "");
      let allSuccess = true;
      let lastErrorMsg = "";

      for (const master of masterResults) {
        // Fetch checklist data from SQLite
        const checklistResults = await queryAll(
          "SELECT * FROM QuarterVisitChecklist WHERE VisitId = ?",
          [master.Id],
        );

        const checklistData = checklistResults.map((item) => ({
          ChecklistId: item.ChecklistId,
          IsChecked: item.IsChecked === 1,
        }));

        // Build API payload
        const route = `${apiUrl}api/${stateCode}/Master_Quarter/AddQuarterChecklist?PROJCD=${componentKey}`;
        const payload = {
          CId: master.FarmerId,
          Year: master.Year,
          Quarter: master.Quarter,
          RefLatitude: str(master.RefLatitude || "30.1789441"),
          RefLongitude: str(master.RefLongitude || "74.3416841"),
          Latitude: str(master.Latitude || master.RefLatitude || ""),
          Longitude: str(master.Longitude || master.RefLongitude || ""),
          DistMtr: str(master.DistMtr),
          Remark: master.Remark || "",
          DocType: master.DocType || "jpg",
          docName:
            master.DocName ||
            master.Quarter + "_" + moment().valueOf() + ".jpg",
          Checklists: checklistData,
          File_String: master.FileString || "",
        };

        console.log("🚀 [SyncQuarterVisit] Calling Sync API Route:", route);
        console.log("📦 [SyncQuarterVisit] Sync API Payload:", {
          ...payload,
          File_String: payload.File_String
            ? `[Base64 Image String, Length: ${payload.File_String.length}]`
            : "",
        });

        const callResult = await APIHelper.Post1(route, authToken, payload);
        console.log("📥 [SyncQuarterVisit] Sync API Response:", callResult);

        if (callResult.Result) {
          // Delete this specific synced quarter from SQLite
          await withTransaction(async (tx) => {
            await tx.executeSql(
              "DELETE FROM QuarterVisitChecklist WHERE VisitId = ?",
              [master.Id],
            );
            await tx.executeSql("DELETE FROM QuarterVisitMaster WHERE Id = ?", [
              master.Id,
            ]);
          });
        } else {
          allSuccess = false;
          lastErrorMsg = callResult.Message;
        }
      }

      // Refresh table UI
      await loadTableData();

      if (allSuccess) {
        setSnackbar({
          showSnackbar: true,
          snackbarText: "Sync Successfully",
        });
      } else {
        throw new Error("Some quarters failed to sync: " + lastErrorMsg);
      }
    } catch (error) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Sync failed: " + error.message,
      });
    } finally {
      setIsBusy(false);
    }
  };

  // Delete all quarter visit data for this farmer from SQLite
  const deletedata = async (rowData) => {
    const appNo = rowData[3];

    try {
      const stateCode = await AsyncStorage.getItem("stateCode");
      const isHR = stateCode === "HR";
      const identifierColumn = isHR ? "SaralId" : "ApplicationNo";

      await withTransaction(async (tx) => {
        await tx.executeSql(
          `DELETE FROM QuarterVisitChecklist WHERE VisitId IN (SELECT Id FROM QuarterVisitMaster WHERE ${identifierColumn} = ?)`,
          [appNo],
        );
        await tx.executeSql(
          `DELETE FROM QuarterVisitMaster WHERE ${identifierColumn} = ?`,
          [appNo],
        );
      });

      await loadTableData();

      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("yourinspectionisdone"),
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("dataDoes'tDeletePleaseCheckIt"),
      });
    }
  };

  // Sync button element for each row
  const syncElement = (rowData, index) => {
    const completedCount = rowData[4];
    const isCompleted = completedCount > 0;

    return isCompleted ? (
      <TouchableOpacity
        onPress={async () => {
          const net = await NetInfo.fetch();
          if (!net.isConnected) {
            Alert.alert(
              i18n.t("AlertMeaasge"),
              i18n.t("Pleaseturnoninternetconnection"),
              [{ text: i18n.t("OK") }],
            );
          } else {
            Alert.alert(
              "Sync Quarter Visit",
              "Are you sure you want to sync this quarter visit data?",
              [
                {
                  text: i18n.t("Yes"),
                  onPress: async () => {
                    await syncdata(rowData, index);
                  },
                },
                { text: i18n.t("No") },
              ],
            );
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
    ) : null;
  };

  // Delete button element for each row
  const deleteElement = (rowData, index) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          "Delete Quarter Visit",
          "Are you sure you want to delete this quarter visit data?",
          [
            {
              text: i18n.t("Yes"),
              onPress: () => {
                deletedata(rowData, index);
              },
            },
            { text: i18n.t("No"), style: "noStyle" },
          ],
        );
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

  // Navigate to QuarterVisit screen for offline editing
  const navigateElement = (rowData) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          const net = await NetInfo.fetch();
          if (net.isConnected) {
            Alert.alert(
              i18n.t("AlertMeaasge"),
              i18n.t("Pleaseturnoffinternetconnection"),
              [{ text: i18n.t("OK") }],
            );
            return;
          }

          // Store farmer details in AsyncStorage for QuarterVisit screen
          const master = await queryAll(
            "SELECT * FROM QuarterVisitMaster WHERE Id = ?",
            [rowData[1]],
          );

          if (master.length > 0) {
            const record = master[0];
            await AsyncStorage.multiSet([
              ["farmerId", record.FarmerId ? record.FarmerId.toString() : ""],
              ["farmerName", record.FarmerName || ""],
              ["FarmerNameImage", record.FarmerName || ""],
              ["FatherNameImage", record.FatherName || ""],
              ["fatherName", record.FatherName || ""],
              ["applicationNo", record.ApplicationNo || ""],
              ["SaralId", record.SaralId || ""],
              ["RMSLatitude", record.RefLatitude || ""],
              ["RMSLongitude", record.RefLongitude || ""],
              ["LastAcceptedLatitude", record.Latitude || ""],
              ["LastAcceptedLongitude", record.Longitude || ""],
              [
                "RequiredPumpCapacity",
                record.RequiredPumpCapacity
                  ? record.RequiredPumpCapacity.toString()
                  : "",
              ],
              ["requiredPumpType", record.RequiredPumpType || ""],
              ["RequiredPumpType", record.RequiredPumpType || ""],
              ["requiredPumpsubtype", record.RequiredPumpsubtype || ""],
              ["RequiredPumpsubtype", record.RequiredPumpsubtype || ""],
              [
                "SPVCapacity",
                record.SPVCapacity ? record.SPVCapacity.toString() : "",
              ],
              ["InstalledDate", record.InstalledDate || ""],
            ]);

            navigation.navigate("QuarterVisit");
          }
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }}
      style={styles.btn}
    >
      <Text style={{ textDecorationLine: "underline" }}>{rowData[2]}</Text>
    </TouchableOpacity>
  );

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
            placeholder={i18n.t("SearchByApplicationNo")}
            keyboardType={"default"}
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
                      {[rowData[0], rowData[1], rowData[2], rowData[3]].map(
                        (cellData, cellIndex) => (
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
                                cellIndex === 0
                                  ? 50
                                  : cellIndex === 1
                                  ? 50
                                  : 160,
                            }}
                            textStyle={styles.text}
                          />
                        ),
                      )}
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

export default SyncQuarterVisit;

const styles = StyleSheet.create({
  backPanel: {
    margin: "1%",
    backgroundColor: "#ddd",
    padding: 5,
    borderRadius: 5,
    paddingVertical: 10,
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
