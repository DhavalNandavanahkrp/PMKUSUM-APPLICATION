import React from "react";
import { View } from "react-native";
import ChartTab from "../Components/ChartTab";

const PumpConsumptionTab = (props) => {
  return (
    <View>
      <ChartTab
        configuration={{
          color: "#3399FF",
          text: props.configuration.text,
          parameter: "PTOTKWH1",
          duration: "0",
          type: "Bar",
        }}
      ></ChartTab>
    </View>
  );
};

export default PumpConsumptionTab;
