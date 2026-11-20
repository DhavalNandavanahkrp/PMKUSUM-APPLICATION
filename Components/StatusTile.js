import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import moment from "moment";
import { Feather as IconF } from "@expo/vector-icons";
import i18n from "i18n-js";
const StatusTile = (props) => {
  return (
    <View style={styles.mainContaier}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerText}>{props.StatusTitle}</Text>
      </View>
      {props.Timestamp ? (
        <View>
          <View style={styles.row}>
            <IconF
              name="calendar"
              size={Platform.OS === "ios" ? 25 : 20}
            ></IconF>
            <Text style={{ marginLeft: 5 }}>
              {moment(props.Timestamp).format("Do MMM YYYY")}
            </Text>
            <Text
              style={{
                color: Colors.green,
                fontWeight: "bold",
                marginLeft: "auto",
                marginRight: 5,
              }}
            >
              {i18n.t("Completed")}
            </Text>
          </View>
          {/* <View style={styles.row}>
            <IconF name="phone" size={Platform.OS === "ios" ? 25 : 20}></IconF>
            <Text style={{ marginLeft: 5 }}>{props.PhoneNumber}</Text>

            <Text
              style={{
                color: Colors.graytone,
                fontWeight: "bold",
                marginLeft: "auto",
                marginRight: 5,
              }}
            >
              <IconF
                name="user"
                style={{ marginLeft: 20 }}
                size={Platform.OS === "ios" ? 25 : 20}
              ></IconF>
              {props.LMBName}
            </Text>
          </View> */}
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{ color: Colors.red, fontWeight: "bold", marginVertical: 5 }}
          >
            {/* {i18n.t("Pending")} */} -
          </Text>
        </View>
      )}
    </View>
  );
};

export default StatusTile;

const styles = StyleSheet.create({
  mainContaier: {
    flex: 0.5,
    justifyContent: "flex-end",
    marginVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.primaryOrange,
  },
  titleContainer: {
    minHeight: 30,
    backgroundColor: Colors.primaryOrange,
    justifyContent: "flex-start",
    alignSelf: "stretch",
    paddingVertical: 5,
    flex: 1,
  },
  headerText: {
    textAlign: "center",
    fontFamily: "roboto-regular",
    color: Colors.white,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    padding: 5,
    alignSelf: "stretch",
    alignItems: "flex-end",
  },
});
