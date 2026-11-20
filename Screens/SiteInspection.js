import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { RadioButton, Snackbar, Button } from "react-native-paper";
import * as APIHelper from "../Data/APIHelper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import { useIsFocused } from "@react-navigation/native";
import OTPTextInput from "react-native-otp-textinput";
import {
  Feather as IconF,
  MaterialCommunityIcons as IconMC,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
} from "@expo/vector-icons";
import { getDb } from "../db/db";

const SiteInspection = ({ route, navigation }) => {
  const { Id } = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [mode, setMode] = useState(true);
  const [data1, setData1] = useState([]);
  const [isConnected, setIsconnected] = useState(false);
  const [isSurveyDone, setIsSurveyDone] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [data, setData] = useState({ mobileNo: 0 });
  const [displaydata, setDisplayData] = useState([]);
  const [verificationData, setVerificationData] = useState({
    date: new Date(),
    dateDisplay: moment().format("YYYY-MM-DD"),
    showPicker: false,
    selection: 1,
  });
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [pumpDescription, setPumpDescription] = useState("");

  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  const isFocused = useIsFocused();

  const renderHeader = () => {
    return (
      <View>
        <View
          style={[
            styles.tableTitle,
            {
              backgroundColor: mode ? Colors.green : Colors.grayAAA,
              borderColor: mode ? Colors.green : Colors.grayAAA,
            },
          ]}
        >
          <Text style={[styles.headerText, { flex: 2 }]}>
            {i18n.t("CheckListItem")}
          </Text>
          <Text style={[styles.headerText, { flex: 1 }]}>
            {i18n.t("Input")}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemNameCell}>
        <Text>{item.Name}</Text>
      </View>
      <View style={styles.itemValueCell}>
        {item.FieldType === "Boolean" ? (
          <View style={{ flexDirection: "row", marginLeft: -12 }}>
            <RadioButton
              color={Colors.green}
              uncheckedColor={Colors.grayAAA}
              disabled={isSurveyDone}
              value="true"
              status={item.Response === "true" ? "checked" : "unchecked"}
              onPress={() => {
                const updatedData = data1.map((obj, i) =>
                  i === index ? { ...obj, Response: "yes" } : obj,
                );
                setData1(updatedData);
              }}
            />
            <Text style={{ textAlignVertical: "center" }}>{i18n.t("Yes")}</Text>
            <RadioButton
              color={Colors.green}
              uncheckedColor={Colors.grayAAA}
              disabled={isSurveyDone}
              value="false"
              status={item.Response === "false" ? "checked" : "unchecked"}
              onPress={() => {
                const updatedData = data1.map((obj, i) =>
                  i === index ? { ...obj, Response: "no" } : obj,
                );
                setData1(updatedData);
              }}
            />
            <Text style={{ textAlignVertical: "center" }}>{i18n.t("No")}</Text>
          </View>
        ) : item.FieldType === "String" ? (
          <TextInput
            style={[
              Styles.textInput,
              { color: isSurveyDone ? Colors.black : Colors.graytone },
            ]}
            numberOfLines={5}
            multiline={true}
            placeholder={"Remarks"}
            editable={!isSurveyDone}
            onChangeText={(value) => {
              const copyData = [...data1];
              const newItem = {
                ...copyData[index],
                Response: value,
              };
              copyData.splice(index, 1, newItem);
              setData1(copyData);
            }}
          >
            {item.Response}
          </TextInput>
        ) : (
          <View>
            <TextInput
              style={[
                Styles.textInput,
                {
                  textAlign: "right",
                  paddingRight: 5,
                  color: isSurveyDone ? Colors.black : Colors.graytone,
                },
              ]}
              keyboardType="numeric"
              editable={!isSurveyDone}
              onChangeText={(value) => {
                const copyData = [...data1];
                const newItem = {
                  ...copyData[index],
                  Response: value,
                };
                copyData.splice(index, 1, newItem);
                setData1(copyData);
              }}
            >
              {item.Response}
            </TextInput>
            <Text style={styles.inputSubText}>
              [{item.IdealResponse1} - {item.Sign}]
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const fetchDataOnline = async () => {
    setIsBusy(true);
    const [apiUrl, stateCode, authToken, CID, selectedComponent] =
      await Promise.all([
        AsyncStorage.getItem("apiURL"),
        AsyncStorage.getItem("stateCode"),
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("farmerId"),
        AsyncStorage.getItem("selectedComponent"),
      ]);

    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : selectedComponent === "ComponentC"
        ? "c"
        : "a";

    let number =
      selectedComponent === "ComponentB"
        ? 2
        : selectedComponent === "ComponentA"
        ? 1
        : 3;

    const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/Mobile_Consumer_SiteInspectionChecklist_Response?CID=${CID}&Component=${number}&PROJCD=${Component}`;
    let rowItems = [];
    const callResult = await APIHelper.Get(route, authToken);
    if (callResult && callResult.Data) {
      const data = callResult.Data.Checklist_Details.sort((a, b) =>
        a.Sequence > b.Sequence ? 1 : -1,
      );
      data.forEach((element) => {
        let idealResponse = element.IdealResponse;
        rowItems.push({
          Checklist_Id: element.Checklist_Id,
          Name: element.Name,
          FieldType: element.FieldType,
          List: element.DropdownValues,
          Sign: element.Sign,
          Sequence: element.Sequence,
          Response: element.Response,
          IdealResponse1: idealResponse,
          IdealResponse: callResult.Data.IsSiteInspectionDone
            ? element.Response
            : idealResponse,
        });
      });
      setIsSurveyDone(callResult.Data.IsSiteInspectionDone);
      const date =
        callResult.Data.DateTime != null
          ? moment(callResult.Data.DateTime, "YYYY-MM-DD")
          : moment();
      setVerificationData({
        ...verificationData,
        selection: callResult.Data.IsSiteInspectionSatisfy ? "1" : "0",
        date: date.toDate(),
        dateDisplay: date.format("YYYY-MM-DD"),
      });
    }
    setIsBusy(false);
    return rowItems;
  };

  const mobileNodetails = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("authToken");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/UserAuth/GetUserProfile?userId=${userId}&PROJCD=${Component}`;
    const callResult = await APIHelper.Get(route, token);
    if (callResult && callResult.Result) {
      setData((prev) => ({
        ...prev,
        mobileNo: callResult.Data.PhoneNumber,
      }));
    }
  };

  const mobileNoOTPRequest = async () => {
    if (data.mobileNo.toString().length !== 10) {
      setData({ ...data, showMobileNoError: true });
      return;
    }
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const route = `${apiUrl}api/UserAuth/SendOTPForConsumerGetData?mobileNo=${data.mobileNo}`;
    const callResult = await APIHelper.Get2(route);
    if (callResult.Flag) {
      setData({ ...data, mobileNoEntered: true });
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("UserDoesnotExistMobile"),
      });
    }
    setIsBusy(false);
  };

  const InputOTP = (val) => {
    setData({ ...data, inputOTP: val });
  };

  const loadInspectionData = async (Id) => {
    try {
      const db = await getDb();
      const masterRow = await db.getFirstAsync(
        "SELECT * FROM SiteInspectionMaster WHERE Id = ?",
        [Id],
      );
      if (!masterRow) return [];

      setFarmerdata((prev) => ({
        ...prev,
        SaralId: masterRow.Saral_Id,
        ApplicationNo: masterRow.Application_No,
        farmerName: `${masterRow.FarmerName} ${masterRow.FatherName}`,
        RequiredPumpCapacity: masterRow.RequiredPumpCapacity,
        RequiredPumpType: masterRow.RequiredPumpType,
        requiredPumpsubtype: masterRow.RequiredPumpsubtype,
        SPVCapacity: masterRow.SPVCapacity,
        stateCode: masterRow.StateCode || prev.stateCode,
      }));
      setPumpDescription(
        `${masterRow.RequiredPumpCapacity} HP ${masterRow.RequiredPumpType} ${masterRow.RequiredPumpsubtype}`,
      );
      const checklistRows = await db.getAllAsync(
        `SELECT d.InspectionId, d.Checklist_Id, d.Response, c.Name, c.FieldType, 
              c.Sign, c.Sequence, c.Comp, c.IdealResponse 
        FROM SiteInspectionData d 
        JOIN SiteInspectionChecklist c ON d.Checklist_Id = c.Id 
        WHERE c.Comp = ? AND d.InspectionId = ?`,
        [masterRow.Component, masterRow.Id],
      );

      if (checklistRows.length > 0) {
        const compVal = checklistRows[0].Comp;
        const compNumber = compVal === "b" ? 2 : compVal === "a" ? 1 : 3;

        const formattedList = checklistRows.map((element) => ({
          Checklist_Id: element.Checklist_Id,
          Name: element.Name,
          FieldType: element.FieldType,
          Sign: element.Sign,
          Sequence: element.Sequence,
          Response: element.Response,
          Component: compNumber,
          IdealResponse1: element.IdealResponse,
          IdealResponse: masterRow.IsSiteInspectionSatisfy
            ? element.Response
            : element.IdealResponse,
        }));

        setIsSurveyDone(masterRow.IsSiteInspectionSatisfy === "1");
        const date = masterRow.Inspectiondate
          ? moment(masterRow.Inspectiondate, "YYYY-MM-DD")
          : moment();

        setVerificationData({
          selection: masterRow.IsSiteInspectionSatisfy || "1",
          date: date.toDate(),
          dateDisplay: date.format("YYYY-MM-DD"),
          showPicker: false,
        });

        return formattedList;
      }
      return [];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  };

  const fetchDataOffline = async () => {
    return await loadInspectionData(Id);
  };

  const saveOfflineSiteInspection = async () => {
    setIsBusy(true);
    try {
      const db = await getDb();
      await db.withTransactionAsync(async () => {
        for (const element of data1) {
          await db.runAsync(
            `UPDATE SiteInspectionData SET Response = ? WHERE InspectionId = ? AND Checklist_Id = ?`,
            [element.Response, Id, element.Checklist_Id],
          );
        }
        await db.runAsync(
          `UPDATE SiteInspectionMaster SET Inspectiondate = ?, IsSiteInspectionSatisfy = ? WHERE Id = ?`,
          [verificationData.dateDisplay, verificationData.selection, Id],
        );
      });
      Alert.alert(
        i18n.t("siteInspection"),
        i18n.t("ResponseSaveSuccessfully"),
        [
          {
            text: i18n.t("OK"),
            onPress: () => navigation.navigate("SyncInspections"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        i18n.t("siteInspection"),
        i18n.t("ResponsenotSaveSuccessfully"),
      );
    } finally {
      setIsBusy(false);
    }
  };

  const saveOnlineSiteInspection = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const CID = await AsyncStorage.getItem("farmerId");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");

    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : selectedComponent === "ComponentC"
        ? "c"
        : "a";
    let number =
      selectedComponent === "ComponentB"
        ? 2
        : selectedComponent === "ComponentA"
        ? 1
        : 3;

    const chkListDetails = data1.map((item) => ({
      Checklist_Id: item.Checklist_Id,
      Response: item.Response || "",
    }));

    const payload = {
      Checklist_Details: chkListDetails,
      CID: CID,
      Component: number,
      IsSiteInspectionSatisfy: verificationData.selection === "1",
      DateTime: verificationData.date,
    };

    const callResult = await APIHelper.Post1(
      `${apiUrl}/api/${stateCode}/ConsumerMonitering/Mobile_SiteInspectionChecklistAndSpInsert?PROJCD=${Component}`,
      authToken,
      payload,
    );

    if (callResult && callResult.Result === true) {
      const statusRoute = `${apiUrl}api/${stateCode}/ConsumerMonitering/Cns_StatusDateChange?cId=${CID}&statusId=12&subStatusId=-1&dateTime=${verificationData.dateDisplay}&Component=${number}&PROJCD=${Component}`;
      await APIHelper.Post1(statusRoute, authToken, null);
      Alert.alert(
        i18n.t("siteInspection"),
        i18n.t("ResponseSaveSuccessfully"),
        [{ text: i18n.t("OK"), onPress: () => navigation.goBack() }],
      );
    }
    setIsBusy(false);
  };

  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    ApplicationNo: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    selectedComponent: "",
    requiredPumpType: "",
    requiredPumpsubtype: "",
    stateCode: "",
  });

  const farmerdetails = async () => {
    const [
      name,
      saral,
      appNo,
      pType,
      pCap,
      spv,
      selComp,
      reqPType,
      reqPSub,
      sCode,
    ] = await Promise.all([
      AsyncStorage.getItem("farmerName"),
      AsyncStorage.getItem("SaralId"),
      AsyncStorage.getItem("applicationNo"),
      AsyncStorage.getItem("RequiredPumpType"),
      AsyncStorage.getItem("RequiredPumpCapacity"),
      AsyncStorage.getItem("SPVCapacity"),
      AsyncStorage.getItem("selectedComponent"),
      AsyncStorage.getItem("requiredPumpType"),
      AsyncStorage.getItem("requiredPumpsubtype"),
      AsyncStorage.getItem("stateCode"),
    ]);

    setFarmerdata({
      farmerName: name,
      SaralId: saral,
      ApplicationNo: appNo,
      RequiredPumpCapacity: pCap,
      RequiredPumpType: pType,
      SPVCapacity: spv,
      selectedComponent: selComp,
      requiredPumpType: reqPType,
      requiredPumpsubtype: reqPSub,
      stateCode: sCode,
    });
    setPumpDescription(`${pCap} HP ${reqPType} ${reqPSub}`);
  };

  useEffect(() => {
    (async () => {
      setIsBusy(true);
      const net = await NetInfo.fetch();
      let items = [];
      if (!net.isConnected) {
        setIsconnected(false);
        items = await fetchDataOffline();
      } else {
        setIsconnected(true);
        await farmerdetails();
        await mobileNodetails();
        items = await fetchDataOnline();
      }
      setData1(items);
      setIsBusy(false);
    })();
  }, [isFocused]);

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={{ margin: 10 }}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconMC
              name="account-outline"
              size={25}
              color={Colors.graytone}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.cellTextRight}>{Farmerdata.farmerName}</Text>
            <IconMC
              name={isConnected ? "wifi-check" : "wifi-off"}
              style={{ marginRight: 10, marginLeft: "auto" }}
              size={25}
              color={isConnected ? Colors.green : Colors.red}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconMC
              name="file-document-outline"
              size={25}
              color={Colors.graytone}
              style={{ marginRight: 10 }}
            />
            <Text style={{ alignSelf: "center", flex: 1 }}>
              {Farmerdata.stateCode === "HR"
                ? Farmerdata.SaralId
                : Farmerdata.ApplicationNo}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconMC
              name={
                Farmerdata.selectedComponent === "ComponentB"
                  ? "water-pump"
                  : "view-grid"
              }
              size={25}
              color={Colors.graytone}
              style={{ marginRight: 10 }}
            />
            <Text style={{ alignSelf: "center", flex: 1 }}>
              {Farmerdata.selectedComponent === "ComponentB"
                ? pumpDescription
                : "Solar System"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={data1}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader()}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={{ backgroundColor: "#ddd", padding: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>{i18n.t("VerificationDate")}</Text>
          <Pressable
            onPress={() =>
              setVerificationData({ ...verificationData, showPicker: true })
            }
          >
            <Text style={{ textDecorationLine: "underline" }}>
              {verificationData.dateDisplay}
            </Text>
          </Pressable>
        </View>
        {verificationData.showPicker && (
          <DateTimePicker
            value={verificationData.date}
            mode="date"
            onChange={(e, d) => {
              if (d)
                setVerificationData({
                  ...verificationData,
                  date: d,
                  dateDisplay: moment(d).format("YYYY-MM-DD"),
                  showPicker: false,
                });
              else
                setVerificationData({ ...verificationData, showPicker: false });
            }}
          />
        )}
        <Text style={{ marginTop: 10 }}>{i18n.t("VerificationTitle")}</Text>
        <View style={{ flexDirection: "row", marginLeft: -10 }}>
          <RadioButton.Group
            onValueChange={(newValue) =>
              setVerificationData({ ...verificationData, selection: newValue })
            }
            value={verificationData.selection}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RadioButton
                value="1"
                disabled={isSurveyDone}
                color={Colors.green}
              />
              <Text>{i18n.t("Satisfied")}</Text>
              <RadioButton
                value="0"
                disabled={isSurveyDone}
                color={Colors.green}
              />
              <Text>{i18n.t("NotSatisfied")}</Text>
            </View>
          </RadioButton.Group>
        </View>
      </View>

      {!isSurveyDone && (
        <Button
          mode="contained"
          color={Colors.green}
          style={{ margin: 10 }}
          onPress={async () => {
            const net = await NetInfo.fetch();
            net.isConnected
              ? setisModalVisible(true)
              : await saveOfflineSiteInspection();
          }}
        >
          {i18n.t("SaveSiteInspection")}
        </Button>
      )}

      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 15 }}
            >
              Verify OTP
            </Text>
            <Text>Mobile: {data.mobileNo}</Text>
            {data.mobileNoEntered ? (
              <OTPTextInput handleTextChange={InputOTP} inputCount={4} />
            ) : (
              <Button
                mode="contained"
                onPress={mobileNoOTPRequest}
                style={{ marginTop: 20 }}
              >
                Get OTP
              </Button>
            )}
            {data.mobileNoEntered && (
              <Button
                mode="contained"
                onPress={saveOnlineSiteInspection}
                style={{ marginTop: 10 }}
              >
                Verify & Save
              </Button>
            )}
            <Button onPress={() => setisModalVisible(false)}>Cancel</Button>
          </View>
        </View>
      </Modal>

      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SiteInspection;

const styles = StyleSheet.create({
  headerText: {
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "roboto-regular",
    marginVertical: 5,
    color: Colors.white,
  },
  tableTitle: {
    borderWidth: 1,
    borderColor: Colors.grayAAA,
    padding: 5,
    flexDirection: "row",
  },
  itemNameCell: {
    flex: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: "center",
    margin: 1,
    marginBottom: 0,
    borderBottomColor: "#BDBDBD",
    borderBottomWidth: 2,
    borderRightColor: "#BDBDBD",
    borderRightWidth: 2,
  },
  itemValueCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: "center",
    borderBottomColor: "#BDBDBD",
    borderBottomWidth: 2,
  },
  saveButton: {
    margin: 5,
    paddingVertical: 5,
    borderRadius: 7,
    borderColor: Colors.primaryPurple,
    borderWidth: 2,
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    flex: 1,
    borderColor: "#BDBDBD",
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  inputSubText: {
    marginTop: 10,
    textAlign: "right",
  },
  button: {
    borderWidth: 2,
    marginVertical: 5,
    borderRadius: 30,
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
    marginRight: 5,
  },
  signin: {
    marginTop: 30,
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
  },
  inputTitle: {
    color: Colors.graytone,
    marginLeft: 30,
    marginTop: 20,
    fontSize: 14,
    fontFamily: "roboto-regular",
  },
  resendOTPText: {
    color: Colors.graytone,
    marginTop: 20,
    textDecorationLine: "underline",
  },
  otpInputText: {
    textAlign: "center",
    alignItems: "center",
    marginTop: 30,
    color: Colors.graytone,
  },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
    fontSize: 14,
    marginLeft: 30,
  },
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
  action: {
    flexDirection: "row",
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    padding: 15,
    marginTop: 200,
  },
  modalView: {
    padding: 50,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#aaa",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 30,
  },
});
