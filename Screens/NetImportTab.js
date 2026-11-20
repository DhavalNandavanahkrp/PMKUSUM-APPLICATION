import React from "react";
import { View } from "react-native";
import ChartTab from "../Components/ChartTab";

const NetImportTab = (props) => {
  return (
    <View>
      <ChartTab
        configuration={{
          color: "#FF66B2",
          text: props.configuration.text,
          parameter: "PTOTKWH1",
          duration: "0",
          type: "Bar",
        }}
      ></ChartTab>
    </View>
  );
};

export default NetImportTab;
