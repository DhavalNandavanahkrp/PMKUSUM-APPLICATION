import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Share,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Snackbar, RadioButton, Checkbox } from "react-native-paper";
import ModalSelector from "react-native-modal-selector";
import moment from "moment";
import axios from "axios";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
  FontAwesome5 as IconFA5,
  EvilIcons as IconE,
  Ionicons as IconI,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import * as APIHelper from "../Data/APIHelper";
import { useIsFocused } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { queryAll } from "../db/exec";
import { withTransaction } from "../db/transaction";

let apiUrl,
  stateCode,
  District,
  stateId,
  number,
  authToken,
  applicationNo,
  deptName,
  PROJCD;

const SiteSurvey = ({ route, navigation }) => {
  const { Id, sanctionId } = route?.params || {};
  let params = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [isLocationError, setIsLocationError] = useState(false);
  const [isSurveyDone, setIsSurveyDone] = useState(false);
  const [isSiteSurvey, setIsSiteSurvey] = useState(false);
  const [isPumpUpdate, setIsPumpUpdate] = useState(false);
  const [latLong, setLatLong] = useState({
    latitude: "*****",
    longitude: "*****",
  });
  const [data, setData] = useState([]);
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [netconnection, setNetconnection] = useState("");
  const [photographss, setPhotographss] = useState({
    Site: 0,
    Conset: 0,
    Proof: 0,
    FarmPond: 0,
    LandDoc: 0,
    SurveyReport: 0,
    IrrigationImages: 0,
  });
  const [images, setImages] = useState([]);
  const [consentImages, setConsentImages] = useState([]);
  const [proofImages, setProofImages] = useState([]);
  const [farmPondImages, setFarmPondImages] = useState([]);
  const [landDocImages, setLandDocImages] = useState([]);
  const [siteSurveyImages, setSiteSurveyImages] = useState([]);
  const [irrigationImages, setIrrigationImages] = useState([]);
  const [towncallResult, setTowncallResult] = useState([]);
  const [pdfdata, setpdfdata] = useState([]);
  const [checkboxStatus, setCheckboxStatus] = useState(false);
  const [PumpCategoryhide, setPumpCategoryHide] = useState(false);
  const [selectedTown, setselectedTown] = useState(false);
  const [disableDistrict, setDisableDistrict] = useState(true);
  const [contributiondata, setContributiondata] = useState({
    Comp: "",
    Pump_Type: "",
    Pump_Capacity: 0,
    Pump_Category: "",
    Pump_Subcategory: "",
    SanctionId: 0,
    ControllerType: "",
    Contribution: 0,
  });
  const [payment, setPayment] = useState({
    Payment: "Zero",
    Total: 0,
  });
  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  let SanctionId = contributiondata.SanctionId;

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          borderColor: "#BDBDBD",
          borderLeftWidth: 2,
          borderRightWidth: 2,
        }}
      >
        {(!PumpCategoryhide && item.FieldName === "PumpCategory") ||
        item.FieldName !== "PumpCategory" ? (
          <View style={styles.itemNameCell}>
            <Text>{item.Name}</Text>
          </View>
        ) : null}
        <View
          style={{
            flex: 1.2,
            paddingVertical: 5,
            paddingHorizontal: 5,
            justifyContent: "center",
            borderBottomColor: "#BDBDBD",
            borderBottomWidth: 2,
          }}
        >
          {item.FieldType === "String" ? (
            item.IsEditing ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignSelf: "center",
                  alignItems: "center",
                }}
              >
                <TextInput
                  editable={isBusy ? false : true}
                  key={item.FieldName}
                  numberOfLines={item.FieldName == "SiteSurvey_Remark" ? 5 : 1}
                  style={[
                    Styles.textInput,
                    {
                      borderBottomColor: Colors.grayAAA,
                      borderBottomWidth: 1.5,
                    },
                  ]}
                  onChangeText={(value) => {
                    const copyData = [...data];
                    const newItem = {
                      ...copyData[index],
                      Response: value,
                    };
                    copyData.splice(index, 1, newItem);
                    setData(copyData);
                  }}
                >
                  {item.Response}
                </TextInput>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }} key={item.FieldName}>
                <Text style={{ flex: 1 }}>{item.Response}</Text>
              </View>
            )
          ) : item.FieldType === "Boolean" ? (
            <View style={{ flexDirection: "row", marginLeft: -12 }}>
              <RadioButton
                disabled={item.IsEditing ? true : false && isBusy}
                color={Colors.green}
                uncheckedColor={Colors.grayAAA}
                value="Yes"
                status={item.Response === "Yes" ? "checked" : "unchecked"}
                onPress={() => {
                  const copyData = [...data];
                  const newItem = {
                    ...copyData[index],
                    Response: "Yes",
                  };
                  copyData.splice(index, 1, newItem);
                  setData(copyData);
                }}
              />
              <Text style={{ textAlignVertical: "center" }}>
                {i18n.t("Yes")}
              </Text>
              <RadioButton
                disabled={item.IsEditing ? true : false && isBusy}
                color={Colors.green}
                uncheckedColor={Colors.grayAAA}
                value="No"
                status={item.Response === "No" ? "checked" : "unchecked"}
                onPress={() => {
                  const copyData = [...data];
                  const newItem = {
                    ...copyData[index],
                    Response: "No",
                  };
                  copyData.splice(index, 1, newItem);
                  setData(copyData);
                }}
              />
              <Text style={{ textAlignVertical: "center" }}>
                {i18n.t("No")}
              </Text>
            </View>
          ) : item.FieldType === "Number" ? (
            <View style={{ flexDirection: "row" }}>
              {item.IsEditing ? (
                <TextInput
                  style={[
                    Styles.textInput,
                    { textAlign: "right", paddingRight: 5 },
                  ]}
                  editable={isBusy ? false : true}
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    const copyData = [...data];
                    const newItem = {
                      ...copyData[index],
                      Response: value,
                    };
                    copyData.splice(index, 1, newItem);
                    setData(copyData);
                  }}
                >
                  {item.Response}
                </TextInput>
              ) : (
                <Text>
                  <Text
                    style={{ flex: 1, textAlign: "right", paddingRight: 5 }}
                  >
                    {item.Response}
                  </Text>
                </Text>
              )}
            </View>
          ) : item.FieldType === "DropDown" ? (
            (!PumpCategoryhide && item.FieldName === "PumpCategory") ||
            item.FieldName !== "PumpCategory" ? (
              item.IsEditing ? (
                item.FieldName === "Location_District" &&
                item.Response !== "" ? (
                  <View style={{ flexDirection: "row" }}>
                    <ModalSelector
                      disabled={true}
                      animationType="fade"
                      initValueTextStyle={{
                        color: Colors.black,
                      }}
                      style={styles.picker}
                      selectedKey={item.Response}
                      data={item.DropdownValues}
                      keyExtractor={(item) => item.key}
                      labelExtractor={(item) => item.val}
                      initValue="Select"
                      onChange={async (option) => {
                        console.log("select 1", item);
                        const net = await NetInfo.fetch();
                        if (!net.isConnected) {
                          fetchofflinedropdown(item, option, index);
                        } else {
                          fetchonlinedropdown(item, option, index);
                        }
                      }}
                    />
                  </View>
                ) : (
                  <View style={{ flexDirection: "row" }}>
                    <ModalSelector
                      disabled={!item.IsEditing || isBusy}
                      animationType="fade"
                      initValueTextStyle={{
                        color: Colors.black,
                      }}
                      style={styles.picker}
                      selectedKey={item.Response}
                      data={item.DropdownValues}
                      keyExtractor={(item) => item.key}
                      labelExtractor={(item) => item.val}
                      initValue="Select"
                      onChange={async (option) => {
                        console.log("item 2", item);
                        if (
                          !option ||
                          !("key" in option) ||
                          !("val" in option)
                        ) {
                          console.log("Invalid option object");
                          return;
                        }
                        const net = await NetInfo.fetch();
                        if (!net.isConnected) {
                          fetchofflinedropdown(item, option, index);
                        } else {
                          fetchonlinedropdown(item, option, index);
                        }
                      }}
                    />
                  </View>
                )
              ) : item.FieldName === "Underwaterstressarea" ? (
                <View style={{ flexDirection: "row" }} key={item.FieldName}>
                  <Text style={{ flex: 1 }}>
                    {item.Response === "true" ? "Yes" : "No"}
                  </Text>
                </View>
              ) : item.FieldName === "IrrigationMode" ? (
                <View style={{ flexDirection: "row" }} key={item.FieldName}>
                  <Text style={{ flex: 1 }}>
                    {item.Response === "1" ? "Micro Irrigation" : item.Response}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row" }}>
                  <ModalSelector
                    disabled={!item.IsEditing || isBusy}
                    animationType="fade"
                    initValueTextStyle={{
                      color: Colors.black,
                    }}
                    style={styles.picker}
                    selectedKey={item.Response}
                    data={item.DropdownValues}
                    keyExtractor={(item) => item.key}
                    labelExtractor={(item) => item.val}
                    initValue="Select"
                    onChange={async (option) => {
                      console.log("item 3", item);
                      const net = await NetInfo.fetch();
                      if (!net.isConnected) {
                        fetchofflinedropdown(item, option, index);
                      } else {
                        fetchonlinedropdown(item, option, index);
                      }
                    }}
                  />
                </View>
              )
            ) : null
          ) : (
            <Text>
              {item.Response} {item.FieldType} {item.FieldName} {item.IsEditing}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const fetchonlinedropdown = async (item, option, index) => {
    let Underwaterstressarea = selectedTown;
    if (item.FieldName === "Location_District" && item.Response === "") {
      const talukaMatches = data.filter(
        (item) => item.FieldName === "Location_Taluka",
      );
      const townMatches = data.filter(
        (item) => item.FieldName === "Location_Town",
      );
      const BlockMatches = data.filter(
        (item) => item.FieldName === "Location_Block",
      );
      if (talukaMatches && talukaMatches.length > 0) {
        const lastIndex =
          talukaMatches[0].DropdownAPI.lastIndexOf("District_Code");
        let str = talukaMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        talukaMatches[0].DropdownAPI =
          str +
          "District_Code" +
          "=" +
          option.key +
          "&" +
          `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${talukaMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          talukaMatches[0].DropdownValues = callResult1.Data.map((element) => {
            return { key: element.Key, val: element.Value };
          });
          townMatches[0].DropdownValues = [];
          townMatches[0].DropdownValues = [];
          BlockMatches[0].DropdownValues = [];
          const copyData = [...data];
          var matchIndexTaluka = data.findIndex(
            (d) => d.FieldName === "Location_Taluka",
          );
          var matchIndexTown = data.findIndex(
            (d) => d.FieldName === "Location_Town",
          );
          var matchIndexBlock = data.findIndex(
            (d) => d.FieldName === "Location_Block",
          );
          const newTaluka = {
            ...copyData[matchIndexTaluka],
            DropdownValues: talukaMatches[0].DropdownValues,
          };
          const newTown = {
            ...copyData[matchIndexTown],
            DropdownValues: townMatches[0].DropdownValues,
          };
          const newBlock = {
            ...copyData[matchIndexBlock],
            DropdownValues: BlockMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexTaluka, 1, newTaluka);
          copyData.splice(matchIndexTown, 1, newTown);
          copyData.splice(matchIndexBlock, 1, newBlock);
          setData(copyData);
        }
      }
    }

    if (item.FieldName === "Location_Taluka") {
      const distrcitMatches = data.filter(
        (item) => item.FieldName === "Location_District",
      );
      const townMatches = data.filter(
        (item) => item.FieldName === "Location_Town",
      );
      if (townMatches && townMatches.length > 0) {
        const lastTalukaIndex =
          townMatches[0].DropdownAPI.lastIndexOf("Taluka_Code");
        const talukaText = townMatches[0].DropdownAPI.substr(lastTalukaIndex);
        const talukasubstr = townMatches[0].DropdownAPI.substr(
          0,
          lastTalukaIndex,
        );
        const districtStr = talukasubstr.substr(
          0,
          talukasubstr.lastIndexOf("="),
        );
        const district = districtStr + "=" + distrcitMatches[0].Response;
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        townMatches[0].DropdownAPI =
          district +
          "&" +
          "Taluka_Code" +
          "=" +
          option.key +
          "&" +
          `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${townMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          townMatches[0].DropdownValues = callResult1.Data.map((element) => {
            return { key: element.Key, val: element.Value };
          });
          const copyData = [...data];
          var matchIndex = data.findIndex(
            (d) => d.FieldName === "Location_Town",
          );
          const newItem = {
            ...copyData[matchIndex],
            DropdownValues: townMatches[0].DropdownValues,
          };
          copyData.splice(matchIndex, 1, newItem);
          setData(copyData);
        }
      }
    }

    if (item.FieldName === "Location_Town") {
      const BlockMatches = data.filter(
        (item) => item.FieldName === "Location_Block",
      );
      const distrcitMatches = data.filter(
        (item) => item.FieldName === "Location_District",
      );
      if (BlockMatches && BlockMatches.length > 0) {
        const lastTalukaIndex = BlockMatches[0].DropdownAPI.lastIndexOf("=");
        const blockText = BlockMatches[0].DropdownAPI.substr(lastTalukaIndex);
        const blocksubstr = BlockMatches[0].DropdownAPI.substr(
          0,
          lastTalukaIndex + 16,
        );
        const districtStr = blocksubstr.substr(0, blocksubstr.lastIndexOf("="));
        const district = districtStr + "=" + distrcitMatches[0].Response;
        const route1 = `${apiUrl}api/${stateCode}/${district}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          BlockMatches[0].DropdownValues = callResult1.Data.map((element) => {
            return { key: element.Key, val: element.Value };
          });
          const copyData = [...data];
          var matchIndex = data.findIndex(
            (d) => d.FieldName === "Location_Block",
          );
          const newItem = {
            ...copyData[matchIndex],
            DropdownValues: BlockMatches[0].DropdownValues,
          };
          copyData.splice(matchIndex, 1, newItem);
          setData(copyData);
        }
      }
      // Underwater
      const distrcitdata = data.find(
        (item) => item.FieldName === "Location_District",
      );
      const Talukadata = data.find(
        (item) => item.FieldName === "Location_Taluka",
      );
      const townroute = `${apiUrl}api/${stateCode}/Town/GetList?State_Code=${stateId}&District_Code=${distrcitdata.Response}&Taluka_Code=${Talukadata.Response}&PROJCD=b`;
      const TowncallResult = await APIHelper.Get(townroute, authToken);
      const selectedTownlist = TowncallResult.Data.find(
        (item) => option.key === item.Key,
      );
      Underwaterstressarea = selectedTownlist.Underwaterstressarea;
      setselectedTown(selectedTownlist.Underwaterstressarea);
    }

    if (stateCode === "KA" && item.FieldName === "DISCOMCode") {
      const ZoneMatches = data.filter((item) => item.FieldName === "Zone");
      const CircleMatches = data.filter((item) => item.FieldName === "Circle");
      const DivisionMatches = data.filter(
        (item) => item.FieldName === "Division",
      );
      const SubDivisionMatches = data.filter(
        (item) => item.FieldName === "Sub_Division",
      );
      const SubStationMatches = data.filter(
        (item) => item.FieldName === "SubStation",
      );
      if (ZoneMatches && ZoneMatches.length > 0) {
        const lastIndex = ZoneMatches[0].DropdownAPI.lastIndexOf("RegionId");
        let str = ZoneMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        ZoneMatches[0].DropdownAPI =
          str + "RegionId" + "=" + option.key + "&" + `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${ZoneMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          ZoneMatches[0].DropdownValues = callResult1.Data.map((element) => {
            return { key: element.Key, val: element.Value };
          });
          CircleMatches[0].DropdownValues = [];
          DivisionMatches[0].DropdownValues = [];
          SubDivisionMatches[0].DropdownValues = [];
          SubStationMatches[0].DropdownValues = [];
          const copyData = [...data];
          var matchIndexZone = data.findIndex((d) => d.FieldName === "Zone");
          var matchIndexCircle = data.findIndex(
            (d) => d.FieldName === "Circle",
          );
          var matchIndexDivision = data.findIndex(
            (d) => d.FieldName === "Division",
          );
          var matchIndexSubDivision = data.findIndex(
            (d) => d.FieldName === "Sub_Division",
          );
          var matchIndexSubStation = data.findIndex(
            (d) => d.FieldName === "SubStation",
          );
          const newZone = {
            ...copyData[matchIndexZone],
            DropdownValues: ZoneMatches[0].DropdownValues,
          };
          const newCircle = {
            ...copyData[matchIndexCircle],
            DropdownValues: CircleMatches[0].DropdownValues,
          };
          const newDivision = {
            ...copyData[matchIndexDivision],
            DropdownValues: DivisionMatches[0].DropdownValues,
          };
          const newSubDivision = {
            ...copyData[matchIndexSubDivision],
            DropdownValues: SubDivisionMatches[0].DropdownValues,
          };
          const newSubStation = {
            ...copyData[matchIndexSubStation],
            DropdownValues: SubStationMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexZone, 1, newZone);
          copyData.splice(matchIndexCircle, 1, newCircle);
          copyData.splice(matchIndexDivision, 1, newDivision);
          copyData.splice(matchIndexSubDivision, 1, newSubDivision);
          copyData.splice(matchIndexSubStation, 1, newSubStation);

          setData(copyData);
        }
      }
    }

    if (stateCode === "KA" && item.FieldName === "Zone") {
      const CircleMatches = data.filter((item) => item.FieldName === "Circle");
      const DivisionMatches = data.filter(
        (item) => item.FieldName === "Division",
      );
      const SubDivisionMatches = data.filter(
        (item) => item.FieldName === "Sub_Division",
      );
      const SubStationMatches = data.filter(
        (item) => item.FieldName === "SubStation",
      );
      if (CircleMatches && CircleMatches.length > 0) {
        const lastIndex = CircleMatches[0].DropdownAPI.lastIndexOf("ZoneId");
        let str = CircleMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        CircleMatches[0].DropdownAPI =
          str + "ZoneId" + "=" + option.key + "&" + `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${CircleMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          CircleMatches[0].DropdownValues = callResult1.Data.map((element) => {
            return { key: element.Key, val: element.Value };
          });
          DivisionMatches[0].DropdownValues = [];
          SubDivisionMatches[0].DropdownValues = [];
          SubStationMatches[0].DropdownValues = [];
          const copyData = [...data];
          var matchIndexCircle = data.findIndex(
            (d) => d.FieldName === "Circle",
          );
          var matchIndexDivision = data.findIndex(
            (d) => d.FieldName === "Division",
          );
          var matchIndexSubDivision = data.findIndex(
            (d) => d.FieldName === "Sub_Division",
          );
          var matchIndexSubStation = data.findIndex(
            (d) => d.FieldName === "SubStation",
          );
          const newCircle = {
            ...copyData[matchIndexCircle],
            DropdownValues: CircleMatches[0].DropdownValues,
          };
          const newDivision = {
            ...copyData[matchIndexDivision],
            DropdownValues: DivisionMatches[0].DropdownValues,
          };
          const newSubDivision = {
            ...copyData[matchIndexSubDivision],
            DropdownValues: SubDivisionMatches[0].DropdownValues,
          };
          const newSubStation = {
            ...copyData[matchIndexSubStation],
            DropdownValues: SubStationMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexCircle, 1, newCircle);
          copyData.splice(matchIndexDivision, 1, newDivision);
          copyData.splice(matchIndexSubDivision, 1, newSubDivision);
          copyData.splice(matchIndexSubStation, 1, newSubStation);
          setData(copyData);
        }
      }
    }

    if (stateCode === "KA" && item.FieldName === "Circle") {
      const DivisionMatches = data.filter(
        (item) => item.FieldName === "Division",
      );
      const SubDivisionMatches = data.filter(
        (item) => item.FieldName === "Sub_Division",
      );
      const SubStationMatches = data.filter(
        (item) => item.FieldName === "SubStation",
      );
      if (DivisionMatches && DivisionMatches.length > 0) {
        const lastIndex =
          DivisionMatches[0].DropdownAPI.lastIndexOf("CircleId");
        let str = DivisionMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        DivisionMatches[0].DropdownAPI =
          str + "CircleId" + "=" + option.key + "&" + `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${DivisionMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          DivisionMatches[0].DropdownValues = callResult1.Data.map(
            (element) => {
              return { key: element.Key, val: element.Value };
            },
          );
          SubDivisionMatches[0].DropdownValues = [];
          SubStationMatches[0].DropdownValues = [];
          const copyData = [...data];
          var matchIndexDivision = data.findIndex(
            (d) => d.FieldName === "Division",
          );
          var matchIndexSubDivision = data.findIndex(
            (d) => d.FieldName === "Sub_Division",
          );
          var matchIndexSubStation = data.findIndex(
            (d) => d.FieldName === "SubStation",
          );
          const newDivision = {
            ...copyData[matchIndexDivision],
            DropdownValues: DivisionMatches[0].DropdownValues,
          };
          const newSubDivision = {
            ...copyData[matchIndexSubDivision],
            DropdownValues: SubDivisionMatches[0].DropdownValues,
          };
          const newSubStation = {
            ...copyData[matchIndexSubStation],
            DropdownValues: SubStationMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexDivision, 1, newDivision);
          copyData.splice(matchIndexSubDivision, 1, newSubDivision);
          copyData.splice(matchIndexSubStation, 1, newSubStation);
          setData(copyData);
        }
      }
    }

    if (stateCode === "KA" && item.FieldName === "Division") {
      const SubDivisionMatches = data.filter(
        (item) => item.FieldName === "Sub_Division",
      );
      const SubStationMatches = data.filter(
        (item) => item.FieldName === "SubStation",
      );
      if (SubDivisionMatches && SubDivisionMatches.length > 0) {
        const lastIndex =
          SubDivisionMatches[0].DropdownAPI.lastIndexOf("DivisionId");
        let str = SubDivisionMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        SubDivisionMatches[0].DropdownAPI =
          str + "DivisionId" + "=" + option.key + "&" + `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${SubDivisionMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          SubDivisionMatches[0].DropdownValues = callResult1.Data.map(
            (element) => {
              return { key: element.Key, val: element.Value };
            },
          );
          SubStationMatches[0].DropdownValues = [];
          const copyData = [...data];
          var matchIndexSubDivision = data.findIndex(
            (d) => d.FieldName === "Sub_Division",
          );
          var matchIndexSubStation = data.findIndex(
            (d) => d.FieldName === "SubStation",
          );
          const newSubDivision = {
            ...copyData[matchIndexSubDivision],
            DropdownValues: SubDivisionMatches[0].DropdownValues,
          };
          const newSubStation = {
            ...copyData[matchIndexSubStation],
            DropdownValues: SubStationMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexSubDivision, 1, newSubDivision);
          copyData.splice(matchIndexSubStation, 1, newSubStation);
          setData(copyData);
        }
      }
    }

    if (stateCode === "KA" && item.FieldName === "Sub_Division") {
      const SubStationMatches = data.filter(
        (item) => item.FieldName === "SubStation",
      );
      if (SubStationMatches && SubStationMatches.length > 0) {
        const lastIndex =
          SubStationMatches[0].DropdownAPI.lastIndexOf("div_Id");
        let str = SubStationMatches[0].DropdownAPI.substr(0, lastIndex);
        const selectedComponent = await AsyncStorage.getItem(
          "selectedComponent",
        );
        const Component =
          selectedComponent === "ComponentB"
            ? "b"
            : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";
        SubStationMatches[0].DropdownAPI =
          str + "div_Id" + "=" + option.key + "&" + `PROJCD=${Component}`;
        const route1 = `${apiUrl}api/${stateCode}/${SubStationMatches[0].DropdownAPI}`;
        const callResult1 = await APIHelper.Get(route1, authToken);
        if (callResult1.Result) {
          SubStationMatches[0].DropdownValues = callResult1.Data.map(
            (element) => {
              return { key: element.Key, val: element.Value };
            },
          );
          const copyData = [...data];
          var matchIndexSubStation = data.findIndex(
            (d) => d.FieldName === "SubStation",
          );
          const newSubStation = {
            ...copyData[matchIndexSubStation],
            DropdownValues: SubStationMatches[0].DropdownValues,
          };
          copyData.splice(matchIndexSubStation, 1, newSubStation);
          setData(copyData);
        }
      }
    }
    if (item.FieldName === "RequiredPumpsubtype" && option.key === "Surface") {
      setPumpCategoryHide(true);
    } else if (
      item.FieldName === "RequiredPumpsubtype" &&
      option.key === "Submersible"
    ) {
      setPumpCategoryHide(false);
    }

    // store newly selected value
    const copyData = [...data];

    /* let filter = data.filter(
      (element) => element.FieldName === "Underwaterstressarea"
    ); */

    if (Underwaterstressarea) {
      var IrrigationIndex = data.findIndex(
        (d) => d.FieldName === "IrrigationMode",
      );
      var underwaterIndex = data.findIndex(
        (d) => d.FieldName === "Underwaterstressarea",
      );
      const newIrrigationMode = {
        ...copyData[IrrigationIndex],
        Response: "Micro Irrigation",
        IsEditing: false,
      };
      const newUnderwaterstressarea = {
        ...copyData[underwaterIndex],
        Response: "true",
        IsEditing: false,
      };
      const newItem = {
        ...copyData[index],
        Response: option.key,
      };
      copyData.splice(index, 1, newItem);
      copyData.splice(IrrigationIndex, 1, newIrrigationMode);
      copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
      setData(copyData);
    } else {
      var IrrigationIndex = data.findIndex(
        (d) => d.FieldName === "IrrigationMode",
      );
      var Irrigationdata = data.find((d) => d.FieldName === "IrrigationMode");
      /* var underwaterIndex = data.findIndex(
        (d) => d.FieldName === "Underwaterstressarea"
      ); */

      let newIrrigationMode = {
        ...copyData[IrrigationIndex],
        Response: "1",
        IsEditing: true,
      };
      /* let newUnderwaterstressarea = {
        ...copyData[underwaterIndex],
        Response: "false",
      }; */

      let newItem = {
        ...copyData[index],
        Response: option.key,
      };

      if (item.FieldName === "IrrigationMode") {
        (newItem = {
          ...copyData[index],
          Response: option.key,
        }),
          (newIrrigationMode = {
            ...copyData[IrrigationIndex],
            Response: option.key,
            IsEditing: true,
          });
      } else {
        (newItem = {
          ...copyData[index],
          Response: option.key,
        }),
          (newIrrigationMode = {
            ...copyData[IrrigationIndex],
            Response: Irrigationdata.Response,
            IsEditing: true,
          });
      }
      /* item.FieldName === "IrrigationMode" ? (
        newItem = {
          ...copyData[index],
          Response: option.key,
        },
        newIrrigationMode = {
          ...copyData[IrrigationIndex],
          Response: option.key,
          IsEditing: true,
        }
      ) : (
        newItem = {
          ...copyData[index],
          Response: option.key,
        },
        newIrrigationMode = {
          ...copyData[IrrigationIndex],
          Response: Irrigationdata.Response,
          IsEditing: true,
        }
      ) */

      copyData.splice(index, 1, newItem);
      copyData.splice(IrrigationIndex, 1, newIrrigationMode);
      // copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);

      if (item.FieldName === "RequiredPumpType") {
        contribution(copyData);
      }
      if (item.FieldName === "RequiredPumpCapacity") {
        contribution(copyData);
      }
      if (item.FieldName === "RequiredPumpsubtype") {
        contribution(copyData);
      }
      if (item.FieldName === "PumpCategory") {
        contribution(copyData);
      }
      if (item.FieldName === "TypeofControllerForPump") {
        contribution(copyData);
      }

      setData(copyData);
    }

    setIsBusy(false);
  };

  const fetchofflinedropdown = async (item, option, index) => {
    let Underwaterstressarea = selectedTown;
    //store newly selected value
    const copyData = [...data];
    const newItem = {
      ...copyData[index],
      Response: option.key,
    };
    copyData.splice(index, 1, newItem);

    const distrcitMatches = copyData.filter(
      (element) => element.FieldName === "Location_District",
    );
    const selecteddcode = distrcitMatches[0].Response;

    const talukaMatches = copyData.filter(
      (element) => element.FieldName === "Location_Taluka",
    );

    const townMatches = copyData.filter(
      (element) => element.FieldName === "Location_Town",
    );

    const blockMatches = copyData.filter(
      (element) => element.FieldName === "Location_Block",
    );

    let regionMatches,
      zoneMatches,
      circleMatches,
      divisionMatches,
      subDivisionMatches,
      subStationMatches;
    if (stateCode === "KA" || stateCode === "KL" || stateCode === "TS") {
      regionMatches = copyData.filter(
        (element) =>
          element.FieldName === "DISCOMCode" || element.FieldName === "DISCOM",
      );
      zoneMatches = copyData.filter((element) => element.FieldName === "Zone");
      circleMatches = copyData.filter(
        (element) => element.FieldName === "Circle",
      );
      divisionMatches = copyData.filter(
        (element) => element.FieldName === "Division",
      );
      subDivisionMatches = copyData.filter(
        (element) => element.FieldName === "Sub_Division",
      );
      subStationMatches = copyData.filter(
        (element) => element.FieldName === "SubStation",
      );
    }

    let rowItems = [];
    if (item.FieldName === "Location_District") {
      try {
        const results = await queryAll(
          "SELECT * FROM Talukalist WHERE State_Code = ? AND District_Code = ?",
          [stateId, option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          talukaMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Failed to fetch Taluka list:", error);
        Alert.alert(
          "Taluka list",
          "Unable to fetch Taluka list. Please try again.",
        );
      }
    } else if (item.FieldName === "Location_Taluka") {
      try {
        const results = await queryAll(
          "SELECT * FROM Townlist WHERE State_Code = ? AND District_Code = ? AND Taluka_Code = ?",
          [stateId, selecteddcode, option.key],
        );
        setTowncallResult(results);

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          townMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Townlist:", error);
      }
    } else if (item.FieldName === "Location_Town") {
      const selectedTownlist = towncallResult.find(
        (item) => option.key === item.Key,
      );
      Underwaterstressarea = selectedTownlist.Underwaterstressarea;
      setselectedTown(selectedTownlist.Underwaterstressarea);
      if (Underwaterstressarea === "true") {
        var IrrigationIndex = data.findIndex(
          (d) => d.FieldName === "IrrigationMode",
        );
        var underwaterIndex = data.findIndex(
          (d) => d.FieldName === "Underwaterstressarea",
        );
        const newIrrigationMode = {
          ...copyData[IrrigationIndex],
          Response: "Micro Irrigation",
          IsEditing: false,
        };
        const newUnderwaterstressarea = {
          ...copyData[underwaterIndex],
          Response: "true",
        };
        const newItem = {
          ...copyData[index],
          Response: option.key,
        };
        copyData.splice(index, 1, newItem);
        copyData.splice(IrrigationIndex, 1, newIrrigationMode);
        copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
        /* 
                const newUnderwaterstressarea = {
                    ...copyData[underwaterIndex],
                    IsEditing: "false",
                  };
                  copyData.splice(underwaterIndex, 1, newUnderwaterstressarea); */
        setData(copyData);
      } else {
        var IrrigationIndex = data.findIndex(
          (d) => d.FieldName === "IrrigationMode",
        );
        var Irrigationdata = data.find((d) => d.FieldName === "IrrigationMode");
        /*  var underwaterIndex = data.findIndex(
           (d) => d.FieldName === "Underwaterstressarea"
         ); */
        let newIrrigationMode = {
          ...copyData[IrrigationIndex],
          Response: "1",
          IsEditing: true,
        };
        /* const newUnderwaterstressarea = {
          ...copyData[underwaterIndex],
          Response: "false",
        }; */
        /* let newItem = {}
        item.FieldName === "IrrigationMode" ? (
          newItem = {
            ...copyData[index],
            Response: option.key,
          },
          newIrrigationMode = {
            ...copyData[IrrigationIndex],
            Response: option.key,
            IsEditing: true,
          }
        ) : (
          newItem = {
            ...copyData[index],
            Response: option.key,
          },
          newIrrigationMode = {
            ...copyData[IrrigationIndex],
            Response: Irrigationdata.Response,
            IsEditing: true,
          }
        ) */

        let newItem = {
          ...copyData[index],
          Response: option.key,
        };

        if (item.FieldName === "IrrigationMode") {
          (newItem = {
            ...copyData[index],
            Response: option.key,
          }),
            (newIrrigationMode = {
              ...copyData[IrrigationIndex],
              Response: option.key,
              IsEditing: true,
            });
        } else {
          (newItem = {
            ...copyData[index],
            Response: option.key,
          }),
            (newIrrigationMode = {
              ...copyData[IrrigationIndex],
              Response: Irrigationdata.Response,
              IsEditing: true,
            });
        }

        copyData.splice(index, 1, newItem);
        copyData.splice(IrrigationIndex, 1, newIrrigationMode);
        // copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);

        if (
          item.FieldName === "RequiredPumpsubtype" &&
          option.key === "Surface"
        ) {
          setPumpCategoryHide(true);
        } else if (
          item.FieldName === "RequiredPumpsubtype" &&
          option.key === "Submersible"
        ) {
          setPumpCategoryHide(false);
        }
        if (item.FieldName === "RequiredPumpType") {
          contribution(copyData);
        }
        if (item.FieldName === "RequiredPumpCapacity") {
          contribution(copyData);
        }
        if (item.FieldName === "RequiredPumpsubtype") {
          contribution(copyData);
        }
        if (item.FieldName === "PumpCategory") {
          contribution(copyData);
        }
        if (item.FieldName === "TypeofControllerForPump") {
          contribution(copyData);
        }

        /* if (underwaterIndex) {
          const newUnderwaterstressarea = {
            ...copyData[underwaterIndex],
            IsEditing: "false",
          };
          copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
        } */

        setData(copyData);
      }

      try {
        const results = await queryAll(
          "SELECT * FROM BlockList WHERE State_Code = ? AND Taluka_Code = ?",
          [stateId, option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          blockMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching BlockList:", error);
      }
    } else if (stateCode === "KA" && item.FieldName === "DISCOMCode") {
      try {
        const results = await queryAll(
          "SELECT * FROM Zonelist WHERE Discom_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          zoneMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Zonelist:", error);
      }
    } else if (stateCode === "KA" && item.FieldName === "Zone") {
      try {
        const results = await queryAll(
          "SELECT * FROM Circlelist WHERE Zone_Id = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          circleMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Circlelist:", error);
      }
    } else if (stateCode === "KA" && item.FieldName === "Circle") {
      try {
        const results = await queryAll(
          "SELECT * FROM Divisionlist WHERE Circle_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          divisionMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Divisionlist:", error);
      }
    } else if (stateCode === "KA" && item.FieldName === "Division") {
      try {
        const results = await queryAll(
          "SELECT * FROM SUBDivisionlist WHERE Div_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          subDivisionMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching SUBDivisionlist:", error);
      }
    } else if (stateCode === "KA" && item.FieldName === "Sub_Division") {
      try {
        const results = await queryAll(
          "SELECT * FROM SUBStationlist WHERE SUBDivision_Id = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          subStationMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Substations:", error);
      }
    } else if (
      (stateCode === "KL" || stateCode === "TS") &&
      (item.FieldName === "DISCOM" || item.FieldName === "DISCOMCode")
    ) {
      try {
        const results = await queryAll(
          "SELECT * FROM Circlelist WHERE Discom_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          circleMatches[0].DropdownValues = vals;
          divisionMatches[0].DropdownValues = [];
          subDivisionMatches[0].DropdownValues = [];

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Circlelist:", error);
      }
    } else if (
      (stateCode === "KL" || stateCode === "TS") &&
      item.FieldName === "Circle"
    ) {
      try {
        const results = await queryAll(
          "SELECT * FROM Divisionlist WHERE Circle_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          divisionMatches[0].DropdownValues = vals;
          subDivisionMatches[0].DropdownValues = [];

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching Divisionlist:", error);
      }
    } else if (
      (stateCode === "KL" || stateCode === "TS") &&
      item.FieldName === "Division"
    ) {
      try {
        const results = await queryAll(
          "SELECT * FROM SUBDivisionlist WHERE Div_Code = ?",
          [option.key],
        );

        if (results && results.length > 0) {
          const vals = results.map((e) => ({
            key: e.Key,
            val: e.Value,
          }));

          subDivisionMatches[0].DropdownValues = vals;

          setData([...copyData]);
        }
      } catch (error) {
        console.error("Error fetching SUBDivisionlist:", error);
      }
    } else {
      if (underwaterIndex) {
        const newUnderwaterstressarea = {
          ...copyData[underwaterIndex],
          IsEditing: "false",
        };
        copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
      }
      setData(copyData);
      /* if (item.FieldName === "RequiredPumpsubtype" && option.key === "Surface") {
        setPumpCategoryHide(true)
      } 
      else if (item.FieldName === "RequiredPumpsubtype" && option.key === "Submersible") {
         setPumpCategoryHide(false) 
      }
      if (item.FieldName === "RequiredPumpType") { contribution(copyData) }
      if (item.FieldName === "RequiredPumpCapacity") { contribution(copyData) }
      if (item.FieldName === "RequiredPumpsubtype") { contribution(copyData) }
      if (item.FieldName === "PumpCategory") { contribution(copyData) }
      if (item.FieldName === "TypeofControllerForPump") { contribution(copyData) }
      console.log("underwaterstressarea offline>>>>", Underwaterstressarea, underwaterIndex);

      if (underwaterIndex) {
        const newUnderwaterstressarea = {
          ...copyData[underwaterIndex],
          IsEditing: "false",
        };
        copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
      }
      setData(copyData); */
    }

    /* if (item.FieldName === "RequiredPumpsubtype" && option.key === "Surface") {
      setPumpCategoryHide(true)
    }
    else if (item.FieldName === "RequiredPumpsubtype" && option.key === "Submersible") {
      setPumpCategoryHide(false)
    }
    if (item.FieldName === "RequiredPumpType") { contribution(copyData) }
    if (item.FieldName === "RequiredPumpCapacity") { contribution(copyData) }
    if (item.FieldName === "RequiredPumpsubtype") { contribution(copyData) }
    if (item.FieldName === "PumpCategory") { contribution(copyData) }
    if (item.FieldName === "TypeofControllerForPump") { contribution(copyData) }
    console.log("underwaterstressarea offline>>>>", Underwaterstressarea, underwaterIndex);

    if (underwaterIndex) {
      const newUnderwaterstressarea = {
        ...copyData[underwaterIndex],
        IsEditing: "false",
      };
      copyData.splice(underwaterIndex, 1, newUnderwaterstressarea);
    }
    setData(copyData); */
  };

  const fetchDataonline = async () => {
    const headers = {
      Authorization: authToken,
    };
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const SaralNo = await AsyncStorage.getItem("SaralId");
    let route = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=${number}&AppNo=${applicationNo}&PROJCD=${Component}`;
    let callResult = await APIHelper.Get(route, authToken);
    // if (
    //   !callResult?.Result ||
    //   !callResult?.Data ||
    //   callResult.Data.length === 0
    // ) {
    //   const masterRoute = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=${number}&PROJCD=${Component}`;
    //   callResult = await APIHelper.Get(masterRoute, authToken);
    // }
    const queryParam =
      stateCode === "HR"
        ? `SaralNo=${SaralNo}`
        : `ApplicationNo=${applicationNo}`;
    route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/Mobile_GetByApplicationNo?${queryParam}&PROJCD=${Component}`;
    const callResult1 = await APIHelper.Get2(route, authToken);
    if (callResult1?.Data) {
      SanctionId = callResult1.Data.Sanction_Id;
      setIsSurveyDone(callResult1.Data.IsSitSurveyDone);
      setIsSiteSurvey(callResult1.Data.IsSiteSurvey);
      setIsPumpUpdate(callResult1.Data.IsPumpUpdate);
      setContributiondata({
        Comp: Component,
        Pump_Type: callResult1.Data.RequiredPumpType,
        Pump_Capacity: callResult1.Data.RequiredPumpCapacity,
        Pump_Category: callResult1.Data.PumpCategory,
        Pump_Subcategory: callResult1.Data.RequiredPumpsubtype,
        SanctionId: callResult1.Data.Sanction_Id,
        ControllerType: callResult1.Data.TypeofControllerForPump,
        Contribution: callResult1.Data.Farmer_Contribution_Rs,
      });
      setPayment({
        Payment: "Zero",
        Total: callResult1.Data.Farmer_Contribution_Rs,
      });
    } else {
      SanctionId = sanctionId || Id || 0;
    }
    var State = await AsyncStorage.getItem("State");
    let rowItems = [];
    if (callResult.Result === true) {
      const data = callResult.Data.sort((a, b) =>
        a.Sequence > b.Sequence ? 1 : -1,
      );
      data.forEach((element) => {
        if (element.FieldName === "Location_District") {
          element.Response === ""
            ? setDisableDistrict(true)
            : setDisableDistrict(false);
        }
        if (element.FieldName === "isSouthFacing") {
          element.Response === ""
            ? (element.Response = true)
            : (element.Response = element.Response);
        }
        if (element.FieldName === "IsSiteSuitable") {
          element.Response === ""
            ? (element.Response = true)
            : (element.Response = element.Response);
        }
        if (element.FieldName === "SizeofBorewell") {
          element.Response === ""
            ? (element.Response = 0)
            : (element.Response = element.Response);
        }

        // console.log('element isSiteSuitable>>>>', element.FieldName, element.Response);
        /* if (SanctionId === 1 || SanctionId === 2 || SanctionId === 3 || SanctionId === 4) {
          if (element.FieldName === "RequiredPumpCapacity") {
            element.IsEdit = false
          }
          if (element.FieldName === "RequiredPumpType") {
            element.IsEdit = false
          }
          if (element.FieldName === "RequiredPumpsubtype") {
            element.IsEdit = false
          }
          if (element.FieldName === "PumpCategory") {
            element.IsEdit = false
          }
          if (element.FieldName === "TypeofControllerForPump") {
            element.IsEdit = false
          }
        } */

        if (stateCode === "HR") {
          if (
            SanctionId === 1 ||
            SanctionId === 2 ||
            SanctionId === 3 ||
            SanctionId === 4
          ) {
            if (element.FieldName === "RequiredPumpCapacity") {
              element.IsEdit = false;
            }
            if (element.FieldName === "RequiredPumpType") {
              element.IsEdit = false;
            }
            if (element.FieldName === "RequiredPumpsubtype") {
              element.IsEdit = false;
            }
            if (element.FieldName === "PumpCategory") {
              element.IsEdit = false;
            }
            if (element.FieldName === "TypeofControllerForPump") {
              element.IsEdit = false;
            }
          }
        }

        if (element.FieldName === "RequiredPumpsubtype") {
          element.Response === "Submersible"
            ? setPumpCategoryHide(false)
            : setPumpCategoryHide(true);
        }
        rowItems.push({
          Id: element.Id,
          Name: element.Name,
          FieldName: element.FieldName,
          IsEditing: element.IsEdit,
          FieldType: element.FieldType,
          DropdownAPI: element.DropDownAPI,
          DropdownValues: JSON.parse(element.DropDownValues),
          Sequence: element.Sequence,
          Response: element.Response,
          Argument: element.Argument,
        });
      });
      var dropdowns = rowItems.filter((item) => item.DropdownAPI);

      console.log("dropdowns Mobile_GetByApplicationNo>>", dropdowns);
      dropdowns.forEach(async (e1) => {
        const arguments1 = e1.Argument.split(",");
        for (let i = 0; i < arguments1.length; i++) {
          let pattern = "{" + i + "}";

          console.log("dropdown values>>", arguments1);
          if (arguments1[i].toUpperCase() === "STATECODE") {
            e1.DropdownAPI = e1.DropdownAPI.replace(pattern, stateId);
          } else if (arguments1[i].toUpperCase() === "COMPONENT") {
            e1.DropdownAPI = e1.DropdownAPI.replace(pattern, number);
          } else {
            const filteredItems = data.filter((item) => {
              return (
                item.FieldName.toUpperCase() === arguments1[i].toUpperCase()
              );
            });

            console.log("===========before drp", filteredItems);
            if (filteredItems.length !== 0) {
              e1.DropdownAPI = e1.DropdownAPI.replace(
                pattern,
                filteredItems[0].Response,
              );
            }
          }
        }

        console.log(
          "======================================= drop down =========================",
          e1.DropDownAPI,
        );
        const route1 = `${apiUrl}api/${stateCode}/${e1.DropdownAPI}`;
        const callResult1 = await axios.get(route1, { headers });
        if (callResult1.data.Result) {
          let vals = callResult1.data.Data.map((e) => {
            return { key: e.Key, val: e.Value };
          });
          e1.DropdownValues = vals;
        }
      });
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText:
          i18n.t("Failedtofetchsitesurveydetails") + callResult.Message,
      });
    }
    setData(rowItems);
  };

  const fetchDataoffline = async () => {
    const stateCode = await AsyncStorage.getItem("stateCode");
    let ID = "";
    let Component = "";
    let Application_No = "";
    let Name = "";
    let fathername = "";
    let mobileNo = "";
    let Saral_Id = "";
    let Required_PumpCapacity = "";
    let Required_PumpType = "";
    let Required_Pumpsubtype = "";
    let Pump_Category = "";
    let Underwaterstressarea = "";
    let rowItems = [];

    try {
      const masterRows = await queryAll(
        "SELECT * FROM SiteSurveyMaster WHERE Id = ?",
        [Id],
      );
      if (!masterRows.length) return;

      const master = masterRows[0];
      const { Component, SanctionId, Id: surveyId } = master;
      const underwaterStress =
        master.Underwaterstressarea === "0" ? "false" : "true";

      setContributiondata({
        Comp: master.Component,
        Pump_Type: master.RequiredPumpType,
        Pump_Capacity: master.RequiredPumpCapacity,
        Pump_Category: master.PumpCategory,
        Pump_Subcategory: master.RequiredPumpsubtype,
        SanctionId,
        ControllerType: master.TypeofControllerForPump,
        Contribution: master.FarmerContributionRs,
      });
      setPayment({ Payment: "Zero", Total: master.FarmerContributionRs });

      // 2. Fetch Checklist Data
      const checklistSql = `
      SELECT d.SurveyId, d.Checklist_Id, d.FieldName, d.Response, 
             c.Name, c.IsEdit, c.FieldType, c.DropdownAPI, 
             c.DropdownValues, c.Sequence, c.Comp, c.Argument 
      FROM SaveSiteSurvey d 
      JOIN SiteSurveyChecklist c ON d.Checklist_Id = c.Id 
      WHERE c.Comp = ? AND d.SurveyId = ?`;

      const rawChecklist = await queryAll(checklistSql, [Component, surveyId]);
      const sortedData = rawChecklist.sort(
        (a, b) => parseInt(a.Sequence) - parseInt(b.Sequence),
      );

      const compNum = Component === "b" ? 2 : Component === "a" ? 1 : 3;

      const fetchMap = async (sql, params = []) => {
        const res = await queryAll(sql, params);
        const mapped = res.map((e) => ({ key: e.Key, val: e.Value }));
        return JSON.stringify(mapped);
      };

      const findField = (name) =>
        sortedData.find((el) => el.FieldName === name) || {};

      const fields = {
        discom:
          sortedData.find(
            (el) => el.FieldName === "DISCOM" || el.FieldName === "DISCOMCode",
          ) || {},
        circle: findField("Circle"),
        division: findField("Division"),
        subDiv: findField("Sub_Division"),
        zone: findField("Zone"),
        subStation: findField("SubStation"),
        district: findField("Location_District"),
        taluka: findField("Location_Taluka"),
        town: findField("Location_Town"),
        block: findField("Location_Block"),
      };

      if (stateCode === "GJ") {
        fields.discom.DropDownValues = await fetchMap(
          `SELECT * FROM Discomlist`,
        );
        fields.circle.DropDownValues = await fetchMap(
          `SELECT * FROM Circlelist WHERE Discom_Code = ?`,
          [fields.discom.Response],
        );
        fields.division.DropDownValues = await fetchMap(
          `SELECT * FROM Divisionlist WHERE Circle_Code = ?`,
          [fields.circle.Response],
        );
        fields.subDiv.DropDownValues = await fetchMap(
          `SELECT * FROM SUBDivisionlist WHERE Div_Code = ?`,
          [fields.division.Response],
        );
      }

      if (stateCode === "KA") {
        fields.discom.DropDownValues = await fetchMap(
          `SELECT * FROM Discomlist`,
        );
        fields.zone.DropDownValues = await fetchMap(
          fields.zone.Response
            ? `SELECT * FROM zonelist WHERE Discom_Code = ?`
            : `SELECT * FROM zonelist`,
          [fields.discom.Response],
        );
        fields.circle.DropDownValues = await fetchMap(
          fields.zone.Response
            ? `SELECT * FROM Circlelist WHERE Discom_Code = ?`
            : `SELECT * FROM zonelist`,
          [fields.zone.Response],
        );
        fields.division.DropDownValues = await fetchMap(
          fields.circle.Response
            ? `SELECT * FROM Divisionlist WHERE Circle_Code = ?`
            : `SELECT * FROM Divisionlist`,
          [fields.circle.Response],
        );
        fields.subDiv.DropDownValues = await fetchMap(
          fields.division.Response
            ? `SELECT * FROM SUBDivisionlist WHERE Div_Code = ?`
            : `SELECT * FROM SUBDivisionlist`,
          [fields.division.Response],
        );
        fields.subStation.DropDownValues = await fetchMap(
          fields.subDiv.Response
            ? `SELECT * FROM SUBStationlist WHERE SUBDivision_Id = ?`
            : `SELECT * FROM SUBStationlist`,
          [fields.subDiv.Response],
        );
      }

      if (stateCode === "KL" || stateCode === "TS") {
        fields.discom.DropDownValues = await fetchMap(
          `SELECT * FROM Discomlist`,
        );
        fields.circle.DropDownValues = await fetchMap(
          fields.discom.Response
            ? `SELECT * FROM Circlelist WHERE Discom_Code = ?`
            : `SELECT * FROM Circlelist`,
          [fields.discom.Response],
        );
        fields.division.DropDownValues = await fetchMap(
          fields.circle.Response
            ? `SELECT * FROM Divisionlist WHERE Circle_Code = ?`
            : `SELECT * FROM Divisionlist`,
          [fields.circle.Response],
        );
        fields.subDiv.DropDownValues = await fetchMap(
          fields.division.Response
            ? `SELECT * FROM SUBDivisionlist WHERE Div_Code = ?`
            : `SELECT * FROM SUBDivisionlist`,
          [fields.division.Response],
        );
      }

      fields.district.DropDownValues = await fetchMap(
        `SELECT * FROM Districtlist WHERE Statecode = ?`,
        [stateId],
      );

      if (fields.district.Response) {
        fields.taluka.DropDownValues = await fetchMap(
          `SELECT * FROM Talukalist WHERE State_Code = ? AND District_Code = ?`,
          [stateId, fields.district.Response],
        );
      }

      if (fields.district.Response && fields.taluka.Response) {
        const townRes = await queryAll(
          `SELECT * FROM Townlist WHERE State_Code = ? AND District_Code = ? AND Taluka_Code = ?`,
          [stateId, fields.district.Response, fields.taluka.Response],
        );
        setTowncallResult(townRes);
        fields.town.DropDownValues = JSON.stringify(
          townRes.map((e) => ({ key: e.Key, val: e.Value })),
        );
      }

      if (
        fields.district.Response &&
        stateCode !== "GJ" &&
        fields.taluka.Response
      ) {
        fields.block.DropDownValues = await fetchMap(
          `SELECT * FROM BlockList WHERE State_Code = ? AND Taluka_Code = ?`,
          [stateId, fields.taluka.Response],
        );
      }

      const finalItems = sortedData.map((item) => {
        let element = { ...item };

        // Field UI logic
        if (element.FieldName === "Location_District")
          setDisableDistrict(!element.Response);

        // Default Values for empty responses
        if (
          ["isSouthFacing", "IsSiteSuitable"].includes(element.FieldName) &&
          element.Response === ""
        )
          element.Response = true;
        if (element.FieldName === "SizeofBorewell" && element.Response === "")
          element.Response = 0;

        // Lockdown logic (Haryana Specific)
        const lockFields = [
          "RequiredPumpCapacity",
          "RequiredPumpType",
          "RequiredPumpsubtype",
          "PumpCategory",
          "TypeofControllerForPump",
        ];
        if (
          stateCode === "HR" &&
          [1, 2, 3, 4].includes(SanctionId) &&
          lockFields.includes(element.FieldName)
        ) {
          element.IsEdit = false;
        }

        if (element.FieldName === "RequiredPumpsubtype")
          setPumpCategoryHide(element.Response !== "Submersible");

        if (element.FieldName === "Underwaterstressarea") {
          element.Response = underwaterStress;
          element.IsEdit = false;
        }

        // Format for UI Component
        return {
          Checklist_Id: element.Checklist_Id,
          Name: element.Name,
          FieldName: element.FieldName,
          IsEditing: element.IsEdit,
          FieldType: element.FieldType,
          DropdownAPI: element.DropdownAPI,
          DropdownValues: element.DropDownValues
            ? JSON.parse(element.DropDownValues)
            : [],
          Sequence: element.Sequence,
          Response: element.Response,
          Component: compNum,
          Argument: element.Argument,
        };
      });

      setData(finalItems);
    } catch (error) {
      console.error("Error loading configuration data:", error);
    }
  };

  const submitsitesurveyonline = async () => {
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const SaralNo = await AsyncStorage.getItem("SaralId");
    const queryParam =
      stateCode === "HR"
        ? `SaralNo=${SaralNo}`
        : `ApplicationNo=${applicationNo}`;
    let route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/Mobile_GetByApplicationNo?${queryParam}&PROJCD=${Component}`;
    const callResult1 = await APIHelper.Get2(route, authToken);
    setIsSurveyDone(true);
    const saveData = {};
    const surveyData = callResult1?.Data;
    saveData["Sanction_Id"] =
      surveyData?.Sanction_Id || SanctionId || sanctionId;
    data.forEach((item) => {
      saveData[item.FieldName] =
        item.FieldType === "Boolean"
          ? item.Response.toLowerCase() === "true"
          : item.Response;
    });
    if (surveyData?.IsSiteSurvey) {
      saveData["Latitude"] = surveyData.Latitude;
      saveData["Longitude"] = surveyData.Longitude;
    } else {
      saveData["Latitude"] = latLong.latitude;
      saveData["Longitude"] = latLong.longitude;
    }

    const department = await AsyncStorage.getItem("departmentId");
    saveData["Installer"] = department;
    route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/Post?PROJCD=${Component}`;

    const callResult = await APIHelper.Post1(route, authToken, saveData);

    if (callResult.Result) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Site survey saved successfully",
      });
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText:
          "Failed to save site survey \r\n\r\n" + callResult.Message,
      });
      setIsSurveyDone(false);
    }
  };

  const submitsitesurveyoffline = () => {
    const getField = (fieldName) => data.find((e) => e.FieldName === fieldName);

    const IrrigationMode = getField("IrrigationMode");
    const IsSiteSuitable = getField("IsSiteSuitable");
    const FarmerType = getField("FarmerType");
    const ApplicationCategory = getField("ApplicationCategory");
    const District = getField("Location_District");
    const Town = getField("Location_Town");
    const RequiredPumpCapacity = getField("RequiredPumpCapacity");
    const RequiredPumpType = getField("RequiredPumpType");
    const RequiredPumpsubtype = getField("RequiredPumpsubtype");
    const PumpCategory = getField("PumpCategory");
    const isSouthFacing = getField("isSouthFacing");
    const SourceofWater = getField("SourceofWater");
    const SizeofBorewell = getField("SizeofBorewell");
    const GridConnection = getField("GridConnectionApplicationStatus");
    const SourceOfPowerExistingPump = getField("SourceOfPowerExistingPump");
    const HeadofPumpMeter = getField("HeadofPumpMeter");
    const WaterDepthLevel = getField("WaterDepthLevel");

    if (images.length === 0 || consentImages.length === 0) {
      setSnackbar({
        showSnackbar: true,
        snackbarText:
          stateCode !== "GJ"
            ? contributiondata.SanctionId === 5
              ? `${i18n.t("uploadphotographsSelectionForm")}`
              : `${i18n.t("uploadphotographsConsentForm")}`
            : `${i18n.t("uploadphotographsGJConsentForm")}`,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (IrrigationMode && IrrigationMode.Response === "") ||
      (IsSiteSuitable && IsSiteSuitable.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillirrigationinstalled&SolarPump"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (FarmerType && FarmerType.Response === "") ||
      (ApplicationCategory && ApplicationCategory.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillApplicantField&Category"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (District && District.Response === "") ||
      (Town && Town.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillLocation_District&Location_Town"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (isSouthFacing && isSouthFacing.Response === "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillSouthfacing"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (SourceofWater && SourceofWater.Response === "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillSourceofWater"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      SourceofWater &&
      SourceofWater.Response === "Borewell" &&
      SizeofBorewell &&
      SizeofBorewell.Response === ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillborewel"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (SourceOfPowerExistingPump &&
        SourceOfPowerExistingPump.Response === "") ||
      (GridConnection && GridConnection.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: `${i18n.t(
          "pleasefillSourceOfPowerExistingPump",
        )} \r\n\r\n ${i18n.t("pleasefillelectricconnection")}`,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (RequiredPumpCapacity && RequiredPumpCapacity.Response === "") ||
      (RequiredPumpType && RequiredPumpType.Response === "") ||
      (RequiredPumpsubtype && RequiredPumpsubtype.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t(
          "pleasefillRequiredPumpCapacity&RequiredPumpType&RequiredPumpsubtype",
        ),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      RequiredPumpsubtype &&
      RequiredPumpsubtype.Response === "Submersible" &&
      PumpCategory &&
      PumpCategory.Response === undefined
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillPumpCategory"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      (HeadofPumpMeter && HeadofPumpMeter.Response === "") ||
      (WaterDepthLevel && WaterDepthLevel.Response === "")
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillHeadofPumpMeter&WaterDepthLevel"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else {
      console.log(
        "latLong.latitude,latLong.longitude",
        latLong.latitude,
        latLong.longitude,
      );

      if (latLong.latitude == "*****" || latLong.longitude == "*****") {
        fetchLocation();
      } else {
        (async () => {
          setIsBusy(true);

          try {
            await withTransaction(async (tx) => {
              for (const element of data) {
                await tx.executeSql(
                  "UPDATE SaveSiteSurvey SET Response = ? WHERE SurveyId = ? AND Checklist_Id = ?",
                  [element.Response, Id, element.Checklist_Id],
                );
              }

              await tx.executeSql(
                "UPDATE SiteSurveyMaster SET SiteSurveyDate = ?, latitude = ?, longitude = ? WHERE Id = ?",
                [
                  moment().format("DD/MM/YYYY"),
                  latLong.latitude,
                  latLong.longitude,
                  Id,
                ],
              );
            });

            Alert.alert(
              i18n.t("siteSurvey"),
              i18n.t("ResponseSaveSuccessfully"),
              [
                {
                  text: i18n.t("OK"),
                  onPress: () => navigation.navigate("SyncSurvey"),
                },
              ],
            );
          } catch (error) {
            console.error("Save failure:", error);
            Alert.alert(
              i18n.t("SyncSurvey"),
              i18n.t("ResponsenotSaveSuccessfully"),
              [{ text: i18n.t("OK") }],
            );
          } finally {
            setIsBusy(false);
          }
        })();
      }
    }
  };

  const savesitesurveyonline = async () => {
    const saveData = {};
    data.forEach((item) => {
      saveData[item.FieldName] =
        item.FieldType === "Boolean"
          ? item.Response.toLowerCase() === "true"
          : item.Response;
    });
    saveData["IrrigationMode"] === "Micro Irrigation"
      ? (saveData["IrrigationMode"] = "1")
      : (saveData["IrrigationMode"] = saveData["IrrigationMode"]);
    saveData["Latitude"] = latLong.latitude;
    saveData["Longitude"] = latLong.longitude;
    const department = await AsyncStorage.getItem("departmentId");
    saveData["Installer"] = department;
    saveData["IsOfflineSiteSurvey"] = false;
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey/SaveSiteSurvey?PROJCD=${Component}`;
    const callResult = await APIHelper.Post1(route, authToken, saveData);
    if (callResult.Result) {
      setIsSurveyDone(true);
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Site survey saved successfully",
      });
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText:
          "Failed to save site survey \r\n\r\n" + callResult.Message,
      });
    }
  };

  const savesitesurveyoffline = () => {
    const IrrigationMode = data.find((e) => e.FieldName == "IrrigationMode");
    const IsSiteSuitable = data.find((e) => e.FieldName == "IsSiteSuitable");
    const FarmerType = data.find((e) => e.FieldName == "FarmerType");
    const ApplicationCategory = data.find(
      (e) => e.FieldName == "ApplicationCategory",
    );
    const District = data.find((e) => e.FieldName == "Location_District");
    const Town = data.find((e) => e.FieldName == "Location_Town");
    const RequiredPumpCapacity = data.find(
      (e) => e.FieldName == "RequiredPumpCapacity",
    );
    const RequiredPumpType = data.find(
      (e) => e.FieldName == "RequiredPumpType",
    );
    const RequiredPumpsubtype = data.find(
      (e) => e.FieldName == "RequiredPumpsubtype",
    );
    const PumpCategory = data.find((e) => e.FieldName == "PumpCategory");
    const isSouthFacing = data.find((e) => e.FieldName == "isSouthFacing");
    const SourceofWater = data.find((e) => e.FieldName == "SourceofWater");
    const SizeofBorewell = data.find((e) => e.FieldName == "SizeofBorewell");
    const GridConnection = data.find(
      (e) => e.FieldName == "GridConnectionApplicationStatus",
    );
    const SourceOfPowerExistingPump = data.find(
      (e) => e.FieldName == "SourceOfPowerExistingPump",
    );
    const HeadofPumpMeter = data.find((e) => e.FieldName == "HeadofPumpMeter");
    const WaterDepthLevel = data.find((e) => e.FieldName == "WaterDepthLevel");
    if (SourceofWater.Response == "Borewell" && SizeofBorewell.Response == "") {
      SizeofBorewell.Response = "0";
    }
    if (images.length == 0 || consentImages.length == 0) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("uploadPhotographs"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (IrrigationMode.Response == "" || IsSiteSuitable.Response == "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillirrigationinstalled&SolarPump"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      FarmerType.Response == "" ||
      ApplicationCategory.Response == ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillApplicantField&Category"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (District.Response == "" || Town.Response == "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillLocation_District&Location_Town"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (isSouthFacing.Response == "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillSouthfacing"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (SourceofWater.Response == "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillSourceofWater"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      SourceofWater.Response == "Borewell" &&
      SizeofBorewell.Response !== "0"
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillborewel"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      SourceOfPowerExistingPump.Response == "" ||
      GridConnection.Response == ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: `${i18n.t(
          "pleasefillSourceOfPowerExistingPump",
        )} \r\n\r\n ${i18n.t("pleasefillelectricconnection")}`,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      RequiredPumpCapacity.Response == "" ||
      RequiredPumpType.Response == "" ||
      RequiredPumpsubtype.Response == ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t(
          "pleasefillRequiredPumpCapacity&RequiredPumpType&RequiredPumpsubtype",
        ),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      RequiredPumpsubtype.Response == "Submersible" &&
      PumpCategory.Response == undefined
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillPumpCategory"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else if (
      HeadofPumpMeter.Response == "" ||
      WaterDepthLevel.Response == ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("pleasefillHeadofPumpMeter&WaterDepthLevel"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else {
      console.log(
        "latLong.latitude,latLong.longitude",
        latLong.latitude,
        latLong.longitude,
      );

      if (latLong.latitude == "*****" || latLong.longitude == "*****") {
        fetchLocation();
      } else {
        (async () => {
          setIsBusy(true);
          try {
            await withTransaction(async (tx) => {
              for (const element of data) {
                await tx.executeSql(
                  "UPDATE SaveSiteSurvey SET Response = ? WHERE SurveyId = ? AND Checklist_Id = ?",
                  [element.Response, Id, element.Checklist_Id],
                );
              }

              await tx.executeSql(
                "UPDATE SiteSurveyMaster SET SiteSurveyDate = ?, latitude = ?, longitude = ? WHERE Id = ?",
                [
                  moment().format("DD/MM/YYYY"),
                  latLong.latitude,
                  latLong.longitude,
                  Id,
                ],
              );
            });

            Alert.alert(
              i18n.t("siteSurvey"),
              i18n.t("ResponseSaveSuccessfully"),
              [
                {
                  text: i18n.t("OK"),
                  onPress: () => navigation.navigate("SyncSurvey"),
                },
              ],
            );
          } catch (error) {
            console.error("Database Transaction Error:", error);
            Alert.alert(
              i18n.t("SyncSurvey"),
              i18n.t("ResponsenotSaveSuccessfully"),
              [{ text: i18n.t("OK") }],
            );
          } finally {
            setIsBusy(false);
          }
        })();
      }
    }
  };

  const renderImage = ({ item, index }) => {
    const fileName = item.DocName;
    const fileExtension = fileName.split(".").pop();
    if (netconnection == true) {
      return (
        <View style={styles.imageContainer}>
          {fileExtension === "pdf" ? (
            <Pressable onPress={() => pdfview(item)}>
              <View style={Styles.imageThumbnail}>
                <Text>PDF</Text>
              </View>
            </Pressable>
          ) : (
            <TouchableOpacity
              onPress={() => {
                downloadImage(item);
              }}
            >
              <Image
                style={Styles.imageThumbnail}
                source={{ uri: `data:image/png;base64,${item.src}` }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.imageContainer}>
          {fileExtension === "pdf" ? (
            <Pressable onPress={() => pdfview(item)}>
              <View style={Styles.imageThumbnail}>
                <Text>PDF</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onLongPress={() => {
                removeimageoffline(item, index);
              }}
            >
              <Image
                style={Styles.imageThumbnail}
                source={{ uri: item.src }}
                resizeMode="cover"
              />
            </Pressable>
          )}
        </View>
      );
    }
  };

  const removeimageoffline = (item, index) => {
    return Alert.alert(
      "Delete Image",
      "Are you sure you want to delete image?",
      [
        {
          text: "yes",
          onPress: async () => {
            try {
              await withTransaction(async (tx) => {
                await tx.executeSql(
                  "DELETE FROM ImageUpload WHERE SurveyId = ? AND DocType = ?",
                  [Id, item.DocType],
                );
              });

              if (item.DocType === 0) {
                setImages((prevImages) => {
                  const newImages = [...prevImages];
                  newImages.splice(index, 1);
                  return newImages;
                });
              } else {
                setConsentImages((prevConsent) => {
                  const newConsent = [...prevConsent];
                  newConsent.splice(index, 1);
                  return newConsent;
                });
              }
            } catch (error) {
              console.error("Failed to delete image:", error);
              Alert.alert("Error", "Could not delete image from database.");
            }
            if (item.DocType == 0) {
              setPhotographss({
                Site: photographss.Site - 1,
                Conset: photographss.Conset,
              });
            } else {
              setPhotographss({
                Site: photographss.Site,
                Conset: photographss.Conset - 1,
              });
            }
          },
        },
        { text: "no" },
      ],
    );
  };

  const processImageUploadOnline = async (type, base64, spaceID) => {
    console.log(JSON.stringify(photographss, null, 2));

    if (base64 === "" || base64 === null || base64 === undefined) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Somthing went wrong, Please Re-Capture Image",
      });
      return;
    }
    setIsBusy(true);
    apiUrl = await AsyncStorage.getItem("apiURL");
    stateCode = await AsyncStorage.getItem("stateCode");
    authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    number = selectedComponentRoute === "b" ? 2 : 3;
    const farmerId = await AsyncStorage.getItem("farmerId");
    const appNo = await AsyncStorage.getItem("applicationNo");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/Comp${Component}_SiteSurvey_Document/UploadDcoument_Base64_M?PROJCD=${Component}`;
    const payload = {
      docspreffid: appNo,
      docName:
        (type == 0 && spaceID == 24
          ? "Site"
          : type == 1 && spaceID == 24
          ? "Consent"
          : type === 1 && spaceID === 42
          ? "Suplier"
          : type == 1 && spaceID == 35
          ? "ChallanProof"
          : type == 1 && spaceID == 36
          ? "FarmPond"
          : type == 1 && spaceID == 38
          ? "LandDoc"
          : type == 35 && spaceID == 24
          ? "SiteSurveyReport"
          : type == 43 && spaceID == 24
          ? "IrrigationDoc"
          : "") +
        "_" +
        moment().valueOf() +
        ".jpg",
      version: "1",
      EnumValue: 0,
      DocType: type,
      docspid: spaceID,
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
      }, 3000);

      if (type === 0 && spaceID === 24) {
        console.log("Inside 1");
        setImages((images) => [
          ...images,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          Site: prev.Site + 1,
        }));
      } else if (
        (type === 1 && spaceID === 42) ||
        (type === 1 && spaceID === 24)
      ) {
        setConsentImages((consentImages) => [
          ...consentImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          Conset: prev.Conset + 1,
        }));
      } else if (type === 1 && spaceID === 35) {
        setProofImages((proofImages) => [
          ...proofImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          Proof: prev.Proof + 1,
        }));
      } else if (type === 1 && spaceID === 36) {
        setFarmPondImages((farmPondImages) => [
          ...farmPondImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          FarmPond: prev.FarmPond + 1,
        }));
      } else if (type === 1 && spaceID === 38) {
        setLandDocImages((landDocImages) => [
          ...landDocImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          LandDoc: prev.LandDoc + 1,
        }));
      } else if (type === 35 && spaceID === 24) {
        setSiteSurveyImages((siteSurveyImages) => [
          ...siteSurveyImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          SurveyReport: prev.SurveyReport + 1,
        }));
      } else if (type === 43 && spaceID === 24) {
        setIrrigationImages((irrigationImages) => [
          ...irrigationImages,
          {
            DocType: type,
            SpaceID: spaceID,
            src: base64,
            DocName: payload.docName,
          },
        ]);

        setPhotographss((prev) => ({
          ...prev,
          IrrigationImages: prev.IrrigationImages + 1,
        }));
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: response.data.Message,
      });
    }
  };

  const processImageUploadOffline = async (type, uri, spaceID) => {
    try {
      setIsBusy(true);
      const dir = FileSystem.documentDirectory + "PMKUSUM/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const timestamp = moment().valueOf();
      const filename = `IMG_${timestamp}.jpg`;
      const newPath = dir + filename;

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      const finalAsset = {
        uri: newPath,
        filename: filename,
      };

      await withTransaction(async (tx) => {
        await tx.executeSql(
          "INSERT INTO ImageUpload (SurveyId, docName, DocType, SpaceID, File_String, FileName) VALUES (?,?,?,?,?,?)",
          [
            Id,
            `${timestamp}`,
            type,
            spaceID,
            finalAsset.uri,
            finalAsset.filename,
          ],
        );
      });

      const newImageObj = {
        DocType: type,
        SpaceID: spaceID,
        src: finalAsset.uri,
      };

      // Determine which state to update and the prefix for DocName
      if (spaceID === 24) {
        if (type === 0) {
          console.log("Inside 2");
          setImages((prev) => [
            ...prev,
            { ...newImageObj, DocName: `Site_${timestamp}.jpg` },
          ]);
          setPhotographss((prev) => ({ ...prev, Site: prev.Site + 1 }));
        } else if (type === 1) {
          setConsentImages((prev) => [
            ...prev,
            { ...newImageObj, DocName: `Consent_${timestamp}.jpg` },
          ]);
          setPhotographss((prev) => ({ ...prev, Conset: prev.Conset + 1 }));
        } else if (type === 35) {
          setSiteSurveyImages((prev) => [
            ...prev,
            {
              ...newImageObj,
              DocName: `SiteSurveyReport_${timestamp}.jpg`,
            },
          ]);
          setPhotographss((prev) => ({
            ...prev,
            SurveyReport: prev.SurveyReport + 1,
          }));
        } else if (type === 43) {
          setIrrigationImages((prev) => [
            ...prev,
            { ...newImageObj, DocName: `IrrigationDoc_${timestamp}.jpg` },
          ]);
          setPhotographss((prev) => ({
            ...prev,
            IrrigationImages: prev.IrrigationImages + 1,
          }));
        }
      } else if (spaceID === 42 && type === 1) {
        setConsentImages((prev) => [
          ...prev,
          { ...newImageObj, DocName: `Suplier_${timestamp}.jpg` },
        ]);
        setPhotographss((prev) => ({ ...prev, Conset: prev.Conset + 1 }));
      } else if (spaceID === 35 && type === 1) {
        setProofImages((prev) => [
          ...prev,
          { ...newImageObj, DocName: `ChallanProof_${timestamp}.jpg` },
        ]);
        console.log("Proof updated");
        setPhotographss((prev) => ({ ...prev, Proof: prev.Proof + 1 }));
      } else if (spaceID === 36 && type === 1) {
        setFarmPondImages((prev) => [
          ...prev,
          { ...newImageObj, DocName: `FarmPond_${timestamp}.jpg` },
        ]);
        setPhotographss((prev) => ({
          ...prev,
          FarmPond: prev.FarmPond + 1,
        }));
      } else if (spaceID === 38 && type === 1) {
        setLandDocImages((prev) => [
          ...prev,
          { ...newImageObj, DocName: `LandDoc_${timestamp}.jpg` },
        ]);
        setPhotographss((prev) => ({ ...prev, LandDoc: prev.LandDoc + 1 }));
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      Alert.alert("Error", "Failed to save image.");
    } finally {
      setIsBusy(false);
    }
  };

  const fetchAllAssets = async () => {
    try {
      const dir = FileSystem.documentDirectory + "PMKUSUM/";

      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(dir);

      const assets = files.map((file, index) => ({
        id: `${index}`,
        filename: file,
        uri: dir + file,
        mediaType: "photo",
      }));

      return assets;
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  };

  const uploadImage = async (type, SpaceID, showDetail) => {
    navigation.navigate("Imagecapture", {
      type: type,
      id: Id,
      spaceID: SpaceID,
      screen: "SiteSurvey",
      latitude: latLong.latitude,
      longitude: latLong.longitude,
      showDetail: showDetail,
    });
  };

  const getHeader = () => {
    if (data.length === 0) return null;
    return (
      <View
        style={{
          backgroundColor: Colors.cellBackground,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{i18n.t("SiteDetails")}</Text>
      </View>
    );
  };

  const getFooter = () => {
    if (data.length === 0) return null;
    const SourceofWater = data.find(
      (item) => item.FieldName === "SourceofWater",
    );
    const IrrigationMode = data.find(
      (item) => item.FieldName === "IrrigationMode",
    );
    return (
      <View>
        {/* Site Photographs */}
        <View style={{ flexDirection: "row" }}>
          <Text style={[styles.imageTitle]}>
            {contributiondata.SanctionId === 5
              ? i18n.t("SitePhotographsApplicant")
              : i18n.t("SitePhotographs")}
          </Text>
          <Pressable
            style={{ marginTop: 10 }}
            onPress={async () => {
              if (photographss.Site >= 6) {
                Alert.alert(
                  i18n.t("AlertMeaasge"),
                  "Do not capture more than 6 Site photographs",
                  [
                    {
                      text: "OK",
                    },
                  ],
                );
              } else {
                !isBusy ? uploadImage(0, 24, true) : null;
              }
            }}
          >
            <IconMC
              name="camera-outline"
              size={35}
              color={Colors.graytone}
              style={{ marginVertical: 5 }}
            ></IconMC>
          </Pressable>
        </View>
        <FlatList
          listKey="imageList"
          data={images}
          renderItem={renderImage}
          numColumns={3}
          keyExtractor={(item, index) => index}
          ListEmptyComponent={() => {
            return (
              <Text style={styles.emptyComponent}>
                {i18n.t("NoSitePhotograph")}
              </Text>
            );
          }}
        />

        {/*  Farmer Site Survey Report */}
        {stateCode === "HR" && (
          <>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.imageTitle]}>{i18n.t("SurveyReport")}</Text>
              <Pressable
                style={{ marginTop: 10 }}
                onPress={async () => {
                  // downloadImage()
                  openFile();
                  // Alert.alert(
                  //   i18n.t("AlertMeaasge"),
                  //   // "Download Succsfully Farmer Site Survey Report",
                  //   "Work in Progress",
                  //   [
                  //     {
                  //       text: "OK",
                  //       // onPress: () => { downloadImage() }
                  //     },
                  //   ]
                  // );
                }}
              >
                <IconI
                  name="download-outline"
                  size={35}
                  color={Colors.graytone}
                  style={{ marginVertical: 5 }}
                ></IconI>
              </Pressable>
              <Pressable
                style={{ marginTop: 10 }}
                onPress={async () => {
                  if (photographss.SurveyReport >= 6) {
                    Alert.alert(
                      i18n.t("AlertMeaasge"),
                      "Do not capture more than 6 Farmer Site Survey Report",
                      [
                        {
                          text: "OK",
                        },
                      ],
                    );
                  } else {
                    !isBusy ? uploadImage(35, 24, false) : null;
                  }
                }}
              >
                <IconMC
                  name="camera-outline"
                  size={35}
                  color={Colors.graytone}
                  style={{ marginVertical: 5 }}
                ></IconMC>
              </Pressable>
            </View>
            <FlatList
              listKey="surveyReportList"
              data={siteSurveyImages}
              renderItem={renderImage}
              numColumns={3}
              keyExtractor={(item, index) => index}
              ListEmptyComponent={() => {
                return (
                  <Text style={styles.emptyComponent}>
                    {i18n.t("NoSurveyReportPhotograph")}
                  </Text>
                );
              }}
            />
          </>
        )}

        {/* Farmer Consent Image */}
        {(stateCode !== "HR" || contributiondata.SanctionId !== 5) && (
          <View style={{ flexDirection: "row" }}>
            {stateCode !== "GJ" ? (
              <Text style={[styles.imageTitle]}>
                {contributiondata.SanctionId === 5
                  ? i18n.t("SupplierSelectionForm")
                  : i18n.t("FarmerConsentForm")}
              </Text>
            ) : (
              <Text style={[styles.imageTitle]}>
                {i18n.t("GJFarmerConsentForm")}
              </Text>
            )}
            <Pressable
              style={{ marginTop: 10 }}
              onPress={async () => {
                if (photographss.Conset >= 6) {
                  Alert.alert(
                    i18n.t("AlertMeaasge"),
                    "Do not capture more than 6 Consent Photographs",
                    [
                      {
                        text: "OK",
                      },
                    ],
                  );
                } else {
                  !isBusy
                    ? SanctionId === 5 && stateCode === "HR"
                      ? uploadImage(1, 42, false)
                      : uploadImage(1, 24, false)
                    : null;
                }
              }}
            >
              <IconMC
                name="camera-outline"
                size={35}
                color={Colors.graytone}
                style={{ marginVertical: 5 }}
              ></IconMC>
            </Pressable>
          </View>
        )}
        <FlatList
          listKey="consentImageList"
          data={consentImages}
          renderItem={renderImage}
          numColumns={3}
          keyExtractor={(item, index) => index}
          ListEmptyComponent={() => {
            return (
              <Text style={styles.emptyComponent}>
                {i18n.t("NoConsentPhotograph")}
              </Text>
            );
          }}
        />

        {/* Challan/Paymet Proof Image */}
        {stateCode === "HR" && (
          <>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.imageTitle]}>
                {i18n.t("Challan/PaymetProof")}
              </Text>
              <Pressable
                style={{ marginTop: 10 }}
                onPress={async () => {
                  if (photographss.Proof >= 6) {
                    console.log(JSON.stringify(photographss, null, 2));
                    Alert.alert(
                      i18n.t("AlertMeaasge"),
                      "Do not capture more than 6 Challan/Payment Proof",
                      [
                        {
                          text: "OK",
                        },
                      ],
                    );
                  } else {
                    !isBusy ? uploadImage(1, 35, false) : null;
                  }
                }}
              >
                <IconMC
                  name="camera-outline"
                  size={35}
                  color={Colors.graytone}
                  style={{ marginVertical: 5 }}
                ></IconMC>
              </Pressable>
            </View>
            <FlatList
              listKey="proofImagesList"
              data={proofImages}
              renderItem={renderImage}
              numColumns={3}
              keyExtractor={(item, index) => index}
              ListEmptyComponent={() => {
                return (
                  <Text style={styles.emptyComponent}>
                    {i18n.t("NoChallanProofPhotograph")}
                  </Text>
                );
              }}
            />
          </>
        )}

        {/*  Land Document Image */}
        {stateCode === "HR" && (
          <>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.imageTitle]}>{i18n.t("LandDocument")}</Text>
              <Pressable
                style={{ marginTop: 10 }}
                onPress={async () => {
                  if (photographss.LandDoc >= 6) {
                    Alert.alert(
                      i18n.t("AlertMeaasge"),
                      "Do not capture more than 6 Land Document",
                      [
                        {
                          text: "OK",
                        },
                      ],
                    );
                  } else {
                    !isBusy ? uploadImage(1, 38, false) : null;
                  }
                }}
              >
                <IconMC
                  name="camera-outline"
                  size={35}
                  color={Colors.graytone}
                  style={{ marginVertical: 5 }}
                ></IconMC>
              </Pressable>
            </View>
            <FlatList
              listKey="landDocumnetList"
              data={landDocImages}
              renderItem={renderImage}
              numColumns={3}
              keyExtractor={(item, index) => index}
              ListEmptyComponent={() => {
                return (
                  <Text style={styles.emptyComponent}>
                    {i18n.t("NoLandDocumentPhotograph")}
                  </Text>
                );
              }}
            />
          </>
        )}

        {/* Proof Of Existing FarmPond Image */}
        {stateCode === "HR" && SourceofWater.Response === "Pond" && (
          <>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.imageTitle]}>
                {stateCode === "HR" && contributiondata.SanctionId === 5
                  ? i18n.t("ProofOfExistingFarmPond1")
                  : i18n.t("ProofOfExistingFarmPond")}
              </Text>
              <Pressable
                style={{ marginTop: 10 }}
                onPress={async () => {
                  if (photographss.FarmPond >= 6) {
                    Alert.alert(
                      i18n.t("AlertMeaasge"),
                      "Do not capture more than 6 Proof Of Existing FarmPond",
                      [
                        {
                          text: "OK",
                        },
                      ],
                    );
                  } else {
                    !isBusy ? uploadImage(1, 36, false) : null;
                  }
                }}
              >
                <IconMC
                  name="camera-outline"
                  size={35}
                  color={Colors.graytone}
                  style={{ marginVertical: 5 }}
                ></IconMC>
              </Pressable>
            </View>
            <FlatList
              listKey="farmPondImages"
              data={farmPondImages}
              renderItem={renderImage}
              numColumns={3}
              keyExtractor={(item, index) => index}
              ListEmptyComponent={() => {
                return (
                  <Text style={styles.emptyComponent}>
                    {i18n.t("NoFarmPondPhotograph")}
                  </Text>
                );
              }}
            />
          </>
        )}

        {/* Micro Irrigation Document Image */}
        {stateCode === "HR" &&
          IrrigationMode.Response === "1" &&
          contributiondata.SanctionId >= 5 && (
            <>
              <View style={{ flexDirection: "row" }}>
                <Text style={[styles.imageTitle]}>
                  {i18n.t("microIrrigationDocument")}
                </Text>
                <Pressable
                  style={{ marginTop: 10 }}
                  onPress={async () => {
                    if (photographss.IrrigationImages >= 6) {
                      Alert.alert(
                        i18n.t("AlertMeaasge"),
                        "Do not capture more than 6 Micro Irrigation Document",
                        [
                          {
                            text: "OK",
                          },
                        ],
                      );
                    } else {
                      !isBusy ? uploadImage(43, 24, false) : null;
                    }
                  }}
                >
                  <IconMC
                    name="camera-outline"
                    size={35}
                    color={Colors.graytone}
                    style={{ marginVertical: 5 }}
                  ></IconMC>
                </Pressable>
              </View>
              <FlatList
                listKey="irrigationImages"
                data={irrigationImages}
                renderItem={renderImage}
                numColumns={3}
                keyExtractor={(item, index) => index}
                ListEmptyComponent={() => {
                  return (
                    <Text style={styles.emptyComponent}>
                      {i18n.t("noMicroIrrigationDocument")}
                    </Text>
                  );
                }}
              />
            </>
          )}
      </View>
    );
  };

  const isSiteSuitable = (item) => {
    const matches = item.filter(
      (element) => element.FieldName === "IsSiteSuitable",
    );
    //contribution(item)
    if (matches.length > 0) {
      return matches[0].Response === "true" ? "is Suitable " : "not Suitable ";
    } else {
      return "";
    }
  };

  const requiredPumpCapacity = (item) => {
    const matches = item.filter(
      (element) => element.FieldName === "RequiredPumpCapacity",
    );
    //contribution(item)
    if (matches.length > 0) {
      return matches[0].Response + " HP ";
    } else {
      return "";
    }
  };

  const requiredPumpSubType = (item) => {
    const matches = item.filter(
      (element) => element.FieldName === "RequiredPumpsubtype",
    );
    //contribution(item)
    return matches.length > 0 ? matches[0].Response + " " : " ";
  };

  const requiredPumpType = (item) => {
    const matches = item.filter(
      (element) => element.FieldName === "RequiredPumpType",
    );
    //contribution(item)
    return matches.length > 0 ? matches[0].Response + " " : " ";
  };

  const contribution = (item) => {
    const RequiredPumpTypematch = item.find(
      (element) => element.FieldName === "RequiredPumpType",
    );
    const RequiredPumpCapacitymatch = item.find(
      (element) => element.FieldName === "RequiredPumpCapacity",
    );
    const RequiredPumpsubtypematch = item.find(
      (element) => element.FieldName === "RequiredPumpsubtype",
    );
    const PumpCategorymatch = item.find(
      (element) => element.FieldName === "PumpCategory",
    );
    const TypeofControllerForPumpmatch = item.find(
      (element) => element.FieldName === "TypeofControllerForPump",
    );
    const RequiredPumpType =
      RequiredPumpTypematch === undefined
        ? contributiondata.Pump_Type
        : RequiredPumpTypematch.Response;
    const RequiredPumpCapacity =
      RequiredPumpCapacitymatch === undefined
        ? contributiondata.Pump_Capacity
        : RequiredPumpCapacitymatch.Response;
    const RequiredPumpsubtype =
      RequiredPumpsubtypematch === undefined
        ? contributiondata.Pump_Subcategory
        : RequiredPumpsubtypematch.Response;
    const PumpCategory =
      PumpCategorymatch === undefined
        ? contributiondata.Pump_Category
        : PumpCategorymatch.Response;
    const TypeofControllerForPump =
      TypeofControllerForPumpmatch === undefined
        ? contributiondata.ControllerType
        : TypeofControllerForPumpmatch.Response;
    const pumpdata = {
      Comp: contributiondata.Comp,
      Pump_Type: RequiredPumpType,
      Pump_Capacity: RequiredPumpCapacity,
      Pump_Category: PumpCategory,
      Pump_Subcategory: RequiredPumpsubtype,
      Sanction_Id: contributiondata.SanctionId,
      Controller_Type: TypeofControllerForPump,
    };
    chnagepayment(pumpdata);
  };

  const chnagepayment = async (pumpdata) => {
    if (
      pumpdata.Pump_Type === "" ||
      pumpdata.Pump_Capacity === "" ||
      pumpdata.Pump_Category === "" ||
      pumpdata.Pump_Subcategory === ""
    ) {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Please Check Fill Pump Detail",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 1000);
      return;
    } else if (pumpdata.Controller_Type === "") {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Please Check Fill Required Controller Type",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 1000);
      return;
    } else {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        const payload = {
          Comp: pumpdata.Comp,
          Pump_Type: pumpdata.Pump_Type,
          Pump_Capacity: pumpdata.Pump_Capacity,
          Pump_Category:
            pumpdata.Pump_Subcategory === "Surface"
              ? "-"
              : pumpdata.Pump_Category,
          Pump_Subcategory: pumpdata.Pump_Subcategory,
          Sanction_Id: `${pumpdata.Sanction_Id}`,
          Controller_Type: pumpdata.Controller_Type,
        };
        const seletquery =
          'SELECT * FROM RateCarddata WHERE Comp="' +
          payload.Comp +
          '" AND Pump_Type="' +
          payload.Pump_Type +
          '" AND Pump_Capacity="' +
          payload.Pump_Capacity +
          '" AND Pump_Category="' +
          payload.Pump_Category +
          '" AND Pump_SubType="' +
          payload.Pump_Subcategory +
          '" AND Sanction_Id="' +
          payload.Sanction_Id +
          '" AND Controller_Type="' +
          payload.Controller_Type +
          '"';
        try {
          const rows = await queryAll(seletquery, []);

          if (rows && rows.length > 0) {
            const total = rows[0].farmer_Contribution_Rs;
            const currentContribution =
              parseInt(contributiondata.Contribution) || 0;
            const difference = currentContribution - total;

            // Logic for Karnataka (KA)
            if (stateCode === "KA") {
              setPayment({
                Payment: "Pay",
                Total: Math.abs(total),
              });
            }
            // Logic for other states
            else {
              if (currentContribution > total) {
                setPayment({
                  Payment: "Refund",
                  Total: Math.abs(difference),
                });
              } else if (currentContribution < total) {
                setPayment({
                  Payment: "Pay",
                  Total: Math.abs(difference),
                });
              } else {
                setPayment({
                  Payment: "Zero",
                  Total: currentContribution,
                });
              }
            }
          } else {
            // Handle "Rate Card Not Found" case
            handleFailure(
              "EA Rate Card Not Found",
              contributiondata.Contribution,
            );
          }
        } catch (error) {
          // Handle Database errors
          handleFailure(
            error.message || "Database Error",
            contributiondata.Contribution,
          );
        }
      } else {
        apiUrl = await AsyncStorage.getItem("apiURL");
        stateCode = await AsyncStorage.getItem("stateCode");
        authToken = await AsyncStorage.getItem("authToken");
        const route = `${apiUrl}api/${stateCode}/RateCard/GetPumpRate?PROJCD=B`;
        const payload = {
          Comp: pumpdata.Comp,
          Pump_Type: pumpdata.Pump_Type,
          Pump_Capacity: pumpdata.Pump_Capacity,
          Pump_Category:
            pumpdata.Pump_Subcategory === "Surface"
              ? "-"
              : pumpdata.Pump_Category,
          Pump_Subcategory: pumpdata.Pump_Subcategory,
          Sanction_Id: pumpdata.Sanction_Id,
          Controller_Type: pumpdata.Controller_Type,
        };
        const callResult = await APIHelper.Post2(route, authToken, payload);
        if (callResult.Result) {
          const total =
            callResult.Data === undefined
              ? payment.Total
              : callResult.Data[0].farmer_Contribution_Rs;
          const difference = contributiondata.Contribution - total;
          //Ankit -if else
          if (stateCode == "KA") {
            setPayment({
              Payment: "Pay",
              Total: Math.abs(total),
            });
          } else {
            if (parseInt(contributiondata.Contribution) > parseInt(total)) {
              setPayment({
                Payment: "Refund",
                Total: Math.abs(difference),
              });
            } else if (
              parseInt(contributiondata.Contribution) < parseInt(total)
            ) {
              setPayment({
                Payment: "Pay",
                Total: Math.abs(difference),
              });
            } else {
              setPayment({
                Payment: "Zero",
                Total: contributiondata.Contribution,
              });
            }
          }
        } else {
          setPayment({
            Payment: "Zero",
            Total: contributiondata.Contribution,
          });
          setSnackbar({
            ...snackbar,
            showSnackbar: true,
            snackbarText: "EA Rate Card Not Found",
          });

          setTimeout(() => {
            setSnackbar(false);
          }, 2000);
        }
      }
    }
  };

  const fetchonlineimage = async () => {
    const appNo = await AsyncStorage.getItem("applicationNo");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";

    {
      /* fetch site photographs */
    }
    let route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=24&DocTypeId=0&PROJCD=${Component}`;
    let callResult1 = await APIHelper.Get(route, authToken);
    if (callResult1.Result) {
      if (callResult1.Data.length > 0) {
        const siteImages = callResult1.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto = siteImages[siteImages.length - 1];
        setImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch site photographs",
      });
    }

    {
      /* fetch farmer consent photographss */
    }
    let callResult2 = [];
    if (SanctionId === 5 && stateCode === "HR") {
      route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=42&DocTypeId=1&PROJCD=${Component}`;
      callResult2 = await APIHelper.Get(route, authToken);
      if (callResult2.Result) {
        if (callResult2.Data.length > 0) {
          const farmerConsentImages = callResult2.Data.map((item, index) => {
            return {
              DocType: item.DocType,
              SpaceID: item.SpaceId,
              src: item.ImgString,
              DocName: item.DocName,
            };
          });
          const lastAddedPhoto =
            farmerConsentImages[farmerConsentImages.length - 1];
          setConsentImages([lastAddedPhoto]);
        }
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: "Failed to fetch farmer consent photographs",
        });
      }
    } else {
      route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=24&DocTypeId=1&PROJCD=${Component}`;
      callResult2 = await APIHelper.Get(route, authToken);
      if (callResult2.Result) {
        if (callResult2.Data.length > 0) {
          const farmerConsentImages = callResult2.Data.map((item, index) => {
            return {
              DocType: item.DocType,
              SpaceID: item.SpaceId,
              src: item.ImgString,
              DocName: item.DocName,
            };
          });
          const lastAddedPhoto =
            farmerConsentImages[farmerConsentImages.length - 1];
          setConsentImages([lastAddedPhoto]);
        }
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: "Failed to fetch farmer consent photographs",
        });
      }
    }

    {
      /* fetch farmer Challan/Paymet Proof photographs */
    }
    route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=35&DocTypeId=1&PROJCD=${Component}`;
    let callResult3 = await APIHelper.Get(route, authToken);
    if (callResult3.Result) {
      if (callResult3.Data.length > 0) {
        const farmerProofImages = callResult3.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto = farmerProofImages[farmerProofImages.length - 1];
        setProofImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText:
          "Failed to fetch farmer Challan/Payment Proof photographs",
      });
    }

    {
      /* fetch Proof Of Existing FarmPond photographs */
    }
    route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=36&DocTypeId=1&PROJCD=${Component}`;
    let callResult4 = await APIHelper.Get(route, authToken);
    if (callResult4.Result) {
      if (callResult4.Data.length > 0) {
        const farmPondImages = callResult4.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto = farmPondImages[farmPondImages.length - 1];
        setFarmPondImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch Proof Of Existing FarmPond photographs",
      });
    }

    {
      /* fetch Farmer Land Document photographs */
    }
    route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=38&DocTypeId=1&PROJCD=${Component}`;
    let callResult5 = await APIHelper.Get(route, authToken);
    if (callResult5.Result) {
      if (callResult5.Data.length > 0) {
        const landDocImages = callResult5.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto = landDocImages[landDocImages.length - 1];
        setLandDocImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch Proof Of Existing FarmPond photographs",
      });
    }

    {
      /* fetch Farmer Site Survey Report */
    }
    route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=24&DocTypeId=35&PROJCD=${Component}`;
    let callResult6 = await APIHelper.Get(route, authToken);
    if (callResult6.Result) {
      if (callResult6.Data.length > 0) {
        const surveyreportImages = callResult6.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto =
          surveyreportImages[surveyreportImages.length - 1];
        setSiteSurveyImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch Farmer Site Survey Report",
      });
    }

    {
      /* fetch Micro Irrigation Document */
    }
    route = `${apiUrl}api/${stateCode}/ConsumerMonitering/M_GetInsurancePolicyNoAndDoc?ApplicationId=${appNo}&SpaceId=24&DocTypeId=43&PROJCD=${Component}`;
    let callResult7 = await APIHelper.Get(route, authToken);
    if (callResult7.Result) {
      if (callResult7.Data.length > 0) {
        const irrigationImagesImages = callResult7.Data.map((item, index) => {
          return {
            DocType: item.DocType,
            SpaceID: item.SpaceId,
            src: item.ImgString,
            DocName: item.DocName,
          };
        });
        const lastAddedPhoto =
          irrigationImagesImages[irrigationImagesImages.length - 1];
        setIrrigationImages([lastAddedPhoto]);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch Farmer Site Survey Report",
      });
    }

    setPhotographss({
      Site: callResult1.Data.length,
      Conset: callResult2.Data.length,
      Proof: callResult3.Data.length,
      FarmPond: callResult4.Data.length,
      LandDoc: callResult5.Data.length,
      SurveyReport: callResult6.Data.length,
      IrrigationImages: callResult7.Data.length,
    });
  };

  const fetchofflineimages = async () => {
    try {
      const imageRows = await queryAll(
        "SELECT * FROM ImageUpload WHERE SurveyId = ?",
        [Id],
      );

      // Helper function to filter and format images to avoid repeating code
      const getImagesByCriteria = (docType, spaceId) =>
        imageRows
          .filter((img) => img.DocType === docType && img.SpaceID === spaceId)
          .map((img) => ({
            DocType: img.DocType,
            SpaceID: img.SpaceID,
            src: img.File_String,
            DocName: img.docName,
          }));

      const site = getImagesByCriteria(0, 24);
      const consent = getImagesByCriteria(1, 24);
      const proof = getImagesByCriteria(1, 35);
      const pond = getImagesByCriteria(1, 36);
      const land = getImagesByCriteria(1, 38);
      const report = getImagesByCriteria(35, 24);
      const irrigation = getImagesByCriteria(43, 24);

      setImages(site);
      setConsentImages(consent);
      setProofImages(proof);
      setFarmPondImages(pond);
      setLandDocImages(land);
      setSiteSurveyImages(report);
      setIrrigationImages(irrigation);

      setPhotographss({
        Site: site.length,
        Conset: consent.length,
        Proof: proof.length,
        FarmPond: pond.length,
        LandDoc: land.length,
        SurveyReport: report.length,
        IrrigationImages: irrigation.length,
      });

      // 4. Handle Master Record (Legacy/Fallback Data)
      const masterRows = await queryAll(
        "SELECT * FROM SiteSurveyMaster WHERE Id = ?",
        [Id],
      );

      if (masterRows.length > 0) {
        const master = masterRows[0];

        // Mapping master fields to their respective state setters
        const masterMappings = [
          {
            condition: master.ConsetDocName,
            setter: setConsentImages,
            prefix: "Conset",
          },
          {
            condition: master.ProofDocName,
            setter: setProofImages,
            prefix: "Proof",
          },
          {
            condition: master.FarmPondDocName,
            setter: setFarmPondImages,
            prefix: "FarmPond",
          },
          {
            condition: master.LandDocName,
            setter: setLandDocImages,
            prefix: "Land",
          },
          {
            condition: master.ReportDocName,
            setter: setSiteSurveyImages,
            prefix: "Report",
          },
          {
            condition: master.IrrigationDocName,
            setter: setIrrigationImages,
            prefix: "Irrigation",
          },
        ];

        masterMappings.forEach(({ condition, setter, prefix }) => {
          if (condition !== null) {
            setter((prev) => [
              ...prev,
              {
                DocType: master[`${prefix}DocType`] || master[`${prefix}Type`],
                SpaceID: master[`${prefix}SpaceID`],
                src: master[`${prefix}src`],
                DocName: master[`${prefix}DocName`],
              },
            ]);
          }
        });
      }
    } catch (error) {
      console.error("Error loading survey images:", error);
    }
  };

  const downloadImage = async (item) => {
    try {
      const dir = FileSystem.documentDirectory + "PMKUSUM/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      // ✅ File path
      const filename = dir + item.DocName;

      // ✅ Save base64 to file
      await FileSystem.writeAsStringAsync(filename, item.src, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // ✅ Success Snackbar (same behavior)
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("Imagedownloadedsuccessfullytocameraroll"),
      });

      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    } catch (error) {
      console.error("Download failed:", error);

      Alert.alert(
        i18n.t("AlertMeaasge"),
        i18n.t("NeedStoragepermissiontosavefile"),
        [{ text: i18n.t("OK") }],
      );
    }
  };

  const pdfview = async (item) => {
    // Create a directory for the PDF file
    const filePath = FileSystem.documentDirectory + item.DocName;
    const pdfbase64 =
      "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3YuVdkLsX0H5UrvuHKuy+4NgHYflRd9x2S2SF2j0ouMMCkAuKACgAoAMUAJimMKACgAoAWkIKACgAoAKACgAoAKAEKhuozRewC0AFACUxiUALQAUAFABQAUAFABQAtABSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUABGeDQA3DD0I9+D/XP6UvT+n69vk2P+v6X9egfN7D9f8AD/PahXtro+2/46fkH9f1/SHAYpiCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAD0oGIKGAtSIKljEqAA10AAoAWkIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoGJTAWkAUCCgAoAKACgAoAKACgAoAKACgAoGFABQAUAFACUwFpCCgAoAKACgAoAKACgAoAKACgAoAKAEpjFoAKQBQAUwCkAUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoADQMBQIKkApPYY2ot/WoC1uAUALSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUxiUALSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUDCgQlMYtIApgFIQUDCgQUAFABQAUAFABQAUAFABQMKAEpgLSASmAtIAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAGgYUCCkAVLASoGBrcAoAWkIKACgAoAKACgAoAKACgAoAKADFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxKYBQAtIAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUDCgApgFIAoAKACgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAAaBgKACkIKljEqAA1uAUALSEFABQAUAFAwoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAwoEFAwpgFABSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKACgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAAaBgOlABSEJUPUYVDAWtxCUwFpAFABQAUAFAwpgFIQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFMYUgCgAoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQADpQxhUiCl5DErMAroAKACgQtIAoAKBhTASgBaQCUwFpCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKBiUwFoAKQBQIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAB0oGFS3YQgNRf+tRhSYBW4BQAUCFpAFABQAUxiUALSEFAwoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUxiUAFABQAtIQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFIApgFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAIOlDGLioaATFTYApAFbiCgYUCFpAFACUxhQAUALSEFMYUhBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAwoASmAUALSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBHFIJVDr0P09cdsigCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAEHSgYtIQVL2GJUAFbgFAgoAWgApAFAwpgJQAtIBKYBQAtIQUAFABQAUAFABQAUAFABQAUAFABQAUAFAwoAKAEpgFABQAUALSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKACgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAVLEbYFGMYz/M0AW6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgANACDpQMWkIKljEqNQA1uIKACgAoGLSEFACUxhQAtIBKYC0gCgAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFMYlABQAUALSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKACgAoEFAwoAKACgAoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAAYoGFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCtZ8Qr+P8zQBZoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAHSgYUhBUsYlQAVuISgAoGOpCCgAoAKBhQAUCCgYUAFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoASmMKQBmldLdgJkUXXdBYTeo7j86odn2Deo7j86LMVhd6+o/Oiz7MQbh6il8n9zC4oINH9bAG4f5BoH/AFugDA9O1AhaACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKBhQAUAFABQIKBhQAUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAKljnyVzwef/QjQBboAKACgAoAKACgAoAKACgAoAKACgAoARhkYpp2GLSEFABQAUAFABQAUAFABQAUAFABQAGgYDpQAUhBUvYYlQAHitxCd6Bi0CFpAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFADSufX8DTH/XQXb9fzNACbR7/maPu+5CAqD/APrNLTsvuQf1uGwUB9/3sQxqeoH5U7jE8pPQfkKd33YC+WvoPyFF33Yg2L6D8qLvuFkOwKQWQUALSAKACgAoAjTqw9/6CkBJTAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoGJTAKAFoAKQBQAUAFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCrZcRAdMFhz9TQBaoAKACgAoAKACgAoAKACgAoAKAG7x607MqzHUiQoAKACgAoAKACgAoAKACgAoAKACgAoADQAg6UDFpCCkAlQxiGthAKBi0ALSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACUxi0hBQAUAFABQAUAFAwoAKACgAoEFABQAUARR/eb6/wBBRb+v6/ryQEtABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFMYlABQAUAFABQAtIAoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAVLL/Vfi38z6/59KALdABQAUAFADS4HU4p2Y7NjqQgoAKACgAoAKAGhQvTv9ad2yrtjqRIUAFABQAUAFABQAUAFABQAUAFABQAUAFAAKBhSEFL1AKljGVsIUCkMWgQtIAoAKACgAoAKACgAoAazqvUgfU4oAo/2lHv8sA55AyOM/zx+FAEEepM7mMphhkDr1+n9aewBHqLFtjL82D065+mc4/T3osBPBqCyA7htKjP19ucc+1Tr1/r8wLcMyTDchyKYEtABQAUAFABQAUAFABQAUAFABQAUAFABQAUDCgQUAFABQAUAFAEafeb6j+Q/wA/54P6/r+l6dWElABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKAEpgFABQAUALSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAVbQ5Q+zMB06A47f/r9eaALVABQAUAFAELxkn8+f8/p+J5rROyNE7EwGBWZAUCCgAoAKACgCCQEHjPvj/PNaJrqaJ9yVffmoZLHUiQoAKACgAoAKACgAoAKACgAoAKACgAoABQMKBBSAKQDB0rQBRSGLQAtIQUAFABQAUAFABQBSuLsJ8keC/oe39P8AP4UAUpUaRPNI+YcN7j/63/16pe6/6/4cEyYW8cgDAbh2bp+W3n8zmp9f6/yAkMXX7v5duuMkn/PbFWop7t/h+qKt/X9P+vwEeMD5sLu9eR+PBH+e9NR7X+dn+FkTt/Vv8yMRAFmAILZyfvDnP0P6H1IPWpcWvT+vL8n/AJC0/wCH/wCH/MoFHtkYhsbgApB68g5BHpyOeevYUlZ6bf11/wCB/wAEf9f1/wAOadpeh4x5pwwIGexyMj8cUgNGgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjT7zfUfyH+f88Hn/X9fd6dWySgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxKYBQAUAFAC0gCgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAFW0GFYf7bfzoYFqgAoAKACgCORN3GcDv+WKpO3QtO3QeoAGB0pPzJfmLSEFABQAUAFABigYUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAQUDFoEFIAqGv6sMjFbAOFIBaAFpCCgAoAKACgAoAq3MxQbUwWPHUcUA9ChbwgsGZRv69/XgnJP4DqR1Pamg2NHBz1znrn/P6fyp6dhdShbt5DmFunVfp/n+tSMtbh0/z6/5/wAmtrMsVieuDj8B/X/Pr6n9f1/XyJv5DgSeDjj0xx7cf5/nUPT+n9/9ff0IevQhePgkYJPUHofr/Qjke9G/9f1/XRAk+hmzxNsVUHGTjAGc+h9SPX+IcjNTtuUaltcgkQt98Dn6jqPqO/vmkBeoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAiT77fh/Km9l/X9f1p1b/r+v6+faWkIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgYUAJTAKACgAoAWkAUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCvbDAb3cn88U2BYpAFABQAUANbGOelNX6DV+gq4xxxQ/MH5i0hCMQoyegoSvohpX0QisHGR0ptW0YNW0Y6kIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACk9AClYCMVoMcKQC0ALSEFABQAUAFACMdoJ9KAMdVMzmVlIyeB2Pt+fJ9hyO9UvLddddP6+8XmXkGDnuep/z/AJx6iqemn9f1/Wgv6/r+vvJai/T+v6/rXca/r+v6+RQu4yQHT78ZyPpnn8v/ANXpQMdFJ5qhhwD1Hpjr+X+cda0i/wCv6/r12HcmI6dxkf5/r/j3bf8AX9f16dJbsSIAOnP1FZNvzX9f1692K3n/AF/X9dRDmnv/AF/X/A8i1/X9f18yBl3A56Hrjt7j3H6jI561TWmgMzYiYZTK54Qtn346D3Pvxj06VnbqI34pBKgcdxmgCSgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAI0++34fypvZB/X9f18+ikpAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUDEpgFABQAUAFAC0gCgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBVtBgOB/z0agC1QAUAFABQAgUCncdxQMdKQgoARhuBHrTTs7jWmpXEKjj73PbjHftWnM/Q15n6D1VV6Z49c1Lbe5Lbe5NUGYUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABSAKACgCOrGOFIBaBC0gCgAoAKACgCOZC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FABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBVuPvxf75/wDQGoAtUAZ+pfcXOR845UZPRug9aX4+gCWCSYyzPsHyorhQdoGMkYz9KOVJ82t2v5m1917J/K4J/wBWsaNMAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgApAFABSuBBb/AHB26/zNWxk9IQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBiSLLO7OEifYcbGX5iBnnJGee3b+pZfzO/ayt00vv3fr5bF/L59f8i1aXKyyFY/lQICVwBtbJBHTOfb6HvQBo0ABoAKACgANABQBA1xGjFWYKRg8kDrQA6OaOQ4RlYjrgg/ypjJKACgBKAEpjGt0P0oA5yGaEKN8zqR1UZwPyBP6/lUkm7aFWjBRiw55brQhloUwFpAFAgoAjm+4fpTW4ElIAoAKACgYUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgYlMAoAWkAlMAoAWkAUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCpdcNEf+mg/VWFAFugDBuzKzgOshxIAoXCpjOBhs53H1yMZ7YocW0/ha21f5qz077iv01Xov6RPaEPJ8iONhIcu5IB9BywJ/QfU1MYqN0oxjr9nquj2Wv9XBX6yk/J2/RGvVDCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACkAUAFICKD7g/H+Zq2BLSAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAjESqxcDDEYJ56denSgAWJFYuBhj1P60ASUABoAKACgAoAKAMe4YeeV2JIcLjeQOvpkHPSk+90vW/8AwB+ib9CxYszgsUSMdPl65B5zx609hF+mMiklWLG443HaPrigBS6juPzpXX3AOqhjT0P0oYHOmHdDHISVC7x8udxJPGMA9cc5NSSblrvES+Z9/HP+fXHWmMtCgBaACkIKAI5uEb6GmtwJKQBQAUAJTGFAC0gCgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxKYBQAUAFAC0AFIQUAFABQAYoGFAgoAKACgAoAKACgAoAKACgAoAKACgAxQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAFS66xf8AXQf+gtQBboAyb+WXA2qFAkXBbkkj/ZHb8cnHTmjfS9vMBLC4knf7ylAoZgq4+Zs/KTnqDyfWklZWu35u1/w0D8DXpgFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFIAoAKYENv9wZ9/wCZpgTUgCgAoAKACgAoAKAEYkDjk0DM7z5Q204z9KizvZP8v+AXp2NEdOasgWgQUAFABQAUAFABQAUAFABQAUAFACUxi0gMyeCOWRw4GSigE+p3dO/agRJZSqw2KCMc898k5P55BoAv0xmPq7qqLuXcN2cZx0B7+vPGOaAMu2hiuJECxlCPmf5iRtxwc565pCOpxiqKGmgTOajmkjCqsqorMRtIUlevJJ9e31HNTp8/T9SdfkXp7SR13u3mlVO0jg7ieCAOOPWgZrxbgi7vvYGfrjmmMkoAWkIKAGSfcP0NCAfQAUAFABTGJQAtIAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUDCgAoASmAUALSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBVuuPL/66L/IigC1QAx9vG/HUYz654x756Ur2/r+v+AA8ADpxmmAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUDCgQUgCmBFAMIPx/mabAlpAFABQAUAFABQAUAFADBGAd2OTTuMfSEFABQAUAFABQAUARSGQMoQAqT8xJ6D296AAGTzCCB5eOD33f4UAS0AFABQAUAFAwoEZN1E8sjqgU/IuQwJJwWIxgjBoAns7dlPmSAKdoUKvQAfXnJNAF+gZm6iMqgyF/eDBOMA4OOtAiArIvW4Rf+AIP60r32A1h09aoYmKYzM/sqIptblgc7gME89D7UrCsaMUYjUIvRQAKAJaAFoAKQgoAjl+430NCAkoAKACgBKYwoAWkAUAFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKBhTAKAEoAKAFpCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAqXf/LP/AK6L/WgC3QBkX0MjkF2Ai8xAEGRkFgMluDnk9PY9aTdtXsAWccRk3KhXG4KxkzkjKn5c8Hr60Jxe0k3ponrrt961XkFn2f8AX9WNemAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAAKBhQIKQBQBXtTmIfj/M1QFikAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAU7u4aBQU25Y4yxwo4zkmgCnaX8ryBZAhDllGzPVep5JyvvQBr0DGum9SuSM9wcH86BGVeSBJW+Z0PlgjaCect14OPxxQA6wkVmAV3lJXLEnKqfTtg9elMDWpAZmqf6teN58xflPfrx+NAGSAUlK+Qod1GxeGAx1Y+n/wBagDpEztG7G7HOOmfamMbJKsSlnO0DuaAMyHVC658uRuTyq5HX1z1oA0oJTMu4qyezcGgCegAoAWkIKAGSjKN9D/KmtwHDpSAWgAoGJTAKAFpAFABQIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoGFABTASgBRSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBUvOif9dU/wDQsUAW6AK15AbiPYMdVPPTAIJ9e1C0Aq2WnC1YsdrHgKQOQBnnPqc84q27K0W7Pft6ab27slX62/P8/wAjTqCgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAEFAxaQgoAKAK9qcxj8f5mqAsUgCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAGeYu/y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AoAKAIpYhKMHj0I7UAVmRxDsPJBx6ZGeP6df171bUCneSvGEZsqfmxj0465P+R15pWs+/wDXl/wfmH9f1/X3DF1F1HOGHv8A5/z60WS2/r+vX7tgv/X9f5ffuTrqoPG3n6//AFv/AK9ILmhBkrvbgvyR6cAD9KPUZNQIKACgYlMAoASgBaAENAxKYBQAUAFABQAtIQtABQAtIQUAFABQAUAFMYUAFIQUAFABQAUAFABQAUAJTGLSEFABQMSmAUAFABQAUAFAC0gCgBKYC0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBlv/AMf6/wDXL+rUAalABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACd6Bi0hBUMYUAU7M/JWwi2KQxaQgoAKACgAoAKACgAoAKACgAoAKACgAoAKAEZQwwQCPegCq1jC3O3HfjI/lQAsdlDGdyrz7kn+dAFqgAoAKACgYlMAoAKACgBKBhTASgAoAKAFpALQIKACgBaQBQIKACgAoAKBhTAKQBQIKACgAoAKACgAoGFABQIKACgYUAJTAKACgAoAKAFoAKQgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgCubZTMJ8ncF247d/8aALFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACd6Bi0hBUsYlTdgVLQfJW4i2KQxaQgoAKACgAoAKACgAoAKBhQIKACgAoAKACgAoAKACgAoAKACgAoGJTAKACgAoAKAEoASmMKACgBaACkIWgBaQBQIKACgAoAKACgYUAFABQIKACgAoAKACgAoAKBhQIKACgYUwEoAKACgAoAWkAlMBaQgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKADvQMKQgqRiVNwKlp9ytxFsUhi0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMKYCUAFABQA2mMWgBKACgAFADqQgoAWkIKACgAoAKACgAoGJTAWkAUCCgAoAKBhQAlMAzRYBNwoAXNABmgAoADQAUAFABQAUALSAKACgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACd/wo6D6C1IhKkYUr+QFS0HyVuItikMWkIKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoGFAhKYxDQAlMYUAFAC0gFoEFAC0gCgQUAFABQAUDCmAlABQAtIQUAFACUxi0gEpgIRQBGy1QEeaBjsk0CEyRRYB4Y0DJAakQtABQAtIAoAKACgAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxMU7gGKAFxSAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUDG80wFzQAA0ALSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAnejoMWkIKljEqAKtrwldAkWhSAWkAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFMYlACUAJTGFAC0gFoELQAUhBQAUAFABQAUAFMYlABQAtIAoEFABTGFIQUAJimMKAGkUwGYPYUDHgetIQ7FABQAUALSAKACgAoAKYBSEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxKYC0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAnegfQWkIKQBUjKtt9ythIs0hi0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAJTGFACUxhQAUgFoEFAC0gCgQUAFABQAUAJTGFABQAUgFoAKBCUxi0gCgAoEFAwoEFABQAUAFMYlABmgBN1Fh2E3iiwWHAg0CFpAFABQIKACgAoAKACgAoAKACgAoAKACgAoGFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAE7/hR0H0FpCCkwErP5DK1qMJXQxIs0hi0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAxKYBQAlAwFAhaACgBaQgoAKACgAoAKAEpjCgAoAKACgBaQCUwFoAKACkAlMBaQgoAKACgAoGJTATFACHFMYmwUXAAmKLgPFIQtIQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAJ3/CgfQWkIKkYlK4Fa2Py1sJFkUhi0hBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACUxiUAFACAYpjHUhC0gCgQUAFABQAUAFACUxhQAUALSASmAtIBKYBQAUAFABQAtIAoEFABQMSmAtABSAKACgQUDCgAoAKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFADf4vwo6D6DqgQUhiUrgVbbha6BIsipGLQAtIQUAFABQAUAFABQAUDCgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQMSmAUAFABQAUALSAKBBQAUAFABQAUAFAwoASmAtIAoAKAEpgFABQAUAFAC0gCgQUDCgAoAKACgAoEFAwpgFIAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFACd/wAKOg+gtQIKQxKkCpb/AHa6RItCpGLQIWkAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFAwpgJQAUAFABQAtIAoEFABQAUAFABQAUAFAwoAKACgAoAbmmMM0AGaBC0AGKAFpAFAgoAKBhQAUAFABQIKACgYUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAb3/Ch7FdBayEFIApAVrb7ldIkTigY6kAtIQUAFABQAUAFABQMKACgQUAFABQMKBBQAUAFABQAUAFABQAUAFABQAUAFABQAUAJTGFABmgBKAAGgBaAFpCCgAoAKACgAoAKBhQAlMBaQBQIKAG4pjAGgBcUrgLQIKACgAoAKACgAoAKBhQAUAJTAKAFpAFABQIKACgAoAKACgAoAKACgAoGFAgoAKBhQAUCCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAA0AFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABSAKYBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFIApgFABSAKYBQAUAJSYwrMAqQEpDKtqcp/n1rrJRZ6UhjhSELSAKACgAoGFAgoAKBiUwFpAFAgoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgYlMAoAKACgBaACkIKACgAoAKACgAoGFACYpgLSAKBBQAUAFABQAUAFABQAUAFABSAKYwoEFABQAUAFAwoAKBBQAlAxaBBQAUAFABSAKYBQAUAJQMKAFoATNIAzTAAaAFoEFABQAUAFABQAZoAKAEBzSGLTEFABSAKYBQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUgCgAoAKVwCi4BQAUrjCi4BVgJTABSYBWVgCpAaQaVv6/pjGQoFXFdTIJcUgE5pDuLzS+YBzQAc0wDmlqMTmmAvNIA5oAQZ70W8wDmgAGaAF5pgLQIKACgAoAKACgAoATNABmgAzQMM0CDNIYZoAM0wEyaADNIBM0AG6mAbqAF3UALmgAzQAuaBBQAUAFABSAKAEzSuMWmAUAFABTATNACZoAWgBaBCUgFpgFABSuAUAFACUDCgAoAKLgFFwEouAhpjGjj8aQDs0XAM0wDJFADhSEFAATilcQmaLjANmi4C5ouAmaLgBNFwAmi4xKLgJ0pIBc07gGaLgLmmIM0ALmmAUAGaQC0wCkIKYCUAFAxaQhKBi0AFABTASgAoAWgQUAFABQAUAFABSAKYBSAKACmAlAxaACgQUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFIApgFIAoAKQBTsAUAFIAqgCgYlDAWotYQlSMWrSEJVki0DCkAUAFAwoEIaYwoAKAAUAFAxG6UgQooBi0CA0xhSEFABQAUAFABQA00DAUAFAC0MBDSewCUdQFFMApgMpDDtQAUmAtHUBKYDqBCigBaAFoEFABSASmMDUgNNMY40hBTAKSAKYBTAaKYx9IQUAJQAGpAWqEJ3/z7VPX5D6AKYCmkxBTGIaACgBDQAh6UhiUwA0ANoGKOlAhaYC96AHCkIKXUBrUmAw0DFWmA6kgDvQA00f1+AxRTYhKQwoAKoA/z+tAh1AAaAFpgB6UCAdaAFoAWgAoEFAxKAFpCEo6jFpCEFUhhQAGgBaACgQUAFABSAKYBQAUgCmAUgCmAUDCgAoEFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUgCmAUAFIApAFMApIAoQBVAIaBgOlDAWs+gCUPoAtWI//ZZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqIDE0OTEwMCBlbmRvYmoKNiAwIG9iaiAgPDwgL1Byb2R1Y2VyIChNYXJ2ZWxsIFNlbWljb25kdWN0b3IsIEluYy4gIC0tIGh0dHA6Ly93d3cubWFydmVsbC5jb20pICAgICAvVGl0bGUgKEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIFBERiBmcm9tIGV4aXN0aW5nIGltYWdlcy4pICAgICAvQ3JlYXRpb25EYXRlIChEOjIwMjMwNTIzMTQ0MzAxKzA1JzMwJykgICAgIC9Nb2REYXRlIChEOjIwMjMwNTIzMTQ0MzAxKzA1JzMwJykgICAgIC9BdXRob3IgKFlBU0gpICAgICAvS2V5d29yZHMgKE1SVkE4RTkuanBnKSAgICAgL1N1YmplY3QgKEltYWdlIGNvbnZlcnRlZCB0byBQREYgZm9ybWF0LikgID4+IGVuZG9iago3IDAgb2JqICA8PCAvVHlwZSAvQ2F0YWxvZyAgICAgL1BhZ2VzIDggMCBSICAgICAvVmlld2VyUHJlZmVyZW5jZXMgOSAwIFIgID4+IGVuZG9iago4IDAgb2JqICA8PCAvVHlwZSAvUGFnZXMgICAgIC9Db3VudCAxICAgICAvS2lkcyBbIDEgMCBSIF0gID4+IGVuZG9iago5IDAgb2JqICA8PCAvRml0V2luZG93IHRydWUgID4+IGVuZG9iagp4cmVmCjAgMTAKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMzEgMDAwMDAgbgowMDAwMDAwMTg4IDAwMDAwIG4KMDAwMDAwMDI4OCAwMDAwMCBuCjAwMDAwMDAzOTAgMDAwMDAgbgowMDAwMTQ5NjkwIDAwMDAwIG4KMDAwMDE0OTcxMiAwMDAwMCBuCjAwMDAxNTAwNDEgMDAwMDAgbgowMDAwMTUwMTI1IDAwMDAwIG4KMDAwMDE1MDE5NCAwMDAwMCBuCnRyYWlsZXIgIDw8IC9TaXplIDEwICAgICAvUm9vdCA3IDAgUiAgICAgL0luZm8gNiAwIFIgICAgIC9JRCBbPDFBQ0ZEQ0Y3MUJDMTQ0MjlCRkIxQ0I4QkExODNBMTc3PjwxQUNGRENGNzFCQzE0NDI5QkZCMUNCOEJBMTgzQTE3Nz5dICA+PiAKc3RhcnR4cmVmCjE1MDIzMwolJUVPRg==";
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

  const share = async (url) => {
    try {
      const result = await Share.share({
        url,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          setSnackbar({
            ...snackbar,
            showSnackbar: true,
            snackbarText: "PDF downloaded successfully to Custom Folder",
          });
          setTimeout(() => {
            setSnackbar(false);
          }, 2000);
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: "dismissed",
        });
        setTimeout(() => {
          setSnackbar(false);
        }, 2000);
      }
    } catch (error) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: error.message,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
  };

  const openFile = async () => {
    // FileSystem.downloadAsync(
    //   'https://pmkusum.hareda.gov.in/Site Survey Form.pdf',
    //   FileSystem.documentDirectory + 'Site Survey Form.pdf'
    // )
    //   .then(async ({ uri }) => {
    //     const contentURL = await FileSystem.getContentUriAsync(uri);
    //     if (Platform.OS == 'android') {
    //       await IntentLauncher.startActivityAsync(
    //         'android.intent.action.VIEW',
    //         {
    //           data: contentURL,
    //           flags: 1,
    //           type: 'application/pdf',
    //         }
    //       );
    //     } else if (Platform.OS == 'ios') {
    //       share(uri)
    //     }
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

    try {
      // Create a directory for the PDF file
      const filePath = FileSystem.documentDirectory + "Sitesurvey Report.pdf";
      const base64 =
        "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bnQgODAxL0Rlc2NlbnQgMjAwL0NhcEhlaWdodCA4MDAvQXZnV2lkdGggMzk2L01heFdpZHRoIDEzNTIvRm9udFdlaWdodCA0MDAvWEhlaWdodCAyNTAvU3RlbVYgMzkvRm9udEJCb3hbIC01MjYgMjAwIDgyNiA4MDBdIC9Gb250RmlsZTIgNzMgMCBSPj4NCmVuZG9iag0KNyAwIG9iag0KPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvTmFtZS9GMi9CYXNlRm9udC9UaW1lcyMyME5ldyMyMFJvbWFuL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZy9Gb250RGVzY3JpcHRvciA4IDAgUi9GaXJzdENoYXIgMzIvTGFzdENoYXIgMTE2L1dpZHRocyA3NCAwIFI+Pg0KZW5kb2JqDQo4IDAgb2JqDQo8PC9UeXBlL0ZvbnREZXNjcmlwdG9yL0ZvbnROYW1lL1RpbWVzIzIwTmV3IzIwUm9tYW4vRmxhZ3MgMzIvSXRhbGljQW5nbGUgMC9Bc2NlbnQgODkxL0Rlc2NlbnQgLTIxNi9DYXBIZWlnaHQgNjkzL0F2Z1dpZHRoIDQwMS9NYXhXaWR0aCAyNjE0L0ZvbnRXZWlnaHQgNDAwL1hIZWlnaHQgMjUwL0xlYWRpbmcgNDIvU3RlbVYgNDAvRm9udEJCb3hbIC01NjggLTIxNiAyMDQ2IDY5M10gPj4NCmVuZG9iag0KOSAwIG9iag0KPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvTmFtZS9GMy9CYXNlRm9udC9BcmlhbC9FbmNvZGluZy9XaW5BbnNpRW5jb2RpbmcvRm9udERlc2NyaXB0b3IgMTAgMCBSL0ZpcnN0Q2hhciAzMi9MYXN0Q2hhciAzMi9XaWR0aHMgNzUgMCBSPj4NCmVuZG9iag0KMTAgMCBvYmoNCjw8L1R5cGUvRm9udERlc2NyaXB0b3IvRm9udE5hbWUvQXJpYWwvRmxhZ3MgMzIvSXRhbGljQW5nbGUgMC9Bc2NlbnQgOTA1L0Rlc2NlbnQgLTIxMC9DYXBIZWlnaHQgNzI4L0F2Z1dpZHRoIDQ0MS9NYXhXaWR0aCAyNjY1L0ZvbnRXZWlnaHQgNDAwL1hIZWlnaHQgMjUwL0xlYWRpbmcgMzMvU3RlbVYgNDQvRm9udEJCb3hbIC02NjUgLTIxMCAyMDAwIDcyOF0gPj4NCmVuZG9iag0KMTEgMCBvYmoNCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUwL0Jhc2VGb250L0FCQ0RFRStLcnV0aSMyMERldiMyMDAxMC9FbmNvZGluZy9JZGVudGl0eS1IL0Rlc2NlbmRhbnRGb250cyAxMiAwIFIvVG9Vbmljb2RlIDc2IDAgUj4+DQplbmRvYmoNCjEyIDAgb2JqDQpbIDEzIDAgUl0gDQplbmRvYmoNCjEzIDAgb2JqDQo8PC9CYXNlRm9udC9BQkNERUUrS3J1dGkjMjBEZXYjMjAwMTAvU3VidHlwZS9DSURGb250VHlwZTIvVHlwZS9Gb250L0NJRFRvR0lETWFwL0lkZW50aXR5L0RXIDEwMDAvQ0lEU3lzdGVtSW5mbyAxNCAwIFIvRm9udERlc2NyaXB0b3IgMTUgMCBSL1cgNzggMCBSPj4NCmVuZG9iag0KMTQgMCBvYmoNCjw8L09yZGVyaW5nKElkZW50aXR5KSAvUmVnaXN0cnkoQWRvYmUpIC9TdXBwbGVtZW50IDA+Pg0KZW5kb2JqDQoxNSAwIG9iag0KPDwvVHlwZS9Gb250RGVzY3JpcHRvci9Gb250TmFtZS9BQkNERUUrS3J1dGkjMjBEZXYjMjAwMTAvRmxhZ3MgMzIvSXRhbGljQW5nbGUgMC9Bc2NlbnQgODAxL0Rlc2NlbnQgMjAwL0NhcEhlaWdodCA4MDAvQXZnV2lkdGggMzk2L01heFdpZHRoIDEzNTIvRm9udFdlaWdodCA0MDAvWEhlaWdodCAyNTAvU3RlbVYgMzkvRm9udEJCb3hbIC01MjYgMjAwIDgyNiA4MDBdIC9Gb250RmlsZTIgNzcgMCBSPj4NCmVuZG9iag0KMTYgMCBvYmoNCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUwL0Jhc2VGb250L1N5bWJvbC9FbmNvZGluZy9JZGVudGl0eS1IL0Rlc2NlbmRhbnRGb250cyAxNyAwIFIvVG9Vbmljb2RlIDc5IDAgUj4+DQplbmRvYmoNCjE3IDAgb2JqDQpbIDE4IDAgUl0gDQplbmRvYmoNCjE4IDAgb2JqDQo8PC9CYXNlRm9udC9TeW1ib2wvU3VidHlw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MDAgbg0KMDAwMDAwODAwNyAwMDAwMCBuDQowMDAwMDA4MjUzIDAwMDAwIG4NCjAwMDAwMDg0MjYgMDAwMDAgbg0KMDAwMDAwODY2NCAwMDAwMCBuDQowMDAwMDA4ODIzIDAwMDAwIG4NCjAwMDAwMDkwNDggMDAwMDAgbg0KMDAwMDAwOTE5MCAwMDAwMCBuDQowMDAwMDA5MjIwIDAwMDAwIG4NCjAwMDAwMDkzOTAgMDAwMDAgbg0KMDAwMDAwOTQ2NCAwMDAwMCBuDQowMDAwMDA5NzExIDAwMDAwIG4NCjAwMDAwMDk4MzUgMDAwMDAgbg0KMDAwMDAwOTg2NSAwMDAwMCBuDQowMDAwMDEwMDE3IDAwMDAwIG4NCjAwMDAwMTAwOTEgMDAwMDAgbg0KMDAwMDAxMDMyMSAwMDAwMCBuDQowMDAwMDAwMDIzIDY1NTM1IGYNCjAwMDAwMDAwMjQgNjU1MzUgZg0KMDAwMDAwMDAyNSA2NTUzNSBmDQowMDAwMDAwMDI2IDY1NTM1IGYNCjAwMDAwMDAwMjcgNjU1MzUgZg0KMDAwMDAwMDAyOCA2NTUzNSBmDQowMDAwMDAwMDI5IDY1NTM1IGYNCjAwMDAwMDAwMzAgNjU1MzUgZg0KMDAwMDAwMDAzMSA2NTUzNSBmDQowMDAwMDAwMDMyIDY1NTM1IGYNCjAwMDAwMDAwMzMgNjU1MzUgZg0KMDAwMDAwMDAzNCA2NTUzNSBmDQowMDAwMDAwMDM1IDY1NTM1IGYNCjAwMDAwMDAwMzYgNjU1MzUgZg0KMDAwMDAwMDAzNyA2NTUzNSBmDQowMDAwMDAwMDM4IDY1NTM1IGYNCjAwMDAwMDAwMzkgNjU1MzUgZg0KMDAwMDAwMDA0MCA2NTUzNSBmDQowMDAwMDAwMDQxIDY1NTM1IGYNCjAwMDAwMDAwNDIgNjU1MzUgZg0KMDAwMDAwMDA0MyA2NTUzNSBmDQowMDAwMDAwMDQ0IDY1NTM1IGYNCjAwMDAwMDAwNDUgNjU1MzUgZg0KMDAwMDAwMDA0NiA2NTUzNSBmDQowMDAwMDAwMDQ3IDY1NTM1IGYNCjAwMDAwMDAwNDggNjU1MzUgZg0KMDAwMDAwMDA0OSA2NTUzNSBmDQowMDAwMDAwMDUwIDY1NTM1IGYNCjAwMDAwMDAwNTEgNjU1MzUgZg0KMDAwMDAwMDA1MiA2NTUzNSBmDQowMDAwMDAwMDUzIDY1NTM1IGYNCjAwMDAwMDAwNTQgNjU1MzUgZg0KMDAwMDAwMDA1NSA2NTUzNSBmDQowMDAwMDAwMDU2IDY1NTM1IGYNCjAwMDAwMDAwNTcgNjU1MzUgZg0KMDAwMDAwMDA1OCA2NTUzNSBmDQowMDAwMDAwMDU5IDY1NTM1IGYNCjAwMDAwMDAwNjAgNjU1MzUgZg0KMDAwMDAwMDA2MSA2NTUzNSBmDQowMDAwMDAwMDYyIDY1NTM1IGYNCjAwMDAwMDAwNjMgNjU1MzUgZg0KMDAwMDAwMDA2NCA2NTUzNSBmDQowMDAwMDAwMDY1IDY1NTM1IGYNCjAwMDAwMDAwNjYgNjU1MzUgZg0KMDAwMDAwMDA2NyA2NTUzNSBmDQowMDAwMDAwMDY4IDY1NTM1IGYNCjAwMDAwMDAwNjkgNjU1MzUgZg0KMDAwMDAwMDA3MCA2NTUzNSBmDQowMDAwMDAwMDcxIDY1NTM1IGYNCjAwMDAwMDAwMDAgNjU1MzUgZg0KMDAwMDAxMTI5NSAwMDAwMCBuDQowMDAwMDExNzYyIDAwMDAwIG4NCjAwMDAwMjQ4ODQgMDAwMDAgbg0KMDAwMDAyNTExNSAwMDAwMCBuDQowMDAwMDI1MTQyIDAwMDAwIG4NCjAwMDAwMjU1NzEgMDAwMDAgbg0KMDAwMDAzNTQ1MSAwMDAwMCBuDQowMDAwMDM1NzcwIDAwMDAwIG4NCjAwMDAwMzYwNzAgMDAwMDAgbg0KMDAwMDA0ODAwNyAwMDAwMCBuDQowMDAwMDQ4MDUwIDAwMDAwIG4NCnRyYWlsZXINCjw8L1NpemUgODMvUm9vdCAxIDAgUi9JbmZvIDIxIDAgUi9JRFs8QUVBODZGQjU3QzVEQTM0RTg5NTdGQjk4RjE2RUY3RjY+PEFFQTg2RkI1N0M1REEzNEU4OTU3RkI5OEYxNkVGN0Y2Pl0gPj4NCnN0YXJ0eHJlZg0KNDg0NzQNCiUlRU9GDQp4cmVmDQowIDANCnRyYWlsZXINCjw8L1NpemUgODMvUm9vdCAxIDAgUi9JbmZvIDIxIDAgUi9JRFs8QUVBODZGQjU3QzVEQTM0RTg5NTdGQjk4RjE2RUY3RjY+PEFFQTg2RkI1N0M1REEzNEU4OTU3RkI5OEYxNkVGN0Y2Pl0gL1ByZXYgNDg0NzQvWFJlZlN0bSA0ODA1MD4+DQpzdGFydHhyZWYNCjUwMjkxDQolJUVPRg==";
      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: "base64",
      });

      // Open the PDF file using Expo's Linking
      const url = await FileSystem.getContentUriAsync(filePath);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: url,
        flags: 1,
        type: "application/pdf",
      });
    } catch (e) {
      console.log("Error", e);
    }

    // FileSystem.downloadAsync(remoteUrl, localPath).then(async ({ uri }) => {
    //   const contentURL = await FileSystem.getContentUriAsync(uri);
    //   try {

    //     if (Platform.OS == 'android') {
    //       await IntentLauncher.startActivityAsync(
    //         'android.intent.action.VIEW',
    //         {
    //           data: contentURL,
    //           flags: 1,
    //           type: 'application/pdf',
    //         }
    //       );
    //     } else if (Platform.OS == 'ios') {
    //       share(contentURL)
    //     }
    //   } catch (error) {
    //     Alert.alert('INFO', JSON.stringify(error));
    //   }
    // });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      if (isFocused === true) {
        setIsBusy(true);

        // Start fetching location asynchronously
        fetchLocation();

        try {
          apiUrl = await AsyncStorage.getItem("apiURL");
          stateCode = await AsyncStorage.getItem("stateCode");
          stateId = await AsyncStorage.getItem("stateId");
          District = await AsyncStorage.getItem("District");
          authToken = await AsyncStorage.getItem("authToken");
          const selectedComponentRoute = await AsyncStorage.getItem(
            "farmerComponent",
          );
          number = selectedComponentRoute === "b" ? 2 : 3;
          applicationNo = await AsyncStorage.getItem("applicationNo");
          deptName = await AsyncStorage.getItem("departmentName");

          const net = await NetInfo.fetch();
          setNetconnection(net.isConnected);

          if (!net.isConnected) {
            if (params.uri === undefined) {
              await fetchDataoffline();
              await fetchofflineimages();
            }
            if (params.uri !== undefined) {
              await processImageUploadOffline(
                params.type,
                params.uri,
                params.spaceID,
              );
            }
            params.uri = "";
          } else {
            if (params.base64 === undefined) {
              await fetchDataonline();
              await fetchonlineimage();
            }
            if (params.base64 !== undefined) {
              await processImageUploadOnline(
                params.type,
                params.base64,
                params.spaceID,
              );
            }
            params.base64 = "";
            setNetconnection(true);
          }
        } catch (error) {
          console.error("Error during data processing:", error);
        }

        setIsBusy(false);
      }
    })();
  }, [isFocused]);

  // Function to handle location fetching asynchronously
  // const fetchLocation = async () => {
  //   setIsBusy(true);
  //   try {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert(
  //         'Permission not granted',
  //         'Allow the app to use location service.',
  //         [{ text: 'OK' }],
  //         { cancelable: false }
  //       );
  //       return;
  //     }

  //     // const location = await Location.getCurrentPositionAsync({
  //     //   accuracy: Location.Accuracy.High,
  //     // });
  //     const location = await Location.watchPositionAsync(
  //       {
  //         accuracy: Location.Accuracy.High,
  //         timeInterval: 60000, // Update every 60 seconds
  //         distanceInterval: 1, // Update for every 1 meter
  //       })

  //     if (location) {
  //       setLatLong({
  //         ...latLong,
  //         longitude: location.coords.longitude.toFixed(6),
  //         latitude: location.coords.latitude.toFixed(6),
  //       });
  //       setIsLocationError(false);
  //     } else {
  //       Alert.alert("Error", "Unable to fetch location. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error('Error fetching location:', error);
  //     Alert.alert(
  //       'Error fetching location',
  //       'Unable to fetch Current location',
  //       [
  //         {
  //           text: i18n.t("OK"),
  //         },
  //       ]
  //     );
  //   }
  //   setIsBusy(false);
  // };
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

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={styles.locationTextContainer}>
        <IconE
          name="location"
          size={30}
          color={Colors.white}
          style={{ marginHorizontal: 3 }}
        />

        <Text style={styles.locationText}>
          Latitude : {latLong.latitude} Longitude : {latLong.longitude}
        </Text>

        <IconFA5
          name="dot-circle"
          style={{ marginLeft: 7 }}
          size={Platform.OS === "ios" ? 30 : 25}
          color={netconnection ? Colors.green : Colors.red}
        />
      </View>
      <View style={{ flex: 1, marginHorizontal: "1%" }}>
        <FlatList
          removeClippedSubviews={false}
          style={{ marginVertical: 10 }}
          contentContainerStyle={{ flexGrow: 1 }}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={getHeader}
          ListFooterComponent={getFooter}
        />
        {!isBusy && !isLocationError && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
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
                status={checkboxStatus ? "checked" : "unchecked"}
                onPress={() => {
                  setCheckboxStatus(!checkboxStatus);
                }}
              />
            </View>
            {payment.Payment === "Pay" ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: "2%",
                }}
              >
                <Text>It Is Certified that We </Text>
                <Text style={{ fontWeight: "bold" }}>{deptName}</Text>
                <Text>have inspected the said site on dated </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {moment().format("DD/MM/YYYY")}
                </Text>
                <Text>and as per site survey, the site </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {isSiteSuitable(data)}
                </Text>
                <Text>for installation of </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpCapacity(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpSubType(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpType(data)}
                </Text>
                <Text>so farmer will have to Pay Rupees </Text>
                <Text style={{ fontWeight: "bold" }}>{payment.Total}</Text>
              </View>
            ) : payment.Payment === "Refund" ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: "2%",
                }}
              >
                <Text>It Is Certified that We </Text>
                <Text style={{ fontWeight: "bold" }}>{deptName}</Text>
                <Text>have inspected the said site on dated </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {moment().format("DD/MM/YYYY")}
                </Text>
                <Text>and as per site survey, the site </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {isSiteSuitable(data)}
                </Text>
                <Text>for installation of </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpCapacity(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpSubType(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpType(data)}
                </Text>
                <Text>so farmer will be Refunded Rupees </Text>
                <Text style={{ fontWeight: "bold" }}>{payment.Total}</Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: "2%",
                }}
              >
                <Text>It Is Certified that We </Text>
                <Text style={{ fontWeight: "bold" }}>{deptName}</Text>
                <Text>have inspected the said site on dated </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {moment().format("DD/MM/YYYY")}
                </Text>
                <Text>and as per site survey, the site </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {isSiteSuitable(data)}
                </Text>
                <Text>for installation of </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpCapacity(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpSubType(data)}
                </Text>
                <Text style={{ fontWeight: "bold" }}>
                  {requiredPumpType(data)}
                </Text>
              </View>
            )}
          </View>
        )}
        {/* Save & Submit Button When Offline */}
        {!isBusy &&
          !isLocationError &&
          !isSurveyDone &&
          stateCode === "HR" &&
          !netconnection && (
            <View style={{ flexDirection: "row" }}>
              {/* Save Button */}
              <Button
                icon={() => (
                  <IconF name="save" size={22} color={Colors.white} />
                )}
                mode="contained"
                disabled={
                  contributiondata.SanctionId === 1 ||
                  contributiondata.SanctionId === 2 ||
                  contributiondata.SanctionId === 3 ||
                  contributiondata.SanctionId === 4
                }
                color={Colors.green}
                style={[styles.saveButton, { width: "49%" }]}
                labelStyle={{ color: Colors.white }}
                onPress={async () => {
                  if (!checkboxStatus) {
                    Alert.alert(
                      i18n.t("SaveSiteSurvey"),
                      i18n.t("SiteSurveyAccept"),
                      [
                        {
                          text: i18n.t("OK"),
                        },
                      ],
                    );
                    return;
                  }
                  const net = await NetInfo.fetch();
                  if (!net.isConnected) {
                    savesitesurveyoffline();
                  } else {
                    savesitesurveyonline();
                  }
                }}
              >
                {i18n.t("SaveSiteSurvey")}
              </Button>
              {/* Submit Button */}
              <Button
                icon={() => (
                  <IconF name="save" size={22} color={Colors.white} />
                )}
                mode="contained"
                color={Colors.green}
                disabled={contributiondata.SanctionId === 5}
                style={[styles.saveButton, { width: "49%" }]}
                labelStyle={{ color: Colors.white }}
                onPress={async () => {
                  if (!checkboxStatus) {
                    Alert.alert(
                      i18n.t("SubmitSiteSurvey"),
                      i18n.t("SiteSurveyAccept"),
                      [
                        {
                          text: i18n.t("OK"),
                        },
                      ],
                    );
                    return;
                  }
                  const net = await NetInfo.fetch();
                  if (!net.isConnected) {
                    submitsitesurveyoffline();
                  } else {
                    submitsitesurveyonline();
                  }
                }}
              >
                {i18n.t("SubmitSiteSurvey")}
              </Button>
            </View>
          )}
        {/* Save & Submit Button When Online */}
        {!isBusy &&
          !isLocationError &&
          !isSurveyDone &&
          stateCode === "HR" &&
          netconnection && (
            <View style={{ flexDirection: "row" }}>
              {/* Save Button */}
              {/*  */}

              <Button
                icon={() => (
                  <IconF name="save" size={22} color={Colors.white} />
                )}
                mode="contained"
                disabled={
                  isSiteSurvey ||
                  isPumpUpdate ||
                  contributiondata.SanctionId === 1 ||
                  contributiondata.SanctionId === 2 ||
                  contributiondata.SanctionId === 3 ||
                  contributiondata.SanctionId === 4
                }
                color={Colors.green}
                style={[styles.saveButton, { width: "49%" }]}
                labelStyle={{ color: Colors.white }}
                onPress={async () => {
                  if (!checkboxStatus) {
                    Alert.alert(
                      i18n.t("SaveSiteSurvey"),
                      i18n.t("SiteSurveyAccept"),
                      [
                        {
                          text: i18n.t("OK"),
                        },
                      ],
                    );
                    return;
                  }
                  const net = await NetInfo.fetch();
                  if (!net.isConnected) {
                    savesitesurveyoffline();
                  } else {
                    savesitesurveyonline();
                  }
                }}
              >
                {i18n.t("SaveSiteSurvey")}
              </Button>
              {/* Submit Button */}
              <Button
                icon={() => (
                  <IconF name="save" size={22} color={Colors.white} />
                )}
                mode="contained"
                color={Colors.green}
                style={[styles.saveButton, { width: "49%" }]}
                labelStyle={{ color: Colors.white }}
                onPress={async () => {
                  if (!checkboxStatus) {
                    Alert.alert(
                      i18n.t("SubmitSiteSurvey"),
                      i18n.t("SiteSurveyAccept"),
                      [
                        {
                          text: i18n.t("OK"),
                        },
                      ],
                    );
                    return;
                  }
                  const net = await NetInfo.fetch();
                  if (!net.isConnected) {
                    submitsitesurveyoffline();
                  } else {
                    submitsitesurveyonline();
                  }
                }}
              >
                {i18n.t("SubmitSiteSurvey")}
              </Button>
            </View>
          )}
        {/* Submit Button When State Code is not HR  */}
        {!isBusy && !isLocationError && !isSurveyDone && stateCode !== "HR" && (
          <Button
            icon={() => <IconF name="save" size={22} color={Colors.white} />}
            mode="contained"
            color={Colors.green}
            style={[styles.saveButton]}
            labelStyle={{ color: Colors.white }}
            onPress={async () => {
              if (!checkboxStatus) {
                Alert.alert(
                  i18n.t("SaveSiteSurvey"),
                  i18n.t("SiteSurveyAccept"),
                  [
                    {
                      text: i18n.t("OK"),
                    },
                  ],
                );
                return;
              }
              const net = await NetInfo.fetch();
              if (!net.isConnected) {
                submitsitesurveyoffline();
              } else {
                submitsitesurveyonline();
              }
            }}
          >
            {i18n.t("SaveSiteSurvey")}
          </Button>
        )}
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

export default SiteSurvey;

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: "column",
    margin: 3,
    padding: 3,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "#aaa",
  },

  imageTitle: {
    color: Colors.graytone,
    marginVertical: 5,
    fontWeight: "bold",
    alignSelf: "center",
    flex: 1,
  },

  tableTitle: {
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    backgroundColor: Colors.cellBackground,
    padding: 5,
  },

  itemNameCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: "center",
    backgroundColor: "#BDBDBD",
    margin: 1,
  },

  saveButton: {
    margin: 5,
    marginBottom: 5,
    borderRadius: 30,
    paddingVertical: 5,
    justifyContent: "center",
  },

  picker: {
    alignSelf: "stretch",
    flex: 1,
    marginRight: "3%",
    borderColor: Colors.cellBackground,
    borderWidth: 2,
    borderRadius: 7,
  },

  locationTextContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primaryOrange,
    height: 50,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  locationText: {
    color: Colors.white,
    fontSize: 14,
    textAlignVertical: "center",
  },

  emptyComponent: {
    fontWeight: "bold",
    color: Colors.grayAAA,
    textAlign: "center",
  },
});
