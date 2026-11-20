import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Caption } from "react-native-paper";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import i18n from "i18n-js";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
} from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as backgroundNotification from "../Components/BackgroundNotification";
import { getDb } from "../db/db";
import { withTransaction } from "../db/transaction";
import { queryAll } from "../db/exec";

const Settings = ({ navigation }) => {
  const [role, setRole] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [notification, setNotification] = useState({
    icon: "notifications-none",
    text: "None",
  });

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      const role1 = await AsyncStorage.getItem("departmentRole");
      setRole(role1.toUpperCase());
      const allowNotification = await AsyncStorage.getItem("allowNotification");
      if (allowNotification === "true") {
        setNotification({
          ...notification,
          icon: "notifications-off",
          text: i18n.t("turnoff"),
        });
      } else {
        setNotification({
          ...notification,
          icon: "notifications-on",
          text: i18n.t("turnon"),
        });
      }
    })();
  }, [isFocused]);

  const SyncData = async () => {
    console.log("Sync Started");
    try {
      resetDatabaseSchema(false);
      setIsBusy(true);
      const apiUrl = await AsyncStorage.getItem("apiURL");
      const stateCode = await AsyncStorage.getItem("stateCode");
      const authToken = await AsyncStorage.getItem("authToken");
      const stateId = await AsyncStorage.getItem("stateId");
      let route = "";
      let callResult = "";
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
            ? "c"
            : "a";

      {
        /* SiteinspectionChecklist */
      }
      const SiteinspectionDeletequery = `DELETE FROM SiteInspectionChecklist`;
      route = `${apiUrl}api/${stateCode}/Master_SiteInspection_Checklist/GetList?Component=1&PROJCD=${Component}`;
      const Insertsiteinspectionchecklista =
        await Insertsiteinspectionchecklist(route, authToken);
      const InspectionVersionA = await siteinspectonversion(route, authToken);

      route = `${apiUrl}api/${stateCode}/Master_SiteInspection_Checklist/GetList?Component=2&PROJCD=${Component}`;
      const Insertsiteinspectionchecklistb =
        await Insertsiteinspectionchecklist(route, authToken);
      const InspectionVersionB = await siteinspectonversion(route, authToken);

      route = `${apiUrl}api/${stateCode}/Master_SiteInspection_Checklist/GetList?Component=3&PROJCD=${Component}`;
      const Insertsiteinspectionchecklistc =
        await Insertsiteinspectionchecklist(route, authToken);
      const InspectionVersionC = await siteinspectonversion(route, authToken);

      {
        /* SiteSurveyChecklist */
      }
      const SitesurveyDeletequery = `DELETE FROM SiteSurveyChecklist`;
      route = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=1&PROJCD=${Component}`;
      const Insertsitesurveylista = await Insertsitesurveychecklist(
        route,
        authToken,
      );
      const SurveyVersionA = await sitesurveyversion(route, authToken);

      route = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=2&PROJCD=${Component}`;
      const Insertsitesurveylistb = await Insertsitesurveychecklist(
        route,
        authToken,
      );
      const SurveyVersionB = await sitesurveyversion(route, authToken);

      route = `${apiUrl}api/${stateCode}/Master_SiteSurvey_Checklist/GetList?Component=3&PROJCD=${Component}`;
      const Insertsitesurveylistc = await Insertsitesurveychecklist(
        route,
        authToken,
      );
      const SurveyVersionC = await sitesurveyversion(route, authToken);

      {
        /* Discom */
      }
      const DiscomDeletequery = `DELETE FROM Discomlist`;
      route = `${apiUrl}api/${stateCode}/Discom/GetKeyValuePair?PROJCD=${Component}`;
      const Discominsertquery = await DiscomConstruct(route, authToken);

      {
        /* Zone */
      }
      const ZoneDeletequery = `DELETE FROM Zonelist`;
      route = `${apiUrl}api/${stateCode}/Circle/GetMSEDCLZoneKeyValuePair?PROJCD=${Component}`;
      const Zoneinsertquery = await ZoneConstruct(route, authToken);

      {
        /* Circle */
      }
      const CircleDeletequery = `DELETE FROM Circlelist`;
      route = `${apiUrl}api/${stateCode}/Circle/GetKeyValuePair?PROJCD=${Component}`;
      const Circleinsertquery = await CircleConstruct(route, authToken);

      {
        /* Division */
      }
      const DivisionDeletequery = `DELETE FROM Divisionlist`;
      route = `${apiUrl}api/${stateCode}/Division/GetKeyValuePair?PROJCD=${Component}`;
      const Divisioninsertquery = await DivisionConstruct(route, authToken);

      {
        /* SUBDivision */
      }
      const SUBDivisionDeletequery = `DELETE FROM SUBDivisionlist`;
      route = `${apiUrl}api/${stateCode}/SUBDivision/GetKeyValuePair?PROJCD=${Component}`;
      const SUBDivisioninsertquery = await SUBDivisionConstruct(
        route,
        authToken,
      );

      console.log(
        "SUBDivisioninsertquery | Setting 147>>>>",
        SUBDivisioninsertquery,
      );

      {
        /* SUBStation */
      }
      const SUBStationDeletequery = `DELETE FROM SUBStationlist`;
      route = `${apiUrl}api/${stateCode}/SUBStation/GetKeyValuePair?PROJCD=${Component}`;
      const SUBStationinsertquery = await SUBStationConstruct(route, authToken);

      console.log(
        "SUBStationinsertquery | Setting 156>>>>",
        SUBStationinsertquery,
      );

      {
        /*State*/
      }
      const StateDeletequery = `DELETE FROM StateList`;
      route = "https://apipmk.hkapl.in/api/State/Map_GetKeyValuePair";
      const Stateinsertquery = await StateConstruct();

      {
        /*District*/
      }
      const DistrictDeletequery = `DELETE FROM Districtlist`;
      route = `${apiUrl}api/${stateCode}/District/GetKeyValuePair?stateCode=${stateId}&PROJCD=${Component}`;
      const Districtinsertquery = await DistrictConstruct(route, authToken);

      {
        /*Taluka*/
      }
      const TalukaDeletequery = `DELETE FROM Talukalist`;
      route = `${apiUrl}api/${stateCode}/Taluka/GetList?State_Code=${stateId}&PROJCD=${Component}`;
      const Talukainsertquery = await TalukaConstruct(route, authToken);

      {
        /*Town*/
      }
      const TownDeletequery = `DELETE FROM Townlist`;
      route = `${apiUrl}api/${stateCode}/Town/M_GetList?State_Code=${stateId}&PROJCD=${Component}`;
      const Towninsertquery = await TownConstruct(route, authToken);

      {
        /*Block*/
      }
      const Blockeletequery = `DELETE FROM BlockList`;
      route = `${apiUrl}api/${stateCode}/Block/GetList?State_Code=${stateId}`;
      const Blockinsertquery = await BlockConstruct(route, authToken);

      {
        /*RateCard*/
      }
      const RateCarddeletequery = `DELETE FROM RateCarddata`;
      route = `${apiUrl}api/${stateCode}/RateCard/GetAllPumpRate?PROJCD=${Component}`;
      const RateCardinsertquery = await RateCardConstruct(route, authToken);

      await withTransaction(async (tx) => {
        // 1. Site Inspection & Survey Checklists
        await tx.executeSql(SiteinspectionDeletequery);
        if (Insertsiteinspectionchecklista)
          await tx.executeSql(Insertsiteinspectionchecklista);
        if (Insertsiteinspectionchecklistb)
          await tx.executeSql(Insertsiteinspectionchecklistb);
        if (Insertsiteinspectionchecklistc)
          await tx.executeSql(Insertsiteinspectionchecklistc);

        await tx.executeSql(SitesurveyDeletequery);
        if (Insertsitesurveylista) await tx.executeSql(Insertsitesurveylista);
        if (Insertsitesurveylistb) await tx.executeSql(Insertsitesurveylistb);
        if (Insertsitesurveylistc) await tx.executeSql(Insertsitesurveylistc);

        // 2. Version Tracking
        await tx.executeSql("DELETE FROM VersionTable");
        await tx.executeSql(
          "INSERT into VersionTable(InspectionVersionA, InspectionVersionB, InspectionVersionC, SurveyVersionA, SurveyVersionB, SurveyVersionC) VALUES (?,?,?,?,?,?)",
          [
            InspectionVersionA,
            InspectionVersionB,
            InspectionVersionC,
            SurveyVersionA,
            SurveyVersionB,
            SurveyVersionC,
          ],
        );
        const syncTable = async (deleteQuery, insertArray) => {
          await tx.executeSql(deleteQuery);
          for (const query of insertArray) {
            await tx.executeSql(query);
          }
        };

        // 4. Execute Geography Syncs
        await syncTable(DiscomDeletequery, Discominsertquery);
        await syncTable(ZoneDeletequery, Zoneinsertquery);
        await syncTable(CircleDeletequery, Circleinsertquery);
        await syncTable(DivisionDeletequery, Divisioninsertquery);
        await syncTable(SUBDivisionDeletequery, SUBDivisioninsertquery);
        await syncTable(SUBStationDeletequery, SUBStationinsertquery);
        await syncTable(StateDeletequery, Stateinsertquery);
        await syncTable(DistrictDeletequery, Districtinsertquery);
        await syncTable(TalukaDeletequery, Talukainsertquery);
        await syncTable(TownDeletequery, Towninsertquery);
        await syncTable(Blockeletequery, Blockinsertquery);
        await syncTable(RateCarddeletequery, RateCardinsertquery);
      });

      // Success UI
      Alert.alert(
        i18n.t("syncSuccessfully"),
        i18n.t("dataStoredsuccessfully"),
        [{ text: i18n.t("OK") }],
      );
    } catch (error) {
      console.error("Sync Error: ", error);
      Alert.alert(i18n.t("syncError"), i18n.t("failedtosyncoffline"), [
        { text: i18n.t("OK") },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  const resetDatabaseSchema = async (showAlert) => {
    try {
      await withTransaction(async (tx) => {
        // 1. DROP EXISTING TABLES
        const tablesToDrop = [
          "VersionTable",
          "SiteInspectionChecklist",
          "SiteInspectionMaster",
          "SiteInspectionData",
          "SiteSurveyChecklist",
          "SaveSiteSurvey",
          "SiteSurveyMaster",
          "ImageUpload",
          "Discomlist",
          "Zonelist",
          "Circlelist",
          "Divisionlist",
          "SUBDivisionlist",
          "SUBStationlist",
          "StateList",
          "Districtlist",
          "Talukalist",
          "Townlist",
          "BlockList",
          "Weatherdata",
          "RateCarddata",
        ];

        for (const table of tablesToDrop) {
          await tx.executeSql(`DROP TABLE IF EXISTS ${table}`);
        }

        // 2. CREATE TABLES
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS VersionTable(Id integer primary key AUTOINCREMENT, InspectionVersionA integer, InspectionVersionB integer, InspectionVersionC integer, SurveyVersionA integer, SurveyVersionB integer, SurveyVersionC integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SiteInspectionChecklist(Id integer, Response text, Name text, IdealResponse text, Sign text, Sequence text, FieldType text, Comp text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SiteInspectionMaster(Id integer primary key AUTOINCREMENT, UserId text, Saral_Id text, Application_No text, FarmerName text, FatherName text, RequiredPumpCapacity text, RequiredPumpType text, RequiredPumpsubtype text, SPVCapacity text, Component text, Inspectiondate text, IsSiteInspectionSatisfy Boolean, FarmerId text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SiteInspectionData(Id integer primary key AUTOINCREMENT, InspectionId integer, Checklist_Id integer, Response text, FOREIGN KEY (InspectionId) REFERENCES SiteInspectionMaster (Id), FOREIGN KEY (Checklist_Id) REFERENCES SiteInspectionChecklist (Id))",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SiteSurveyChecklist(Id integer, Name text, IdealResponse text, FieldName text, IsEdit Boolean, FieldType text, DropDownAPI text, DropDownValues text, Sequence text, Response text, Argument text, Comp text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SiteSurveyMaster(Id integer primary key AUTOINCREMENT, UserId text, Saral_Id text, Application_No text, FarmerName text, FatherName text, MobileNO text, RequiredPumpCapacity text, RequiredPumpType text, RequiredPumpsubtype text, RequiredPumpCategory text, Component text, SiteSurveyDate text, State integer, Department integer, latitude text, longitude text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SaveSiteSurvey(Id integer primary key AUTOINCREMENT, SurveyId integer, Checklist_Id integer, FieldName text, FieldType text, Response text, FOREIGN KEY (SurveyId) REFERENCES SiteSurveyMaster (Id), FOREIGN KEY (Checklist_Id) REFERENCES SiteSurveyChecklist (Id))",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS ImageUpload(Id integer primary key AUTOINCREMENT, SurveyId integer, SpaceID integer, docName text, DocType integer, File_String text, FileName text, FOREIGN KEY (SurveyId) REFERENCES SiteSurveyMaster (Id))",
        );

        // Geography Tables
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Discomlist(Key text unique, Value text, Statecode text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Zonelist(Key text unique, Value text, Discom_Code integer, State_Code integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Circlelist(Key text unique, Value text, Discom_Code integer, State_Code integer, Zone_Id integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Divisionlist(Key text unique, Value text, Circle_Code integer, Discom_Code integer, State_Code integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SUBDivisionlist(Key text unique, Value text, Div_Code integer, Circle_Code integer, Discom_Code integer, State_Code integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SUBStationlist(Key text unique, Value text, Div_Code integer, Circle_Code integer, Discom_Code integer, State_Code integer, SUBDivision_Id integer)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS StateList(Key text unique, Value text, State_Short_Code text, StateLanguages text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Districtlist(Key text unique, Value text, Statecode text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Talukalist(Key text unique, Value text, State_Code text, District_Code text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Townlist(Key text unique, Value text, State_Code text, District_Code text, Taluka_Code text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS BlockList(Key text unique, Value text, State_Code text, District_Code text, Taluka_Code text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS Weatherdata(Id integer primary key AUTOINCREMENT, startdate text, enddate text, latitude REAL, longitude REAL, soiltype integer, statecode integer, tmin text, tmax text, rainfall text, districtcode text)",
        );
        await tx.executeSql(
          "CREATE TABLE IF NOT EXISTS RateCarddata(Id integer primary key AUTOINCREMENT, Comp text, Pump_Type text, Pump_Capacity integer, Pump_Category text, Pump_SubType text, Sanction_Id integer, Controller_Type text, farmer_Contribution_Rs text)",
        );

        // 3. SCHEMA UPGRADES (Dynamic Column Check)
        const ensureColumns = async (tableName, columns) => {
          const info = await queryAll(`PRAGMA table_info('${tableName}')`);
          const existingColumns = info.map((col) => col.name);

          for (const col of columns) {
            if (!existingColumns.includes(col.name)) {
              await tx.executeSql(
                `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`,
              );
            }
          }
        };

        // Add dynamic columns to SiteSurveyMaster
        await ensureColumns("SiteSurveyMaster", [
          { name: "SanctionId", type: "integer" },
          { name: "TypeofControllerForPump", type: "text" },
          { name: "FarmerContributionRs", type: "text" },
          { name: "Underwaterstressarea", type: "text" },
          { name: "ConsetDocType", type: "integer" },
          { name: "ConsetSpaceID", type: "integer" },
          { name: "Consetsrc", type: "text" },
          { name: "ConsetDocName", type: "text" },
          { name: "ProofDocType", type: "integer" },
          { name: "ProofSpaceID", type: "integer" },
          { name: "Proofsrc", type: "text" },
          { name: "ProofDocName", type: "text" },
          { name: "LandDocType", type: "integer" },
          { name: "LandSpaceID", type: "integer" },
          { name: "Landsrc", type: "text" },
          { name: "LandDocName", type: "text" },
          { name: "FarmPondType", type: "integer" },
          { name: "FarmPondSpaceID", type: "integer" },
          { name: "FarmPondsrc", type: "text" },
          { name: "FarmPondDocName", type: "text" },
          { name: "ReportType", type: "integer" },
          { name: "ReportSpaceID", type: "integer" },
          { name: "Reportsrc", type: "text" },
          { name: "ReportDocName", type: "text" },
          { name: "IrrigationType", type: "integer" },
          { name: "IrrigationSpaceID", type: "integer" },
          { name: "Irrigationsrc", type: "text" },
          { name: "IrrigationDocName", type: "text" },
        ]);

        // Add dynamic columns to Townlist
        await ensureColumns("Townlist", [
          { name: "Underwaterstressarea", type: "TEXT" },
        ]);

        // Add dynamic columns to ImageUpload
        await ensureColumns("ImageUpload", [
          { name: "SpaceID", type: "INTEGER" },
        ]);
      });

      if (showAlert)
        // Success Feedback
        Alert.alert(
          i18n.t("resetSuccessfully"),
          i18n.t("dataResetsuccessfully"),
          [{ text: i18n.t("OK") }],
        );
    } catch (error) {
      console.error("Database Reset Failed: ", error);
      Alert.alert(
        i18t.t("resetError"),
        `${i18n.t("failedtoresetrecord")} ${error.message}`,
      );
    }
  };

  const Insertsiteinspectionchecklist = async (route, authToken) => {
    let callResult = await APIHelper.Get(route, authToken);
    if (callResult.Result) {
      const siteInspection = constructQueryString(
        callResult.Data,
        [
          "Id",
          "Response",
          "Name",
          "IdealResponse",
          "Sign",
          "Sequence",
          "FieldType",
          "Comp",
        ],
        "SiteInspectionChecklist",
      );
      return siteInspection;
    }
  };

  const siteinspectonversion = async (route, authToken) => {
    let callResult = await APIHelper.Get(route, authToken);
    if (callResult.Data.length !== 0) {
      return callResult.Data[0].SiteInspectionVersion;
    }
  };

  const Insertsitesurveychecklist = async (route, authToken) => {
    try {
      let callResult = await APIHelper.Get(route, authToken);
      if (callResult.Result) {
        const sitesurvey = constructQueryString(
          callResult.Data,
          [
            "Id",
            "Name",
            "IdealResponse",
            "FieldName",
            "IsEdit",
            "FieldType",
            "DropDownAPI",
            "DropDownValues",
            "Sequence",
            "Response",
            "Argument",
            "Comp",
          ],
          "SiteSurveyChecklist",
        );
        return sitesurvey;
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const sitesurveyversion = async (route, authToken) => {
    let callResult = await APIHelper.Get(route, authToken);
    if (callResult.Data.length !== 0) {
      return callResult.Data[0].SiteSurveyVersion;
    }
  };

  const DiscomConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertDiscom = constructQueryString(
          element,
          ["Key", "Value"],
          "Discomlist",
        );
        temp.push(InsertDiscom);
      });
    }
    return temp;
  };

  const ZoneConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertZone = constructQueryString(
          element,
          ["Key", "Value", "Discom_Code", "State_Code"],
          "Zonelist",
        );
        temp.push(InsertZone);
      });
    }
    return temp;
  };

  const CircleConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertDiscom = constructQueryString(
          element,
          ["Key", "Value", "Discom_Code", "State_Code", "Zone_Id"],
          "Circlelist",
        );
        temp.push(InsertDiscom);
      });
    }
    return temp;
  };

  const DivisionConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertDiscom = constructQueryString(
          element,
          ["Key", "Value", "Circle_Code", "Discom_Code", "State_Code"],
          "Divisionlist",
        );
        temp.push(InsertDiscom);
      });
    }
    return temp;
  };

  const SUBDivisionConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];

    console.log(
      "SUBDivisionConstruct api callResult | Setting 448>>>>",
      callResult,
    );
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertDiscom = constructQueryString(
          element,
          [
            "Key",
            "Value",
            "Div_Code",
            "Circle_Code",
            "Discom_Code",
            "State_Code",
          ],
          "SUBDivisionlist",
        );
        console.log(
          "SUBDivisionConstruct InsertDiscom | Setting 458>>>>",
          InsertDiscom,
        );
        temp.push(InsertDiscom);
      });
    }
    return temp;
  };

  const SUBStationConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];

    console.log(
      "SUBStationConstruct api callResult | Setting 448>>>>",
      callResult,
    );
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertDiscom = constructQueryString(
          element,
          [
            "Key",
            "Value",
            "Div_Code",
            "Circle_Code",
            "Discom_Code",
            "State_Code",
            "SUBDivision_Id",
          ],
          "SUBStationlist",
        );
        console.log(
          "SUBStationConstruct InsertDiscom | Setting 470>>>>",
          InsertDiscom,
        );
        temp.push(InsertDiscom);
      });
    }
    return temp;
  };

  const StateConstruct = async () => {
    const callResult = await APIHelper.GetStates();
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let InsertState = constructQueryString(
          element,
          ["Key", "Value", "State_Short_Code", "StateLanguages"],
          "StateList",
        );
        temp.push(InsertState);
      });
    }
    return temp;
  };

  const DistrictConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let Insertdistrict = constructQueryString(
          element,
          ["Key", "Value", "StateCode"],
          "Districtlist",
        );
        temp.push(Insertdistrict);
      });
    }
    return temp;
  };

  const TalukaConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let Inserttaluka = constructQueryString(
          element,
          ["Key", "Value", "State_Code", "District_Code"],
          "Talukalist",
        );
        temp.push(Inserttaluka);
      });
    }
    return temp;
  };

  const TownConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let Inserttown = constructQueryString(
          element,
          [
            "Key",
            "Value",
            "Underwaterstressarea",
            "State_Code",
            "District_Code",
            "Taluka_Code",
          ],
          "Townlist",
        );
        temp.push(Inserttown);
      });
    }
    return temp;
  };

  const BlockConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      pages.forEach((element) => {
        let Insertblock = constructQueryString(
          element,
          ["Key", "Value", "State_Code", "District_Code", "Taluka_Code"],
          "BlockList",
        );
        temp.push(Insertblock);
      });
    }
    return temp;
  };

  const RateCardConstruct = async (route, authToken) => {
    const callResult = await APIHelper.Get3(route, authToken);
    let temp = [];
    if (callResult.Result) {
      let page_size = 5000;
      let pages = pagination(callResult.Data, page_size);
      callResult.Data.forEach((element) => {
        let Insertblock = constructQueryString(
          [element],
          [
            "Comp",
            "Pump_Type",
            "Pump_Capacity",
            "Pump_Category",
            "Pump_SubType",
            "Sanction_Id",
            "Controller_Type",
            "farmer_Contribution_Rs",
          ],
          "RateCarddata",
        );
        temp.push(Insertblock);
      });
    }
    return temp;
  };

  const pagination = (arr, size) => {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size);
      let page = acc[idx] || (acc[idx] = []);
      page.push(val);
      return acc;
    }, []);
  };

  const constructQueryString = (collection, properties, tablename) => {
    const escapeString = (str) => {
      if (typeof str === "string") {
        return str.replace(/'/g, "''"); // Replace single quotes with two single quotes
      }
      return str;
    };

    const result = collection.map((item) => {
      let str = "";
      for (let i = 0; i < properties.length; i++) {
        str += `'${escapeString(item[properties[i]])}',`;
      }
      str = str.slice(0, -1);
      return `(${str})`;
    });
    const response =
      `INSERT into ${tablename}(${properties.join(",")}) VALUES` +
      result.toString();
    return response;
  };

  const SyncClear = async () => {
    return Alert.alert(i18n.t("resetrecord"), i18n.t("resetlocaldatabase"), [
      {
        text: "yes",
        onPress: async () => {
          await resetDatabaseSchema(true);
        },
      },
      { text: "no" },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={{ margin: "1%" }}>
        {/* Profile Settings */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconF
            name="user"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconF>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("ProfileSetting")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          {/* Farmer UserProfile */}
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate(
                role.toUpperCase() === "FARMER"
                  ? "UserProfileFarmer"
                  : "UserProfile",
              );
            }}
          >
            <View>
              <View style={Styles.actionButton}>
                <IconF
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="user"
                  size={30}
                  color={Colors.graytone}
                ></IconF>
              </View>
              <Caption style={Styles.captionText}>{i18n.t("Profile")}</Caption>
            </View>
          </Pressable>
          {/* ForgotPassword */}
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("ForgotPassword");
            }}
          >
            <View>
              <View style={Styles.actionButton}>
                <IconMC
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="key-outline"
                  size={30}
                  color={Colors.graytone}
                ></IconMC>
              </View>
              <Caption style={Styles.captionText}>
                {i18n.t("ChangePassword")}
              </Caption>
            </View>
          </Pressable>
          {/* LanguageSelection */}
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={() => {
              navigation.navigate("LanguageSelection");
            }}
          >
            <View>
              <View style={Styles.actionButton}>
                <IconFA
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name="language"
                  size={30}
                  color={Colors.graytone}
                ></IconFA>
              </View>
              <Caption style={Styles.captionText}>
                {i18n.t("LanguageSelection")}
              </Caption>
            </View>
          </Pressable>
        </Animatable.View>

        {/* Syncing Settings */}
        {(role.toUpperCase() === "DISCOM" || role.toUpperCase() === "EPC") && (
          <View>
            <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
              <IconMC
                name="sync"
                size={Platform.OS === "ios" ? 20 : 15}
                color={Colors.white}
                style={{ marginHorizontal: 5, alignSelf: "center" }}
              ></IconMC>
              <Text style={{ color: Colors.white, alignSelf: "center" }}>
                {i18n.t("Syncingsetting")}
              </Text>
            </View>
            <Animatable.View
              animation="slideInLeft"
              duration={1000}
              style={[Styles.sectionView, { flexDirection: "row" }]}
            >
              {/* SyncData */}
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => SyncData()}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconMC
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="sync"
                      size={30}
                      color={Colors.graytone}
                    ></IconMC>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("syncoffline")}
                  </Caption>
                </View>
              </Pressable>

              {/* Weatherdata */}
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => navigation.navigate("Weatherdata")}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconMC
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="download"
                      size={30}
                      color={Colors.graytone}
                    ></IconMC>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("Weatherdata")}
                  </Caption>
                </View>
              </Pressable>

              {/* SyncClear */}
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => SyncClear()}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconM
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="clear"
                      size={30}
                      color={Colors.graytone}
                    ></IconM>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("resetrecord")}
                  </Caption>
                </View>
              </Pressable>
            </Animatable.View>
          </View>
        )}

        {/* Notification Settings */}
        <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
          <IconM
            name="notifications-none"
            size={Platform.OS === "ios" ? 20 : 15}
            color={Colors.white}
            style={{ marginHorizontal: 5, alignSelf: "center" }}
          ></IconM>
          <Text style={{ color: Colors.white, alignSelf: "center" }}>
            {i18n.t("notificationSettings")}
          </Text>
        </View>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[Styles.sectionView, { flexDirection: "row" }]}
        >
          {/* AllowNotification */}
          <Pressable
            style={[Styles.pressable, { flex: 0.33 }]}
            onPress={async () => {
              const allowNotification = await AsyncStorage.getItem(
                "allowNotification",
              );
              if (allowNotification === "true") {
                await AsyncStorage.setItem("allowNotification", "false");
                await backgroundNotification.disableForegroundNotification();
                setNotification({
                  ...notification,
                  icon: "notifications-on",
                  text: i18n.t("turnon"),
                });
              } else {
                await AsyncStorage.setItem("allowNotification", "true");
                await backgroundNotification.enableForegroundNotification();
                setNotification({
                  ...notification,
                  icon: "notifications-off",
                  text: i18n.t("turnoff"),
                });
              }
            }}
          >
            <View>
              <View style={Styles.actionButton}>
                <IconM
                  style={{ alignSelf: "center", alignItems: "center" }}
                  name={notification.icon}
                  size={30}
                  color={Colors.graytone}
                ></IconM>
              </View>
              <Caption style={Styles.captionText}>{notification.text}</Caption>
            </View>
          </Pressable>
        </Animatable.View>

        {/* Crop Settings */}
        {role.toUpperCase() === "FARMER" && (
          <View>
            <View style={[Styles.sectionTitle, { marginTop: 10 }]}>
              <IconMC
                name="corn"
                size={Platform.OS === "ios" ? 20 : 15}
                color={Colors.white}
                style={{ marginHorizontal: 5, alignSelf: "center" }}
              ></IconMC>
              <Text style={{ color: Colors.white, alignSelf: "center" }}>
                {i18n.t("CropSettings")}
              </Text>
            </View>
            <Animatable.View
              animation="slideInLeft"
              duration={1000}
              style={[Styles.sectionView, { flexDirection: "row" }]}
            >
              <Pressable
                style={[Styles.pressable, { flex: 0.33 }]}
                onPress={() => {
                  navigation.navigate("CropSelection");
                }}
              >
                <View>
                  <View style={Styles.actionButton}>
                    <IconMC
                      style={{ alignSelf: "center", alignItems: "center" }}
                      name="corn"
                      size={30}
                      color={Colors.graytone}
                    ></IconMC>
                  </View>
                  <Caption style={Styles.captionText}>
                    {i18n.t("CropSelection")}
                  </Caption>
                </View>
              </Pressable>
            </Animatable.View>
          </View>
        )}

        {isBusy && (
          <View style={Styles.loading}>
            <ActivityIndicator size="large" color="#F9AA33" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Settings;
