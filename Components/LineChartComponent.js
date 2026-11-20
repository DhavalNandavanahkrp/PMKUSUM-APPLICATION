import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { RadioButton } from "react-native-paper";
import { LineChart, BarChart, AreaChart } from "react-native-chart-kit";
import { Rect, Text as TextSVG, Svg } from "react-native-svg";

const ChartComponent1 = (props) => {
  const [value, setValue] = React.useState("0");
  const [dimension, setDimension] = React.useState({ width: 0, height: 0 });
  const [tooltipPos, setTooltipPos] = React.useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
    xValue: "",
  });

  const measureView = (event) => {
    setDimension({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  return (
    <View>
      <RadioButton.Group
        onValueChange={(newValue) => setValue(newValue)}
        value={value}
      >
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={styles.radioContainer}>
            <RadioButton
              value="0"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>Current Month</Text>
          </View>
          <View style={styles.radioContainer}>
            <RadioButton
              value="1"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>Last Month</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={styles.radioContainer}>
            <RadioButton
              value="2"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>Current Week </Text>
          </View>
          <View style={styles.radioContainer}>
            <RadioButton
              value="3"
              color={props.configuration.color}
            ></RadioButton>
            <Text style={{ alignSelf: "center" }}>Last Week </Text>
          </View>
        </View>
      </RadioButton.Group>

      <View>
        <View
          style={[
            styles.titleSection,
            { backgroundColor: props.configuration.color },
          ]}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.titleText}>{props.configuration.text}</Text>
          </View>
        </View>
        {/* Bar chart */}
        {/* <View
          // onLayout={(event) => measureView(event)}
          style={{
            flex: 1,
            marginHorizontal: "3%",
          }}
        > */}
        <ScrollView horizontal={true}>
          <LineChart
            withDots={true}
            // withScrollableDot={false}
            verticalLabelRotation={270}
            withVerticalLines={false}
            yLabelsOffset={10}
            xLabelsOffset={5}
            segments={5}
            data={{
              labels: [
                "01/01",
                "",
                "March",
                "April",
                "May",
                "June",
                "July",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              datasets: [
                {
                  data: [
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    //     Math.random() * 100,
                    23.35, 41.9, 11.21, 75.23, 9.23, 33.67, 45.11, 66.76, 33.21,
                    11.9, 51.85, 59.11, 44.09, 15.4, 33.92, 72.98, 12.66, 54.33,
                    33.82, 56, 12, 31.99, 48.72, 55.82, 22.51,
                  ],
                },
              ],
            }}
            width={dimension.width}
            height={400}
            chartConfig={{
              backgroundGradientFrom: "#F2F2F2",
              backgroundGradientTo: "#F2F2F2",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => props.configuration.color,
              labelColor: (opacity = 1) => "#344955",
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: props.configuration.color,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
            }}
            decorator={() => {
              return tooltipPos.visible ? (
                <View>
                  <Svg>
                    <Rect
                      x={tooltipPos.x - 35}
                      y={tooltipPos.y + 10}
                      width="80"
                      height="70"
                      fill="black"
                    />
                    <TextSVG
                      x={tooltipPos.x + 5}
                      y={tooltipPos.y + 30}
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {tooltipPos.xValue}
                    </TextSVG>
                    <TextSVG
                      x={tooltipPos.x + 5}
                      y={tooltipPos.y + 60}
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {tooltipPos.value}
                    </TextSVG>
                  </Svg>
                </View>
              ) : null;
            }}
            onDataPointClick={(data1) => {
              let isSamePoint =
                tooltipPos.x === data1.x && tooltipPos.y === data1.y;
              isSamePoint
                ? setTooltipPos((previousState) => {
                    return {
                      ...previousState,
                      value: data1.value.toFixed(1),
                      xValue: "17 Jun",
                      visible: !previousState.visible,
                    };
                  })
                : setTooltipPos({
                    x: data1.x,
                    value: data1.value.toFixed(1),
                    xValue: "17 Jun",
                    y: data1.y,
                    visible: true,
                  });
            }}
          />
        </ScrollView>
        {/* </View> */}
      </View>
    </View>
  );
};

export default ChartComponent1;

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
