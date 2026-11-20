import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Snackbar } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import NetInfo from "@react-native-community/netinfo";
import SearchableDropdown from "react-native-searchable-dropdown";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Apikey from "../app.json";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons as IconM } from "@expo/vector-icons";
import * as location from "expo-location";
import * as APIHelper from "../Data/APIHelper";
import { getDb } from "../db/db";
import { queryAll } from "../db/exec";

let Pagedata = {
  Climatedata: {},
  page1: {},
  page3: {},
  page4: {},
};

const Location = ({ navigation, route }) => {
  Pagedata = route?.params || {};

  const [stateData, setStateData] = useState([]);
  const [selectedstate, setSelectedstate] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [selecteddistrict, setSelecteddistrict] = useState([]);
  const [netconnection, setNetconnection] = useState(true);
  const [latlong, setlatlong] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [long, setLong] = useState(0);
  const [lat, setLat] = useState(0);

  const [region, setRegion] = useState({
    latitude: 20.1,
    longitude: 75.8,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    address: "",
  });
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

  useEffect(() => {
    (async () => {
      setIsBusy(true);
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setNetconnection(false);
      } else {
        setNetconnection(true);
        GetCurrentLocation();
      }
      getStates();
    })();
  }, []);

  const GetCurrentLocation = async () => {
    let { status } = await location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission not granted",
        "Allow the app to use location service.",
        [{ text: "OK" }],
        { cancelable: false },
      );
    }

    let { coords } = await location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;
      let response = await location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = `${response[0].city}, ${response[0].district}, ${response[0].region}`;
      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
        address: address,
      });
      setLong(longitude);
      setLat(latitude);
    }
    setIsBusy(false);
  };

  const getStates = async () => {
    setIsBusy(true);
    const states = await queryAll("SELECT * FROM StateList");
    if (states && states.length > 0) {
      const activestate = states.map((element) => {
        return {
          name: element.Value,
          Key: element.Key,
          State_Short_Code: element.State_Short_Code,
        };
      });
      setStateData(activestate);
      setIsBusy(false);
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "State Data is not Found",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }
    setIsBusy(false);
  };

  const getDistrict = async (Key) => {
    setIsBusy(true);
    const districts = await queryAll(
      `SELECT * FROM Districtlist WHERE Statecode= ${Key}`,
    );

    if (districts && districts.length > 0) {
      const activedistrict = districts.map((element) => {
        return {
          name: element.Value,
          Key: element.Key,
          StateCode: element.Statecode,
        };
      });
      setDistrictData(activedistrict);
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "District Data is not Found",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 2000);
    }

    setIsBusy(false);
  };

  const getlatlong = async (DistrictCode, StateCode, longitude, latitude) => {
    setIsBusy(true);
    let findlatlong = "";
    if (longitude === 0 && latitude === 0) {
      findlatlong = `SELECT * FROM Weatherdata WHERE statecode = ${StateCode} AND districtcode = ${DistrictCode}`;
    } else {
      findlatlong = `SELECT * FROM Weatherdata WHERE longitude=${longitude} AND latitude=${latitude}`;
    }
    const locations = await queryAll(findlatlong);
    if (locations && locations.length > 0) {
      setlatlong({
        Latitude: locations[0].latitude,
        Longitude: locations[0].longitude,
      });
      setLong(locations[0].longitude);
      setLat(locations[0].latitude);
    } else {
      setSnackbar({
        showSnackbar: true,
        snackbarText: "For this District Latitude and Longitude is not Found",
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 800);
    }

    setIsBusy(false);
  };

  //getNearestValue(val) If we click on map find nearrest value of lat and long
  const getNearestValue = (val) => {
    let comp = val - Math.floor(val);
    if (comp > 0 && comp <= 0.25) {
      return Number(Math.floor(val) + ".25");
    } else if (comp > 0.25 && comp <= 0.5) {
      return Number(Math.floor(val) + ".25");
    } else if (comp > 0.5 && comp <= 0.75) {
      return Number(Math.floor(val) + ".75");
    } else if (comp > 0.75 && comp <= 0.99) {
      return Number(Math.floor(val) + ".75");
    }
    return 0;
  };

  const readdatabase = async () => {
    setIsBusy(true);
    let longValue, latValue;
    if (netconnection) {
      longValue = getNearestValue(long);
      latValue = getNearestValue(lat);

      const route = `https://apipmk.mnre.gov.in/api/ClimateData/GetClimateDataBylatlon?lat=${latValue}&lon=${longValue}`;
      const callResult = await APIHelper.Get(route, null);
      if (callResult.Result) {
        const Climatedata = {
          date_string: callResult.Data.date_string.split(","),
          tmin: callResult.Data.tmin,
          tmax: callResult.Data.tmax,
          rainfall: callResult.Data.rainfall,
          soiltype: callResult.Data.soil_type.split(",")[0],
        };
        Pagedata.Climatedata = {
          Climatedata: Climatedata,
          Lat: getNearestValue(lat),
          IsFill: true,
        };
        navigation.navigate("Cardanalysis", Pagedata);
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
        setTimeout(() => {
          setSnackbar(false);
        }, 1000);
      }
    } else {
      longValue = getNearestValue(long);
      latValue = getNearestValue(lat);

      let StateCode = selectedstate.Key;
      let DistrictCode = selecteddistrict.DistrictId;

      const WeatherdataSelectquery = `SELECT * FROM Weatherdata WHERE latitude = ${latValue} AND longitude = ${longValue}`;
      const weatherData = await queryAll(WeatherdataSelectquery);

      if (!weatherData && weatherData.length === 0) {
        setSnackbar({
          showSnackbar: true,
          snackbarText: "This location data is not available",
        });
      } else {
        const Startdate = result.rows._array[0].startdate;
        const Enddate = result.rows._array[0].enddate;
        const date_string = Createdate(Startdate, Enddate);
        const Climatedata = {
          date_string: date_string,
          tmin: result.rows._array[0].tmin,
          tmax: result.rows._array[0].tmax,
          rainfall: result.rows._array[0].rainfall,
          soiltype: result.rows._array[0].soiltype,
        };
        Pagedata.Climatedata = {
          Climatedata: Climatedata,
          Lat: getNearestValue(lat),
          IsFill: true,
        };
        navigation.navigate("Cardanalysis", Pagedata);
      }
    }
    setIsBusy(false);
  };

  const Createdate = (Startdate, Enddate) => {
    const startDate = new Date(Startdate);
    const endDate = new Date(Enddate);

    const dates = [];

    for (
      let currentDate = startDate;
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      const date = new Date(year, month - 1, day);

      const formattedDate = `${("0" + (date.getMonth() + 1)).slice(-2)}/${(
        "0" + date.getDate()
      ).slice(-2)}/${date.getFullYear()}`;

      dates.push(formattedDate);
    }
    return dates;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      {netconnection ? (
        <>
          {!isBusy && (
            <GooglePlacesAutocomplete
              placeholder="Search here"
              fetchDetails={true}
              GooglePlacesSearchQuery={{
                rankby: "distance",
              }}
              onPress={(data, details = null) => {
                // 'details' is provided when fetchDetails = true
                setRegion({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                  address: details.formatted_address,
                });
                setIsBusy(false);
              }}
              query={{
                key:
                  Platform.OS === "ios"
                    ? Apikey.expo.ios.config.googleMapsApiKey
                    : Apikey.expo.android.config.googleMaps.apiKey,
                language: "en",
                components: "country:in",
                types: "establishment",
                radius: 30000,
                location: `${region.latitude}, ${region.longitude}`,
              }}
              styles={{
                container: {
                  flex: 0,
                  position: "absolute",
                  width: "110%",
                  zIndex: 1,
                },
                listView: { backgroundColor: "white" },
              }}
            />
          )}
          <ScrollView>
            <MapView
              region={region}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
            >
              {/* <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} /> */}
              <Marker
                coordinate={region}
                draggable={true}
                onDragEnd={(e) => {
                  setRegion({
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                  });
                  setLong(e.nativeEvent.coordinate.longitude);
                  setLat(e.nativeEvent.coordinate.latitude);
                }}
                onDragStart={(e) => {}}
              />
              <Circle center={region} radius={1000} />
            </MapView>
          </ScrollView>
          <View>
            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.dateCell,
                  { width: "20%", backgroundColor: Colors.white },
                ]}
              >
                <IconM
                  name="location-pin"
                  size={Platform.OS === "ios" ? 35 : 30}
                  color={Colors.black}
                  style={{ alignSelf: "center" }}
                ></IconM>
              </View>
              <View
                style={[
                  styles.dateCell,
                  { width: "80%", backgroundColor: "lightgray" },
                ]}
              >
                <Text style={{ fontSize: 15, textAlign: "left" }}>
                  {region.address}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.dateCell, { width: "20%" }]}>
                <Text style={{ fontSize: 15, textAlign: "center" }}>Long</Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  { width: "30%", backgroundColor: "lightgray" },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  keyboardType="numberic"
                  defaultValue={long}
                  onChangeText={(value) => {
                    let val = +value;
                    setLong(val);
                  }}
                  placeholder="Enter Longitude"
                >
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {long}
                  </Text>
                </TextInput>
              </View>
              <View style={[styles.dateCell, { width: "20%" }]}>
                <Text style={{ fontSize: 15, textAlign: "center" }}>Lat</Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  { width: "30%", backgroundColor: "lightgray" },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  keyboardType="numberic"
                  defaultValue={lat}
                  onChangeText={(value) => {
                    let val = +value;
                    setLat(val);
                  }}
                  placeholder="Enter Latitude"
                >
                  <Text style={{ fontSize: 15, textAlign: "center" }}>
                    {lat}
                  </Text>
                </TextInput>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={[Styles.m1h, { marginVertical: 10, flex: 1 }]}>
            {/* Current State selected */}
            <View style={styles.head}>
              <Text style={styles.headerText}>Select State</Text>
            </View>
            <SearchableDropdown
              onTextChange={(text) => console.log(text)}
              onItemSelect={async (item) => {
                setSelectedstate({
                  ...selectedstate,
                  name: item.name,
                  StateCode: item.State_Short_Code,
                  Key: item.Key,
                });
                setSelecteddistrict([]);
                setlatlong([]);
                getDistrict(item.Key);
              }}
              items={stateData}
              defaultIndex={2}
              placeholder={
                selectedstate.length == 0
                  ? "Selected State"
                  : selectedstate.name
              }
              resetValue={false}
              underlineColorAndroid="transparent"
              containerStyle={{ padding: 5 }}
              textInputStyle={{
                padding: 12,
                borderColor: Colors.grayAAA,
                borderWidth: 2,
                borderRadius: 5,
              }}
              itemStyle={{
                padding: 10,
                marginTop: 2,
                borderColor: "#bbb",
                borderWidth: 1,
                borderRadius: 5,
              }}
              itemTextStyle={{
                color: "#222",
              }}
              itemsContainerStyle={{
                maxHeight: 300,
              }}
            />

            {/* Current District selected */}
            <View style={styles.head}>
              <Text style={styles.headerText}>Select District</Text>
            </View>
            <SearchableDropdown
              onTextChange={(text) => console.log(text)}
              onItemSelect={(item) => {
                setSelecteddistrict({
                  ...selecteddistrict,
                  DistrictName: item.name,
                  DistrictId: item.Key,
                  StateCode: item.StateCode,
                });
                getlatlong(item.Key, item.StateCode, long, lat);
              }}
              items={districtData}
              defaultIndex={2}
              placeholder={
                selecteddistrict.length == 0
                  ? "Selected District"
                  : selecteddistrict.DistrictName
              }
              resetValue={false}
              underlineColorAndroid="transparent"
              containerStyle={{ padding: 5 }}
              textInputStyle={{
                padding: 12,
                borderColor: Colors.grayAAA,
                borderWidth: 2,
                borderRadius: 5,
              }}
              itemStyle={{
                padding: 10,
                marginTop: 2,
                borderColor: "#bbb",
                borderWidth: 1,
                borderRadius: 5,
              }}
              itemTextStyle={{
                color: "#222",
              }}
              itemsContainerStyle={{
                maxHeight: 300,
              }}
            />
          </View>

          {/* latitude and longitude data */}
          <View>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.dateCell, { width: "20%" }]}>
                <Text style={{ fontSize: 20, textAlign: "center" }}>Long</Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  { width: "30%", backgroundColor: "lightgray" },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  keyboardType="numberic"
                  defaultValue={long}
                  onChangeText={(value) => {
                    let val = +value;
                    setLong(val);
                    getlatlong(
                      selectedstate.Key,
                      selecteddistrict.DistrictId,
                      val,
                      lat,
                    );
                  }}
                  placeholder="Enter Longitude"
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>
                    {long}
                  </Text>
                </TextInput>
              </View>
              <View style={[styles.dateCell, { width: "20%" }]}>
                <Text style={{ fontSize: 20, textAlign: "center" }}>Lat</Text>
              </View>
              <View
                style={[
                  styles.dateCell,
                  { width: "30%", backgroundColor: "lightgray" },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  keyboardType="numberic"
                  defaultValue={long}
                  onChangeText={(value) => {
                    let val = +value;
                    setLat(val);
                    getlatlong(
                      selectedstate.Key,
                      selecteddistrict.DistrictId,
                      long,
                      val,
                    );
                  }}
                  placeholder="Enter Latitude"
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>
                    {lat}
                  </Text>
                </TextInput>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={{ flexDirection: "row", margin: 10 }}>
        <Button
          mode="contained"
          color={Colors.green}
          style={Styles.button}
          labelStyle={{ color: Colors.white }}
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          Back
        </Button>
        <Button
          mode="contained"
          color={Colors.orange}
          style={Styles.button}
          labelStyle={{ color: Colors.white }}
          disabled={isBusy}
          onPress={() => readdatabase()}
        >
          Next
        </Button>
      </View>

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

export default Location;

const styles = StyleSheet.create({
  text: { textAlign: "center" },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  address: {
    borderWidth: 2,
    padding: 10,
    flexDirection: "row",
  },
  dateCell: {
    borderWidth: 1,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
});
