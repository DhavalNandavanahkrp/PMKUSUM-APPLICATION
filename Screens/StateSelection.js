import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { queryAll } from "../db/exec";
import {
  Pressable,
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { Button, Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import SearchableDropdown from "react-native-searchable-dropdown";

import NetInfo from "@react-native-community/netinfo";

import { Statedata } from "../Data/StateData";
import { initDatabase } from "../db/migration";
import { Feather as IconF } from "@expo/vector-icons";
const StateSelection = ({ navigation }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [stateData, setStateData] = useState([]);
  const [language, setLanguage] = useState([]);
  const [languagelist, setlanguagelist] = useState([]);

  /* #region  Snackbar configuration */
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });

  const onDismissSnackBar = () => {
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  };

  const [selectedstate, setSelectedstate] = useState([]);

  const [selectedlanguage, setSelectedlanguage] = useState([]);

  const setupdatabase = async () => {
    const StateDeletequery = `DELETE FROM StateList`;
    const Stateinsertquery = await StateConstruct();

    await initDatabase({
      Stateinsertquery,
      StateDeletequery,
    });
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        updateLanguageDisplay();
        await getStates();
      } else {
        await setupdatabase();
        updateLanguageDisplay();
        await getStates();
      }
    })();
  }, [isFocused]);

  const updateLanguageDisplay = async () => {
    const selectedLocale = await AsyncStorage.getItem("selectedLocale");
    const selectedLanguageName = await AsyncStorage.getItem(
      "selectedLanguageName",
    );
    setLanguage({
      ...language,
      locale: selectedLocale,
      name: selectedLanguageName,
    });
  };

  const getStates = async () => {
    setIsBusy(true);

    try {
      const net = await NetInfo.fetch();

      const res = await queryAll(`SELECT * FROM StateList`);

      if (res && res.length > 0) {
        const activeStates = res.map((item) => {
          let languages = [];
          try {
            // Handling potential double-stringification or escaped characters
            const rawLang = item.StateLanguages;
            languages =
              typeof rawLang === "string" ? JSON.parse(rawLang) : rawLang;
          } catch (e) {
            console.error("JSON Parse error for:", item.Value, e);
          }

          return {
            Key: item.Key,
            name: item.Value,
            APIUrl: item.APIUrl,
            BrokerIp: item.BrokerIp,
            BrokerPort: item.BrokerPort,
            StateCode: item.State_Short_Code,
            StateLanguages: languages,
          };
        });

        setStateData(activeStates);
      } else {
        showErrorSnackbar(
          net.isConnected
            ? i18n.t("statedatanotfound")
            : i18n.t("statedatanotfoundretry"),
        );
      }
    } catch (error) {
      console.error("Failed to fetch active state list:", error);
      showErrorSnackbar(i18n.t("FailedToFetchActiveStateList"));
    } finally {
      setIsBusy(false);
    }
  };

  // Helper function to keep code clean
  const showErrorSnackbar = (message) => {
    setSnackbar({
      ...snackbar,
      showSnackbar: true,
      snackbarText: message,
    });

    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, showSnackbar: false }));
    }, 2000);
  };

  const renderLanguageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Pressable
        style={styles.button}
        onPress={() => {
          setSelectedlanguage({
            ...selectedlanguage,
            selectedLanguageName: item.name,
            selectedLocale: item.locale,
          });
        }}
      >
        <Text style={styles.languageName}>{item.name}</Text>
        {selectedlanguage.selectedLocale === item.locale ? (
          <IconF
            name="check-circle"
            style={styles.right}
            color={Colors.green}
            size={20}
          />
        ) : null}
      </Pressable>
    </View>
  );

  const loginhandler = async () => {
    const net = await NetInfo.fetch();
    if (!selectedstate.stateName || selectedstate.stateName === "") {
      Alert.alert(
        "Select State and Language",
        "Please select state before proceeding",
        [{ text: "OK" }],
      );
      return;
    } else if (
      !selectedlanguage.selectedLanguageName ||
      selectedlanguage.selectedLanguageName === ""
    ) {
      Alert.alert(
        "Select State and Language",
        "Please select preferred language before proceeding",
        [{ text: "OK" }],
      );
      return;
    } else if (net.isConnected) {
      setIsBusy(true);
      await AsyncStorage.setItem("stateName", selectedstate.stateName);
      await AsyncStorage.setItem("apiURL", selectedstate.APIUrl);
      await AsyncStorage.setItem("broker", selectedstate.BrokerIp);
      await AsyncStorage.setItem("brokerPort", selectedstate.BrokerPort);
      await AsyncStorage.setItem("stateCode", selectedstate.StateCode);
      await AsyncStorage.setItem("stateId", selectedstate.StateId);
      await AsyncStorage.setItem(
        "selectedLocale",
        selectedlanguage.selectedLocale,
      );
      await AsyncStorage.setItem(
        "selectedLanguageName",
        selectedlanguage.selectedLanguageName,
      );
      await AsyncStorage.setItem(
        "StateLanguages",
        JSON.stringify(selectedstate.StateLanguages),
      );
      i18n.locale = selectedlanguage.selectedLocale;
      navigation.navigate("Login");
    } else {
      i18n.locale = selectedlanguage.selectedLocale;
      navigation.navigate("Login", {
        StateId: selectedstate.StateId,
        StateCode: selectedstate.StateCode,
        APIUrl: selectedstate.APIUrl,
      });
    }
  };

  const StateConstruct = async () => {
    let temp = [];
    let page_size = 5000;
    let pages = pagination(Statedata, page_size);

    pages.forEach((element) => {
      const data = [];
      element.map((item) => {
        const itemdata = {
          Key: item.Key,
          Value: item.Value,
          APIUrl: item.State_API_URL,
          BrokerIp: item.BrokerData.Ip,
          BrokerPort: item.BrokerData.Port,
          State_Short_Code: item.State_Short_Code,
          StateLanguages: JSON.stringify(item.StateLanguages),
        };
        data.push(itemdata);
      });
      let InsertState = constructQueryString(
        data,
        [
          "Key",
          "Value",
          "State_Short_Code",
          "StateLanguages",
          "APIUrl",
          "BrokerIp",
          "BrokerPort",
        ],
        "StateList",
      );
      temp.push(InsertState);
    });

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

  const handleSyncButtonPress = async () => {
    const net = await NetInfo.fetch();
    if (net.isConnected) {
      Alert.alert(
        "Sync StateList",
        "Are you sure you want to sync the StateList?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => await setupdatabase(true),
          },
        ],
        { cancelable: false },
      );
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "Please turn on your internet connection!",
      });
    }
  };

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      <View style={[Styles.m1h, { marginVertical: 10, flex: 1 }]}>
        {/* Current State selected */}
        <View style={styles.head}>
          <Text style={styles.headerText}>Selected State</Text>
          {/* Sync Icon Button */}
          {/* <TouchableOpacity
        style={{ position: 'absolute', top: 0, right: 0, padding: 10 }}
        onPress={handleSyncButtonPress}
      >
        <IconA name="sync" size={24} color="white" />
      </TouchableOpacity> */}
        </View>
        <SearchableDropdown
          onTextChange={(text) => console.log(text)}
          onItemSelect={(item) => {
            if (item.name) {
              let stateLanguagesArray = [];
              try {
                stateLanguagesArray = JSON.parse(item.StateLanguages);
              } catch (error) {
                console.error("Error parsing StateLanguages JSON:", error);
              }

              const latestlanguage = stateLanguagesArray.map((lang) => {
                return {
                  locale: lang.val,
                  name: lang.key,
                };
              });
              setlanguagelist(latestlanguage);

              setSelectedstate({
                ...selectedstate,
                stateName: item.name,
                APIUrl: item.APIUrl,
                BrokerIp: item.BrokerIp,
                BrokerPort: item.BrokerPort,
                StateCode: item.StateCode,
                StateId: item.Key,
                StateLanguages: stateLanguagesArray, // Update StateLanguages with the parsed array
              });
            }
          }}
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
          items={stateData}
          defaultIndex={2}
          placeholder={
            selectedstate.length == 0
              ? "Selected State"
              : selectedstate.stateName
          }
          resetValue={false}
          underlineColorAndroid="transparent"
        />

        {/* Current language selected */}
        <View>
          <View style={styles.head}>
            <Text style={styles.headerText}>Selected Language</Text>
          </View>
          <FlatList
            style={{ marginTop: 20 }}
            listKey="languageList"
            data={languagelist}
            renderItem={renderLanguageItem}
            numColumns={2}
            keyExtractor={(item, index) => index}
          />
        </View>

        {/* Enter Button */}
        <View
          style={{
            width: "100%",
            height: 50,
            position: "absolute",
            bottom: 20,
          }}
        >
          <Button
            mode="contained"
            color={Colors.green}
            style={styles.Login}
            labelStyle={{ color: Colors.white }}
            onPress={() => loginhandler()}
            loading={isBusy}
          >
            Enter
          </Button>
        </View>
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

