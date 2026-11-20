import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { parseString } from "../utils/ParseString";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import Tile from "../Components/Tile";

const componentList = [
  {
    Component: "A",
    Name: "ComponentA",
    Description: "Distributed Solar PV\r\n(Component A)",
    ImageSource: require("../assets/Images/Component/CompA.jpg"),
  },
  {
    Component: "B",
    Name: "ComponentB",
    Description: "OffGrid Solar pump\r\n(Component B)",
    ImageSource: require("../assets/Images/Component/CompB.jpg"),
  },
  {
    Component: "C",
    Name: "ComponentC",
    Description: "Grid Connected Solar Pump  Individual\r\n(Component C)",
    ImageSource: require("../assets/Images/Component/CompC.png"),
  },
];

const ComponentSelection = ({ navigation }) => {
  const [displayComponents, setDisplayComponents] = useState([]);

  /* #region  Snackbar configuration */
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
  /* #endregion */

  const selectComponent = async (component) => {
    await AsyncStorage.setItem("selectedComponent", component);
    const departmentRole = await AsyncStorage.getItem("departmentRole");

    /* #region  EPC Deparatment */
    if (departmentRole.toUpperCase() === "EPC") {
      if (component === "ComponentA") {
        navigation.navigate("EPCA");
      } else if (component === "ComponentC") {
        navigation.navigate("EPCC");
      } else {
        navigation.navigate("EPCB");
      }
    }
    /* #endregion */

    /* #region  DISCOM Deparatment */
    if (departmentRole.toUpperCase() === "DISCOM") {
      if (component === "ComponentA") {
        navigation.navigate("DiscomA");
      } else if (component === "ComponentC") {
        navigation.navigate("DiscomC");
      } else {
        navigation.navigate("DiscomB");
      }
    }
    /* #endregion */

    /* #region  Farmer Deparatment */
    if (departmentRole.toUpperCase() === "FARMER") {
      if (component === "ComponentC") {
        navigation.navigate("FarmerC");
      } else {
        navigation.navigate("FarmerB");
      }
    }
    /* #endregion */
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const readComponents = await AsyncStorage.getItem("components");
        const components = parseString(readComponents);
        let result = [];
        components.forEach((element) => {
          let match = componentList.find(
            (e) => e.Component.toUpperCase() === element.toUpperCase(),
          );
          if (match) result.push(match);
        });

        setDisplayComponents(result);
      })();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView>
        <Animatable.View
          animation="slideInDown"
          duration={1000}
          style={{ flexDirection: "column", marginVertical: 10 }}
        >
          <View>
            {displayComponents.map((item, index) => (
              <Tile
                key={index}
                Name={item.Description}
                Parameter={item.Name}
                ImageSource={item.ImageSource}
                OnClick={selectComponent}
              ></Tile>
            ))}
          </View>
        </Animatable.View>
        <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
          {snackbar.snackbarText}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComponentSelection;

const styles = StyleSheet.create({
  titleText: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "roboto-regular",
    color: Colors.graytone,
    alignSelf: "center",
    marginVertical: 10,
  },
});
