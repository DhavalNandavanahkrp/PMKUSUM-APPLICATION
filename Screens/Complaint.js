import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  FlatList,
  Image,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { List, Button, Snackbar } from "react-native-paper";
import RadioForm from "react-native-simple-radio-button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { useIsFocused } from "@react-navigation/native";
import {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import * as APIHelper from "../Data/APIHelper";
import moment from "moment";
import i18n from "i18n-js";
import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  EvilIcons as IconE,
} from "@expo/vector-icons";

const Complaint = ({ route, navigation }) => {
  let apiUrl;
  let access_token;
  let stateCode;
  let params = route?.params || {};
  const [isBusy, setIsBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const [expanded, setExpanded] = useState(0);
  const [complaintData, setComplaintData] = useState({
    currentView: 2,
    totalComplaints: [],
    filteredComplaints: [],
    open: 0,
    close: 0,
    total: 0,
  });

  const [newComplaint, setNewComplaint] = useState({
    showDialog: false,
    complainListType: [],
    systemId: "",
    systemName: "",
    subjectId: -1,
    remark: "",
  });

  const [images, setImages] = useState([]);

  const handleChange = (panel) => {
    setExpanded(panel ? panel : false);
  };

  const setView = (view) => {
    let filteredList = complaintData.totalComplaints;
    if (view === 0)
      filteredList = complaintData.totalComplaints.filter(
        (c) => c.CompStatusId !== 7,
      );
    if (view === 1)
      filteredList = complaintData.totalComplaints.filter(
        (c) => c.CompStatusId === 7,
      );
    setComplaintData({
      ...complaintData,
      currentView: view,
      filteredComplaints: filteredList,
    });
  };
  const [modalVisible, setModalVisible] = useState(false);
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

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      if (isFocused === true) {
        await farmerdetails();
        apiUrl = await AsyncStorage.getItem("apiURL");
        access_token = await AsyncStorage.getItem("authToken");
        stateCode = await AsyncStorage.getItem("stateCode");

        const { complaintId } = route.params;
        let id = null;
        if (typeof complaintId !== "undefined" && complaintId !== null) {
          id = complaintId;
        }
        await getFarmerComplaint(id);
        const role1 = await AsyncStorage.getItem("departmentRole");
        setRole(role1.toUpperCase());
        if (params.base64 !== undefined) {
          setModalVisible(false);
          await processImageUpload(params.base64);
        }
        params.base64 === undefined
          ? setModalVisible(false)
          : setModalVisible(true);
        // params.base64 = ""
      }
    })();
  }, [isFocused]);

  const getFarmerComplaint = async (id) => {
    try {
      setIsBusy(true);
      apiUrl = await AsyncStorage.getItem("apiURL");
      access_token = await AsyncStorage.getItem("authToken");
      stateCode = await AsyncStorage.getItem("stateCode");
      const farmerUserName = await AsyncStorage.getItem("applicationNo");
      const selectedComponent = await AsyncStorage.getItem("selectedComponent");
      let number =
        selectedComponent === "ComponentB"
          ? 2
          : null || selectedComponent === "ComponentA"
          ? 1
          : 3;
      const Component =
        selectedComponent === "ComponentB"
          ? "b"
          : null || selectedComponent === "ComponentC"
          ? "c"
          : "a";
      const route = `${apiUrl}/api/${stateCode}/CompGeneration/GetFarmerComplaint?userName=${farmerUserName}&component=${number}&PROJCD=${Component}`;
      const callResult = await APIHelper.Get(route, access_token);

      if (callResult.Result) {
        const result = callResult.Data.map((item) => {
          const {
            ComplainUId,
            ComplainSubject,
            ComplaintDetails,
            ComplainSubjectId,
            SystemTypeId,
            SystemType,
            CompStatusId,
            CompStatus,
            ClosingRemarks,
            CompGeneratedDateSTR,
            AcknowledgedDateSTR,
            TicketGeneratedDateStr,
            ResolvedDateStr,
            ClosingDateStr,
            ResolvedRemarks,
            AllocatedDateSTR,
            TicketAssignedDateStr,
          } = item;
          return {
            ComplainUId: ComplainUId,
            ComplainSubjectId: ComplainSubjectId,
            ComplainSubject: ComplainSubject,
            CompStatusId: CompStatusId,
            ComplaintDetails: ComplaintDetails,
            SystemTypeId: SystemTypeId,
            SystemType: SystemType,
            CompStatus: CompStatus,
            ClosingRemarks: ClosingRemarks,
            CompGeneratedDateSTR: CompGeneratedDateSTR,
            AcknowledgedDateSTR: AcknowledgedDateSTR,
            TicketGeneratedDateStr: TicketGeneratedDateStr,
            ResolvedDateStr: ResolvedDateStr,
            ClosingDateStr: ClosingDateStr,
            AllocatedDateSTR: AllocatedDateSTR,
            ResolvedRemarks: ResolvedRemarks,
            TicketAssignedDateStr: TicketAssignedDateStr,
          };
        });
        if (id !== null) {
          let fromIndex = result.findIndex((x) => x.ComplainUId === id);

          if (fromIndex !== -1) {
            var element = result[fromIndex];
            result.splice(fromIndex, 1);
            result.splice(0, 0, element);
          }
        }

        let filteredList = result.reverse();
        if (complaintData.currentView === 0)
          filteredList = filteredList.filter((c) => c.CompStatusId !== 7);
        if (complaintData.currentView === 1)
          filteredList = filteredList.filter((c) => c.CompStatusId === 7);
        setComplaintData({
          ...complaintData,
          filteredComplaints: filteredList,
          totalComplaints: result.reverse(),
          //   open: result.filter((el) => parseInt(el.CompStatusId) !== 7).length,
          //   close: result.filter((el) => el.CompStatusId === 7).length,
        });
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
      setIsBusy(false);
    } catch (error) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: error,
      });
    }
  };

  const getComplaintSubjectList = async () => {
    setIsBusy(true);
    apiUrl = await AsyncStorage.getItem("apiURL");
    access_token = await AsyncStorage.getItem("authToken");
    stateCode = await AsyncStorage.getItem("stateCode");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/CompComplaintSubject/ComplaintSubjectTypeKeyValList?PROJCD=${Component}`;
    const callResult = await APIHelper.Get(route, access_token);
    if (callResult.Result) {
      const complaintSubjectList = callResult.Data.map((item) => {
        const { Id, Name } = item;
        return {
          value: Id,
          label: Name,
        };
      });
      setNewComplaint({
        ...newComplaint,
        complainListType: complaintSubjectList,
        showDialog: true,
        subjectId: -1,
        remark: null,
        systemName: "",
      });
      setModalVisible(true);
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
    setIsBusy(false);
  };

  const getComplaintSystemName = async (value) => {
    setIsBusy(true);
    apiUrl = await AsyncStorage.getItem("apiURL");
    access_token = await AsyncStorage.getItem("authToken");
    stateCode = await AsyncStorage.getItem("stateCode");
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const route = `${apiUrl}/api/${stateCode}/CompSystemType/GetSystemTypeByCompSubjectId?compSubjectId=${value}&PROJCD=${Component}`;
    const callResult = await APIHelper.Get(route, access_token);
    if (callResult.Result) {
      setNewComplaint({
        ...newComplaint,
        subjectId: value,
        systemName: callResult.Data.Name,
        systemId: callResult.Data.Id,
      });
    } else {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: callResult.Message,
      });
    }
    setIsBusy(false);
  };

  const submitComplaint = async () => {
    setIsBusy(true);
    stateCode = await AsyncStorage.getItem("stateCode");
    const apiUrl = await AsyncStorage.getItem("apiURL");
    const token = await AsyncStorage.getItem("authToken");
    const userName = await AsyncStorage.getItem("applicationNo");
    const subjectTypeId = newComplaint.subjectId;
    const systemTypeId = newComplaint.systemId;
    const details = newComplaint.remark;
    const selectedComponent = await AsyncStorage.getItem("selectedComponent");
    let number =
      selectedComponent === "ComponentB"
        ? 2
        : null || selectedComponent === "ComponentA"
        ? 1
        : 3;
    const Component =
      selectedComponent === "ComponentB"
        ? "b"
        : null || selectedComponent === "ComponentC"
        ? "c"
        : "a";
    const ID = complaintData.totalComplaints.filter(
      (el) => el.ComplainSubjectId === subjectTypeId,
    );
    if (ID.length > 0) {
      setSnackbar({
        ...snackbar,
        showSnackbar: true,
        snackbarText: i18n.t("ComplaintAlreadyRegistered"),
      });
      setTimeout(() => {
        setSnackbar(false);
      }, 3000);
    } else {
      const route = `${apiUrl}/api/${stateCode}/CompGeneration/AddComplaintData?PROJCD=${Component}`;
      const payload = {
        UserName: userName,
        SubjectTypeId: subjectTypeId,
        SystemTypeId: systemTypeId,
        Details: details,
        Component: number,
      };
      const callResult = await APIHelper.Post1(route, token, payload);
      if (callResult.Result) {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: i18n.t("complaintIsRegisteredSuccessfully"),
        });
        setNewComplaint({ ...newComplaint, showDialog: false });
        setModalVisible(false);
        await getFarmerComplaint();
      } else {
        setSnackbar({
          ...snackbar,
          showSnackbar: true,
          snackbarText: callResult.Message,
        });
      }
    }
    setIsBusy(false);
  };

  const uploadImage = async () => {
    setModalVisible(false);
    navigation.navigate("Imagecapture", {
      screen: "Complaint",
      showDetail: false,
    });
  };

  const processImageUpload = async (base64) => {
    let ids = images.map((item) => {
      return item.id;
    });

    ids = ids.sort();
    const newimage = { src: base64, id: ids[ids.length - 1] + 1 };
    setImages((images) => [...images, { id: newimage.id, src: newimage.src }]);
  };

  const removeimage = (item) => {
    if (item.id !== 0) {
      return Alert.alert(
        "Delete Image",
        "Are you sure you want to delete image?",
        [
          {
            text: i18n.t("Yes"),
            onPress: () => {
              const imagesData = [...images];
              imagesData.splice(item, 1);
              setImages(imagesData);
            },
          },
          { text: i18n.t("No") },
        ],
      );
    }
  };

  const renderDocument = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Pressable
        onLongPress={() => {
          removeimage(index);
        }}
      >
        <Image
          style={Styles.imageThumbnail}
          source={{ uri: "data:image/png;base64," + item.src }}
          resizeMode="cover"
        />
      </Pressable>
    </View>
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getFarmerComplaint();
    setRefreshing(false);
  }, [refreshing]);

  const formatDate = (value) => {
    if (value) {
      var date = moment(value, "DD/MM/YYYY").format("Do MMM YYYY");
    }
    return date;
  };

  return (
    <SafeAreaView style={Styles.flex1} edges={["bottom"]}>
      {/* Farmer Basic  details */}
      {(role.toUpperCase() === "DISCOM" || role.toUpperCase() === "EPC") && (
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
        </View>
      )}
      <ScrollView
        style={{ margin: "1%", flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <Pressable
            style={{ flex: 0.33 }}
            disabled={isBusy}
            onPress={() => setView(0)}
          >
            <View style={styles.tile}>
              <Text style={[styles.numberText, { color: Colors.red }]}>
                {
                  complaintData.totalComplaints.filter(
                    (el) => parseInt(el.CompStatusId) !== 7,
                  ).length
                }
              </Text>
              <Text style={[styles.bottomTileText, { color: Colors.red }]}>
                {i18n.t("Open")}
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={{ flex: 0.33 }}
            disabled={isBusy}
            onPress={() => setView(1)}
          >
            <View style={styles.tile}>
              <Text style={[styles.numberText, { color: Colors.green }]}>
                {
                  complaintData.totalComplaints.filter(
                    (el) => parseInt(el.CompStatusId) === 7,
                  ).length
                }
              </Text>
              <Text style={[styles.bottomTileText, { color: Colors.green }]}>
                {i18n.t("Close")}
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={{ flex: 0.33 }}
            disabled={isBusy}
            onPress={() => setView(2)}
          >
            <View style={styles.tile}>
              <Text style={[styles.numberText, { color: Colors.grayAAA }]}>
                {complaintData.totalComplaints.length}
              </Text>
              <Text style={[styles.bottomTileText, { color: Colors.grayAAA }]}>
                {i18n.t("Total")}
              </Text>
            </View>
          </Pressable>
        </View>
        <List.Section
          titleStyle={{ textAlign: "center" }}
          title={
            complaintData.currentView === 0 ? (
              <Text
                style={{ color: Colors.red, fontWeight: "bold", fontSize: 18 }}
              >
                {i18n.t("OpenComplaints")}
              </Text>
            ) : complaintData.currentView === 1 ? (
              <Text
                style={{
                  color: Colors.green,
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {i18n.t("ClosedComplaints")}
              </Text>
            ) : (
              <Text
                style={{
                  color: Colors.graytone,
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {i18n.t("AllComplaints")}
              </Text>
            )
          }
        >
          {complaintData.filteredComplaints.length !== 0 ? (
            complaintData.filteredComplaints.map((item, index) => (
              <List.Accordion
                key={index}
                expanded={expanded == index}
                onPress={() => handleChange(index)}
                description={
                  <View>
                    <Text
                      style={{
                        flexWrap: "wrap",
                        fontWeight: "bold",
                        color: Colors.green,
                      }}
                    >
                      #{item.ComplainUId}
                    </Text>
                    <Text>{item.ComplainSubject}</Text>
                  </View>
                }
                titleStyle={{ color: Colors.graytone }}
              >
                <View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ComplaintStatus")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>{item.CompStatus}</Text>
                    </View>
                  </View>
                  <View style={[styles.row]}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ComplaintDate")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {formatDate(item.CompGeneratedDateSTR)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.row]}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ComplaintAcknowledged")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {formatDate(item.AcknowledgedDateSTR)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("TicketGenerated")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {formatDate(item.TicketGeneratedDateStr)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("TicketResolved")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {formatDate(item.ResolvedDateStr)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ComplaintClosed")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {formatDate(item.ClosingDateStr)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ClosureRemarkEA")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>
                        {item.ResolvedRemarks}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.nameCell}>
                      <Text style={styles.cellText}>
                        {i18n.t("ClosureRemarkSIA")}
                      </Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.cellText}>{item.ClosingRemarks}</Text>
                    </View>
                  </View>
                </View>
              </List.Accordion>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: Colors.graytone,
                  fontFamily: "roboto-regular",
                  fontSize: 16,
                }}
              >
                {i18n.t("NoComplaintRecordFound")}
              </Text>
            </View>
          )}
        </List.Section>
      </ScrollView>
      <KeyboardAvoidingView behavior="position" enabled>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          // onRequestClose={() => {
          //   setModalVisible(!modalVisible)
          // }}
        >
          <View style={styles.modal}>
            <View
              style={{
                height: 40,
                backgroundColor: Colors.grayAAA,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {i18n.t("AddNewComplaint")}
              </Text>
            </View>
            <RadioForm style={{ width: "90%" }}>
              {newComplaint.complainListType.map((obj, i) => (
                <RadioButton labelHorizontal={true} key={i}>
                  <RadioButtonInput
                    obj={obj}
                    index={i + 1}
                    isSelected={newComplaint.subjectId === i + 1}
                    onPress={(value) => {
                      getComplaintSystemName(value);
                    }}
                    borderWidth={1.5}
                    buttonInnerColor={Colors.green}
                    buttonOuterColor={Colors.green}
                    buttonSize={18}
                    buttonOuterSize={25}
                    buttonWrapStyle={{ marginLeft: 10, marginVertical: 5 }}
                  />
                  <RadioButtonLabel
                    obj={obj}
                    index={i + 1}
                    labelHorizontal={true}
                    onPress={(value) => {
                      getComplaintSystemName(value);
                    }}
                    labelStyle={{
                      color: Colors.black,
                      margin: 0,
                      fontFamily: "roboto-regular",
                      fontSize: 14,
                    }}
                  />
                </RadioButton>
              ))}
            </RadioForm>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {i18n.t("SystemName")} :{" "}
              </Text>
              <Text>{newComplaint.systemName}</Text>
            </View>
            <TextInput
              style={{
                marginHorizontal: 10,
                marginBottom: 10,
                borderBottomColor: Colors.graytone,
                borderBottomWidth: 1,
              }}
              placeholder={i18n.t("EnterComplaintDetails")}
              numberOfLines={4}
              onChangeText={(value) => {
                setNewComplaint({ ...newComplaint, remark: value });
              }}
            >
              {newComplaint.remark}
            </TextInput>
            <View
              style={{
                //flexDirection:'row',
                // marginHorizontal: 5,
                borderWidth: 1.7,
                borderColor: Colors.graytone,
                borderRadius: 5,
                margin: 6,
                //minHeight: 50,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                {/* Images form */}
                <FlatList
                  listKey="images"
                  data={images}
                  renderItem={renderDocument}
                  numColumns={3}
                  keyExtractor={(item, index) => index}
                  ListEmptyComponent={() => {
                    return (
                      <Text style={styles.emptyComponent}>
                        {i18n.t("NoImageUploaded")}
                      </Text>
                    );
                  }}
                />
                <Text style={[styles.imageTitle]}></Text>
                <Pressable
                  style={{ marginTop: 10 }}
                  onPress={async () => uploadImage()}
                >
                  <IconMC
                    name="camera-outline"
                    size={35}
                    color={Colors.graytone}
                    style={{ marginVertical: 5 }}
                  ></IconMC>
                </Pressable>
              </View>
            </View>
            <Button
              icon="content-save-outline"
              mode="contained"
              style={{
                marginHorizontal: 15,
                marginBottom: 10,
                backgroundColor: Colors.green,
                borderRadius: 30,
              }}
              onPress={() => submitComplaint()}
              disabled={
                newComplaint.subjectId !== 6 && (!newComplaint.remark || isBusy)
              }
            >
              {i18n.t("RegisterComplaint")}
            </Button>
            <Button
              icon="cancel"
              mode="contained"
              style={{
                marginHorizontal: 15,
                marginBottom: 10,
                backgroundColor: Colors.cellBackground,
                borderRadius: 30,
              }}
              onPress={() => {
                setModalVisible(!modalVisible), setImages([]);
              }}
            >
              {i18n.t("Cancel")}
            </Button>
            {isBusy && (
              <View style={Styles.loading}>
                <ActivityIndicator size="large" color="#F9AA33" />
              </View>
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
      <Button
        icon="plus"
        mode="contained"
        height={45}
        color={Colors.white}
        labelStyle={{ color: Colors.white }}
        style={{
          margin: 5,
          borderRadius: 30,
          color: Colors.white,
          backgroundColor: Colors.green,
          borderWidth: 1.5,
        }}
        onPress={() => getComplaintSubjectList()}
        disabled={isBusy}
      >
        {i18n.t("NewComplaint")}
      </Button>
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

export default Complaint;

const styles = StyleSheet.create({
  tile: {
    marginHorizontal: 5,
    borderWidth: 1.7,
    borderColor: Colors.graytone,
    borderRadius: 5,
    minHeight: 120,
  },
  numberText: {
    fontSize: 50,
    textAlign: "center",
  },
  bottomTileText: {
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.graytone,
    flex: 1,
    fontSize: 20,
  },
  row: {
    flexDirection: "row",
    marginHorizontal: 10,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.cellBackground,
  },
  nameCell: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: Colors.graytone,
    justifyContent: "center",
  },
  valueCell: {
    width: "60%",
    justifyContent: "center",
  },
  cellText: {
    margin: 5,
  },
  modal: {
    marginTop: 70,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.graytone,
    borderRadius: 10,
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
  imageContainer: {
    flexDirection: "column",
    margin: 3,
    padding: 3,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "#aaa",
  },
  imageTitle: {
    color: Colors.graytone,
    marginVertical: 5,
    fontWeight: "bold",
    alignSelf: "center",
    flex: 1,
  },
  emptyComponent: {
    fontWeight: "bold",
    color: Colors.grayAAA,
    textAlign: "left",
    margin: 5,
  },
});
