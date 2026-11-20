import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar } from "react-native-paper";
import { Table, Row, Rows } from "react-native-table-component";
import * as globalStyles from "../Styles/GlobalStyles";

const ContactUsScreen = ({ navigation }) => {
  const [data, setData] = useState({
    contactDetail: [
      ["Empanelled Agency", "Shakti Pump"],
      ["Service Center Name", "Shakti Pump Service Center"],
      ["Service Center Address", "Ambala"],
      ["Service Center City", "Ambala"],
      ["State", "Haryana"],
      ["District", "Ambala"],
      ["Contact Person", "Anurag"],
      ["Contact No", "8989876789"],
      ["Email", "Anurag@gmail.com"],
    ],
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header style={globalStyles.appbar} edges={["bottom"]}>
        <Appbar.Action
          icon="menu"
          color={"#fff"}
          onPress={() => navigation.openDrawer()}
        ></Appbar.Action>
        <Appbar.Content
          title="Contact Us"
          titleStyle={globalStyles.appbarTitleStyle}
        />
      </Appbar.Header>

      <ScrollView style={{ margin: "3%" }}>
        {/* Contact Details */}
        <Table>
          <Row
            data={["Service Center Details"]}
            style={styles.head}
            textStyle={styles.headerText}
          />
        </Table>
        <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
          <Rows
            data={data.contactDetail}
            flexArr={[1, 1.5]}
            textStyle={styles.itemNameText}
          />
        </Table>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  head: { backgroundColor: "#FF0878", padding: 10 },
  headerText: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flexWrap: "wrap",
    textAlign: "center",
  },
  itemNameText: {
    fontSize: 16,
    margin: 10,
  },
  wrapper: { flexDirection: "row" },
});
