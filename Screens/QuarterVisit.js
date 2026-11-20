import { useEffect, useState, useCallback, memo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";

import * as APIHelper from "../Data/APIHelper";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { Snackbar, Checkbox } from "react-native-paper";
// import * as APIHelper from "../Data/APIHelper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as FileSystem from "expo-file-system/legacy";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Sharing from "expo-sharing";
import NetInfo from "@react-native-community/netinfo";
import { withTransaction } from "../db/transaction";
import { queryAll } from "../db/exec";

export const formatCoord = (coord) => {
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

const QuarterCard = memo(
  ({
    index,
    distance,
    quarterId,
    remark,
    updateRemark,
    title,
    Checklist = [],
    setChecklist,
    isDoc,
    image,
    isSubmittedLocally,
    onUpload,
    onDownload,
    refreshLocation,
    isBusy,
    submitQuarter,
  }) => {
    const [localRemark, setLocalRemark] = useState(remark || "");

    useEffect(() => {
      setLocalRemark(remark || "");
    }, [remark]);

    const handleRemarkChange = (text) => {
      setLocalRemark(text);
      updateRemark(index, text);
    };

    const isDistanceValid = distance !== null && distance <= 100;
    const safeChecklist = Array.isArray(Checklist) ? Checklist : [];
    const isAnySelected = safeChecklist.some((item) => item.IsChecked);
    const isAlreadySubmitted =
      quarterId !== null &&
      quarterId !== undefined &&
      quarterId !== 0 &&
      quarterId !== "";

    const hasImage = !!(isDoc || image);
    const isSubmitted = isAlreadySubmitted || !!isSubmittedLocally;

    const selected = safeChecklist.filter((item) => item.IsChecked).length;
    const hasRemark = localRemark.trim().length > 0;

    const isComplete =
      isDistanceValid && (isAnySelected || hasRemark) && hasImage;

    const toggleCheck = (id) => {
      if (!isDistanceValid || isSubmitted) return;

      const updatedList = safeChecklist.map((item) =>
        item.ChecklistId === id
          ? { ...item, IsChecked: !item.IsChecked }
          : item,
      );

      setChecklist(updatedList);
    };

    return (
      <View
        style={[
          styles.card,
          (isComplete || isSubmitted) && styles.cardCompleted,
          !isDistanceValid && !isSubmitted && { opacity: 0.6 },
        ]}
      >
        <View
          style={{
            borderLeftColor: isSubmitted || isComplete ? "#5db85b" : "red",
            borderLeftWidth: 4,
            paddingLeft: 8,
          }}
        >
          <View style={styles.locationHeader}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.progress}>
                {selected}/{safeChecklist.length} Tasks •{" "}
                {image ? "✅ Photo Captured" : "❌ No Image"}
              </Text>

              {!isSubmitted && (
                <Text
                  style={{
                    color: !isDistanceValid ? "red" : "green",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  {distance === null
                    ? "📍 Locating GPS..."
                    : isDistanceValid
                    ? `📍 Distance: ${Math.round(distance)}m (Within 100m)`
                    : `⚠️ Out of range: ${Math.round(
                        distance,
                      )}m (Must be ≤ 100m)`}
                </Text>
              )}
            </View>

            {!isSubmitted && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshLocation}
                disabled={isBusy}
              >
                <IconF name="refresh-cw" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {safeChecklist.map((item) => (
          <TouchableOpacity
            key={item.ChecklistId.toString()}
            style={styles.checkRow}
            disabled={!isDistanceValid || isSubmitted}
            onPress={() => toggleCheck(item.ChecklistId)}
          >
            <View
              style={
                Platform.OS === "ios"
                  ? {
                      borderColor: "#000",
                      borderWidth: 1,
                      borderRadius: 4,
                      marginRight: 5,
                    }
                  : {}
              }
            >
              <Checkbox
                status={item.IsChecked ? "checked" : "unchecked"}
                disabled={!isDistanceValid || isSubmitted}
              />
            </View>
            <Text style={{ flex: 1 }}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* ✅ REMARK INPUT */}
        <View style={styles.remarkContainer}>
          <Text style={styles.remarkLabel}>Remark</Text>
          <TextInput
            value={localRemark}
            onChangeText={handleRemarkChange}
            editable={isDistanceValid && !isSubmitted}
            placeholder="Enter remarks here..."
            style={styles.remarkInput}
            multiline
          />
        </View>

        {/* Upload / Download */}
        {isDoc ? (
          <TouchableOpacity
            style={[styles.imageBox, styles.imgBoxUploaded]}
            onPress={onDownload}
          >
            <Text style={[styles.uploadText, { color: "#5db85b" }]}>
              Download Image
            </Text>
            <IconF name="download" size={20} color="#5db85b" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.imageBox, image && styles.imgBoxUploaded]}
            disabled={!isDistanceValid || isSubmitted}
            onPress={onUpload}
          >
            <Text style={styles.uploadText}>
              {image ? "✅ Photo Captured" : "+ Upload Photo"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          disabled={!isDistanceValid || !isComplete || isSubmitted}
          style={[
            styles.button,
            (!isDistanceValid || !isComplete || isSubmitted) &&
              styles.buttonDisabled,
          ]}
          onPress={() => submitQuarter(index)}
        >
          <Text style={styles.buttonText}>
            {isSubmitted ? "Completed" : "Submit Quarter"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const QuarterVisit = ({ route, navigation }) => {
  const [quarterCheckLists, setQuarterCheckLists] = useState([]);
  const { base64, index, quarter, latitude, longitude } = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [quarters, setQuarters] = useState([]);
  const [quarterTemplate, setQuarterTemplate] = useState([]);

  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [isLocationError, setIsLocationError] = useState(false);
  const [latLong, setLatLong] = useState({
    latitude: "*****",
    longitude: "*****",
  });
  const [refLatLong, setRefLatLong] = useState({
    latitude: "*****",
    longitude: "*****",
  });
  const [distance, setDistance] = useState(null);
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState([]);
  const [year, setYear] = useState();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkInitialNet = async () => {
      const net = await NetInfo.fetch();
      setIsOffline(!net.isConnected);
    };
    checkInitialNet();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      if (offline) {
        setYear(new Date().getFullYear().toString());
      }
    });
    return () => unsubscribe();
  }, []);

  const updateRemark = useCallback((index, newRemark) => {
    setQuarters((prev) => {
      if (!prev[index]) return prev;

      if (prev[index].Remark === newRemark) return prev;

      const updated = [...prev];
      updated[index] = { ...updated[index], Remark: newRemark };
      return updated;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <QuarterCard
        index={index}
        distance={distance}
        quarterId={item.QuarterId}
        remark={item.Remark}
        updateRemark={updateRemark}
        title={item.Title}
        Checklist={item.Checklist}
        setChecklist={(newList) => updateChecklist(index, newList)}
        isDoc={item.IsDoc}
        image={item.Image}
        isSubmittedLocally={item.IsSubmittedLocally}
        onUpload={() => uploadImage(index)}
        onDownload={() => downloadImage(index, item)}
        refreshLocation={refreshLocation}
        isBusy={isBusy}
        submitQuarter={submitQuarter}
      />
    ),
    [quarters, distance, isBusy],
  );

  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });

  let apiUrl = "";
  let stateCode = "";
  let authToken = "";
  let number = 0;
  let farmerId = "";

  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    selectedComponent: "",
    requiredPumpType: "",
    requiredPumpsubtype: "",
  });

  const farmerdetails = async () => {
    let farmerName = await AsyncStorage.getItem("farmerName");
    let SaralId = await AsyncStorage.getItem("SaralId");
    let RequiredPumpType =
      (await AsyncStorage.getItem("RequiredPumpType")) ||
      (await AsyncStorage.getItem("requiredPumpType")) ||
      "";
    let RequiredPumpCapacity =
      (await AsyncStorage.getItem("RequiredPumpCapacity")) || "";
    let SPVCapacity = (await AsyncStorage.getItem("SPVCapacity")) || "";
    let selectedComponent =
      (await AsyncStorage.getItem("selectedComponent")) || "";
    let requiredPumpType =
      (await AsyncStorage.getItem("requiredPumpType")) ||
      (await AsyncStorage.getItem("RequiredPumpType")) ||
      "";
    let requiredPumpsubtype =
      (await AsyncStorage.getItem("requiredPumpsubtype")) ||
      (await AsyncStorage.getItem("RequiredPumpsubtype")) ||
      "";

    let installedDateStr = await AsyncStorage.getItem("InstalledDate");

    const currentFarmerId = await AsyncStorage.getItem("farmerId");
    if (
      currentFarmerId &&
      (!RequiredPumpCapacity || !requiredPumpType || !farmerName)
    ) {
      try {
        const rows = await queryAll(
          "SELECT * FROM QuarterVisitMaster WHERE FarmerId = ? LIMIT 1",
          [currentFarmerId],
        );
        if (rows && rows.length > 0) {
          const rec = rows[0];
          if (!farmerName && rec.FarmerName) farmerName = rec.FarmerName;
          if (!SaralId && rec.SaralId) SaralId = rec.SaralId;
          if (!RequiredPumpCapacity && rec.RequiredPumpCapacity)
            RequiredPumpCapacity = rec.RequiredPumpCapacity;
          if (!requiredPumpType && rec.RequiredPumpType)
            requiredPumpType = rec.RequiredPumpType;
          if (!requiredPumpsubtype && rec.RequiredPumpsubtype)
            requiredPumpsubtype = rec.RequiredPumpsubtype;
          if (!SPVCapacity && rec.SPVCapacity) SPVCapacity = rec.SPVCapacity;
          if (!installedDateStr && rec.InstalledDate)
            installedDateStr = rec.InstalledDate;
        }
      } catch (dbErr) {
        console.warn("DB Fallback Error:", dbErr);
      }
    }

    const storedLat = await AsyncStorage.getItem("RMSLatitude");
    const storedLng = await AsyncStorage.getItem("RMSLongitude");

    console.log("stored farmer details>>", storedLat, storedLng);

    if (storedLat && storedLng) {
      setRefLatLong({
        latitude: parseFloat(storedLat),
        longitude: parseFloat(storedLng),
      });
    }

    // Restore previously accepted coordinates if available (from AsyncStorage or SQLite QuarterVisitMaster)
    let prevAcceptedLat = await AsyncStorage.getItem("LastAcceptedLatitude");
    let prevAcceptedLng = await AsyncStorage.getItem("LastAcceptedLongitude");

    if (
      !prevAcceptedLat ||
      !prevAcceptedLng ||
      prevAcceptedLat === "*****" ||
      prevAcceptedLng === "*****"
    ) {
      try {
        const rows = await queryAll(
          "SELECT Latitude, Longitude FROM QuarterVisitMaster WHERE FarmerId = ? AND Latitude != '' AND Latitude IS NOT NULL ORDER BY Id DESC LIMIT 1",
          [currentFarmerId],
        );
        if (rows && rows.length > 0 && rows[0].Latitude && rows[0].Longitude) {
          prevAcceptedLat = rows[0].Latitude;
          prevAcceptedLng = rows[0].Longitude;
        }
      } catch (err) {
        console.warn("DB coordinate retrieval error:", err);
      }
    }

    if (
      prevAcceptedLat &&
      prevAcceptedLng &&
      prevAcceptedLat !== "*****" &&
      prevAcceptedLng !== "*****" &&
      !isNaN(parseFloat(prevAcceptedLat)) &&
      !isNaN(parseFloat(prevAcceptedLng))
    ) {
      const stableCoords = {
        latitude: formatCoord(prevAcceptedLat),
        longitude: formatCoord(prevAcceptedLng),
      };
      setLatLong(stableCoords);
      if (storedLat && storedLng) {
        const dist = getDistanceBetweenCoords(
          parseFloat(storedLat),
          parseFloat(storedLng),
          parseFloat(stableCoords.latitude),
          parseFloat(stableCoords.longitude),
        );
        setDistance(dist);
      }
    }

    setFarmerdata({
      ...Farmerdata,
      farmerName: farmerName,
      SaralId: SaralId,
      RequiredPumpCapacity: RequiredPumpCapacity,
      RequiredPumpType: RequiredPumpType,
      SPVCapacity: SPVCapacity,
      selectedComponent: selectedComponent,
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
    });

    const net = await NetInfo.fetch();
    const offline = !net.isConnected;
    setIsOffline(offline);

    await getYearData(installedDateStr, offline);
    setIsBusy(false);
  };

  const getYearData = async (installedDateStr, offlineOverride) => {
    const net = await NetInfo.fetch();
    const offline =
      offlineOverride !== undefined ? offlineOverride : !net.isConnected;
    setIsOffline(offline);

    const installedDate = installedDateStr
      ? new Date(installedDateStr)
      : new Date();
    const installedYear = isNaN(installedDate.getFullYear())
      ? new Date().getFullYear()
      : installedDate.getFullYear();
    const currentYearNum = new Date().getFullYear();
    const currentYearStr = currentYearNum.toString();

    // Calculate max allowed years
    const maxPossibleYears = currentYearNum - installedYear + 1;
    const totalYears = Math.min(5, maxPossibleYears);

    console.log(
      "Calculating years array from installed year:",
      maxPossibleYears,
      "to total years:",
      totalYears,
      "offline:",
      offline,
    );

    const yearsArray = Array.from({ length: totalYears }, (_, i) => {
      const y = installedYear + i;
      return { label: y.toString(), value: y.toString() };
    });

    if (
      yearsArray.length === 0 ||
      !yearsArray.some((item) => item.value === currentYearStr)
    ) {
      yearsArray.push({ label: currentYearStr, value: currentYearStr });
    }

    setYears(yearsArray);

    let selectedYear;
    if (offline) {
      // When offline, default select current year!
      selectedYear = currentYearStr;
    } else if (year !== undefined && year !== null) {
      selectedYear = year;
    } else if (yearsArray.length > 0) {
      selectedYear = yearsArray[0].value;
    } else {
      selectedYear = currentYearStr;
    }

    console.log(
      "Setting selected year:",
      selectedYear,
      "offline mode:",
      offline,
    );
    setYear(selectedYear);
    return selectedYear;
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;

    const initScreen = async () => {
      try {
        setIsBusy(true);
        console.log("Screen focused, initializing...", {
          quarter,
          index,
          base64,
          latitude,
          longitude,
        });
        await farmerdetails();

        if (
          latLong.latitude === "*****" ||
          latLong.longitude === "*****" ||
          latitude === undefined ||
          longitude === undefined
        ) {
          await fetchLocation();
        } else if (latitude !== undefined && longitude !== undefined) {
          console.log("Navigation fetch location:", { latitude, longitude });
          const currentLatLng = {
            latitude: formatCoord(latitude),
            longitude: formatCoord(longitude),
          };

          console.log("Using passed location:", currentLatLng);
          setLatLong(currentLatLng);
          setIsBusy(true);

          const storedLat = await AsyncStorage.getItem("RMSLatitude");
          const storedLng = await AsyncStorage.getItem("RMSLongitude");

          if (storedLat && storedLng) {
            setRefLatLong({
              latitude: parseFloat(storedLat),
              longitude: parseFloat(storedLng),
            });
          }

          setIsBusy(false);

          if (
            storedLat &&
            storedLng &&
            currentLatLng.latitude !== "*****" &&
            currentLatLng.longitude !== "*****"
          ) {
            console.log(
              "Calculating distance between:",
              storedLat,
              storedLng,
              currentLatLng.latitude,
              currentLatLng.longitude,
            );
            const dist = getDistanceBetweenCoords(
              parseFloat(storedLat),
              parseFloat(storedLng),
              parseFloat(currentLatLng.latitude),
              parseFloat(currentLatLng.longitude),
            );
            console.log("Calculated distance (meters):", dist);
            setDistance(dist);
          }
        }

        if (
          quarter !== undefined &&
          quarter.length > 0 &&
          index !== undefined &&
          base64 !== undefined
        ) {
          console.log("useeffect quarter >>", quarter);
          await processImageUpload(index, base64, quarter);
          setIsBusy(false);
        }

        setIsBusy(false);
      } catch (error) {
        setIsBusy(false);
        console.error("Screen init error:", error);
      } finally {
        setIsBusy(false);
      }
    };

    initScreen();
  }, [isFocused]);

  useEffect(() => {
    if (quarters.length <= 0) {
      quarterCheckList();
    }
  }, []);

  const quarterCheckList = async () => {
    setIsBusy(true);
    try {
      const net = await NetInfo.fetch();
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const authToken = await AsyncStorage.getItem("authToken");
      const installedDateStr = await AsyncStorage.getItem("InstalledDate");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : selectedComponent === "ComponentC"
          ? "c"
          : "a";

      const QUARTER_TITLES = {
        1: "Quarter 1 (January - March)",
        2: "Quarter 2 (April - June)",
        3: "Quarter 3 (July - September)",
        4: "Quarter 4 (October - December)",
      };

      let formatted = [];

      if (net.isConnected) {
        try {
          const route = `${apiUrl}api/${stateCode}/Master_Quarter/GetMasterQuarterKeyValueResult?PROJCD=${Component}`;
          const callResult = await APIHelper.Get(route, authToken);

          if (callResult.Result && callResult.Data) {
            formatted = callResult.Data.map((item) => ({
              ChecklistId: item.Key,
              label: item.Value,
              IsChecked: false,
            }));

            // Cache questions in MasterQuarterChecklist SQLite table
            await withTransaction(async (tx) => {
              for (const item of callResult.Data) {
                await tx.executeSql(
                  `INSERT OR REPLACE INTO MasterQuarterChecklist (Key, Value, Component) VALUES (?, ?, ?)`,
                  [item.Key, item.Value || "", Component],
                );
              }
            });
          }
        } catch (apiErr) {
          console.log(
            "Online checklist fetch error, loading from SQLite:",
            apiErr,
          );
        }
      }

      // If offline or API returned no data, read questions from local SQLite
      if (formatted.length === 0) {
        const offlineQuestions = await queryAll(
          "SELECT * FROM MasterQuarterChecklist",
        );
        formatted = offlineQuestions.map((item) => ({
          ChecklistId: item.Key,
          label: item.Value,
          IsChecked: false,
        }));
      }

      setQuarterCheckLists(formatted);

      const currentMonth = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      let QUARTERS_TEMPLATE = [];

      if (net.isConnected) {
        // ONLINE CASE: Display ALL 4 Quarters
        QUARTERS_TEMPLATE = Array.from({ length: 4 }, (_, i) => {
          const q = i + 1;
          return {
            QuarterId: null,
            Quarter: q,
            Title: QUARTER_TITLES[q],
            Remark: "",
            IsDoc: false,
            Image: null,
            Document: null,
            Checklist: formatted,
          };
        });
      } else {
        // OFFLINE CASE: Display ONLY SINGLE current Quarter
        QUARTERS_TEMPLATE = [
          {
            QuarterId: null,
            Quarter: currentQuarter,
            Title: QUARTER_TITLES[currentQuarter],
            Remark: "",
            IsDoc: false,
            Image: null,
            Document: null,
            Checklist: formatted,
          },
        ];
      }

      const activeYear = await getYearData(installedDateStr, !net.isConnected);

      console.log("Setting quarters template:", QUARTERS_TEMPLATE, activeYear);

      setQuarterTemplate(QUARTERS_TEMPLATE);
      setQuarters(QUARTERS_TEMPLATE);
      await getQuarterData(activeYear, QUARTERS_TEMPLATE);

      setIsBusy(false);
    } catch (error) {
      setIsBusy(false);
      console.error("Checklist fetch error:", error);
    }
  };

  const getQuarterData = async (passedYear, quartersData) => {
    try {
      const farmerId = await AsyncStorage.getItem("farmerId");
      const currentMonth = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      console.log(
        "Checking SQLite offline quarter data for farmerId:",
        farmerId,
        "quarter:",
        currentQuarter,
      );

      // Step 1: Check SQLite for offline stored visit data
      const offlineMasters = await queryAll(
        "SELECT * FROM QuarterVisitMaster WHERE FarmerId = ? AND Quarter = ?",
        [farmerId, currentQuarter],
      );

      let offlineData = null;
      if (offlineMasters && offlineMasters.length > 0) {
        const master = offlineMasters[0];
        const offlineChecklist = await queryAll(
          "SELECT * FROM QuarterVisitChecklist WHERE VisitId = ?",
          [master.Id],
        );

        const checkMap = {};
        for (const item of offlineChecklist) {
          checkMap[item.ChecklistId] = item.IsChecked === 1;
        }

        offlineData = {
          master,
          checkMap,
        };
        console.log("Found SQLite offline data:", {
          Remark: master.Remark,
          HasImage: !!master.FileString,
          ChecklistCount: offlineChecklist.length,
        });
      }

      // Step 2: Try online API if connected
      const net = await NetInfo.fetch();
      let apiQuarters = null;

      if (net.isConnected) {
        try {
          const apiUrl = await AsyncStorage.getItem("apiURL");
          const stateCode = await AsyncStorage.getItem("stateCode");
          const authToken = await AsyncStorage.getItem("authToken");
          const selectedComponent = await AsyncStorage.getItem(
            "selectedComponent",
          );
          const Component =
            selectedComponent === "ComponentB"
              ? "b"
              : selectedComponent === "ComponentC"
              ? "c"
              : "a";
          const route = `${apiUrl}api/${stateCode}/Master_Quarter/GetFarmerQuarterDetails?CId=${farmerId}&Year=${passedYear}&PROJCD=${Component}`;

          const callResult = await APIHelper.Get(route, authToken);
          if (callResult.Result) {
            apiQuarters = callResult.Data?.Quarters;
          }
        } catch (netErr) {
          console.log("Online quarter fetch error, using SQLite data:", netErr);
        }
      }

      // Step 3: Populate quarters state combining SQLite & API data
      if (quartersData && quartersData.length > 0) {
        const updatedQuarters = quartersData.map((q) => {
          // Priority 1: Local SQLite offline saved data
          if (
            offlineData &&
            Number(offlineData.master.Quarter) === Number(q.Quarter)
          ) {
            const m = offlineData.master;
            const updatedChecklist = q.Checklist.map((cl) => ({
              ...cl,
              IsChecked:
                offlineData.checkMap[cl.ChecklistId] !== undefined
                  ? offlineData.checkMap[cl.ChecklistId]
                  : cl.IsChecked ?? false,
            }));

            const hasImage = !!(m.FileString && m.FileString.length > 0);
            return {
              ...q,
              QuarterId: m.QuarterId || q.QuarterId,
              Remark:
                m.Remark !== undefined && m.Remark !== null
                  ? m.Remark
                  : q.Remark,
              IsDoc: hasImage,
              Image: hasImage
                ? "data:image/png;base64," + m.FileString
                : q.Image,
              Document: hasImage
                ? { DocName: m.DocName, DocType: m.DocType }
                : q.Document,
              Checklist: updatedChecklist,
              IsSubmittedLocally: hasImage,
            };
          }

          // Priority 2: Server API existing data
          const existingData = apiQuarters?.find(
            (d) => Number(d.Quarter) === Number(q.Quarter),
          );

          if (existingData) {
            const updatedChecklist = q.Checklist.map((cl) => {
              const existingChecklistItem = existingData.Checklists?.find(
                (ecl) => ecl.ChecklistId === cl.ChecklistId,
              );
              return existingChecklistItem
                ? { ...cl, IsChecked: existingChecklistItem.IsChecked }
                : { ...cl, IsChecked: false };
            });

            return {
              ...q,
              QuarterId: existingData.QuarterId,
              Remark: existingData.Remark || "",
              IsDoc: !!existingData.Document,
              Document: existingData.Document,
              Image: existingData.Document,
              Checklist: updatedChecklist,
            };
          }

          return q;
        });

        console.log(
          "Final updated quarters state:",
          JSON.stringify(updatedQuarters, null, 2),
        );
        setQuarters(updatedQuarters);
      }
    } catch (error) {
      console.error("Quarter data fetch error:", error);
    }
  };

  const fetchLocation = async (isManualRefresh = false) => {
    console.log("Fetching current location, isManualRefresh:", isManualRefresh);
    try {
      setIsBusy(true);

      // ------- Step 1: Permission -------
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access.",
        );
        setIsBusy(false);
        return null;
      }

      // ------- Step 2: Fetch accurate current location with stationary filter -------
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
        maximumAge: isManualRefresh ? 0 : 5000,
        timeout: 15000,
      });

      // Accuracy validation: Check if reading is valid and not obviously poor
      if (
        !current ||
        !current.coords ||
        isNaN(current.coords.latitude) ||
        isNaN(current.coords.longitude) ||
        (current.coords.accuracy !== null &&
          current.coords.accuracy !== undefined &&
          current.coords.accuracy > 100)
      ) {
        console.log(
          "❌ Poor or invalid GPS accuracy:",
          current?.coords?.accuracy,
        );
        setIsBusy(false);
        setIsLocationError(true);
        return null;
      }

      const rawLat = parseFloat(current.coords.latitude.toFixed(6));
      const rawLng = parseFloat(current.coords.longitude.toFixed(6));

      // Step 2a: Query SQLite QuarterVisitMaster table data for current farmer
      const currentFarmerId = await AsyncStorage.getItem("farmerId");
      let sqliteLat = null;
      let sqliteLng = null;

      if (currentFarmerId) {
        try {
          const currentMonth = new Date().getMonth() + 1;
          const currentQuarter = Math.ceil(currentMonth / 3);

          const rows = await queryAll(
            "SELECT Latitude, Longitude FROM QuarterVisitMaster WHERE FarmerId = ? AND Quarter = ? AND Latitude != '' AND Latitude IS NOT NULL AND Latitude != '*****' LIMIT 1",
            [currentFarmerId, currentQuarter],
          );
          if (
            rows &&
            rows.length > 0 &&
            rows[0].Latitude &&
            rows[0].Longitude
          ) {
            const dbLat = parseFloat(rows[0].Latitude);
            const dbLng = parseFloat(rows[0].Longitude);
            if (!isNaN(dbLat) && !isNaN(dbLng)) {
              sqliteLat = dbLat;
              sqliteLng = dbLng;
            }
          } else {
            const fallbackRows = await queryAll(
              "SELECT Latitude, Longitude FROM QuarterVisitMaster WHERE FarmerId = ? AND Latitude != '' AND Latitude IS NOT NULL AND Latitude != '*****' ORDER BY Id DESC LIMIT 1",
              [currentFarmerId],
            );
            if (
              fallbackRows &&
              fallbackRows.length > 0 &&
              fallbackRows[0].Latitude &&
              fallbackRows[0].Longitude
            ) {
              const dbLat = parseFloat(fallbackRows[0].Latitude);
              const dbLng = parseFloat(fallbackRows[0].Longitude);
              if (!isNaN(dbLat) && !isNaN(dbLng)) {
                sqliteLat = dbLat;
                sqliteLng = dbLng;
              }
            }
          }
        } catch (dbErr) {
          console.warn("SQLite location query error:", dbErr);
        }
      }

      // If not in SQLite yet, check AsyncStorage or component state
      if (sqliteLat === null || sqliteLng === null) {
        const savedLat = await AsyncStorage.getItem("LastAcceptedLatitude");
        const savedLng = await AsyncStorage.getItem("LastAcceptedLongitude");
        if (
          savedLat &&
          savedLng &&
          savedLat !== "*****" &&
          savedLng !== "*****" &&
          !isNaN(parseFloat(savedLat)) &&
          !isNaN(parseFloat(savedLng))
        ) {
          sqliteLat = parseFloat(savedLat);
          sqliteLng = parseFloat(savedLng);
        } else if (
          latLong.latitude !== "*****" &&
          latLong.longitude !== "*****" &&
          !isNaN(parseFloat(latLong.latitude)) &&
          !isNaN(parseFloat(latLong.longitude))
        ) {
          sqliteLat = parseFloat(latLong.latitude);
          sqliteLng = parseFloat(latLong.longitude);
        }
      }

      const hasSQLiteData = sqliteLat !== null && sqliteLng !== null;

      // Check if current quarter details/photo are locked (photo captured or submitted)
      let isRecordLocked = false;
      if (currentFarmerId) {
        try {
          const currentMonth = new Date().getMonth() + 1;
          const currentQuarter = Math.ceil(currentMonth / 3);
          const lockedRows = await queryAll(
            "SELECT Latitude, Longitude, FileString FROM QuarterVisitMaster WHERE FarmerId = ? AND Quarter = ? AND FileString IS NOT NULL AND FileString != '' LIMIT 1",
            [currentFarmerId, currentQuarter],
          );
          if (lockedRows && lockedRows.length > 0 && lockedRows[0].FileString) {
            isRecordLocked = true;
            if (lockedRows[0].Latitude && lockedRows[0].Longitude) {
              const lLat = parseFloat(lockedRows[0].Latitude);
              const lLng = parseFloat(lockedRows[0].Longitude);
              if (!isNaN(lLat) && !isNaN(lLng)) {
                sqliteLat = lLat;
                sqliteLng = lLng;
              }
            }
          }
        } catch (lErr) {
          console.warn("Check locked record error:", lErr);
        }
      }

      if (!isRecordLocked && quarters && quarters.length > 0) {
        const hasInStateCapturedPhoto = quarters.some(
          (q) => q.Image || q.IsDoc || q.IsSubmittedLocally,
        );
        if (hasInStateCapturedPhoto) {
          isRecordLocked = true;
        }
      }

      let acceptedLat = rawLat;
      let acceptedLng = rawLng;
      let acceptedLoc = {
        latitude: formatCoord(rawLat),
        longitude: formatCoord(rawLng),
      };

      if (isRecordLocked && sqliteLat !== null && sqliteLng !== null) {
        // Details locked after photo capture / submit: retain submission/photo capture time lat & long
        console.log(
          "🔒 Details are locked (photo captured / submitted). Displaying locked submission lat long:",
          sqliteLat,
          sqliteLng,
        );
        acceptedLat = sqliteLat;
        acceptedLng = sqliteLng;
        acceptedLoc = {
          latitude: formatCoord(sqliteLat),
          longitude: formatCoord(sqliteLng),
        };
        setLatLong(acceptedLoc);
      } else {
        // Satellite GPS coordinates used directly for current location
        setLatLong(acceptedLoc);

        if (hasSQLiteData) {
          // Compare current satellite GPS location with SQLite table data
          const distanceDiff = getDistanceBetweenCoords(
            sqliteLat,
            sqliteLng,
            rawLat,
            rawLng,
          );

          if (distanceDiff >= 10) {
            console.log(
              "📍 GPS difference from SQLite data is >= 10m (" +
                distanceDiff.toFixed(2) +
                "m). Updating SQLite with satellite GPS coordinates.",
            );
            await AsyncStorage.multiSet([
              ["LastAcceptedLatitude", acceptedLoc.latitude],
              ["LastAcceptedLongitude", acceptedLoc.longitude],
            ]);

            // Update SQLite record with new coordinates only when >= 10m
            if (currentFarmerId) {
              try {
                await withTransaction(async (tx) => {
                  await tx.executeSql(
                    "UPDATE QuarterVisitMaster SET Latitude = ?, Longitude = ? WHERE FarmerId = ? AND (FileString IS NULL OR FileString = '')",
                    [
                      acceptedLoc.latitude,
                      acceptedLoc.longitude,
                      currentFarmerId,
                    ],
                  );
                });
              } catch (uErr) {
                console.warn("SQLite update error on >= 10m movement:", uErr);
              }
            }
          } else {
            console.log(
              "📍 GPS difference from SQLite data is < 10m (" +
                distanceDiff.toFixed(2) +
                "m). Using satellite GPS coordinates; SQLite table not updated.",
            );
          }
        } else {
          // First valid satellite GPS reading: save to SQLite and AsyncStorage
          console.log(
            "📍 First valid satellite GPS reading accepted and saved to SQLite:",
            acceptedLoc,
          );
          await AsyncStorage.multiSet([
            ["LastAcceptedLatitude", acceptedLoc.latitude],
            ["LastAcceptedLongitude", acceptedLoc.longitude],
          ]);

          console.log("currentFarmerId", currentFarmerId);

          if (currentFarmerId) {
            try {
              await withTransaction(async (tx) => {
                await tx.executeSql(
                  "UPDATE QuarterVisitMaster SET Latitude = ?, Longitude = ? WHERE FarmerId = ? AND (FileString IS NULL OR FileString = '')",
                  [
                    acceptedLoc.latitude,
                    acceptedLoc.longitude,
                    currentFarmerId,
                  ],
                );
              });
            } catch (uErr) {
              console.warn("SQLite initial location save error:", uErr);
            }
          }
        }
      }

      // ------- Step 3: Set reference & calculate distance -------
      const storedLat = await AsyncStorage.getItem("RMSLatitude");
      const storedLng = await AsyncStorage.getItem("RMSLongitude");

      if (storedLat && storedLng) {
        setRefLatLong({
          latitude: parseFloat(storedLat),
          longitude: parseFloat(storedLng),
        });
      }

      setIsBusy(false);
      setIsLocationError(false);

      if (
        storedLat &&
        storedLng &&
        acceptedLoc.latitude !== "*****" &&
        acceptedLoc.longitude !== "*****"
      ) {
        const dist = getDistanceBetweenCoords(
          parseFloat(storedLat),
          parseFloat(storedLng),
          acceptedLat,
          acceptedLng,
        );
        console.log("Calculated distance to reference (meters):", dist);
        setDistance(dist);
      }

      return acceptedLoc;
    } catch (e) {
      console.log("❌ Location error:", e);
      setIsLocationError(true);
      return null;
    } finally {
      setIsBusy(false);
    }
  };

  const refreshLocation = async () => {
    await fetchLocation(true);
  };

  const getDistanceBetweenCoords = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log("Corrected Distance calculation:", distance);
    return distance; // meters
  };

  const updateChecklist = (index, newChecklist) => {
    const updated = [...quarters];
    updated[index].Checklist = newChecklist;

    console.log(
      "Updating Checklist for quarter index:",
      index,
      updated[index].Checklist,
    );
    setQuarters(updated);

    console.log("Updated quarters state:", updated);
  };

  const uploadImage = async (i) => {
    console.log(
      "Navigating to Imagecapture for quarter:",
      quarters,
      quarters[i]?.Remark,
    );
    let currentLat = latLong?.latitude;
    let currentLng = latLong?.longitude;

    if (
      !currentLat ||
      !currentLng ||
      currentLat === "*****" ||
      currentLng === "*****"
    ) {
      const loc = await fetchLocation();
      if (loc) {
        currentLat = loc.latitude;
        currentLng = loc.longitude;
      }
    }

    if (Farmerdata.farmerName) {
      await AsyncStorage.setItem("FarmerNameImage", Farmerdata.farmerName);
    }
    const storedFatherName =
      (await AsyncStorage.getItem("fatherName")) ||
      (await AsyncStorage.getItem("FatherNameImage")) ||
      "";
    if (storedFatherName) {
      await AsyncStorage.setItem("FatherNameImage", storedFatherName);
    }

    navigation.navigate("Imagecapture", {
      index: i,
      quarter: quarters,
      year: year,
      screen: "QuarterVisit",
      latitude: currentLat,
      longitude: currentLng,
      farmerName: Farmerdata.farmerName || "",
      fatherName: storedFatherName || "",
      showDetail: true,
    });
  };

  const processImageUpload = async (index, base64, quarterData) => {
    const uploadedImage = "data:image/png;base64," + base64;
    const updated = [...quarterData];

    // Update the specific index
    updated[index] = {
      ...updated[index],
      Image: uploadedImage,
    };

    // VERIFICATION LOG: Map the data to hide the actual Base64 string
    const debugData = updated.map((q, i) => ({
      Quarter: q.Quarter,
      Title: q.Title,
      Remark: q.Remark,
      IsCheckedCount: q.Checklist?.filter((c) => c.IsChecked).length,
      HasImage: !!q.Image,
      ImageLength: q.Image?.length || 0, // Verify size instead of content
    }));

    console.log("📊 Data Verification (No Base64):", debugData);

    setQuarters(updated);
  };

  const downloadImage = async (index, item) => {
    console.log("Downloading image for quarter index:", index, item);
    setIsBusy(true);
    try {
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const authToken = await AsyncStorage.getItem("authToken");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      // const route = `${apiUrl}api/${stateCode}/Master_Quarter/GetMasterQuarterKeyValueResult?PROJCD=${Component}`;
      const route = `${apiUrl}api/${stateCode}/Master_Quarter/DownloadByID?id=${item?.Document?.DocId}&docType=${item?.Document?.DocType}&PROJCD=${Component}`;
      const callResult = await APIHelper.Get(route, authToken);

      if (callResult.Result) {
        const img = callResult?.Data?.ImgString;
        console.log("Image>>", img);

        if (img) {
          try {
            const cleanBase64 = img.replace(/^data:image\/\w+;base64,/, "");
            const fileName = `PMKUSUM_${Date.now()}.jpg`;
            const tempUri = FileSystem.documentDirectory + fileName;
            await FileSystem.writeAsStringAsync(tempUri, cleanBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });

            if (Platform.OS === "android") {
              const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

              if (!permissions.granted) {
                setSnackbar({
                  ...snackbar,
                  showSnackbar: true,
                  snackbarText: "Permission required to save file",
                });
                return;
              }

              const newUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  fileName,
                  "image/jpeg",
                );

              await FileSystem.writeAsStringAsync(newUri, cleanBase64, {
                encoding: FileSystem.EncodingType.Base64,
              });
            } else {
              await Sharing.shareAsync(tempUri);
            }

            await FileSystem.deleteAsync(tempUri, { idempotent: true });

            setSnackbar({
              ...snackbar,
              showSnackbar: true,
              snackbarText: i18n.t("Imagedownloadedsuccessfullytocameraroll"),
            });
          } catch (err) {
            console.error("Save error:", err);
          }

          setTimeout(() => {
            setSnackbar(false);
          }, 2000);
        }
      }
      setIsBusy(false);

      console.log("Download fetched successfully:", callResult);
    } catch (error) {
      setIsBusy(false);
      console.error("Download fetch error:", error);
    }
    /* console.log("Downloading image for quarter index:", index, item);
    let fileUri = FileSystem.documentDirectory + "image.jpg";
    await FileSystem.writeAsStringAsync(fileUri, item.Uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await MediaLibrary.saveToLibraryAsync(fileUri);

    setSnackbar({
      ...snackbar,
      showSnackbar: true,
      snackbarText: i18n.t("Imagedownloadedsuccessfullytocameraroll"),
    });
    setTimeout(() => {
      setSnackbar(false);
    }, 2000); */
  };

  const submitQuarter = async (index) => {
    setIsBusy(true);
    try {
      const net = await NetInfo.fetch();
      apiUrl = await AsyncStorage.getItem("apiURL");
      stateCode = await AsyncStorage.getItem("stateCode");
      authToken = await AsyncStorage.getItem("authToken");
      farmerId = await AsyncStorage.getItem("farmerId");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : selectedComponent === "ComponentC"
          ? "c"
          : "a";

      const currentQuarter = quarters[index]?.Quarter;
      const str = (v) => (v !== undefined && v !== null ? String(v) : "");

      const imageStr = quarters[index]?.Image
        ? quarters[index].Image.replace(/^data:image\/\w+;base64,/, "")
        : "";
      const docNameStr = currentQuarter + "_" + moment().valueOf() + ".jpg";
      const remarkStr = quarters[index]?.Remark || "";

      let currentLat = latLong?.latitude;
      let currentLng = latLong?.longitude;

      if (
        !currentLat ||
        !currentLng ||
        currentLat === "*****" ||
        currentLng === "*****"
      ) {
        const fetchedLoc = await fetchLocation();
        if (fetchedLoc) {
          currentLat = fetchedLoc.latitude;
          currentLng = fetchedLoc.longitude;
        }
      }

      const storedRefLat = await AsyncStorage.getItem("RMSLatitude");
      const storedRefLng = await AsyncStorage.getItem("RMSLongitude");
      const refLat = str(refLatLong?.latitude || storedRefLat || "30.1789441");
      const refLng = str(refLatLong?.longitude || storedRefLng || "74.3416841");

      const latStr = str(currentLat || refLat);
      const lngStr = str(currentLng || refLng);
      const distStr = str(distance?.toFixed(2));

      // 1. Save data to SQLite tables (QuarterVisitMaster & QuarterVisitChecklist)
      const existingVisits = await queryAll(
        "SELECT Id FROM QuarterVisitMaster WHERE FarmerId = ? AND Quarter = ?",
        [farmerId, currentQuarter],
      );

      let visitId =
        existingVisits && existingVisits.length > 0
          ? existingVisits[0].Id
          : null;

      await withTransaction(async (tx) => {
        if (visitId) {
          await tx.executeSql(
            `UPDATE QuarterVisitMaster 
             SET Latitude = ?, Longitude = ?, DistMtr = ?, Remark = ?, DocType = 'jpg', DocName = ?, FileString = ? 
             WHERE Id = ?`,
            [latStr, lngStr, distStr, remarkStr, docNameStr, imageStr, visitId],
          );
        } else {
          const masterResult = await tx.executeSql(
            `INSERT INTO QuarterVisitMaster(
              UserId, FarmerId, FarmerName, ApplicationNo, SaralId,
              Year, Quarter, QuarterTitle, RefLatitude, RefLongitude,
              Latitude, Longitude, DistMtr, Remark, DocType,
              DocName, FileString, Component, StateCode, CreatedDate
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              "",
              farmerId,
              Farmerdata.farmerName || "",
              "",
              Farmerdata.SaralId || "",
              year ? year.toString() : new Date().getFullYear().toString(),
              currentQuarter,
              quarters[index]?.Title || `Quarter ${currentQuarter}`,
              refLat,
              refLng,
              latStr,
              lngStr,
              distStr,
              remarkStr,
              "jpg",
              docNameStr,
              imageStr,
              Component,
              stateCode || "",
              moment().format("YYYY-MM-DD HH:mm:ss"),
            ],
          );
          visitId = masterResult.lastInsertRowId;
        }

        // Save/Update checklist answers
        const checklistItems = quarters[index]?.Checklist || [];
        for (const item of checklistItems) {
          const checkRes = await tx.executeSql(
            "SELECT Id FROM QuarterVisitChecklist WHERE VisitId = ? AND ChecklistId = ?",
            [visitId, item.ChecklistId],
          );
          if (checkRes.rows && checkRes.rows.length > 0) {
            await tx.executeSql(
              "UPDATE QuarterVisitChecklist SET IsChecked = ? WHERE VisitId = ? AND ChecklistId = ?",
              [item.IsChecked ? 1 : 0, visitId, item.ChecklistId],
            );
          } else {
            await tx.executeSql(
              "INSERT INTO QuarterVisitChecklist (VisitId, ChecklistId, IsChecked) VALUES (?, ?, ?)",
              [visitId, item.ChecklistId, item.IsChecked ? 1 : 0],
            );
          }
        }
      });

      console.log(
        "Successfully saved quarter visit to SQLite, VisitId:",
        visitId,
      );
      await AsyncStorage.multiSet([
        ["LastAcceptedLatitude", latStr],
        ["LastAcceptedLongitude", lngStr],
      ]);

      // 2. If Online, attempt server API upload
      if (net.isConnected) {
        try {
          const checklistData =
            quarters[index]?.Checklist.map((item) => ({
              ChecklistId: item.ChecklistId,
              IsChecked: item.IsChecked,
            })) ?? [];

          const route = `${apiUrl}api/${stateCode}/Master_Quarter/AddQuarterChecklist?PROJCD=${Component}`;
          const payload = {
            CId: farmerId,
            Year: year,
            Quarter: currentQuarter,
            RefLatitude: refLat,
            RefLongitude: refLng,
            Latitude: latStr,
            Longitude: lngStr,
            DistMtr: distStr,
            Remark: remarkStr,
            DocType: "jpg",
            docName: docNameStr,
            Checklists: checklistData,
            File_String: imageStr,
          };

          console.log(
            "Submitting online payload:",
            JSON.stringify(payload, null, 2),
          );
          const callResult = await APIHelper.Post1(route, authToken, payload);
          console.log(
            "Quarter Submit API Response:",
            JSON.stringify(callResult, null, 2),
          );

          if (callResult.Result) {
            // Remove local offline record when online submit succeeds so it doesn't shadow server state
            if (visitId) {
              await withTransaction(async (tx) => {
                await tx.executeSql(
                  "DELETE FROM QuarterVisitChecklist WHERE VisitId = ?",
                  [visitId],
                );
                await tx.executeSql(
                  "DELETE FROM QuarterVisitMaster WHERE Id = ?",
                  [visitId],
                );
              });
            }

            setSnackbar({
              showSnackbar: true,
              snackbarText: "Quarter submitted and synced online successfully!",
            });
            setIsBusy(false);
            await getQuarterData(year, quarters);
            return;
          } else {
            console.log("Online sync failed:", callResult.Message);
            if (visitId) {
              await withTransaction(async (tx) => {
                await tx.executeSql(
                  "UPDATE QuarterVisitMaster SET FileString = NULL WHERE Id = ?",
                  [visitId],
                );
              });
            }
            Alert.alert(
              "Online Sync Failed",
              callResult.Message || "Failed to sync online",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Do not call getQuarterData here, so the user can correct the input and retry
                  },
                },
              ],
            );
            setIsBusy(false);
            return;
          }
        } catch (netErr) {
          console.log("Online sync warning, data saved in SQLite:", netErr);
        }
      }

      setSnackbar({
        showSnackbar: true,
        snackbarText: "Quarter visit saved successfully!",
      });
      setIsBusy(false);
      setQuarters((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            IsSubmittedLocally: true,
          };
        }
        return updated;
      });
    } catch (error) {
      setIsBusy(false);
      console.error("Quarter submission error:", error);
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Failed to save quarter visit: " + error.message,
      });
    }
  };

  const onYearChange = async (item) => {
    setYear(item.value);
    setQuarters(quarterTemplate);
    console.log("Year changed to:", item.value, quarters);
    await getQuarterData(item.value, quarters);
  };

  return (
    <SafeAreaView
      style={Styles.flex1}
      keyboardShouldPersistTaps="always"
      edges={["bottom"]}
    >
      {/* Farmer Basic  details */}
      <View style={{ padding: 10 }}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconF
              name="user"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconF>
            <Text style={styles.cellTextRight}>{Farmerdata.farmerName}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconM
              name="location-pin"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconM>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              Current {formatCoord(latLong?.latitude)} |{" "}
              {formatCoord(latLong?.longitude)}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconM
              name="location-pin"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconM>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              Initial {formatCoord(refLatLong?.latitude)} |{" "}
              {formatCoord(refLatLong?.longitude)}
            </Text>
          </View>
        </View>
        {/* <View style={styles.row}>
          <View style={styles.cell}>
            <IconM
              name="location-pin"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconM>
            <Text style={styles.cellTextRight}> Distance : {distance?.toFixed(2)} meters</Text>
          </View>
        </View> */}
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconA
              name="solution"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconA>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {Farmerdata.SaralId}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconMC
              name={
                Farmerdata.selectedComponent === "ComponentB"
                  ? "water-pump"
                  : "view-grid"
              }
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
              {`${
                Farmerdata.selectedComponent === "ComponentB"
                  ? Farmerdata.RequiredPumpCapacity
                  : ""
              } ${
                Farmerdata.selectedComponent === "ComponentB" ? " HP" : "KWh"
              }`}
              {` ${Farmerdata.requiredPumpType} ${Farmerdata.requiredPumpsubtype}`}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconM
              name="location-pin"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
            ></IconM>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {distance?.toFixed(2)} meters
            </Text>
          </View>
        </View>
      </View>

      {years.length > 0 && year && (
        <View style={{ padding: 10, paddingHorizontal: 20 }}>
          {/* Year Selector */}
          <Text style={{ marginBottom: 5 }}>Year</Text>
          <View pointerEvents={isOffline ? "none" : "auto"}>
            <Dropdown
              style={[
                styles.dropdown,
                isOffline && { backgroundColor: "#e9ecef", opacity: 0.6 },
              ]}
              placeholderStyle={styles.placeholder}
              selectedTextStyle={styles.selectedText}
              data={years}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Year"
              value={year}
              disable={isOffline}
              onChange={(item) => {
                if (!isOffline) {
                  onYearChange(item);
                }
              }}
            />
          </View>
        </View>
      )}

      <View style={{ flex: 1, padding: 10 }}>
        <FlatList
          data={quarters}
          keyExtractor={(item, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        />
      </View>

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

export default QuarterVisit;

const styles = StyleSheet.create({
  /* =======================
     IMAGE / GRID LAYOUT
  ======================= */
  imageContainer: {
    margin: 3,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: Colors.grayAAA,
    width: "48%",
    height: 250,
  },
  imageThumbnail: {
    height: "100%",
    width: "95%",
    marginTop: 5,
    alignSelf: "center",
  },

  /* =======================
     HEADER / TEXT
  ======================= */
  headerText: {
    color: Colors.white,
    textAlign: "center",
    backgroundColor: Colors.grayAAA,
    paddingVertical: 5,
    height: 50,
    textAlignVertical: "center",
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },

  /* =======================
     ROW / CELL / TABLE
  ======================= */
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
  cellTextRight: {
    alignSelf: "center",
    marginHorizontal: 5,
  },

  /* =======================
     DATE / ICON
  ======================= */
  dateCell: {
    marginTop: 5,
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  dateText: {
    textAlign: "center",
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  icon: {
    color: Colors.black,
    marginLeft: "auto",
    marginRight: 5,
  },

  /* =======================
     FORM / FIELD
  ======================= */
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  field: {
    flex: 1,
    marginHorizontal: 5,
  },
  fieldYear: {
    height: 36,
    borderColor: "#ccc",
    borderWidth: 1,
    width: "100%",
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  fieldText: {
    fontSize: 16,
    color: "#000",
  },
  crossIcon: {
    fontSize: 18,
    color: "red",
    marginRight: 8,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#5db85b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },

  /* =======================
     DROPDOWN
  ======================= */
  /*  dropdownRow: {
     flexDirection: "row",
     justifyContent: "space-between",
     padding: 10,
   }, */
  /* dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  }, */
  dropdown: {
    height: 35,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 6,
    fontSize: 12,
  },
  dropdownPlaceholder: {
    fontSize: 12,
    color: "#888",
  },
  dropdownSelectedText: {
    fontSize: 12,
  },

  /* =======================
     QUARTER CARD 
  ======================= */
  card: {
    // flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  cardCompleted: {
    borderColor: "#5db85b",
    borderWidth: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  progress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  /* checkLabel: {
    fontSize: 14,
  }, */
  checkDone: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  /* =======================
     IMAGE UPLOAD
  ======================= */
  imageBox: {
    marginTop: 8,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },

  imgBoxUploaded: {
    borderColor: "#5db85b",
    borderWidth: 2,
    marginTop: 8,
    height: 40,
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },

  image: {
    width: "100%",
    height: "100%",
  },
  uploadText: {
    fontSize: 12,
    color: "#f89f2e",
  },
  downloadImageTxt: {
    fontSize: 12,
    color: "#f89f2e",
    textAlign: "left",
  },

  /* =======================
  button
======================= */
  button: {
    backgroundColor: Colors.green,
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    borderColor: "#999999",
  },

  /* checkbox */
  checkboxWrapper: {
    position: "relative",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  overlayCross: {
    position: "absolute",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 19,
    backgroundColor: "#d32f2f",
    borderColor: "#d32f2f",
  },

  checkLabel: {
    flex: 1,
    fontSize: 14,
    flexWrap: "wrap",
  },

  remarkContainer: {
    marginTop: 8,
    paddingLeft: 4,
  },

  remarkLabel: {
    fontSize: 13,
    color: Colors.grayAAA,
    marginBottom: 4,
  },

  remarkInput: {
    borderWidth: 1,
    borderColor: Colors.grayAAA,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
});
