import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// SDK 54 uses CameraView
import { CameraView, useCameraPermissions } from "expo-camera";
import { Colors } from "../Styles/Colors";
import {
  MaterialCommunityIcons as IconMC,
  Ionicons as IconI,
} from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system/legacy";
import ViewShot from "react-native-view-shot";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import { queryAll } from "../db/exec";

const formatCoord = (coord) => {
  if (coord === null || coord === undefined || coord === "" || coord === "*****") {
    return "*****";
  }
  const num = parseFloat(coord);
  return isNaN(num) ? String(coord) : num.toFixed(6);
};

const Imagepicture = ({ route, navigation }) => {
  const {
    type,
    id,
    spaceID,
    screen,
    index,
    quarter,
    latitude,
    longitude,
    showDetail,
  } = route?.params || {};
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [farmerName, setFarmerName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [saralNo, setSaralNo] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [netconnection, setNetconnection] = useState(true);

  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const initializeScreen = async () => {
      setIsBusy(true);
      try {
        // Parallel Permissions & Network
        const [cameraStatus, locationStatus, net] = await Promise.all([
          requestPermission(),
          Location.requestForegroundPermissionsAsync(),
          NetInfo.fetch(),
        ]);

        if (!cameraStatus.granted) {
          Alert.alert("Permission Required", "Camera access is needed.");
          navigation.navigate(`${screen}`);
          return;
        }

        const isGPSEnabled = await checkAndEnableGPS();
        if (!isGPSEnabled || locationStatus.status !== "granted") {
          Alert.alert("Error", "GPS/Location access denied");
          return;
        }

        setNetconnection(net.isConnected);
        setTimestamp(moment().format("DD MMM YYYY HH:mm"));

        if (!net.isConnected && screen === "SiteSurvey") {
          await fetchOfflineSurveyDetails(id);
        } else {
          const [fName, fthName, sId, appNo, sCode, defaultFName, defaultFthName] = await Promise.all([
            AsyncStorage.getItem("FarmerNameImage"),
            AsyncStorage.getItem("FatherNameImage"),
            AsyncStorage.getItem("SaralId"),
            AsyncStorage.getItem("applicationNo"),
            AsyncStorage.getItem("stateCode"),
            AsyncStorage.getItem("farmerName"),
            AsyncStorage.getItem("fatherName"),
          ]);

          setFarmerName(route?.params?.farmerName || fName || defaultFName || "");
          setFatherName(route?.params?.fatherName || fthName || defaultFthName || "");
          setStateCode(sCode || "");
          setSaralNo(sCode === "HR" ? sId : appNo);
        }
      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setIsBusy(false);
      }
    };

    initializeScreen();
  }, [isFocused]);

  const fetchOfflineSurveyDetails = async (surveyId) => {
    try {
      const results = await queryAll(
        "SELECT FarmerName, FatherName, Saral_Id, Application_No FROM SiteSurveyMaster WHERE Id = ?",
        [surveyId],
      );

      if (results?.length > 0) {
        const { FarmerName, FatherName, Saral_Id, Application_No } = results[0];
        // Note: stateCode logic relies on state existing or being fetched
        const sCode = await AsyncStorage.getItem("stateCode");
        setFarmerName(FarmerName);
        setFatherName(FatherName);
        setStateCode(sCode);
        setSaralNo(sCode === "HR" ? Saral_Id : Application_No);
      }
    } catch (error) {
      console.error("Offline Fetch Error:", error);
    }
  };

  const checkAndEnableGPS = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      try {
        await Location.enableNetworkProviderAsync();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  };

  const takePic = async () => {
    if (cameraRef.current && isReady) {
      setIsBusy(true);
      try {
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
          skipProcessing: false,
          exif: true,
        });
        setPhoto(result);
      } catch (e) {
        Alert.alert("Error", "Failed to capture photo");
      } finally {
        setIsBusy(false);
      }
    }
  };

  const handleNavigation = async () => {
    setIsBusy(true);
    try {
      // Create a File instance from the URI
      const uri = await viewShotRef.current.capture();

      // Using the legacy API with the string literal fix
      const base64Screenshot = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      // Unified Navigation Logic
      const navParams = {
        base64: base64Screenshot,
        uri: photo.uri,
        type,
        spaceID,
        Id: id,
        index,
        quarter,
        latitude: formatCoord(latitude),
        longitude: formatCoord(longitude),
      };

      navigation.navigate(screen, navParams);
    } catch (e) {
      console.log("error", e);
      Alert.alert("Error", "Failed to process image");
    } finally {
      setIsBusy(false);
    }
  };

  if (photo) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "black" }}
        edges={["bottom"]}
      >
        <ViewShot
          ref={viewShotRef}
          style={styles.container}
          options={{ format: "png", quality: 0.8 }}
        >
          <Image style={styles.preview} source={{ uri: photo.uri }} resizeMode="cover" />
          {showDetail && (
            <View style={styles.overlay}>
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>Farmer: {farmerName}</Text>
                <Text style={styles.locationText}>Father: {fatherName}</Text>
                <Text style={styles.locationText}>
                  {stateCode === "HR" ? "Saral No: " : "App No: "}
                  {saralNo}
                </Text>
                <Text style={styles.locationText}>
                  Lat: {formatCoord(latitude)}, Long: {formatCoord(longitude)}
                </Text>
                <Text style={styles.locationText}>Date: {timestamp}</Text>
              </View>
            </View>
          )}
        </ViewShot>

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => setPhoto(null)}>
            <IconI name="close-circle" size={70} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNavigation}>
            <IconMC
              name="check-circle"
              size={70}
              color={Colors.primaryOrange || "orange"}
            />
          </TouchableOpacity>
        </View>

        {isBusy && <ActivityIndicator style={styles.loader} size="large" />}
      </SafeAreaView>
    );
  }

  return (
    <CameraView
      style={styles.container}
      ref={cameraRef}
      facing="back"
      mode="picture"
      onCameraReady={() => setIsReady(true)}
    >
      <View style={styles.cameraUi}>
        <TouchableOpacity style={styles.cameraButton} onPress={takePic}>
          <View style={styles.buttonInner} />
        </TouchableOpacity>
      </View>
    </CameraView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 20,
  },
  locationContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 8,
  },
  locationText: { color: "white", fontSize: 14, fontWeight: "bold" },
  cameraUi: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 30,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 10,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});

export default Imagepicture;
