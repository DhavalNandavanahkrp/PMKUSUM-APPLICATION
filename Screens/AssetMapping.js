import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar, Button, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import * as APIHelper from "../Data/APIHelper";
import SearchableDropdown from "react-native-searchable-dropdown";
import MultiSelect from "react-native-multiple-select";
import i18n from "i18n-js";
import * as Animatable from "react-native-animatable";
import { useIsFocused } from "@react-navigation/native";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  EvilIcons as IconE,
} from "@expo/vector-icons";
const AssetMapping = () => {
  const [isBusy, setIsBusy] = useState(false);
  const [snackbar, setSnackbar] = useState({
    showSnackbar: false,
    message: "",
  });
  const onDismissSnackBar = () =>
    setSnackbar({
      ...snackbar,
      showSnackbar: false,
      snackbarText: "",
    });
  const [assetMapping, setAssetMapping] = useState({
    assets: [],
    selectedAsset: null,
  });
  const [lotNo, setLotNo] = useState({
    lots: [],
    selectedLots: [],
  });
  const [serialNo, setSerialNo] = useState({
    serialNos: [],
    selectedSerialNos: [],
  });

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

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      await farmerdetails();
      setIsBusy(true);
      const items = await fetchAssetTypes();
      let converted = items.map((v) => ({ id: v.Id, name: v.Name }));

      setAssetMapping({
        ...assetMapping,
        assets: converted,
      });
      setIsBusy(false);
    })();
  }, [isFocused]);

  const fetchAssetTypes = async () => {
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/Master_Asset_Type/GetAllMasterAssetType?comp=${selectedComponentRoute}&PROJCD=${Component}`;
    let rowItems = [];
    const callResult = await APIHelper.Get(route, authToken);
    if (callResult) {
      rowItems = callResult.Data;
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: i18n.t("FailedtofetchAssettypes") + result.Message,
      });
    }
    setIsBusy(false);
    return rowItems;
  };

  const mapAssets = async () => {
    if (serialNo.selectedSerialNos.length === 0) {
      Alert.alert(i18n.t("assetMapping"), i18n.t("SelectSerialNo"), [
        { text: i18n.t("OK") },
      ]);
      return;
    }
    setIsBusy(true);
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const stateCode = await AsyncStorage.getItem("stateCode");
    const authToken = await AsyncStorage.getItem("authToken");
    const CID = await AsyncStorage.getItem("farmerId");
    const selectedComponentRoute = await AsyncStorage.getItem(
      "farmerComponent",
    );
    let number = selectedComponentRoute === "b" ? 2 : 3;

    const payload = {
      Component: number,
      CID: CID,
      AssetIds: serialNo.selectedSerialNos,
    };
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/MapAssetToConsumer?PROJCD=${Component}`;
    const callResult = await APIHelper.Post1(route, authToken, payload);
    if (callResult.Result) {
      setAssetMapping({
        ...assetMapping,
        selectedAsset: null,
      });

      setLotNo({
        ...lotNo,
        selectedLots: [],
      });

      setSerialNo({
        ...serialNo,
        selectedSerialNos: [],
      });

      setIsBusy(false);

      Alert.alert(i18n.t("assetMapping"), i18n.t("AssetMapSuccessful"), [
        { text: i18n.t("OK") },
      ]);
    } else {
      setIsBusy(false);

      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
  };

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      {/* Farmer Basic  details */}
      <View style={{ margin: 10 }}>
        <View style={styles.row}>
          <View style={styles.cell}>
            <IconF
              name="user"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.graytone}
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
                  ? Farmerdata.RequiredPumpCapacity
                  : ""
              } ${
                Farmerdata.selectedComponent === "ComponentB" ? " HP" : "KWh"
              }`}
              {` ${Farmerdata.requiredPumpType} ${Farmerdata.requiredPumpsubtype}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: "2%", flex: 1 }}>
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[
            styles.sectionContainer,
            { borderColor: Colors.orange, marginTop: 15 },
          ]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: Colors.orange }]}
          >
            <IconFA5
              name="solar-panel"
              size={Platform.OS === "ios" ? 20 : 15}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconFA5>
            <Title style={{ color: "#fff" }}>{i18n.t("SelectAssetType")}</Title>
          </View>

          <View
            style={[Styles.sectionView, { marginVertical: 5, width: "95%" }]}
          >
            <SearchableDropdown
              onItemSelect={async (item) => {
                setAssetMapping({
                  ...assetMapping,
                  selectedAsset: item,
                });

                const apiUrl = await AsyncStorage.getItem("apiURL");
                const stateCode = await AsyncStorage.getItem("stateCode");
                const authToken = await AsyncStorage.getItem("authToken");
                const CID = await AsyncStorage.getItem("farmerId");
                const selectedComponentRoute = await AsyncStorage.getItem(
                  "farmerComponent",
                );
                let number = selectedComponentRoute === "b" ? 2 : 3;
                const selectedComponent = await AsyncStorage.getItem(
                  "selectedComponent",
                );
                const Component =
                  selectedComponent === "ComponentB"
                    ? "b"
                    : null || selectedComponent === "ComponentC"
                    ? "c"
                    : "a";
                const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/GetLotDetailsByAssetTypeForAssetMaaping?Component=${number}&AssetType=${item.id}&CID=${CID}&PROJCD=${Component}`;
                const callResult = await APIHelper.Get(route, authToken);
                if (callResult.Result) {
                  let converted = callResult.Data.map((v) => ({
                    id: v.Lot_ID.toString(),
                    name: v.LotName,
                  }));
                  setLotNo({
                    ...lotNo,
                    lots: converted,
                    selectedLots: [],
                  });
                } else {
                  setSnackbar({
                    ...snackbar,
                    showSnackbar: true,
                    snackbarText:
                      i18n.t("Failedtofetchlotdetailsforselectedassettype") +
                      callResult.Message,
                  });
                }
                const route1 = `${apiUrl}api/${stateCode}/ConsumerMonitering/GetAssetSerialNoForConsumerMapping?Component=${number}&AssetType=${item.id}&CID=${CID}&PROJCD=${Component}&SerialNo_ForFilter=`;
                const callResult1 = await APIHelper.Get(route1, authToken);

                if (callResult1.Result) {
                  let converted = callResult1.Data.map((v) => ({
                    id: v.AssetId.toString(),
                    name: v.SerialNo,
                  }));
                  setSerialNo({
                    ...serialNo,
                    serialNos: converted,
                    selectedserialNos: [],
                  });
                } else {
                  setSnackbar({
                    ...snackbar,
                    showSnackbar: true,
                    snackbarText:
                      i18n.t("Failedtofetchlotdetailsforselectedassettype") +
                      callResult.Message,
                  });
                  setTimeout(() => {
                    setSnackbar(false);
                  }, 2000);
                }
              }}
              itemStyle={{
                padding: 5,
              }}
              itemTextStyle={{ color: Colors.graytone }}
              itemsContainerStyle={{
                maxHeight: 150,
                borderWidth: 1,
                borderColor: Colors.graytone,
              }}
              items={assetMapping.assets}
              resetValue={false}
              textInputProps={{
                placeholder: `${i18n.t("AssetType")}`,
                underlineColorAndroid: "transparent",
                style: {
                  padding: 5,
                  borderWidth: 1,
                  borderColor: Colors.graytone,
                },
              }}
              listProps={{
                nestedScrollEnabled: true,
              }}
              selectedItems={assetMapping.selectedAsset}
            />
          </View>
        </Animatable.View>

        {/* search by lot number */}
        <Animatable.View
          animation="slideInRight"
          duration={1000}
          style={[
            styles.sectionContainer,
            { borderColor: Colors.orange, marginTop: 15 },
          ]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: Colors.orange }]}
          >
            <IconE
              name="search"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconE>
            <Title style={{ color: "#fff" }}>{i18n.t("LotName")}</Title>
          </View>

          <View
            style={[
              Styles.sectionView,
              {
                marginTop: 5,
                width: "95%",
                backgroundColor: "#00000000",
                borderColor: "#00000000",
              },
            ]}
          >
            <MultiSelect
              single
              items={lotNo.lots}
              styleSelectorContainer={{
                borderColor: Colors.cellBackground,
                borderWidth: 1,
                marginVertical: 1,
              }}
              displayKey="name"
              uniqueKey="id"
              onSelectedItemsChange={async (items) => {
                setLotNo({ ...lotNo, selectedLots: items });

                const apiUrl = await AsyncStorage.getItem("apiURL");
                const stateCode = await AsyncStorage.getItem("stateCode");
                const authToken = await AsyncStorage.getItem("authToken");
                const CID = await AsyncStorage.getItem("farmerId");
                const selectedComponentRoute = await AsyncStorage.getItem(
                  "farmerComponent",
                );
                let number = selectedComponentRoute === "b" ? 2 : 3;
                const selectedComponent = await AsyncStorage.getItem(
                  "selectedComponent",
                );
                const Component =
                  selectedComponent === "ComponentB"
                    ? "b"
                    : null || selectedComponent === "ComponentC"
                    ? "c"
                    : "a";
                const lotId = items[0];
                const assetId = assetMapping.selectedAsset.id;
                const route = `${apiUrl}api/${stateCode}/ConsumerMonitering/GetAssetSerialNoForConsumerMappingByLotId?Component=${number}&AssetType=${assetId}&CID=${CID}&LotId=${lotId}&PROJCD=${Component}`;
                const callResult = await APIHelper.Get(route, authToken);
                if (callResult.Result) {
                  const data = callResult.Data.map((item) => ({
                    id: item.AssetId,
                    name: item.SerialNo,
                  }));
                  setSerialNo({
                    ...serialNo,
                    selectedSerialNos: [],
                    serialNos: data,
                  });
                }
              }}
              selectedItems={lotNo.selectedLots}
              selectText=""
              noItemsText={i18n.t("NoItems")}
              searchInputPlaceholderText={i18n.t("SearchLotNo")}
              onChangeInput={(text) => console.log(text)}
              tagRemoveIconColor={Colors.graytone}
              tagBorderColor={Colors.graytone}
              tagTextColor={Colors.graytone}
              selectedItemTextColor={Colors.graytone}
              selectedItemIconColor={Colors.graytone}
              itemTextColor="#000"
              searchInputStyle={{
                color: Colors.graytone,
                height: 35,
              }}
              styleListContainer={{ zIndex: 5000, height: 150 }}
              submitButtonColor={Colors.primaryOrange}
              submitButtonText={i18n.t("ConfirmSelection")}
              flatListProps={{ nestedScrollEnabled: true }}
            />
          </View>
        </Animatable.View>

        {/* Search by Serial Number */}
        <Animatable.View
          animation="slideInLeft"
          duration={1000}
          style={[
            styles.sectionContainer,
            { borderColor: Colors.orange, marginTop: 15 },
          ]}
        >
          <View
            style={[styles.headerContainer, { backgroundColor: Colors.orange }]}
          >
            <IconE
              name="search"
              size={Platform.OS === "ios" ? 30 : 25}
              color={Colors.white}
              style={{ marginHorizontal: 5, alignSelf: "center" }}
            ></IconE>
            <Title style={{ color: "#fff" }}>{i18n.t("SerialNumber")}</Title>
          </View>

          <View
            style={[
              Styles.sectionView,
              {
                marginTop: 5,
                width: "95%",
                backgroundColor: "#00000000",
                borderColor: "#00000000",
              },
            ]}
          >
            <MultiSelect
              items={serialNo.serialNos}
              styleSelectorContainer={{
                borderColor: Colors.cellBackground,
                borderWidth: 1,
                marginVertical: 1,
              }}
              displayKey="name"
              uniqueKey="id"
              onSelectedItemsChange={(items) =>
                setSerialNo({ ...serialNo, selectedSerialNos: items })
              }
              selectedItems={serialNo.selectedSerialNos}
              selectText=""
              noItemsText={i18n.t("NoItems")}
              searchInputPlaceholderText={i18n.t("SearchSerialNo")}
              onChangeInput={(text) => console.log(text)}
              tagRemoveIconColor={Colors.graytone}
              tagBorderColor={Colors.graytone}
              tagTextColor={Colors.graytone}
              selectedItemTextColor={Colors.graytone}
              selectedItemIconColor={Colors.graytone}
              itemTextColor="#000"
              searchInputStyle={{
                color: Colors.graytone,
              }}
              styleListContainer={{ zIndex: 5001, height: 150 }}
              submitButtonColor={Colors.primaryOrange}
              submitButtonText={i18n.t("ConfirmSelection")}
            />
          </View>
        </Animatable.View>

        <Button
          icon={() => (
            <IconM name="compare-arrows" size={24} color={Colors.graytone} />
          )}
          mode="outlined"
          color={Colors.graytone}
          style={[Styles.saveButton]}
          onPress={() => mapAssets()}
        >
          {i18n.t("Map")}
        </Button>
      </View>
      <Snackbar visible={snackbar.showSnackbar} onDismiss={onDismissSnackBar}>
        {snackbar.snackbarText}
      </Snackbar>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default AssetMapping;

const styles = StyleSheet.create({
  bottomButton: {
    position: "absolute",
    bottom: 10,
    left: 5,
    right: 5,
  },
  icon: {
    marginRight: 5,
    alignSelf: "center",
    color: "#fff",
  },
  sectionContainer: {
    marginHorizontal: "3%",
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    borderBottomEndRadius: 10,
    borderTopLeftRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderTopLeftRadius: 10,
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
