import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Title, Paragraph, Snackbar } from "react-native-paper";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import * as APIHelper from "../Data/APIHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  AntDesign as IconA,
} from "@expo/vector-icons";
const AssetDetail = ({ navigation }) => {
  const [data, setData] = useState({});
  const [isBusy, setIsBusy] = useState(false);
  const [agency, setAgency] = useState();
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
  const isFocused = useIsFocused();

  const [role, setRole] = useState("");
  const [Farmerdata, setFarmerdata] = useState({
    farmerName: "",
    SaralId: 0,
    RequiredPumpCapacity: 0,
    RequiredPumpType: 0,
    SPVCapacity: 0,
    selectedComponent: "",
    requiredPumpType: "",
    requiredPumpsubtype: "",
  });

  const farmerdetails = async () => {
    const farmerName = await AsyncStorage.getItem("farmerName");
    const SaralId = await AsyncStorage.getItem("SaralId");
    const RequiredPumpType = await AsyncStorage.getItem("RequiredPumpType");
    const RequiredPumpCapacity = await AsyncStorage.getItem(
      "RequiredPumpCapacity",
    );
    const SPVCapacity = await AsyncStorage.getItem("SPVCapacity");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const requiredPumpType = await AsyncStorage.getItem("requiredPumpType");
    const requiredPumpsubtype = await AsyncStorage.getItem(
      "requiredPumpsubtype",
    );

    setFarmerdata({
      ...Farmerdata,
      farmerName: farmerName,
      SaralId: SaralId,
      RequiredPumpCapacity: RequiredPumpCapacity,
      RequiredPumpType: RequiredPumpType,
      SPVCapacity: SPVCapacity,
      selectedComponent: selectedComponent,
      requiredPumpType: requiredPumpType,
      requiredPumpsubtype: requiredPumpsubtype,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();
    (async () => {
      await AssetData();
      await farmerdetails();
      const role1 = await AsyncStorage.getItem("departmentRole");
      setRole(role1.toUpperCase());
    })();
    return () => {
      abortController.abort();
    };
  }, [isFocused]);

  const AssetData = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const token = await AsyncStorage.getItem("authToken");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    var number = selectedComponent === "ComponentB" ? 2 : 3;
    const farmerId = await AsyncStorage.getItem("farmerId");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/ConsumerMonitering/M_GetAssetInfoByFramer?CID=${farmerId}&Component=${number}&PROJCD=${Component}`;
    const callResult = await APIHelper.Get(route, token);
    if (callResult.Result) {
      const apiData = callResult.Data.map((item) => {
        const {
          AssetType,
          AssetSeerialNo,
          AssetName,
          OrderToEa_Name,
          Manufacturer,
          Name,
        } = item;
        return {
          AssetType: AssetType,
          AssetSeerialNo: AssetSeerialNo,
          AssetName: AssetName,
          OrderToEa_Name: OrderToEa_Name,
          Name: Name,
          Manufacturer: Manufacturer,
        };
      });
      setData(apiData);
      if (apiData.length > 0) {
        setAgency(apiData[0].OrderToEa_Name);
      }
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
    setIsBusy(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
      edges={["bottom"]}
    >
      {/* Farmer Basic  details */}
      <View style={{ margin: 10 }}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconF
              name="user"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
              style={styles.icon}
            ></IconF>
            <Text style={styles.cellTextRight}>{Farmerdata.farmerName}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconA
              name="solution"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
              style={styles.icon}
            ></IconA>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {Farmerdata.SaralId}
            </Text>
          </View>
          <View style={styles.rightCell}>
            <IconMC
              name={
                Farmerdata.selectedComponent === "ComponentB"
                  ? "water-pump"
                  : "view-grid"
              }
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconMC>
            <Text
              style={{
                alignSelf: "center",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {`${
                Farmerdata.selectedComponent === "ComponentB"
                  ? `${Farmerdata.RequiredPumpCapacity} ${" HP"}`
                  : Farmerdata.SPVCapacity ||
                    Farmerdata.selectedComponent === "ComponentC"
                  ? `${Farmerdata.SPVCapacity} ${" KWp"}`
                  : "6.75 KWp"
              } ${Farmerdata.requiredPumpType} ${
                Farmerdata.requiredPumpsubtype
              }`}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.cellTextRight}>
              {" "}
              {i18n.t("AgencyName")} {agency}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={{ marginTop: 5 }}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Title style={styles.title}>{item.AssetType}</Title>
            <Card.Content>
              <View>
                <Paragraph
                  style={[
                    styles.paragraph,
                    {
                      flex: 1,
                      textAlign: "left",
                      marginBottom: 5,
                    },
                  ]}
                >
                  {item.AssetType === "Solar Panel"
                    ? i18n.t("SPV_Capacity")
                    : ""}{" "}
                  {item.AssetType === "Pump Contoller with RMS"
                    ? ""
                    : item.AssetName}
                </Paragraph>
                <Paragraph
                  style={[
                    styles.paragraph,
                    {
                      flex: 1,
                      textAlign: "left",
                      marginTop: 5,
                    },
                  ]}
                >
                  {i18n.t("Manufacturer")} : {item.Manufacturer}
                </Paragraph>
                <Paragraph
                  style={[
                    styles.paragraph,
                    {
                      flex: 1,
                      textAlign: "left",
                      marginTop: 15,
                    },
                  ]}
                >
                  {i18n.t("ModelNo")} : {item.Name}
                </Paragraph>
                <Paragraph
                  style={[
                    styles.paragraph,
                    {
                      flex: 1,
                      textAlign: "left",
                      marginTop: 15,
                    },
                  ]}
                >
                  {i18n.t("SerialNumber")} : {item.AssetSeerialNo}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        )}
      />
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default AssetDetail;

const styles = StyleSheet.create({
  card: {
    width: "94%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: Colors.green,
    borderTopColor: Colors.green,
    marginVertical: 5,
    marginLeft: "3%",
  },
  title: {
    marginTop: -1,
    padding: 10,
    borderTopLeftRadius: 10,
    color: Colors.white,
    backgroundColor: Colors.green,
    textAlign: "center",
    fontWeight: "bold",
  },
  paragraph: {
    color: "#344955",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    minHeight: 40,
    borderColor: Colors.grayAAA,
    borderWidth: 1,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    alignSelf: "center",
  },
  rightCell: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    borderLeftColor: Colors.grayAAA,
    borderLeftWidth: 1,
  },
  cellTextRight: {
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 5,
  },
});
