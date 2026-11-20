import React, { useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import i18n from "i18n-js";
import BarChartComponent from "../Components/BarChartComponent";
const ChartTab = (props) => {
  const [timelineSelection, setTimelineSelection] = React.useState(
    props.configuration.duration,
  );
  const [chartData, setChartData] = React.useState({
    data: { labels: [], datasets: [{ data: [] }] },
    isBusy: false,
    showSnackbar: false,
    snackbarText: "",
  });

  useEffect(() => {
    (async () => {
      await connectBroker(timelineSelection);
    })();
  }, [timelineSelection]);

  const connectBroker = async (selection) => {
    try {
      const broker = await AsyncStorage.getItem("broker");
      const brokerPort = await AsyncStorage.getItem("brokerPort");
      let vHost = await AsyncStorage.getItem("performanceVHost");
      let topic = await AsyncStorage.getItem("performanceTopic");

      let year, month;
      let startDate, endDate;
      let connections = [];
      let dates = [];

      setChartData({ ...chartData, isBusy: true });
      if (selection === "0") {
        year = moment().format("YY");
        month = moment().format("MM");
        vHost = vHost.replace("yy", year).replace("MM", month);
        topic = topic.replace("yy", year).replace("MM", month);

        connections.push({ host: vHost, topic: topic });
      } else if (selection === "1") {
        year = moment().subtract(1, "month").format("YY");
        month = moment().subtract(1, "month").format("MM");
        vHost = vHost.replace("yy", year).replace("MM", month);
        topic = topic.replace("yy", year).replace("MM", month);

        connections.push({ host: vHost, topic: topic });
      } else if (selection === "2") {
        startDate = moment().startOf("week");
        endDate = moment().endOf("week");
        if (moment(startDate).format("MM") !== moment(endDate).format("MM")) {
          let copyHost = vHost;
          let copyTopic = topic;
          copyHost = copyHost
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          copyTopic = copyTopic
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          connections.push({ host: copyHost, topic: copyTopic });

          let copyHost1 = vHost;
          let copyTopic1 = topic;
          copyHost1 = copyHost1
            .replace("yy", moment(endDate).format("YY"))
            .replace("MM", moment(endDate).format("MM"));
          copyTopic1 = copyTopic1
            .replace("yy", moment(endDate).format("YY"))
            .replace("MM", moment(endDate).format("MM"));
          connections.push({ host: copyHost1, topic: copyTopic1 });
        } else {
          vHost = vHost
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          topic = topic
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));

          connections.push({ host: vHost, topic: topic });
        }
        for (let index = 0; index < 7; index++) {
          dates.push(moment(startDate).add(index, "days").format("YYMMDD"));
        }
      } else if (selection === "3") {
        startDate = moment().startOf("week").subtract(1, "week");
        endDate = moment().endOf("week").subtract(1, "week");
        if (moment(startDate).format("MM") !== moment(endDate).format("MM")) {
          let copyHost = vHost;
          let copyTopic = topic;
          copyHost = copyHost
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          copyTopic = copyTopic
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          connections.push({ host: copyHost, topic: copyTopic });

          let copyHost1 = vHost;
          let copyTopic1 = topic;
          copyHost1 = copyHost1
            .replace("yy", moment(endDate).format("YY"))
            .replace("MM", moment(endDate).format("MM"));
          copyTopic1 = copyTopic1
            .replace("yy", moment(endDate).format("YY"))
            .replace("MM", moment(endDate).format("MM"));
          connections.push({ host: copyHost1, topic: copyTopic1 });
        } else {
          vHost = vHost
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));
          topic = topic
            .replace("yy", moment(startDate).format("YY"))
            .replace("MM", moment(startDate).format("MM"));

          connections.push({ host: vHost, topic: topic });
        }
        for (let index = 0; index < 7; index++) {
          dates.push(moment(startDate).add(index, "days").format("YYMMDD"));
        }
      }

      connections.forEach((connection) => {
        const brokerUserName = connection.host + ":test";
        const brokerPassword = "test";
        // create mqtt client
        const client = new Paho.MQTT.Client(
          broker,
          parseInt(brokerPort),
          "/ws",
          Math.random().toString(36).substr(2, 9),
        );
        client.connect({
          useSSL: true,
          userName: brokerUserName,
          password: brokerPassword,
          onSuccess: () => {
            //Process when message arrives for subscribed topic
            client.onMessageArrived = (message) => {
              try {
                const dataArray = JSON.parse(message.payloadString);
                const parameterDataString = dataArray.filter(
                  (d) => d.dnm === props.configuration.parameter,
                )[0].data;

                const readingStr = parameterDataString
                  .trim()
                  .replace("[", "")
                  .replace("]", "");
                const dailyData = readingStr.match(/[{][0-9.',]+[}]/g);
                const readings = [];
                dailyData.forEach((data) => {
                  const reading = data
                    .replace("{", "")
                    .replace("}", "")
                    .replace(/'/g, "");
                  const split = reading.split(",");
                  readings.push({ date: split[0], reading: split[1] });
                });

                let data = { labels: [], datasets: [{ data: [] }] };
                let filteredList = [];
                if (dates.length !== 0) {
                  dates.forEach((dateStr) => {
                    const reading = readings.filter((r) => r.date === dateStr);
                    if (reading.length !== 0) {
                      filteredList.push({
                        date: moment(reading[0].date, "YYMMDD").format("DD/MM"),
                        value: reading[0].reading,
                      });
                    }
                  });
                  filteredList.forEach((map) => {
                    data.labels.push(map.date);
                    data.datasets[0].data.push(map.value);
                  });
                } else {
                  var maps = readings.map((reading) => {
                    return {
                      date: moment(reading.date, "YYMMDD").format("DD/MM"),
                      value: reading.reading,
                    };
                  });

                  maps.forEach((map) => {
                    data.labels.push(map.date);
                    data.datasets[0].data.push(map.value);
                  });
                }
                if (data.labels.length !== 0) {
                  setChartData({ ...chartData, data: data });
                } else {
                  setChartData({
                    ...chartData,
                    data: { labels: [], datasets: [{ data: [] }] },
                  });
                }
              } catch (error) {
                setChartData({
                  ...chartData,
                  data: { labels: [], datasets: [{ data: [] }] },
                  isBusy: false,
                  isError: true,
                  showSnackbar: true,
                  snackbarText:
                    i18n.t("Failedtoparsedata") + JSON.stringify(error),
                });
              }
            };

            // subscribe for value topic
            client.subscribe(connection.topic, {
              qos: 0,
              timeout: 60,
              onSuccess: function () {
                console.log(
                  `Topic ${connection.topic} Subscription Successful..!!`,
                );
              },
              onFailure: function (error) {
                console.log(error);
                setChartData({
                  ...chartData,
                  isBusy: false,
                  showSnackbar: true,
                  snackbarText: i18n.t("FailedToSubscribeForValuesTopic"),
                });
                console.log("client Subscribtion values Failed...!!");
              },
            });
          },
          onFailure: (error) => {
            "Inside Error", error;
            setChartData({
              ...chartData,
              data: { labels: [], datasets: [{ data: [] }] },
              isBusy: false,
              showSnackbar: true,
              snackbarText:
                i18n.t("FailedToConnectWithMQTTBrokerServer") +
                connection.host +
                JSON.stringify(error),
            });
          },
        });
      });
    } catch (error) {
      console.log(error);
      // main catch block
      setChartData({
        ...chartData,
        data: { labels: [], datasets: [{ data: [] }] },
        isBusy: false,
        showSnackbar: true,
        snackbarText:
          i18n.t("FailedToConnectWithMQTTBrokerServer") + JSON.stringify(error),
      });
    }
  };

  return (
    <View>
      <RadioButton.Group
        onValueChange={(newValue) => {
          setTimelineSelection(newValue);
          connectBroker(newValue);
        }}
        value={timelineSelection}
      >
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={styles.radioContainer}>
            <RadioButton
              value="0"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>
              {i18n.t("CurrentMonth")}
            </Text>
          </View>
          <View style={styles.radioContainer}>
            <RadioButton
              value="1"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>{i18n.t("LastMonth")}</Text>
          </View>
        </View>
      </RadioButton.Group>
      {chartData.data.labels.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 200,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.graytone,
              fontFamily: "roboto-regular",
              fontSize: 16,
            }}
          >
            {i18n.t("NoDataFound")}
          </Text>
        </View>
      ) : props.configuration.type === "Bar" ? (
        <BarChartComponent
          configuration={{
            color: props.configuration.color,
            text: props.configuration.text,
            data: chartData.data,
          }}
        ></BarChartComponent>
      ) : (
        <LineChartComponent
          configuration={{
            color: "#FF6347",
            icon: "solar-power",
            text: props.configuration.text,
            data: chartData.data,
          }}
        ></LineChartComponent>
      )}

      {chartData.isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </View>
  );
};

export default ChartTab;

const styles = StyleSheet.create({
  radioContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  titleSection: {
    margin: "3%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  titleText: {
    textAlign: "center",
    fontSize: 22,
    color: "#fff",
    alignSelf: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginLeft: 5,
  },
  radioBtn: {
    color: "#F9AA33",
  },
});
