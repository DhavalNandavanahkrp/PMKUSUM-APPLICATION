import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import * as APIHelper from "../Data/APIHelper";
import SearchableDropdown from "react-native-searchable-dropdown";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as FileSystem from "expo-file-system/legacy";
import i18n from "i18n-js";
import IconMC from "@expo/vector-icons/MaterialCommunityIcons";

const Weatherdata = () => {
  const [isBusy, setIsBusy] = useState(false);
  const [stateData, setStateData] = useState([]);
  const [selectedstate, setSelectedstate] = useState([]);
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });

  const isFocused = useIsFocused();
  useEffect(() => {
    getStates();
  }, [isFocused]);

  const getStates = async () => {
    setIsBusy(true);
    const stateResult = await APIHelper.GetStates();
    if (stateResult.Result) {
      const activeStates = stateResult.Data.filter((item) => {
        return item.IsActive == true;
      }).map((item, index) => {
        return {
          Key: item.Key,
          name: item.Value,
          APIUrl: item.State_API_URL,
          BrokerIp: item.BrokerData.Ip,
          BrokerPort: item.BrokerData.Port,
          StateCode: item.State_Short_Code,
          StateLanguages: JSON.parse(item.StateLanguages),
        };
      });
      setStateData(activeStates);
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: "Failed to fetch active state list",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
    setIsBusy(false);
  };

  const CreateJsonFile = async () => {
    setIsBusy(true);
    let statecode = selectedstate.StateId;
    const latlongResult = await APIHelper.latlongdata(statecode);
    let Jsondata = JSON.stringify(latlongResult);

    let FolderName = selectedstate.StateCode;

    const directoryPath = FileSystem.documentDirectory + `${FolderName}/`;

    FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });

    const filePath = directoryPath + `${FolderName}.json`;

    FileSystem.writeAsStringAsync(filePath, Jsondata, {
      encoding: FileSystem.EncodingType.UTF8,
    })
      .then(() => {
        alert("successfully downloaded");
      })
      .catch((error) => {
        console.error("Error saving file: " + error);
        alert("Somthing went wrong, Please try again");
      });
    setIsBusy(false);
  };

  const pagination = (arr, size) => {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size);
      let page = acc[idx] || (acc[idx] = []);
      page.push(val);
      return acc;
    }, []);
  };

  const CreateDatabase = async () => {
    setIsBusy(true);

    const WeatherdataDeletequery = `DELETE FROM Weatherdata`;
    const InsertWeatherdataquery = await InsertWeatherdata();

    await storeWeatherData(WeatherdataDeletequery, InsertWeatherdataquery);

    setIsBusy(false);
  };

  const storeWeatherData = async (
    WeatherdataDeletequery,
    InsertWeatherdataquery,
  ) => {
    setIsBusy(true);

    try {
      await withTransaction(async (tx) => {
        await tx.executeSql(WeatherdataDeletequery);

        for (const sql of InsertWeatherdataquery) {
          await tx.executeSql(sql);
        }
      });
      alert(i18n.t("DataStoredSuccessfully"));
    } catch (error) {
      console.error("Weather Data Transaction Error:", error);
      alert(i18n.t("failedtosyncoffline") + error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const InsertWeatherdata = async () => {
    let statecode = selectedstate.StateId;
    const latlongResult = await APIHelper.latlongdata(statecode);

    let temp = [];

    if (latlongResult.Result) {
      let Wheatherdata = [];

      latlongResult.Data.forEach((item) => {
        let dateList = item.date_string.replace(/ 12:00:00 AM/g, "").split(",");
        const Startdate = dateList[0];
        const Enddate = dateList[dateList.length - 1];
        const Tmin = item.tmin
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();
        const Tmax = item.tmax
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();
        const Rainfall = item.rainfall
          .split(",")
          .map((num) => Number(num).toFixed(2))
          .toString();

        const obejct = {
          startdate: Startdate,
          enddate: Enddate,
          latitude: item.lat,
          longitude: item.lon,
          soiltype: item.soil_type,
          statecode: item.state_code,
          tmin: Tmin,
          tmax: Tmax,
          rainfall: Rainfall,
          districtcode: item.district_code,
        };
        Wheatherdata.push(obejct);
      });
      let page_size = 10;
      let pages = pagination(Wheatherdata, page_size);

      pages.forEach((element) => {
        let Insertweather = constructQueryString(
          element,
          [
            "startdate",
            "enddate",
            "latitude",
            "longitude",
            "soiltype",
            "statecode",
            "tmin",
            "tmax",
            "rainfall",
            "districtcode",
          ],
          "Weatherdata",
        );
        temp.push(Insertweather);
      });
    }
    return temp;
  };

  const constructQueryString = (collection, properties, tablename) => {
    var result = collection.map((item, index) => {
      let str = "";
      for (let i = 0; i < properties.length; i++) {
        str += `'${item[properties[i]]}',`;
      }
      str = str.slice(0, -1);
      return `(${str})`;
    });
    const response =
      `INSERT into ${tablename}(${properties}) VALUES` + result.toString();
    return response;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Current State selected */}
      <View style={styles.head}>
        <Text style={styles.headerText}>Selected State</Text>
      </View>
      <SearchableDropdown
        onTextChange={(text) => console.log(text)}
        onItemSelect={async (item) => {
          setSelectedstate({
            ...selectedstate,
            stateName: item.name,
            StateCode: item.StateCode,
            StateId: item.Key,
            APIUrl: item.State_API_URL,
          });
        }}
        items={stateData}
        defaultIndex={2}
        placeholder={
          selectedstate.length == 0 ? "Selected State" : selectedstate.stateName
        }
        resetValue={false}
        underlineColorAndroid="transparent"
        containerStyle={{ padding: 5 }}
        textInputStyle={{
          padding: 12,
          borderColor: Colors.grayAAA,
          borderWidth: 2,
          borderRadius: 5,
        }}
        itemStyle={{
          padding: 10,
          marginTop: 2,
          borderColor: "#bbb",
          borderWidth: 1,
          borderRadius: 5,
        }}
        itemTextStyle={{
          color: "#222",
        }}
        itemsContainerStyle={{
          maxHeight: 300,
        }}
      />

      {/* Download File */}
      <View style={styles.btnview}>
        <Button
          icon={() => (
            <IconMC name="progress-download" size={24} color={Colors.white} />
          )}
          mode="outlined"
          color={Colors.green}
          style={styles.download}
          onPress={() =>
            selectedstate.StateId !== undefined
              ? CreateDatabase()
              : Alert.alert(i18n.t("AlertMeaasge"), "Please Select State", [
                  {
                    text: "OK",
                  },
                ])
          }
        >
          <Text style={styles.btntext}>Download</Text>
        </Button>
      </View>

      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </View>
  );
};

export default Weatherdata;

const styles = StyleSheet.create({
  head: {
    margin: 10,
    marginHorizontal: "2%",
  },
  headerText: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
  btnview: {
    bottom: 20,
    width: "100%",
    position: "absolute",
  },
  btntext: {
    color: Colors.white,
    textAlign: "center",
  },
  download: {
    height: 40,
    margin: 4,
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
  },
});
