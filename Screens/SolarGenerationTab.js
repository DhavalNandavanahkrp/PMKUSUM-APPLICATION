import React from "react";
import { View } from "react-native";
import ChartTab from "../Components/ChartTab";
import { Colors } from "../Styles/Colors";

const SolarGenerationTab = (props) => {
  return (
    <View>
      <ChartTab
        configuration={{
          color: Colors.green,
          text: props.configuration.text,
          parameter: "PTOTKWH1",
          duration: "0",
          type: "Bar",
        }}
      ></ChartTab>
    </View>
  );
};

export default SolarGenerationTab;
