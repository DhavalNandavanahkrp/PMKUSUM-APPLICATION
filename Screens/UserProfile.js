import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { List, Title, Snackbar } from "react-native-paper";
import { Table, Row, Rows } from "react-native-table-component";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import i18n from "i18n-js";
import * as APIHelper from "../Data/APIHelper";
import { useIsFocused } from "@react-navigation/native";

const UserProfile = ({ navigation }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [data, setData] = useState({});
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    snackbarText: "",
  });
  const onDismissSnackBar = () => {
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getFarmerComplaint();
    setRefreshing(false);
  }, [refreshing]);

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await getProfileData();
    })();
  }, [isFocused]);

  const getProfileData = async () => {
    setIsBusy(true);
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("authToken");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/UserAuth/GetUserProfile?userId=${userId}&PROJCD=${Component}`;

    const callResult = await APIHelper.Get(route, token);
    if (callResult.Result) {
      const roles = callResult.Data.Roles;

      let roleData = [];

      roles.forEach((r) => {
        var findResult = roleData.find(
          (item) => item.Module_Name == r.Module_Name,
        );

        if (!findResult) {
          const newModule = {
            Module_Name: r.Module_Name,
            Display_Name: [r.Display_Name.toString()],
          };
          roleData.push(newModule);
        } else {
          findResult.Display_Name.push(r.Display_Name.toString());
        }
      });
      setData({
        ...data,
        roleData: roleData,
        stateCode: stateCode,
        name: `${callResult.Data.FirstName} ${callResult.Data.LastName}`,
        contactDetail: [
          [i18n.t("Mobile"), callResult.Data.PhoneNumber],
          [i18n.t("Email"), callResult.Data.Email],
          [i18n.t("Component"), callResult.Data.Comp.toUpperCase()],
          [i18n.t("Department"), callResult.Data.DepartmentType],
          [i18n.t("Designation"), callResult.Data.Designation],
        ],
      });
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
    setIsBusy(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <View style={{ margin: 15 }}>
        <View style={{ flexDirection: "row" }}>
          <Image source={require("../assets/Avatar.png")} width="120" />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Title style={{ color: Colors.graytone }}>{data.name}</Title>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ marginHorizontal: "3%" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {/* {/ Contact Details /} */}
          <Table>
            <Row
              data={[i18n.t("ContactDetails")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#aaa" }}>
            <Rows
              data={data.contactDetail}
              flexArr={[1, 2]}
              textStyle={styles.itemNameText}
            />
          </Table>

          <Table style={{ marginTop: 10 }}>
            <Row
              data={[i18n.t("Roles")]}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>
          {data.roleData ? (
            data.roleData.map((item, index) => (
              <List.Accordion
                key={index}
                title={item.Module_Name}
                style={{
                  backgroundColor: "transparent",
                  borderColor: Colors.grayAAA,
                  borderWidth: 2,
                  borderRadius: 5,
                  marginTop: 10,
                }}
                titleStyle={{
                  color: Colors.black,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {item.Display_Name.map((item1, index1) => (
                  <List.Item
                    key={index1}
                    title={item1}
                    style={{ backgroundColor: "transparent" }}
                  />
                ))}
              </List.Accordion>
            ))
          ) : (
            <View></View>
          )}
        </View>
      </ScrollView>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  head: { backgroundColor: Colors.graytone, padding: 10 },
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
    flexWrap: "wrap",
  },
});
