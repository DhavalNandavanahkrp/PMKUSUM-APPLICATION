import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TextInput,
  Text,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import * as Animatable from "react-native-animatable";
import { Styles } from "../Styles/GlobalStyles";
import { Dropdown } from "react-native-element-dropdown";
import { useIsFocused } from "@react-navigation/native";

const Systemhead = ({ navigation, route }) => {
  const Pagedata = route?.params || {};

  const [isBusy, setIsBusy] = useState(false);
  const [showError, setshowError] = useState(false);
  const [irvaluse, setirvaluse] = useState(0);
  const [days, setDays] = useState(null);
  const [source, setSource] = useState(null);
  const [pipeDiameter, setPipeDiameter] = useState(1);
  const [depthlevel, setDepthlevel] = useState(0);
  const [distanceSource, setDistanceSource] = useState(0);
  const [fourDepthOfWaterLevel, setFourDepthOfWaterLevel] = useState(0);
  const [fourHeadeRequiredForirrigation, setFourHeadeRequiredForirrigation] =
    useState(0);
  const [fourFrictionalHead, setFourFrictionalHead] = useState(0);
  const [fourTotalSystemHead, setFourTotalSystemHead] = useState(0);

  const Days = [
    { label: "20", value: "20" },
    { label: "21", value: "21" },
    { label: "22", value: "22" },
    { label: "23", value: "23" },
    { label: "24", value: "24" },
    { label: "25", value: "25" },
    { label: "26", value: "26" },
    { label: "27", value: "27" },
    { label: "28", value: "28" },
    { label: "29", value: "29" },
    { label: "30", value: "30" },
  ];

  const pipeDiameterList = [
    { label: "50", value: "50" },
    { label: "63", value: "63" },
    { label: "75", value: "75" },
    { label: "90", value: "90" },
    { label: "110", value: "110" },
    { label: "125", value: "125" },
    { label: "140", value: "140" },
    { label: "160", value: "160" },
    { label: "180", value: "180" },
    { label: "200", value: "200" },
  ];

  const Sourcedata = [
    { label: "Tubewell", value: "Tubewell" },
    { label: "Open well", value: "Open well" },
    { label: "Stream", value: "Stream" },
    { label: "Pond", value: "Pond" },
    { label: "River", value: "River" },
    { label: "Tank/Lake", value: "Tank/Lake" },
  ];

  let page3data = {
    Depthlevel: depthlevel,
    DistanceSource: distanceSource,
    PipeDiameter: pipeDiameter,
    Source: source,
    days: days,
    FourDepthOfWaterLevel: fourDepthOfWaterLevel,
    FourHeadeRequiredForirrigation: fourHeadeRequiredForirrigation,
    FourFrictionalHead: fourFrictionalHead,
    FourTotalSystemHead: fourTotalSystemHead,
    Irvaluse: irvaluse,
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      if (Pagedata.page3 !== undefined && Pagedata.page3.IsFill) {
        setDepthlevel(Pagedata.page3.P3.Depthlevel);
        setDistanceSource(Pagedata.page3.P3.DistanceSource);
        setFourDepthOfWaterLevel(Pagedata.page3.P3.FourDepthOfWaterLevel);
        setFourFrictionalHead(Pagedata.page3.P3.FourFrictionalHead);
        setFourHeadeRequiredForirrigation(
          Pagedata.page3.P3.FourHeadeRequiredForirrigation,
        );
        setFourTotalSystemHead(Pagedata.page3.P3.FourTotalSystemHead);
        setPipeDiameter(Pagedata.page3.P3.PipeDiameter);
        setSource(Pagedata.page3.P3.Source);
        setDays(Pagedata.page3.P3.days);
        setirvaluse(Pagedata.page3.P3.Irvaluse);
      } else {
        const headlist = Pagedata.page1.Cropdeatils.map((item) => {
          return item.Head;
        });
        changedMaxirrigationSystem(headlist);
      }
    })();
  }, [isFocused]);

  const CalculateMaxIrValues = async (days) => {
    let ChartValues = Pagedata.page1.Values.CHARTValue;
    let IrValues = ChartValues.map((e) => Number(e) / Number(days));
    let MaxIRValue = Math.round(Number(Math.max(...IrValues)));
    page3data.Irvaluse = MaxIRValue;
    setirvaluse(MaxIRValue);
    changedDistanceFromSource(distanceSource, pipeDiameter, MaxIRValue);
  };

  // water source dropdown list if we click Tubewell then (Depth to pumping water level) * 0.95 and other list (Depth to pumping water level) * 1;
  const changedDepthOfPumpWaterLevel = (value, watersource) => {
    let FormFourDepthOfWaterLevel = 0;
    if (watersource == "Tubewell") {
      let into = value * 0.95;
      FormFourDepthOfWaterLevel = into.toFixed(2);
    } else {
      FormFourDepthOfWaterLevel = value;
    }
    page3data.FourDepthOfWaterLevel = FormFourDepthOfWaterLevel;
    setFourDepthOfWaterLevel(FormFourDepthOfWaterLevel);
    calculateFormFourTotal(
      fourHeadeRequiredForirrigation,
      FormFourDepthOfWaterLevel,
      fourFrictionalHead,
    );
  };

  //Cropping System Details in Irrigation System DropDown Value Find max value of All Opearting Head.
  const changedMaxirrigationSystem = (headlist) => {
    let FormFourHeadeRequiredForirrigation = Math.max(...headlist).toFixed(2);
    page3data.FourHeadeRequiredForirrigation =
      FormFourHeadeRequiredForirrigation;
    setFourHeadeRequiredForirrigation(FormFourHeadeRequiredForirrigation);
    calculateFormFourTotal(
      FormFourHeadeRequiredForirrigation,
      fourDepthOfWaterLevel,
      fourFrictionalHead,
    );
  };

  //genrate Frictional head Loss (m) calculate with Frictional head Loss and Frictional head Loss and System head Change No of Days function
  const changedDistanceFromSource = (value, Diameter, MaxIr) => {
    let CalHead =
      (789000 * value * Math.pow(MaxIr / 6 / 3600, 1.75)) /
      Math.pow(Diameter, 4.75);
    let FormFourFrictionalHead = CalHead.toFixed(2);
    page3data.FourFrictionalHead = FormFourFrictionalHead;
    setFourFrictionalHead(FormFourFrictionalHead);
    calculateFormFourTotal(
      fourHeadeRequiredForirrigation,
      fourDepthOfWaterLevel,
      FormFourFrictionalHead,
    );
  };

  const calculateFormFourTotal = (
    FourHeadeRequiredForirrigation,
    FourDepthOfWaterLevel,
    FourFrictionalHead,
  ) => {
    let FormFourTotalSystemHead =
      +FourHeadeRequiredForirrigation +
      +FourDepthOfWaterLevel +
      +FourFrictionalHead;
    page3data.FourTotalSystemHead = FormFourTotalSystemHead.toFixed(2);
    setFourTotalSystemHead(FormFourTotalSystemHead.toFixed(2));
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView>
        <View style={{ margin: 10 }}>
          {/* Depth to pumping water level */}
          <Text style={styles.textchange}>Depth to pumping water level</Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateCell,
                { width: "85%", marginBottom: 5, height: 50 },
              ]}
            >
              <TextInput
                keyboardType="numeric"
                style={[
                  {
                    marginTop: 5,
                    marginBottom: 5,
                    fontSize: 16,
                    marginHorizontal: 10,
                    paddingBottom: 0,
                  },
                ]}
                defaultValue={true}
                value={depthlevel}
                onChangeText={(value) => {
                  page3data.Depthlevel = value;
                  setDepthlevel(value);
                  changedDepthOfPumpWaterLevel(value, source);
                }}
              />
              {depthlevel < 1 || (depthlevel > 100 && showError) ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    Enter the water level value between 1 to 100 m*
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
            <View
              style={[
                styles.dateCell,
                {
                  width: "15%",
                  marginBottom: 5,
                  height: 50,
                  backgroundColor: "lightgray",
                },
              ]}
            >
              <Text style={{ fontSize: 20, textAlign: "center" }}>m</Text>
            </View>
          </View>

          {/* Distance from source to field */}
          <Text style={styles.textchange}>Distance from source to field</Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateCell,
                { width: "85%", marginBottom: 5, height: 50 },
              ]}
            >
              <TextInput
                keyboardType="numeric"
                style={[
                  {
                    marginTop: 5,
                    marginBottom: 5,
                    fontSize: 16,
                    marginHorizontal: 10,
                    paddingBottom: 0,
                  },
                ]}
                defaultValue={1}
                value={distanceSource}
                onChangeText={(value) => {
                  page3data.DistanceSource = value;
                  setDistanceSource(value);
                  changedDistanceFromSource(value, pipeDiameter, irvaluse);
                }}
              />
              {distanceSource < 1 || (distanceSource > 500 && showError) ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    Enter the Distance value between 1 to 500 m*
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
            <View
              style={[
                styles.dateCell,
                {
                  width: "15%",
                  marginBottom: 5,
                  height: 50,
                  backgroundColor: "lightgray",
                },
              ]}
            >
              <Text style={{ fontSize: 20, textAlign: "center" }}>m</Text>
            </View>
          </View>

          {/* pipe diameter  */}
          <Text style={styles.textchange}>
            Pipe diameter from source to field
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateCell,
                { width: "85%", marginBottom: 5, height: 50 },
              ]}
            >
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyles}
                selectedTextStyle={{ textAlign: "left" }}
                data={pipeDiameterList}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select Pipe diameter"}
                value={pipeDiameter}
                onChange={(item) => {
                  page3data.PipeDiameter = item.value;
                  setPipeDiameter(item.value);
                  changedDistanceFromSource(
                    distanceSource,
                    item.value,
                    irvaluse,
                  );
                }}
              />
            </View>
            <View
              style={[
                styles.dateCell,
                {
                  width: "15%",
                  marginBottom: 5,
                  height: 50,
                  backgroundColor: "lightgray",
                },
              ]}
            >
              <Text style={{ fontSize: 20, textAlign: "center" }}>mm</Text>
            </View>
          </View>
          {pipeDiameter <= 1 && showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Enter the Pipe diameter from source to field*
              </Text>
            </Animatable.View>
          ) : null}

          {/* water source */}
          <Text style={styles.textchange}>Water source</Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateCell,
                { width: "85%", marginBottom: 5, height: 50 },
              ]}
            >
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyles}
                selectedTextStyle={{ textAlign: "left" }}
                data={Sourcedata}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select Water Source"}
                value={source}
                onChange={(item) => {
                  page3data.Source = item.value;
                  setSource(item.value);
                  changedDepthOfPumpWaterLevel(depthlevel, item.value);
                }}
              />
            </View>
            <View
              style={[
                styles.dateCell,
                {
                  width: "15%",
                  marginBottom: 5,
                  height: 50,
                  backgroundColor: "lightgray",
                },
              ]}
            >
              <Text style={{ fontSize: 20, textAlign: "center" }}>-</Text>
            </View>
          </View>
          {source === null && showError ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>Enter the Water source*</Text>
            </Animatable.View>
          ) : null}

          {/* Number of days */}
          <Text style={styles.textchange}>Number of days</Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateCell,
                { width: "85%", marginBottom: 5, height: 50 },
              ]}
            >
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyles}
                selectedTextStyle={{ textAlign: "left" }}
                data={Days}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select Number Of Days"}
                value={days}
                onChange={(item) => {
                  page3data.days = item.value;
                  setDays(item.value);
                  CalculateMaxIrValues(item.value);
                }}
              />
            </View>
            <View
              style={[
                styles.dateCell,
                {
                  width: "15%",
                  marginBottom: 5,
                  height: 50,
                  backgroundColor: "lightgray",
                },
              ]}
            >
              <Text style={{ fontSize: 20, textAlign: "center" }}>days</Text>
            </View>
          </View>
          {(showError && days < 20) || days > 30 ? (
            <Animatable.View animation="fadeInLeft" duration={500}>
              <Text style={styles.errorMsg}>
                Enter the value between 20 to 30 days*
              </Text>
            </Animatable.View>
          ) : null}

          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "70%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: Colors.graytone,
                  },
                ]}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    flexWrap: "wrap",
                    textAlign: "center",
                  }}
                >
                  Head Component
                </Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "30%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: Colors.graytone,
                  },
                ]}
              >
                <Text
                  style={{
                    alignSelf: "center",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    flexWrap: "wrap",
                    textAlign: "center",
                  }}
                >
                  Head
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  { width: "70%", marginBottom: 5, height: 50 },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  Depth to water level (m)
                </Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "30%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: "lightgray",
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  {fourDepthOfWaterLevel}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  { width: "70%", marginBottom: 5, height: 50 },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  Head requirement for irrigation system (m)
                </Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "30%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: "lightgray",
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  {fourHeadeRequiredForirrigation}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  { width: "70%", marginBottom: 5, height: 50 },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  Frictional head Loss (m)
                </Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "30%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: "lightgray",
                  },
                ]}
              >
                <Text style={{ textAlign: "center" }}>
                  {fourFrictionalHead}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  { width: "70%", marginBottom: 5, height: 50 },
                ]}
              >
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                  Total system head (m)
                </Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  {
                    width: "30%",
                    marginBottom: 5,
                    height: 50,
                    backgroundColor: "lightgray",
                  },
                ]}
              >
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                  {fourTotalSystemHead}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", margin: 10 }}>
        <Button
          mode="contained"
          color={Colors.green}
          style={Styles.button}
          disabled={isBusy}
          labelStyle={{ color: Colors.white }}
          onPress={() => {
            setIsBusy(true);
            setTimeout(async () => {
              Pagedata.page3 = {
                Sourcedata: Sourcedata,
                P3: page3data,
                IsFill: true,
              };
              navigation.navigate("Irrigationrequirement", Pagedata);
            }, 10);
          }}
        >
          Back
        </Button>
        <Button
          mode="contained"
          color={Colors.orange}
          style={Styles.button}
          disabled={isBusy}
          labelStyle={{ color: Colors.white }}
          onPress={() => {
            if (
              depthlevel > 100 ||
              depthlevel < 1 ||
              distanceSource > 500 ||
              distanceSource < 1 ||
              distanceSource === 0 ||
              pipeDiameter < 1 ||
              source === null ||
              days === null ||
              days < 20 ||
              days > 30
            ) {
              setshowError(true);
            } else {
              setIsBusy(true);
              setTimeout(async () => {
                Pagedata.page3 = {
                  Sourcedata: Sourcedata,
                  P3: page3data,
                  IsFill: true,
                };
                navigation.navigate("SIPSTool", Pagedata);
                setIsBusy(false);
              }, 10);
            }
          }}
        >
          Next
        </Button>
      </View>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Systemhead;

const styles = StyleSheet.create({
  dateCell: {
    marginTop: 5,
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    paddingHorizontal: 8,
  },
  placeholderStyles: {
    color: Colors.grayAAA,
    textAlign: "left",
  },
  selectedTextStyle: {
    textAlign: "left",
  },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
    fontSize: 10,
    marginLeft: 4,
  },
  textchange: {
    fontSize: 16.5,
    fontWeight: "400",
    color: Colors.black,
  },
});
