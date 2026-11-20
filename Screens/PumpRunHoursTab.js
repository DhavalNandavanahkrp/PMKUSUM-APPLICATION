import React from "react";
import { View } from "react-native";
import ChartTab from "../Components/ChartTab";
import { Colors } from "../Styles/Colors";

const PumpRunHoursTab = (props) => {
  return (
    <View>
      <ChartTab
        configuration={{
          color: Colors.red,
          text: props.configuration.text,
          parameter: "PTOTHR1",
          duration: "0",
          type: "Bar",
        }}
      ></ChartTab>
    </View>
  );
};

export default PumpRunHoursTab;
