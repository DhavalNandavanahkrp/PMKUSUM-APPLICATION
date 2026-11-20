import React from "react";
import { View, Text, Platform } from "react-native";
import {
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  Feather as IconF,
} from "@expo/vector-icons";
import { Colors } from "../Styles/Colors";

const HeaderTitle = (props) => {
  return (
    <View style={{ flexDirection: "row", right: 10 }}>
      {props.iconType === "M" && (
        <IconM
          name={props.icon}
          size={Platform.OS === "ios" ? 35 : 30}
          color={Colors.white}
        ></IconM>
      )}
      {props.iconType === "MC" && (
        <IconMC
          name={props.icon}
          size={Platform.OS === "ios" ? 35 : 30}
          color={Colors.white}
        ></IconMC>
      )}
      {props.iconType === "FA" && (
        <IconFA
          name={props.icon}
          size={Platform.OS === "ios" ? 35 : 30}
          color={Colors.white}
        ></IconFA>
      )}
      {props.iconType === "FA5" && (
        <IconFA5
          name={props.icon}
          size={Platform.OS === "ios" ? 35 : 30}
          color={Colors.white}
        ></IconFA5>
      )}
      {props.iconType === "F" && (
        <IconF
          name={props.icon}
          size={Platform.OS === "ios" ? 35 : 30}
          color={Colors.white}
        ></IconF>
      )}
      <Text
        style={{
          alignSelf: "center",
          marginLeft: 10,
          color: Colors.white,
          fontSize: Platform.OS === "ios" ? 16 : 18,
        }}
      >
        {props.title}
      </Text>
    </View>
  );
};

export default HeaderTitle;
