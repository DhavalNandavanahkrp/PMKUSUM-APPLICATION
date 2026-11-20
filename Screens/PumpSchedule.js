import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar } from "react-native-paper";
import i18n from "i18n-js";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as APIHelper from "../Data/APIHelper";

const zeroPad = (num, places) => String(num).padStart(places, "0");

const PumpSchedule = ({ route }) => {
  const { SCHEN, SCHSTTM, SCHDUR, SCHMODE, SCHCST } = route.params;
  const scheduleOptions = [
    { label: i18n.t("Once"), value: 0 },
    {
      label: i18n.t("Daily"),
      value: 1,
    },
    {
      label: i18n.t("Weekly"),
      value: 2,
    },
    {
      label: i18n.t("Custom"),
      value: 3,
    },
  ];
  const [isBusy, setIsBusy] = React.useState(false);
  const [start, setStart] = React.useState({
    showTimePicker: false,
    hour: 0,
    minute: 0,
    startTime: new Date(),
    scheduleDuration: SCHDUR,
    selectedOccurrence: SCHMODE,
    days: {
      isMonday: false,
      isTuesDay: false,
      isWednesday: false,
      isThursday: false,
      isFriday: false,
      isSaturday: false,
      isSunday: false,
    },
    bitPattern: SCHCST,
    showCustom: false,
    isEnabled: SCHEN === 1 ? true : false,
  });
  const [snackbar, setSnackbar] = React.useState({
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

  const daySelectionChanged = (day) => {
    if (day === "M") {
      let chars = start.bitPattern.toString().split("");
      chars[5] = start.days.isMonday ? "0" : "1";
      const bitPattern = chars.join("");

      setStart({
        ...start,
        days: {
          ...start.days,
          isMonday: !start.days.isMonday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "Tu") {
      let chars = start.bitPattern.toString().split("");
      chars[4] = start.days.isTuesday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isTuesday: !start.days.isTuesday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "W") {
      let chars = start.bitPattern.toString().split("");
      chars[3] = start.days.isWednesday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isWednesday: !start.days.isWednesday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "Th") {
      let chars = start.bitPattern.toString().split("");
      chars[2] = start.days.isThursday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isThursday: !start.days.isThursday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "F") {
      let chars = start.bitPattern.toString().split("");
      chars[1] = start.days.isFriday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isFriday: !start.days.isFriday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "Sa") {
      let chars = start.bitPattern.toString().split("");
      chars[0] = start.days.isSaturday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isSaturday: !start.days.isSaturday,
        },
        bitPattern: bitPattern,
      });
    } else if (day === "Su") {
      let chars = start.bitPattern.toString().split("");
      chars[6] = start.days.isSunday ? "0" : "1";
      const bitPattern = chars.join("");
      setStart({
        ...start,
        days: {
          ...start.days,
          isSunday: !start.days.isSunday,
        },
        bitPattern: bitPattern,
      });
    }
  };

  const disableScheduleHandler = async () => {
    setIsBusy(true);
    const failState = start.isEnabled;
    const msgType = 2;
    const priority = 1;
    const expireTime = moment()
      .add(60, "seconds")
      .format("yyyy-MM-DD HH:mm:ss");
    const deviceId = await AsyncStorage.getItem("deviceId");
    const payload = {
      device: [
        {
          deviceId: deviceId,
          msg: [
            {
              regAdd: "SCHEN",
              val: start.isEnabled ? 0 : 1,
              type: "number",
              isWrite: true,
            },
          ],
        },
      ],
    };

    const authToken = await AsyncStorage.getItem("authToken");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/OndemandReadWrite/OdandConfigReadWrite?msgType=${msgType}&priority=${priority}&ExpireTime=${expireTime}&PROJCD=${Component}`;

    const callResult = await APIHelper.Post1(route, authToken, payload);
    setIsBusy(false);

    if (callResult.Result) {
      const data = JSON.parse(callResult.Data);
      let message = "";
      if (data.IsExpired) {
        message = i18n.t("FailedToSetPumpOperationScheduleAsCommandExpired");
        setStart({ ...start, isEnabled: failState });
      } else {
        if (data.IsAcknowledge) {
          message = i18n.t("PumpOperationScheduleSetSuccessfully");
        } else {
          message = i18n.t("FailedToSetPumpOperationSchedule");
          setStart({ ...start, isEnabled: failState });
        }
        Alert.alert(i18n.t("Pump Operation"), message, [
          {
            text: i18n.t("OK"),
            style: "noStyle",
          },
        ]);
        return;
      }
    }
  };

  const saveScheduleHandler = async () => {
    setIsBusy(true);
    const SCHSTTM = `${start.hour}${start.minute}00`;
    const SCHDUR = parseInt(start.scheduleDuration);
    const msgType = 2;
    const priority = 1;
    let expireTime = moment().add(60, "seconds").format("yyyy-MM-DD HH:mm:ss");
    const deviceId = await AsyncStorage.getItem("deviceId");
    const payload = {
      device: [
        {
          deviceId: deviceId,
          msg: [
            {
              regAdd: "SCHEN",
              val: 1,
              type: "number",
              isWrite: true,
            },
            {
              regAdd: "SCHSTTM",
              val: SCHSTTM,
              type: "string",
              isWrite: true,
            },
            {
              regAdd: "SCHDUR",
              val: SCHDUR,
              type: "number",
              isWrite: true,
            },
            {
              regAdd: "SCHMODE",
              val: start.selectedOccurrence,
              type: "number",
              isWrite: true,
            },
            {
              regAdd: "SCHCST",
              val: start.bitPattern,
              type: "string",
              isWrite: true,
            },
          ],
        },
      ],
    };

    const authToken = await AsyncStorage.getItem("authToken");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/OndemandReadWrite/OdandConfigReadWrite?msgType=${msgType}&priority=${priority}&ExpireTime=${expireTime}&PROJCD=${Component}`;

    const callResult = await APIHelper.Post1(route, authToken, payload);
    setIsBusy(false);
    if (callResult.Result) {
      const data = JSON.parse(callResult.Data);
      let message = "";
      if (data.IsExpired) {
        message = i18n.t("FailedToSetPumpOperationScheduleAsCommandExpired");
      } else {
        if (data.IsAcknowledge) {
          message = i18n.t("PumpOperationScheduleSetSuccessfully");
        } else {
          message = i18n.t("FailedToSetPumpOperationSchedule");
        }
        Alert.alert(i18n.t("PumpOperation"), message, [
          {
            text: i18n.t("OK"),
            style: "noStyle",
          },
        ]);
        return;
      }
    }
  };

  useEffect(() => {
    let hours = 0;
    let minutes = 0;
    let startTime = new Date();
    try {
      hours = Math.floor(SCHSTTM / 10000);
      minutes = Math.floor(SCHSTTM / 100) % 100;
      startTime.setHours(hours);
      startTime.setMinutes(minutes);
    } catch (error) {
      console.log("Error occured");
    }

    let chars = SCHCST.toString().split("");
    setStart({
      ...start,
      hour: hours,
      minute: minutes,
      startTime: startTime,
      days: {
        ...start.days,
        isSunday: chars[6] === "1" ? true : false,
        isMonday: chars[5] === "1" ? true : false,
        isTuesday: chars[4] === "1" ? true : false,
        isWdnesday: chars[3] === "1" ? true : false,
        isThursday: chars[2] === "1" ? true : false,
        isFriday: chars[1] === "1" ? true : false,
        isSaturday: chars[0] === "1" ? true : false,
      },
      bitPattern: SCHCST,
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={{ marginVertical: 15, marginHorizontal: "2%" }}>
        <View
          style={{
            borderColor: Colors.grayAAA,
            borderWidth: 1.5,
          }}
        >
          <View
            style={{
              height: 40,
              backgroundColor: Colors.primaryOrange,
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: Colors.white,
                alignSelf: "center",
                paddingVertical: 10,
                fontWeight: "bold",
                marginHorizontal: 10,
              }}
            >
              {i18n.t("PumpOperationSchedule")}
            </Text>
            <Switch
              disabled={isBusy}
              style={{
                alignItems: "center",
                alignSelf: "center",
                marginLeft: "auto",
                marginRight: 10,
              }}
              value={start.isEnabled}
              onValueChange={() => {
                if (start.isEnabled) {
                  Alert.alert(
                    i18n.t("PumpOperationSchedule"),
                    i18n.t("AreYouSureYouWantToDisablePumpOperationSchedule"),
                    [
                      {
                        text: i18n.t("No"),
                        style: "noStyle",
                        onPress: () => setStart({ ...start, isEnabled: true }),
                      },
                      {
                        text: i18n.t("Yes"),
                        style: "yesStyle",
                        onPress: () => disableScheduleHandler(),
                      },
                    ],
                  );
                } else {
                  saveScheduleHandler();
                }
                setStart({ ...start, isEnabled: !start.isEnabled });
              }}
              //   thumbColor={start.isEnabled ? Colors.green : Colors.grayAAA}
            ></Switch>
          </View>
          {start.isEnabled && (
            <View
              style={{
                flexDirection: "row",
                padding: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {" "}
                {i18n.t("StartTime")} :{" "}
              </Text>
              <Text
                onPress={() => {
                  setStart({ ...start, showTimePicker: true });
                }}
              >
                {start.hour} : {start.minute}
              </Text>
              {start.showTimePicker && (
                <DateTimePicker
                  style={{ minWidth: 130 }}
                  value={start.startTime}
                  mode={"time"}
                  is24Hour={true}
                  display="default"
                  onChange={(e, time) => {
                    if (e.type !== "dismissed") {
                      const date = start.startTime;
                      date.setHours(time.getHours());
                      date.setMinutes(time.getMinutes());
                      setStart({
                        ...start,
                        hour: zeroPad(time.getHours(), 2),
                        minute: zeroPad(time.getMinutes(), 2),
                        showTimePicker: false,
                        startTime: date,
                      });
                    }
                  }}
                />
              )}
              <Text style={{ marginLeft: "auto" }}>
                {" "}
                {i18n.t("Minutes")} :{" "}
              </Text>
              <TextInput
                style={{
                  marginRight: 5,
                  width: 50,
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.graytone,
                  textAlign: "right",
                }}
                value={start.scheduleDuration.toString()}
                onChangeText={(val) => {
                  setStart({ ...start, scheduleDuration: val });
                }}
                keyboardType="numeric"
              ></TextInput>
            </View>
          )}
          {start.isEnabled && (
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {" "}
                {i18n.t("Occurrence")} :{" "}
              </Text>
              <View style={{ paddingHorizontal: 5 }}>
                <RadioButton labelHorizontal={true}>
                  <RadioButtonInput
                    obj={scheduleOptions[0]}
                    index={0}
                    isSelected={start.selectedOccurrence === 0}
                    onPress={(value) => {
                      setStart({
                        ...start,
                        selectedOccurrence: value,
                        showCustom: false,
                      });
                    }}
                    borderWidth={1.5}
                    buttonInnerColor={Colors.green}
                    buttonOuterColor={Colors.green}
                    buttonSize={16}
                    buttonOuterSize={22}
                    buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
                  />
                  <RadioButtonLabel
                    obj={scheduleOptions[0]}
                    index={0}
                    labelHorizontal={true}
                    onPress={(value) => {
                      setStart({
                        ...start,
                        selectedOccurrence: value,
                        showCustom: false,
                      });
                    }}
                    labelStyle={{
                      color: Colors.black,
                      margin: 5,
                      fontFamily: "roboto-regular",
                      fontSize: 14,
                    }}
                  />
                </RadioButton>
                <RadioButton labelHorizontal={true}>
                  <RadioButtonInput
                    obj={scheduleOptions[1]}
                    index={1}
                    isSelected={start.selectedOccurrence === 1}
                    onPress={(value) => {
                      setStart({
                        ...start,
                        selectedOccurrence: value,
                        showCustom: false,
                      });
                    }}
                    borderWidth={1.5}
                    buttonInnerColor={Colors.green}
                    buttonOuterColor={Colors.green}
                    buttonSize={16}
                    buttonOuterSize={22}
                    buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
                  />
                  <RadioButtonLabel
                    obj={scheduleOptions[1]}
                    index={1}
                    labelHorizontal={true}
                    onPress={(value) => {
                      setStart({ ...start, selectedOccurrence: value });
                    }}
                    labelStyle={{
                      color: Colors.black,
                      margin: 5,
                      fontFamily: "roboto-regular",
                      fontSize: 14,
                    }}
                  />
                </RadioButton>
              </View>
              <View style={{ paddingHorizontal: 5 }}>
                <RadioButton labelHorizontal={true}>
                  <RadioButtonInput
                    obj={scheduleOptions[2]}
                    index={2}
                    isSelected={start.selectedOccurrence === 2}
                    onPress={(value) => {
                      setStart({
                        ...start,
                        selectedOccurrence: value,
                        showCustom: false,
                      });
                    }}
                    borderWidth={1.5}
                    buttonInnerColor={Colors.green}
                    buttonOuterColor={Colors.green}
                    buttonSize={16}
                    buttonOuterSize={22}
                    buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
                  />
                  <RadioButtonLabel
                    obj={scheduleOptions[2]}
                    index={2}
                    labelHorizontal={true}
                    onPress={(value) => {
                      setStart({ ...start, selectedOccurrence: value });
                    }}
                    labelStyle={{
                      color: Colors.black,
                      margin: 5,
                      fontFamily: "roboto-regular",
                      fontSize: 14,
                    }}
                  />
                </RadioButton>
                <RadioButton labelHorizontal={true}>
                  <RadioButtonInput
                    obj={scheduleOptions[3]}
                    index={3}
                    isSelected={start.selectedOccurrence === 3}
                    onPress={(value) => {
                      setStart({
                        ...start,
                        selectedOccurrence: value,
                        showCustom: true,
                      });
                    }}
                    borderWidth={1.5}
                    buttonInnerColor={Colors.green}
                    buttonOuterColor={Colors.green}
                    buttonSize={16}
                    buttonOuterSize={22}
                    buttonWrapStyle={{ marginLeft: 5, marginVertical: 5 }}
                  />
                  <RadioButtonLabel
                    obj={scheduleOptions[3]}
                    index={3}
                    labelHorizontal={true}
                    onPress={(value) => {
                      setStart({ ...start, selectedOccurrence: value });
                    }}
                    labelStyle={{
                      color: Colors.black,
                      margin: 5,
                      fontFamily: "roboto-regular",
                      fontSize: 14,
                    }}
                  />
                </RadioButton>
              </View>
            </View>
          )}

          {start.isEnabled && start.showCustom ? (
            <View
              style={{
                // flexDirection: "row",
                padding: 10,
                // alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Days :
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable onPress={() => daySelectionChanged("M")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isMonday ? styles.enable : styles.disable
                      }
                    >
                      M
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("Tu")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isTuesday ? styles.enable : styles.disable
                      }
                    >
                      Tu
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("W")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isWednesday ? styles.enable : styles.disable
                      }
                    >
                      W
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("Th")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isThursday ? styles.enable : styles.disable
                      }
                    >
                      Th
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("F")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isFriday ? styles.enable : styles.disable
                      }
                    >
                      F
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("Sa")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isSaturday ? styles.enable : styles.disable
                      }
                    >
                      Sa
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => daySelectionChanged("Su")}>
                  <View style={styles.dayButton}>
                    <Text
                      style={
                        start.days.isSunday ? styles.enable : styles.disable
                      }
                    >
                      Su
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          ) : null}

          {start.isEnabled && (
            <Button
              disabled={isBusy}
              mode="outlined"
              compact={true}
              labelStyle={{ color: Colors.white }}
              style={{
                margin: 2,
                marginBottom: 5,
                borderRadius: 30,
                backgroundColor: Colors.green,
                height: 40,
              }}
              onPress={() => {
                // validate inputs
                var parseResult = parseInt(start.scheduleDuration);
                if (isNaN(parseResult)) {
                  setSnackbar({
                    ...snackbar,
                    showSnackbar: true,
                    snackbarText: i18n.t("DurationRequired"),
                  });
                  return;
                }

                if (
                  start.selectedOccurrence === 3 &&
                  start.bitPattern === "0000000"
                ) {
                  setSnackbar({
                    ...snackbar,
                    showSnackbar: true,
                    snackbarText: i18n.t("SelectAtleastOneDay"),
                  });
                  return;
                }
                Alert.alert(
                  i18n.t("PumpOperationSchedule"),
                  i18n.t("AreYouSureYouWantToSetPumpOperationSchedule"),
                  [
                    {
                      text: i18n.t("No"),
                      style: "noStyle",
                    },
                    {
                      text: i18n.t("Yes"),
                      style: "yesStyle",
                      onPress: () => saveScheduleHandler(),
                    },
                  ],
                );
              }}
            >
              {i18n.t("SaveSchedule")}
            </Button>
          )}
        </View>
      </View>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default PumpSchedule;

const styles = StyleSheet.create({
  sectionTitle: {
    zIndex: 100,
    backgroundColor: Colors.primaryOrange,
    alignSelf: "center",
    paddingVertical: 2,
    paddingHorizontal: 5,
    color: Colors.white,
    fontFamily: "roboto-regular",
    flexDirection: "row",
  },
  sectionView: {
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.grayAAA,
    marginTop: -10,
  },
  dayButton: {
    borderColor: Colors.grayAAA,
    borderRadius: 7,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    padding: 10,
    marginHorizontal: 2,
  },
  enable: {
    color: Colors.green,
    fontWeight: "bold",
  },
  disable: {
    color: Colors.grayAAA,
    fontWeight: "normal",
  },
});
