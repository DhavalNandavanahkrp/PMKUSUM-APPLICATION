import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Colors } from "../Styles/Colors";

const BarChartComponent = (props) => {
  const [dimension, setDimension] = React.useState({ width: 0, height: 0 });

  const getWidth = () => {
    const factor = Math.ceil(props.configuration.data.labels.length / 9);

    return Dimensions.get("window").width * factor;
  };
  return (
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

      <ScrollView horizontal={true}>
        <BarChart
          verticalLabelRotation={270}
          withVerticalLines={false}
          xLabelsOffset={15}
          segments={5}
          data={props.configuration.data}
          showValuesOnTopOfBars={true}
          showBarTops={false}
          height={500}
          width={getWidth()}
          flatColor={true}
          chartConfig={{
            fillShadowGradient: props.configuration.color,
            fillShadowGradientOpacity: 1,
            backgroundGradientFrom: Colors.chartBackground,
            backgroundGradientTo: Colors.chartBackground,
            decimalPlaces: 2,
            color: (opacity = 1) => Colors.black,
            labelColor: (opacity = 1) => Colors.black,
          }}
        />
      </ScrollView>
    </View>
  );
};

export default BarChartComponent;

const styles = StyleSheet.create({
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
});
