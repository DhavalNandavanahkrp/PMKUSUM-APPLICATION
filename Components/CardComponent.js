import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { Title, Button, Card } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Dropdown } from "react-native-element-dropdown";
import { Styles } from "../Styles/GlobalStyles";

const CardComponent = (props) => {
  const [acre, setAcre] = useState();
  const [crop, setCrop] = useState();
  const [plantdate, setPlantDate] = useState([]);
  const [plantmonth, setPlantMonth] = useState("");
  const [irrigate, setIrrigate] = useState();
  const [head, setHead] = useState();

  const Plant = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "11", value: "11" },
    { label: "12", value: "12" },
    { label: "13", value: "13" },
    { label: "14", value: "14" },
    { label: "15", value: "15" },
    { label: "16", value: "16" },
    { label: "17", value: "17" },
    { label: "18", value: "18" },
    { label: "19", value: "19" },
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
    { label: "31", value: "31" },
  ];

  const irragetdata = JSON.parse(props.irrigate);
  const cropdata1 = JSON.parse(props.crop);
  const monthdata1 = JSON.parse(props.month);

  const OnClear = (value) => {
    setCrop(value);
    setIrrigate(value);
    setAcre();
    setPlantDate();
    setPlantMonth();
  };

  return (
    <View>
      <Card style={{ borderLeftColor: Colors.shadowBorder, margin: 5 }}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.contentView}>
            <View style={{ flex: 1 }}>
              <View style={Styles.itemTitleView}>
                <Title style={[styles.title]}>{props.name}</Title>
              </View>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Button
                color="red"
                onPress={(value) => {
                  OnClear(value);
                }}
              >
                Clear
              </Button>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Pressable>
                <View style={styles.tile}>
                  <Text
                    style={[styles.bottomTileText, { color: Colors.black }]}
                  >
                    {head}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <Text style={styles.header}>Crop</Text>
          <View style={[styles.dateCell, { margin: 5 }]}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyles}
              selectedTextStyle={styles.selectedTextStyle}
              data={cropdata1}
              maxHeight={300}
              labelField="Crop"
              valueField="Key"
              placeholder={"Cropping System"}
              value={crop}
              onChange={(item) => {
                setCrop(item.Key);
                props.data(props.name, "Crop", item.Key);
              }}
            />
          </View>

          <Text style={styles.header}>Acre</Text>
          <View style={[styles.dateCell, { height: 50, margin: 5 }]}>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter area(acre)"
              //placeholderTextColor="black"
              value={acre}
              style={[
                {
                  textAlign: "left",
                  marginHorizontal: 10,
                },
              ]}
              onChangeText={(value) => {
                setAcre(value);
                props.data(props.name, "Acre", value);
              }}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "49%" }}>
              <Text style={styles.header} >Planting Month</Text>
            </View>
            <View style={{ width: "49%" }}>
              <Text style={styles.header}>Planting Date</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", margin: 5 }}>
            <View style={[styles.dateCell, { width: "49%" }]}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyles}
                selectedTextStyle={styles.selectedTextStyle}
                data={monthdata1}
                maxHeight={300}
                labelField="value"
                valueField="key"
                placeholder={"Planting Month"}
                value={plantmonth}
                onChange={(item) => {
                  setPlantMonth(item.key);
                  if (item.key === 2 && plantdate > 28 || item.key === 4 && plantdate > 30 || item.key === 6 && plantdate > 30 || item.key === 9 && plantdate > 30 || item.key === 11 && plantdate > 30) {
                    Alert.alert(
                      "Invalid Month",
                      "Please select valid month",
                      [
                        {
                          text: "OK",
                        },
                      ]
                    )
                  }
                  props.data(props.name, "Plantmonth", item.key);
                }}
              />
            </View>
            <View style={[styles.dateCell, { width: "49%", marginLeft: 5 }]}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyles}
                selectedTextStyle={styles.selectedTextStyle}
                data={Plant}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Planting Date"}
                value={plantdate}
                onChange={(item) => {
                  setPlantDate(item.value);
                  if (plantmonth === 2 && item.value > 28 || plantmonth === 4 && item.value > 30 || plantmonth === 6 && item.value > 30 || plantmonth === 9 && item.value > 30 || plantmonth === 11 && item.value > 30) {
                    Alert.alert(
                      "Invalid Date",
                      "Please select valid date",
                      [
                        {
                          text: "OK",
                        },
                      ]
                    );
                  }
                  props.data(props.name, "Plantdate", item.value);
                }}
              />
            </View>
          </View>

          <Text style={styles.header}>Irrigation System</Text>
          <View style={[styles.dateCell, { margin: 5 }]}>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyles}
              selectedTextStyle={styles.selectedTextStyle}
              data={irragetdata}
              maxHeight={300}
              labelField="value"
              valueField="key"
              placeholder={"Irrigation System"}
              value={irrigate}
              onChange={(item) => {
                setIrrigate(item.key);
                props.data(props.name, "Irrigate", item.key);
                {
                  irragetdata.find((e) => {
                    if (e.key === item.key) {
                      setHead(e.operatinghead);
                      props.data(props.name, "Head", e.operatinghead);
                    }
                  });
                }
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

export default CardComponent;

const styles = StyleSheet.create({
  placeholderStyles: {
    color: "gray",
    textAlign: "left",
    marginHorizontal: 10,
  },
  selectedTextStyle: {
    textAlign: "left",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 17,
    flexWrap: "wrap",
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
    lineHeight: 18,
    marginLeft: 10,
    marginTop: -5,
  },
  contentView: { flexDirection: "row", flex: 1 },
  dateCell: {
    marginTop: 5,
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  dropdown: {
    borderColor: "#B7B7B7",
    height: 50,
  },
  tile: {
    borderWidth: 1.9,
    borderColor: Colors.graytone,
    borderRadius: 5,
    width: "auto",
    marginTop: 3,
    marginRight: 4,
  },
  bottomTileText: {
    textAlign: "center",
    color: Colors.graytone,
    fontSize: 20,
  },
  button: {
    borderRadius: 15,
    width: "50%",
  },
  cardContent: {
    paddingHorizontal: 1,
    flex: 1,
  },
  header: {
    margin: 5,
    fontWeight: '400',
    color: Colors.black
  }
});
