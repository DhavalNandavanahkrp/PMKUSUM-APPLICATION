import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";
import { Table, TableWrapper, Rows, Col } from "react-native-table-component-2";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const Irrigationrequirement = ({ route, navigation }) => {
  const Pagedata = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [cHARTValue, setCHARTValue] = useState([]);
  const [searched, setSearched] = useState(false);
  const [tdata, setTdata] = useState({
    tableTitle: ["Jan", "Feb", "Mar", "April", "May", "Jun"],
    tableTitle1: ["Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
    monthchartvalue: [],
    monthchartvalue2: [],
  });
  const [chartHeight, setChartHeight] = useState(0);

  const chartvalues = () => {
    const values = Pagedata.page1.Values.CHARTValue;
    setCHARTValue(values);
    const chartdataone = values.slice(0, 6);
    let chartarrone = [];
    for (let i = 0; i < chartdataone.length; i++) {
      chartarrone.push([
        chartdataone[i].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      ]);
    }
    const chartdatatwo = values.slice(6);
    let chartarrtwo = [];
    for (let i = 0; i < chartdatatwo.length; i++) {
      chartarrtwo.push([
        chartdatatwo[i].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      ]);
    }
    setTdata({
      ...tdata,
      monthchartvalue: chartarrone,
      monthchartvalue2: chartarrtwo,
    });
    setIsBusy(false);
    setSearched(true);
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    chartvalues();
    const screenHeight = Dimensions.get("window").height;
    setChartHeight(Math.round(screenHeight * 0.5));
  }, [isFocused]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={{ flex: 1, flexDirection: "column" }}>
        <View style={{ height: "60%", flexDirection: "row" }}>
          <View style={styles.topBox}>
            <Text style={styles.headline}>Water Irrigation requriement</Text>
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                datasets: [
                  {
                    data: cHARTValue,
                  },
                ],
              }}
              width={1000}
              height={chartHeight}
              chartConfig={{
                backgroundColor: "#1cc910",
                backgroundGradientFrom: "#eff3ff",
                backgroundGradientTo: "#efefef",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{
                borderRadius: 16,
                marginTop: 35,
              }}
            />
          </ScrollView>
        </View>
        <View style={{ justifyContent: "flex-end", height: "33%" }}>
          {searched && (
            <Table
              style={{ marginLeft: 10, marginRight: 10 }}
              borderStyle={{ borderWidth: 1 }}
            >
              <TableWrapper style={styles.wrapper}>
                <Col
                  data={tdata.tableTitle}
                  style={styles.title}
                  heightArr={[40, 40]}
                  textStyle={styles.text}
                />
                <Rows
                  data={tdata.monthchartvalue}
                  flexArr={[1, 1]}
                  style={styles.row}
                  textStyle={styles.text}
                />
                <Col
                  data={tdata.tableTitle1}
                  style={styles.title}
                  heightArr={[40, 40]}
                  textStyle={styles.text}
                />
                <Rows
                  data={tdata.monthchartvalue2}
                  flexArr={[1, 1]}
                  style={styles.row}
                  textStyle={styles.text}
                />
              </TableWrapper>
            </Table>
          )}
        </View>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Button
            mode="contained"
            color={Colors.green}
            style={Styles.button}
            disabled={isBusy}
            labelStyle={{ color: Colors.white }}
            onPress={async () => {
              setIsBusy(true);
              setTimeout(async () => {
                navigation.navigate("Cardanalysis", Pagedata);
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
              setIsBusy(true);
              setTimeout(async () => {
                navigation.navigate("Systemhead", Pagedata);
              }, 10);
            }}
          >
            Next
          </Button>
        </View>
        {isBusy && (
          <View style={Styles.loading}>
            <ActivityIndicator size="large" color={Colors.primaryOrange} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Irrigationrequirement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    textAlign: "center",
  },
  topBox: {
    width: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  headline: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 0,
    width: 200,
    transform: [{ rotate: "-90deg" }],
  },
  wrapper: { flexDirection: "row" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 40 },
  text: { textAlign: "center" },
});
