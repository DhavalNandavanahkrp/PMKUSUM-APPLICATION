import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar, Title } from "react-native-paper";
import SearchableDropdown from "react-native-searchable-dropdown";
import * as APIHelper from "../Data/APIHelper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { useIsFocused } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";

const IMEIMapping = () => {
  const [isBusy, setIsBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  const [imeiList, setIMEIList] = useState({
    list: [],
    selectedIMEI: null,
  });

  const replaceIMEIOptions = [
    { id: 1, name: i18n.t("GenerateNewIMEINo") },
    { id: 2, name: i18n.t("ReplaceIMEINo") },
    { id: 3, name: i18n.t("ExchangeIMEINo") },
  ];

  const [replaceOption, setReplaceOption] = useState(replaceIMEIOptions[0]);
  const [currentIMEI, setCurrentIMEI] = useState("");
  const [newIMEI, setNewIMEI] = useState("");
  const [password, setPassword] = useState(false);

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

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await farmerdetails();
      setIsBusy(true);
      const authToken = await AsyncStorage.getItem("authToken");
      const imeiNo = await AsyncStorage.getItem("imeiNo");
      if (imeiNo && imeiNo.length > 0) {
        setCurrentIMEI(imeiNo);
      } else {
        const items = await fetchIMEIList();
        const convert = items.map((i) => {
          return { id: i, name: i };
        });
        setIMEIList({ ...imeiList, list: convert, selectedIMEI: null });
      }

      setIsBusy(false);
    })();
  }, [isFocused]);

  const fetchIMEIList = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    const number = selectedComponentRoute === "b" ? 2 : 3;
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
    const farmerId = await AsyncStorage.getItem("farmerId");
    const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/GetUnMappedIMEI?Component=${number}&CID=${farmerId}&PROJCD=${Component}`;
    let rowItems = [];
    const callResult = await APIHelper.Get(route, authToken);
    if (callResult.Result) {
      rowItems = callResult.Data;
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText:
          i18n.t("FailedtofetchunmappedIMEIs") + callResult.Result.Message,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
    setIsBusy(false);
    return rowItems;
  };

  const fetchDeviceList = async (type) => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
    const department = await AsyncStorage.getItem("departmentId");
    const route = `${apiUrl}api/${stateCode}/SSLCert/GetDeviceRegistrationList?comp=${selectedComponentRoute}&department=${department}&PROJCD=${Component}`;
    const callResult = await APIHelper.Get1(route, authToken);
    let filteredList = [];
    if (callResult.Result) {
      const data = callResult.Data.map((item) => {
        return {
          id: item.imei,
          name: item.imei,
          location: item.location,
        };
      });

      if (type === 2) {
        filteredList = data.filter((item) => {
          return item.location === "";
        });
      } else {
        filteredList = data.filter((item) => {
          return item.location !== "";
        });
      }
    }
    setIsBusy(false);
    return filteredList;
  };

  const mapIMEI = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    const number = selectedComponentRoute === "b" ? 2 : 3;
    const farmerId = await AsyncStorage.getItem("farmerId");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
    if (newIMEI.length !== 15 && replaceOption.id === 1) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("InvalidIMEI"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
      setIsBusy(false);
      return;
    }
    const departmetId = await AsyncStorage.getItem("departmentId");
    const payload = {
      CID: farmerId,
      Component: number,
      Old_Mapped_IMEI: currentIMEI,
      New_IMEI_To_Map: replaceOption.id !== 1 ? newIMEI : "",
      IsNewImeiGenerate: replaceOption.id === 1,
      IsExchangeIMEI: replaceOption.id === 3,
      New_imei_GenerateDetails: {
        imei: replaceOption.id === 1 ? newIMEI : "",
        solution:
          replaceOption.id === 1
            ? number === 2
              ? "standalonesolarpump"
              : "gridconnectedsolarpump"
            : "",
        department: departmetId,
        isencrypted: replaceIMEIOptions.id === 1,
        ispwd: password,
      },
    };

    let route = "";
    if (currentIMEI === "") {
      route = `${apiUrl}api/${stateCode}/ConsumerMonitering/MapIMEIToConsumer?Imei=${newIMEI}&CID=${farmerId}&Component=${number}&PROJCD=${Component}`;
    } else {
      route = `${apiUrl}api/${stateCode}/SSLCert/Replaceimei?PROJCD='${Component}'`;
    }
    const callResult = await APIHelper.Post1(route, authToken, payload);

    if (callResult.Result) {
      Alert.alert(i18n.t("IMEIMapping"), i18n.t("IMEIMappingSuccessful"), [
        {
          text: i18n.t("OK"),
          onPress: async () => {
            setIsBusy(false);
            setCurrentIMEI(newIMEI);
            await AsyncStorage.setItem("imeiNo", newIMEI);
            return;
          },
        },
      ]);
    } else {
      setIsBusy(false);
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("FailedtomapIMEI") + callResult.Message,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
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
              {`${Farmerdata.selectedComponent === "ComponentB"
                ? Farmerdata.RequiredPumpCapacity
                : ""
                } ${Farmerdata.selectedComponent === "ComponentB" ? " HP" : "KWh"
                }`}
              {` ${Farmerdata.requiredPumpType} ${Farmerdata.requiredPumpsubtype}`}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ marginHorizontal: "2%", flex: 1 }}>
        <Title style={{ textAlign: "center" }}>{i18n.t("CurrentIMEINo")}</Title>
        {currentIMEI.length > 0 ? (
          <Text style={styles.imeiText}>{currentIMEI}</Text>
        ) : (
          <Text style={styles.imeiText}>---</Text>
        )}

        {currentIMEI ? (
          <View>
            <Title>{i18n.t("ReplaceIMEIBy")}</Title>
            <SearchableDropdown
              defaultIndex={"0"}
              onItemSelect={async (item) => {
                setReplaceOption(item);
                if (item.id !== 1) {
                  setIMEIList({
                    ...imeiList,
                    list: [],
                    selectedIMEI: null,
                  });
                  setPassword(false);
                  const filteredList = await fetchDeviceList(item.id);
                  setIMEIList({
                    ...imeiList,
                    list: filteredList,
                  });
                }
              }}
              itemStyle={{
                padding: 5,
              }}
              itemTextStyle={{ color: Colors.graytone }}
              itemsContainerStyle={{
                maxHeight: 150,
                borderWidth: 1,
                borderColor: Colors.graytone,
              }}
              items={replaceIMEIOptions}
              resetValue={false}
              textInputProps={{
                placeholder: `${i18n.t("ReplaceIMEIBy")}`,
                underlineColorAndroid: "transparent",
                style: {
                  padding: 5,
                  borderWidth: 1,
                  borderColor: Colors.graytone,
                },
              }}
              listProps={{
                nestedScrollEnabled: true,
              }}
              selectedItems={replaceOption}
            />
          </View>
        ) : null}

        {!currentIMEI || replaceOption.id === 2 || replaceOption.id === 3 ? (
          <View>
            <Title>{i18n.t("IMEIList")}</Title>
            <SearchableDropdown
              onItemSelect={async (item) => {
                setNewIMEI(item.id);
                setIMEIList({ ...imeiList, selectedIMEI: item });
              }}
              itemStyle={{
                padding: 5,
              }}
              itemTextStyle={{ color: Colors.graytone }}
              itemsContainerStyle={{
                maxHeight: 150,
                borderWidth: 1,
                borderColor: Colors.graytone,
              }}
              items={imeiList.list}
              resetValue={false}
              textInputProps={{
                placeholder: `${i18n.t("IMEIs")}`,
                underlineColorAndroid: "transparent",
                style: {
                  padding: 5,
                  borderWidth: 1,
                  borderColor: Colors.graytone,
                },
              }}
              listProps={{
                nestedScrollEnabled: true,
              }}
              selectedItems={imeiList.selectedIMEI}
            />
          </View>
        ) : null}

        {currentIMEI && replaceOption.id === 1 ? (
          <View>
            <View
              style={{
                marginVertical: 20,
                flexDirection: "row",
              }}
            >
              <Text style={{ textAlignVertical: "center" }}>
                {i18n.t("NewIMEINo")}
              </Text>
              <TextInput
                maxLength={15}
                keyboardType="number-pad"
                style={[styles.textInput, { marginLeft: 10 }]}
                onChangeText={(val) => {
                  setNewIMEI(val);
                }}
                value={newIMEI}
              ></TextInput>
            </View>
          </View>
        ) : null}
        {currentIMEI && replaceOption.id === 1 ? (
          <TouchableOpacity
            onPress={() => setPassword(!password)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon
              name={password ? "checkbox-marked-outline" : "checkbox-blank-outline"}
              size={25}
              color={Colors.black}
            />
            <Text style={{ marginLeft: 8 }}>
              {i18n.t("Is Password?")}
            </Text>
          </TouchableOpacity>
        ) : null}
        <Button
          icon={() => (
            <IconM name="compare-arrows" size={24} color={Colors.graytone} />
          )}
          mode="outlined"
          color={Colors.graytone}
          style={[Styles.saveButton, { margin: "2%" }]}
          onPress={() => mapIMEI()}
        >
          {i18n.t("Map")}
        </Button>
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

export default IMEIMapping;

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
  headerContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderTopLeftRadius: 10,
  },
  imeiText: {
    textAlign: "center",
    marginVertical: 5,
    fontWeight: "bold",
    color: Colors.green,
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