export default StateSelection;

const styles = StyleSheet.create({
  languageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 10,
    marginRight: 5,
  },
  languageText: {
    alignSelf: "center",
    color: Colors.graytone,
    fontSize: 18,
    fontFamily: "roboto-regular",
    fontWeight: "bold",
  },
  imageContainer: {
    margin: 3,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: Colors.graytone,
    height: 50,
    flex: 0.5,
  },
  imageThumbnail: {
    flex: 1,
    height: "100%",
    width: "100%",
    resizeMode: "contain",
    marginTop: 5,
  },
  StateCode: {
    textAlign: "center",
    fontFamily: "roboto-regular",
    fontWeight: "bold",
    color: Colors.graytone,
    marginVertical: 5,
  },
  languageName: {
    textAlign: "center",
    fontFamily: "roboto-regular",
    fontWeight: "bold",
    color: Colors.graytone,
    marginVertical: 10,
  },
  icon: {
    alignSelf: "flex-end",
    marginRight: 20,
    alignItems: "center",
  },
  Login: {
    marginTop: 30,
    marginHorizontal: "2%",
    borderRadius: 30,
    backgroundColor: Colors.green,
    height: 40,
  },
  bottomView: {
    width: "100%",
    height: 0,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 450,
  },
  head: {
    backgroundColor: "#F1A221",
    padding: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
  },
  headerText: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
  right: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
});
