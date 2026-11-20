import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar, Button } from "react-native-paper";
import * as APIHelper from "../Data/APIHelper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as FileSystem from "expo-file-system/legacy";
import { TouchableOpacity } from "react-native-gesture-handler";
import ImageView from "react-native-image-viewing";
import axios from "axios";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import * as IntentLauncher from "expo-intent-launcher";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

const JCRdocument = ({ route, navigation }) => {
  const { base64 } = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState({
    show: false,
    index: -1,
  });
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [insurance, setInsurance] = useState({
    insuranceNo: "",
    documents: [],
  });
  const [searched, setSearched] = useState(false);
  const [limitOver, setLimitOver] = useState(false);
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

  const processImageUpload = async (base64) => {
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
    const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/Moblie_Upload_SiteInspection_Report?CID=${farmerId}&Component=${number}&PROJCD=${Component}`;
    const payload = {
      docspreffid: farmerId,
      docName: "JCRdocument_" + moment().valueOf() + ".jpg",
      version: "0",
      DocType: 13,
      EnumValue: 0,
      docspid: 30,
      File_String: base64,
    };
    const headers = {
      Authorization: authToken,
    };
    // const response = await APIHelper.Post(route, authToken, payload);
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
      const currentDocuments = insurance.documents;
      const newdocument = {
        Uri: payload.File_String,
        Name: payload.docName,
      };
      const newDocuments = currentDocuments.concat(newdocument);
      setInsurance({ ...insurance, documents: newDocuments.reverse() });
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
    let abortController = new AbortController();
    (async () => {
      if (isFocused === true) {
        await farmerdetails();
        setIsBusy(true);
        apiUrl = await AsyncStorage.getItem("apiURL");
        stateCode = await AsyncStorage.getItem("stateCode");
        authToken = await AsyncStorage.getItem("authToken");
        const selectedComponentRoute = await AsyncStorage.getItem(
          "farmerComponent",
        );
        number = selectedComponentRoute === "b" ? 2 : 3;
        farmerId = await AsyncStorage.getItem("farmerId");
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        const appNo = await AsyncStorage.getItem("applicationNo");
        const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&DocTypeId=13&SpaceId=30&PROJCD=${Component}`;
        const callResult2 = await APIHelper.Get(route, authToken);
        let insuranceNumber = "";
        if (callResult2.Result) {
          if (callResult2.Data.length === 0) {
            setLimitOver(true);
            setIsBusy(false);
          } else if (callResult2.Data.length > 0) {
            insuranceNumber = callResult2.Data[0].InsuranceNo;
            var list = callResult2.Data.map((d) => {
              return { Uri: d.ImgString, Name: d.DocName };
            });
            setInsurance({
              ...insurance,
              insuranceNo: insuranceNumber,
              documents: list,
            });
          }
          setSearched(true);
          setIsBusy(false);
        } else {
          setSnackbar({
            ...snackbar,
            showSnackbar: true,
            snackbarText: callResult2.Message,
          });
        }
        if (base64 !== undefined) {
          await processImageUpload(base64);
        }

        setIsBusy(false);
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [isFocused]);

  const renderDocument = ({ item, index }) => {
    const fileName = item.Name;
    const fileExtension = fileName.split(".").pop();
    return (
      <>
        {fileExtension === "pdf" ? (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              key={index}
              onPress={() => {
                setShowImageViewer({ show: true, index: index });
              }}
            >
              <Image
                style={styles.image}
                source={{
                  uri: "data:image/jpg;base64," + item.Uri,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={[styles.itemNameCell, { flexDirection: "row" }]}>
              <Text style={{ flex: 1, color: Colors.black }}>{item.Name}</Text>
              <IconF
                name="download"
                color={Colors.black}
                size={35}
                onPress={() => pdfview(item)}
              ></IconF>
            </View>
          </View>
        ) : (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              key={index}
              onPress={() => {
                setShowImageViewer({ show: true, index: index });
              }}
            >
              <Image
                style={styles.image}
                source={{
                  uri: "data:image/jpg;base64," + item.Uri,
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={[styles.itemNameCell, { flexDirection: "row" }]}>
              <Text style={{ flex: 1, color: Colors.black }}>{item.Name}</Text>
              <IconF
                name="download"
                color={Colors.black}
                size={35}
                onPress={() => downloadImage(item)}
              ></IconF>
            </View>
          </View>
        )}
      </>
    );
  };

  const emptyComponent = () => {
    return (
      <View>
        <Text
          style={{
            fontWeight: "bold",
            textAlign: "center",
            color: Colors.graytone,
          }}
        >
          {isBusy ? "Please wait.." : i18n.t("NoDocuments")}
        </Text>
      </View>
    ); 
  };

  const saveImage = async (base64String) => {
    try {
      const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");

      const fileName = `PMKUSUM_${Date.now()}.jpg`;
      const tempFileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(tempFileUri, cleanBase64, {
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
        await Sharing.shareAsync(tempFileUri);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save image.");
    }
  };
  const downloadImage = async (item) => {
    console.log("Download Image", item.Uri.slice(0, 50));

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

  const pdfview = async (item) => {
    // Create a directory for the PDF file
    const filePath = FileSystem.documentDirectory + item.Name;
    const pdfbase64 = item.Uri;
    await FileSystem.writeAsStringAsync(filePath, pdfbase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Open the PDF file using Expo's Linking
    const url = await FileSystem.getContentUriAsync(filePath);
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: url,
      flags: 1,
      type: "application/pdf",
    });
  };

  const uploadImage = async () => {
    navigation.navigate("Imagecapture", {
      screen: "JCRdocument",
      showDetail: true,
    });
  };

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
                  : Farmerdata.SPVCapacity
              } ${
                Farmerdata.selectedComponent === "ComponentB" ? " HP" : " KWh"
              } ${Farmerdata.requiredPumpType} ${
                Farmerdata.requiredPumpsubtype
              }`}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ marginHorizontal: "2%", flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={{ fontWeight: "bold" }}>{i18n.t("JCRdocument")}</Text>
        </View>
        <FlatList
          removeClippedSubviews={false}
          style={{ marginVertical: 10 }}
          contentContainerStyle={{ flexGrow: 1 }}
          data={insurance.documents}
          renderItem={renderDocument}
          //keyExtractor={(item, index) => index}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          ListEmptyComponent={emptyComponent}
        />
        {limitOver && (
          <Button
            icon={() => (
              <IconMC name="camera-outline" size={24} color={Colors.graytone} />
            )}
            mode="outlined"
            color={Colors.graytone}
            style={[Styles.saveButton]}
            onPress={uploadImage}
          >
            {i18n.t("UploadJCRdocument")}
          </Button>
        )}
        <View>
          <ImageView
            images={insurance.documents.map((item) => {
              return { uri: "data:image/jpg;base64," + item.Uri };
            })}
            keyExtractor={(item, index) => index}
            imageIndex={showImageViewer.index}
            visible={showImageViewer.show}
            animationType="slide"
            presentationStyle="formSheet"
            HeaderComponent={(item) => {
              return (
                <View style={styles.headerContainer}>
                  <Text style={{ textAlign: "center", fontWeight: "bold" }}>
                    {insurance.documents[item.imageIndex].Name}
                  </Text>
                </View>
              );
            }}
            onRequestClose={() =>
              setShowImageViewer({ show: false, index: -1 })
            }
          />
        </View>
      </KeyboardAvoidingView>

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

export default JCRdocument;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    color: Colors.graytone,
    borderBottomColor: Colors.graytone,
    borderBottomWidth: 1,
    marginLeft: 5,
    fontSize: 16,
    paddingBottom: 3,
    fontFamily: "roboto-regular",
  },
  bottomButton: {
    position: "absolute",
    bottom: 10,
    left: 5,
    right: 5,
  },
  icon: {
    marginRight: 5,
    alignSelf: "center",
    color: "#fff",
  },
  sectionContainer: {
    marginHorizontal: "3%",
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    borderBottomEndRadius: 10,
    borderTopLeftRadius: 10,
  },
  imeiText: {
    textAlign: "center",
    marginVertical: 5,
    fontWeight: "bold",
    color: Colors.green,
  },
  dialogRow: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  row: {
    flexDirection: "column",
    minHeight: 40,
    borderColor: Colors.grayAAA,
    borderWidth: 1,
    flex: 1,
  },
  nameCell: {
    width: "55%",
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.cellBackground,
    marginVertical: 1,
    paddingVertical: 5,
  },
  dateCell: {
    width: "30%",
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  iconCell: {
    width: "15%",
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  closeButton: {
    marginVertical: 10,
    color: Colors.primaryOrange,
    borderColor: Colors.black,
    borderWidth: 1.5,
  },
  itemContainer: {
    flexDirection: "column",
    flex: 1,
    borderColor: "#BDBDBD",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  itemNameCell: {
    justifyContent: "center",
    flexWrap: "wrap",
    margin: 1,
  },
  image: {
    width: "auto",
    height: 120,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  headerContainer: {
    backgroundColor: Colors.cellBackground,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
    alignSelf: "center",
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
