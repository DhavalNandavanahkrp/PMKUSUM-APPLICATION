import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { Asset } from "expo-asset";
import { Snackbar } from "react-native-paper";
import * as APIHelper from "../Data/APIHelper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as FileSystem from "expo-file-system/legacy";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
const addImage = Asset.fromModule(require("../assets/AddImage.png")).uri;

const InstallationCommission = ({ route, navigation }) => {
  const { type, base64 } = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [images, setImages] = useState([]);

  const [isLocationError, setIsLocationError] = useState(false);
  const [latLong, setLatLong] = useState({
    latitude: "*****",
    longitude: "*****",
  });

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
    const farmerName = await AsyncStorage.getItem("farmerName");
    const SaralId = await AsyncStorage.getItem("SaralId");
    const RequiredPumpType = await AsyncStorage.getItem("RequiredPumpType");
    const RequiredPumpCapacity = await AsyncStorage.getItem(
      "RequiredPumpCapacity",
    );
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const requiredPumpType = await AsyncStorage.getItem("requiredPumpType");
    const requiredPumpsubtype = await AsyncStorage.getItem(
      "requiredPumpsubtype",
    );

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
  };

  const processImageUpload = async (type, base64) => {
    setIsBusy(true);
    apiUrl = await AsyncStorage.getItem("apiURL");
    stateCode = await AsyncStorage.getItem("stateCode");
    authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    number = selectedComponentRoute === "b" ? 2 : 3;
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    farmerId = await AsyncStorage.getItem("farmerId");

    console.log("Doc name>>>", type + "_" + moment().valueOf() + ".jpg");
    const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/Moblie_AddInsurancePolicyNoAndDoc?CID=${farmerId}&Component=${number}&PROJCD=${Component}`;
    const payload = {
      docspreffid: 30,
      docName: type + "_" + moment().valueOf() + ".jpg",
      version: "1",
      EnumValue: 1,
      DocType:
        type === "Foundation"
          ? 7
          : type === "Structure"
          ? 8
          : type === "PV System & Controller/Inverter"
          ? 9
          : 11,
      File_String: base64,
    };
    const headers = {
      Authorization: authToken,
    };
    const response = await axios.post(route, payload, {
      headers,
      maxBodyLength: 2000000,
    });
    setIsBusy(false);
    if (response.data.Flag) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("Imageuploadedsuccessfully"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
      const newdocument = {
        Uri: "data:image/png;base64," + payload.File_String,
        Name: payload.docName,
        Type: payload.DocType,
      };
      setImages((images) => [...images, newdocument]);
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: response.data.Message,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      setIsBusy(true);

      if (isFocused === true) {
        await farmerdetails();
        setIsBusy(true);
        if (base64 !== undefined) {
          await processImageUpload(type, base64);
        }
        setIsBusy(true);
        setImages([]);
        apiUrl = await AsyncStorage.getItem("apiURL");
        stateCode = await AsyncStorage.getItem("stateCode");
        authToken = await AsyncStorage.getItem("authToken");
        const selectedComponentRoute = await AsyncStorage.getItem(
          "farmerComponent",
        );
        number = selectedComponentRoute === "b" ? 2 : 3;
        farmerId = await AsyncStorage.getItem("farmerId");
        const appNo = await AsyncStorage.getItem("applicationNo");
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";

        // console.log('useeffect >>*****', latLong.latitude, latLong.longitude);
        if (latLong.latitude == "*****" || latLong.longitude == "*****") {
          fetchLocation();
        }

        // foundation
        let route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=30&DocTypeId=7&PROJCD=${Component}`;
        let callResult = await APIHelper.Get(route, authToken);
        if (callResult.Result) {
          if (callResult.Data.length !== 0) {
            callResult.Data.sort(
              (a, b) => Date.parse(b.CreatedOn) - Date.parse(a.CreatedOn),
            );
          }
          const foundationImage = {
            Type: "Foundation",
            Date:
              callResult.Data.length !== 0
                ? moment(callResult.Data[0].CreatedOn).format("DD/MM/YYYY")
                : "",
            ImagePresent: callResult.Data.length !== 0,
            Uri:
              callResult.Data.length !== 0
                ? callResult.Data[0].ImgString
                : addImage,
          };
          setImages((images) => [...images, foundationImage]);
        } else {
          const foundationImage = {
            Type: "Foundation",
            Date: "",
            ImagePresent: false,
            Uri: addImage,
          };
          setImages((images) => [...images, foundationImage]);
        }

        // Structure
        route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=30&DocTypeId=8&PROJCD=${Component}`;
        callResult = await APIHelper.Get(route, authToken);
        if (callResult.Result) {
          if (callResult.Data.length !== 0) {
            callResult.Data.sort(
              (a, b) => Date.parse(b.CreatedOn) - Date.parse(a.CreatedOn),
            );
          }

          const structureImage = {
            Type: "Structure",
            Date:
              callResult.Data.length !== 0
                ? moment(callResult.Data[0].CreatedOn).format("DD/MM/YYYY")
                : "",
            ImagePresent: callResult.Data.length !== 0,
            Uri:
              callResult.Data.length !== 0
                ? callResult.Data[0].ImgString
                : addImage,
          };
          setImages((images) => [...images, structureImage]);
        } else {
          const structureImage = {
            Type: "Structure",
            Date: "",
            ImagePresent: false,
            Uri: addImage,
          };
          setImages((images) => [...images, structureImage]);
        }

        // PV System & Controller/Inverter
        route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=30&DocTypeId=9&PROJCD=${Component}`;
        callResult = await APIHelper.Get(route, authToken);
        if (callResult.Result) {
          if (callResult.Data.length !== 0) {
            callResult.Data.sort(
              (a, b) => Date.parse(b.CreatedOn) - Date.parse(a.CreatedOn),
            );
          }

          const controllerImage = {
            Type: "PV System & Controller/Inverter",
            Date:
              callResult.Data.length !== 0
                ? moment(callResult.Data[0].CreatedOn).format("DD/MM/YYYY")
                : "",
            ImagePresent: callResult.Data.length !== 0,
            Uri:
              callResult.Data.length !== 0
                ? callResult.Data[0].ImgString
                : addImage,
          };
          setImages((images) => [...images, controllerImage]);
        } else {
          const controllerImage = {
            Type: "PV System & Controller/Inverter",
            Date: "",
            ImagePresent: false,
            Uri: addImage,
          };
          setImages((images) => [...images, controllerImage]);
        }

        // I&C Done
        route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=30&DocTypeId=11&PROJCD=${Component}`;
        callResult = await APIHelper.Get(route, authToken);
        if (callResult.Result) {
          if (callResult.Data.length !== 0) {
            callResult.Data.sort(
              (a, b) => Date.parse(b.CreatedOn) - Date.parse(a.CreatedOn),
            );
          }
          const icdoneImage = {
            Type: "I&C Done",
            Date:
              callResult.Data.length !== 0
                ? moment(callResult.Data[0].CreatedOn).format("DD/MM/YYYY")
                : "",
            ImagePresent: callResult.Data.length !== 0,
            Uri:
              callResult.Data.length !== 0
                ? callResult.Data[0].ImgString
                : addImage,
          };
          setImages((images) => [...images, icdoneImage]);
        } else {
          const icdoneImage = {
            Type: "I&C Done",
            Date: "",
            ImagePresent: false,
            Uri: addImage,
          };
          setImages((images) => [...images, icdoneImage]);
        }
      }
      setIsBusy(false);
    })();
  }, [isFocused]);

  const fetchLocation = async () => {
    setIsBusy(true);
    try {
      // Request foreground location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission not granted",
          "Allow the app to use location service.",
          [{ text: "OK" }],
          { cancelable: false },
        );
        setIsBusy(false);
        return;
      }

      let { coords } = await Location.getCurrentPositionAsync();

      if (coords) {
        setLatLong({
          ...latLong,
          longitude: coords.longitude.toFixed(6),
          latitude: coords.latitude.toFixed(6),
        });
        setIsLocationError(false);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert(
        "Error fetching location",
        "Unable to fetch current location.",
        [{ text: "OK" }],
        { cancelable: false },
      );
    } finally {
      setIsBusy(false);
    }
  };

  const saveImage = async (base64String) => {
    try {
      const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");

      const fileName = `PMKUSUM_${Date.now()}.jpg`;
      const tempUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(tempUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          alert("Permission required");
          return;
        }

        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "image/jpeg",
        );

        await FileSystem.writeAsStringAsync(newUri, cleanBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        alert("Image saved to device!");
      } else {
        await Sharing.shareAsync(tempUri);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save image.");
    }
  };
  const downloadImage = async (item) => {
    let fileUri = FileSystem.documentDirectory + "image.jpg";

    await saveImage(item.Uri);

    setSnackbar({
      ...snackbar,
      showSnackbar: true,
      snackbarText: i18n.t("Imagedownloadedsuccessfullytocameraroll"),
    });
    setTimeout(() => {
      setSnackbar(false);
    }, 2000);
  };

  const uploadImage = async (type) => {
    navigation.navigate("Imagecapture", {
      type: type,
      screen: "InstallationCommission",
      latitude: latLong.latitude,
      longitude: latLong.longitude,
      showDetail: true,
    });
  };

  const renderSection = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Text style={styles.headerText}>{item.Type}</Text>

      <View style={styles.innerContainer}>
        <TouchableOpacity
          style={{ height: "85%", width: "100%" }}
          onPress={() => {
            if (item.ImagePresent) downloadImage(item);
            else uploadImage(item.Type);
          }}
        >
          <Image
            style={styles.imageThumbnail}
            source={{
              uri: item.ImagePresent
                ? "data:image/png;base64," + item.Uri
                : item.Uri,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
          }}
        >
          {item.ImagePresent && <Text style={styles.date}>{item.Date}</Text>}
          {item.ImagePresent && (
            <IconMC
              name="camera-outline"
              size={Platform.OS === "ios" ? 35 : 30}
              color={Colors.graytone}
              style={styles.icon}
              onPress={() => {
                uploadImage(item.Type);
              }}
            ></IconMC>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      {/* Farmer Basic  details */}
      <View style={{ margin: 10 }}>
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
        </View>
      </View>

      <FlatList
        listKey="images"
        data={images}
        renderItem={renderSection}
        numColumns={2}
        keyExtractor={(item, index) => index}
        style={{ marginTop: 10 }}
      />
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

export default InstallationCommission;

const styles = StyleSheet.create({
  imageContainer: {
    margin: 3,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "#aaa",
    width: "48%",
    height: 250,
    borderColor: Colors.grayAAA,
  },
  headerText: {
    color: Colors.white,
    textAlign: "center",
    backgroundColor: Colors.grayAAA,
    paddingVertical: 5,
    textAlignVertical: "center",
    height: 50,
  },
  imageThumbnail: {
    height: "100%",
    width: "95%",
    marginTop: 5,
    alignSelf: "center",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  date: {
    textAlign: "center",
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  icon: {
    color: Colors.black,
    justifyContent: "flex-start",
    marginLeft: "auto",
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
  cellTextRight: {
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 5,
  },
});
