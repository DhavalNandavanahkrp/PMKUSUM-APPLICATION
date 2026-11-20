import React from "react";
import { View } from "react-native";
import ChartTab from "../Components/ChartTab";

const WaterDischargeTab = (props) => {
  return (
    <View>
      <ChartTab
        configuration={{
          color: "#00ABF0",
          text: props.configuration.text,
          parameter: "POPTOTWD1",
          duration: "0",
          type: "Bar",
        }}
      ></ChartTab>
    </View>
  );
};

export default WaterDischargeTab;
