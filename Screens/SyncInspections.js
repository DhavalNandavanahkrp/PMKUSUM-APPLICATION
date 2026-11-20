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
import NetInfo from "@react-native-community/netinfo";
import { useIsFocused } from "@react-navigation/native";
import { queryAll } from "../db/exec";
import { withTransaction } from "../db/transaction";
import { setStatusBarHidden } from "expo-status-bar";

const SyncInspections = ({ navigation }) => {
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const [isBusy, setIsBusy] = useState(false);
  const [data, setData] = useState({
    headers: [
      "",
      "",
      i18n.t("farmerName"),
      i18n.t("saralNo"),
      i18n.t("inspectionDate"),
    ],
    tableData: [],
    widthArr: [50, 50, 160, 160, 160],
  });
  const [searchBy, setSearchBy] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [validationError, setValidationError] = useState({
    isVisible: false,
    message: "",
  });
  let userId = "";
  let component = "";

  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });

  const handleNewInspection = async (
    callResult,
    userId,
    component,
    stateCode,
  ) => {
    setIsBusy(true);
    try {
      await withTransaction(async (tx) => {
        const masterResult = await tx.executeSql(
          `INSERT INTO SiteInspectionMaster(
          UserId, Saral_Id, Application_No, FarmerName, FatherName, 
          RequiredPumpCapacity, RequiredPumpType, RequiredPumpsubtype, 
          SPVCapacity, Component, Inspectiondate, IsSiteInspectionSatisfy, FarmerId
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            userId,
            callResult.Data.SaralId,
            callResult.Data.ApplicationNo,
            callResult.Data.FarmerName,
            callResult.Data.FatherName,
            callResult.Data.RequiredPumpCapacity,
            callResult.Data.RequiredPumpType,
            callResult.Data.RequiredPumpsubtype,
            callResult.Data.SPV_Capacity,
            callResult.Data.DepartmentComp,
            null, // Inspectiondate
            null, // IsSiteInspectionSatisfy
            callResult.Data.FarmerId,
          ],
        );

        const MasterId = masterResult.lastInsertRowId;

        const checklistRows = await queryAll(
          "SELECT * FROM SiteInspectionChecklist WHERE Comp = ?",
          [component],
        );

        for (const item of checklistRows) {
          await tx.executeSql(
            "INSERT INTO SiteInspectionData (InspectionId, Checklist_Id, Response) VALUES (?, ?, ?)",
            [MasterId, item.Id, item.IdealResponse],
          );
        }

        const newRow = [
          userId,
          MasterId,
          callResult.Data.FarmerName,
          stateCode === "HR"
            ? callResult.Data.SaralId
            : callResult.Data.ApplicationNo,
          null, // Inspectiondate
        ];

        setData((prev) => ({
          ...prev,
          tableData: [...prev.tableData, newRow],
        }));
      });
    } catch (error) {
      console.error("Failed to create inspection record:", error);
      Alert.alert("Error", "Could not save inspection data locally.");
    } finally {
      setIsBusy(false);
    }
  };

  const searchPressed = async () => {
    setIsBusy(true);
    if (searchBy === 0 && searchText.length < 6) {
      setValidationError({
        ...validationError,
        isVisible: true,
        message: i18n.t("ApplicationNoShouldBeAtLeast6CharactersLong"),
      });
      setDataLoaded(false);
    } else {
      userId = await AsyncStorage.getItem("userId");
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
      let number =
        selectedComponent === "ComponentB"
          ? 2
          : null || selectedComponent === "ComponentA"
          ? 1
          : 3;
      let MasterId = "";
      let route = `${apiUrl}/api/${stateCode}/Compb_Consumer/M_GetFarmerDataByAppMob?applicationNo=${applicationNo}&mobileNo=${mobileno}&PROJCD=${Component}`;
      const callResult = await APIHelper.Get(route, authToken);
      if (callResult.Result) {
        const CID = callResult.Data.FarmerId;
        component = callResult.Data.DepartmentComp;
        route = `${apiUrl}api/${stateCode}/ConsumerMonitering/Mobile_Consumer_SiteInspectionChecklist_Response?CID=${CID}&Component=${number}&PROJCD=${Component}`;
        const callResult1 = await APIHelper.Get(route, authToken);
        const SiteInspectionDone = callResult1.Data.IsSiteInspectionDone;
        if (SiteInspectionDone === false) {
          Alert.alert(
            "Farmer Details",
            `Application No : ${callResult.Data.ApplicationNo}
        \nSaral No : ${callResult.Data.SaralId}
        \nFarmerName : ${callResult.Data.FarmerName} ${callResult.Data.FatherName}
        \nCapacity : ${callResult.Data.RequiredPumpCapacity} ${callResult.Data.RequiredPumpType} ${callResult.Data.RequiredPumpsubtype}
        \nSPVCapacity : ${callResult.Data.SPV_Capacity}
        \nDo You Want To Add This Farmer For Offline Site Inspection ?`,
            [
              {
                text: i18n.t("Yes"),
                onPress: async () => {
                  await handleNewInspection(
                    callResult,
                    userId,
                    component,
                    stateCode,
                  );
                },
              },
              { text: i18n.t("No") },
            ],
          );
        } else {
          Alert.alert(
            i18n.t("AlertMeaasge"),
            i18n.t("SiteInspectionDoneisalreadydone"),
            [
              {
                text: i18n.t("OK"),
              },
            ],
          );
        }
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
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
    const loadTableData = async () => {
      setIsBusy(true);
      try {
        const userId = await AsyncStorage.getItem("userId");

        const results = await queryAll(
          "SELECT UserId, Id, FarmerName, Saral_Id, Inspectiondate FROM SiteInspectionMaster WHERE UserId = ?",
          [userId],
        );

        const tableRows = results.map((row) => Object.values(row));

        setData((prevData) => ({
          ...prevData,
          tableData: tableRows,
        }));
      } catch (error) {
        console.error("Failed to load table data:", error);
      } finally {
        setIsBusy(false);
      }
    };

    if (isFocused) {
      loadTableData();
    }
  }, [isFocused]);

  const syncdata = async (rowData, index) => {
    setIsBusy(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const inspectionId = rowData[1];

      // 1. Fetch Local Data (Read-only queries don't need a transaction)
      const masterResults = await queryAll(
        "SELECT * FROM SiteInspectionMaster WHERE UserId = ? AND Id = ?",
        [userId, inspectionId],
      );

      if (masterResults.length === 0) {
        setIsBusy(false);
        return;
      }

      const masterRow = masterResults[0];
      const dataRows = await queryAll(
        "SELECT * FROM SiteInspectionData WHERE InspectionId = ?",
        [inspectionId],
      );

      // 2. Prepare Config and Payload
      const [apiUrl, stateCode, authToken, selectedComp] = await Promise.all([
        AsyncStorage.getItem("apiURL"),
        AsyncStorage.getItem("stateCode"),
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("selectedComponent"),
      ]);

      const CID = masterRow.FarmerId.toString().split(".")[0];
      const routeProjcd =
        selectedComp === "ComponentB"
          ? "b"
          : selectedComp === "ComponentC"
          ? "c"
          : "a";
      const compNumber =
        masterRow.Component === "b" ? 2 : masterRow.Component === "a" ? 1 : 3;

      const chkListDetails = dataRows.map((item) => ({
        Checklist_Id: item.Checklist_Id,
        Response: item.Response,
      }));

      const payload = {
        Checklist_Details: chkListDetails,
        CID: CID,
        Component: compNumber,
        IsSiteInspectionSatisfy: masterRow.IsSiteInspectionSatisfy === 1,
        DateTime: masterRow.Inspectiondate,
      };

      let route = `${apiUrl}/api/${stateCode}/ConsumerMonitering/Mobile_SiteInspectionChecklistAndSpInsert?PROJCD=${routeProjcd}`;
      const callResult = await APIHelper.Post1(route, authToken, payload);

      if (callResult.Result) {
        await withTransaction(async (tx) => {
          await tx.executeSql(
            "DELETE FROM SiteInspectionData WHERE InspectionId = ?",
            [inspectionId],
          );
          await tx.executeSql("DELETE FROM SiteInspectionMaster WHERE Id = ?", [
            inspectionId,
          ]);
        });

        setData((prev) => {
          const dataCopy = [...prev.tableData];
          const targetIndex = dataCopy.findIndex((e) => e[1] === inspectionId);
          if (targetIndex > -1) dataCopy.splice(targetIndex, 1);
          return { ...prev, tableData: dataCopy };
        });

        Alert.alert(
          i18n.t("siteInspection"),
          i18n.t("ResponseSaveSuccessfully"),
          [{ text: i18n.t("OK") }],
        );
      } else {
        setSnackbar({
          showSnackbar: true,
          snackbarText: `${i18n.t("Failedtostoreinformation")}: ${
            callResult.Message
          }`,
        });
        setTimeout(() => setSnackbar(false), 2000);
      }
    } catch (error) {
      console.error("Sync Error:", error);
      Alert.alert("Error", "An unexpected error occurred during sync.");
    } finally {
      setIsBusy(false);
    }
  };
  const deletedata = async (rowData, index) => {
    const inspectionId = rowData[1];
    setIsBusy(true);

    try {
      await withTransaction(async (tx) => {
        // Delete child data first to respect potential foreign key constraints
        await tx.executeSql(
          "DELETE FROM SiteInspectionData WHERE InspectionId = ?",
          [inspectionId],
        );

        // Delete master record
        await tx.executeSql("DELETE FROM SiteInspectionMaster WHERE Id = ?", [
          inspectionId,
        ]);
      });

      setData((prev) => {
        const dataCopy = [...prev.tableData];
        const index = dataCopy.findIndex((e) => e[1] === inspectionId);
        if (index !== -1) {
          dataCopy.splice(index, 1);
        }
        return { ...prev, tableData: dataCopy };
      });

      Alert.alert(i18n.t("SyncInspections"), i18n.t("yourinspectionisdone"), [
        { text: i18n.t("OK") },
      ]);
    } catch (error) {
      console.error("Deletion failed:", error);
      Alert.alert(
        i18n.t("SyncInspections"),
        `${i18n.t("dataDoes'tDeletePleaseCheckIt")} ${error.message}`,
        [{ text: i18n.t("OK") }],
      );
    } finally {
      setIsBusy(false);
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
            Alert.alert(
              i18n.t("SyncInspections"),
              i18n.t("ConfirmSiteInspectionSync"),
              [
                {
                  text: i18n.t("Yes"),
                  onPress: async () => {
                    await syncdata(rowData, index);
                  },
                },
                {
                  text: i18n.t("No"),
                },
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
    ) : (
      ""
    );

  const deleteElement = (rowData, index) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(i18n.t("SyncInspections"), i18n.t("DeleteSiteInspection"), [
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

  const navigateElement = (rowData, index) => (
    <TouchableOpacity
      onPress={async () => {
        const net = await NetInfo.fetch();
        if (!net.isConnected) {
          navigation.navigate("SiteInspection", { Id: rowData[1] });
        } else {
          Alert.alert(
            i18n.t("AlertMeaasge"),
            i18n.t("Pleaseturnoffinternetconnection"),
            [
              {
                text: i18n.t("OK"),
              },
            ],
          );
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

export default SyncInspections;

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
