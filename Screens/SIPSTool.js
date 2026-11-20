import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TextInput,
  Pressable,
  Text,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import * as Print from "expo-print";
import { Styles } from "../Styles/GlobalStyles";
import { useIsFocused } from "@react-navigation/native";
import Toolcard from "../Components/Toolcard";
import siptoolresult from "../JsonData/siptoolresult.json";
import * as Animatable from "react-native-animatable";
import {
  MaterialCommunityIcons as IconMC,
  AntDesign as IconA,
} from "@expo/vector-icons";
const SIPSTool = ({ navigation, route }) => {
  const Pagedata = route?.params || {};

  const [selectedPrinter, setSelectedPrinter] = React.useState();

  const [isBusy, setIsBusy] = useState(false);
  const [pumptype, setPumptype] = useState("AC");
  const [isdown, setIsDown] = useState("");
  const [requirement, setRequirement] = useState(1);
  const [level, setLevel] = useState(1);
  const [dischangelpd, setDischangelpd] = useState(1);
  const [design, setdesign] = useState([]);
  const [designhead, setDesignhead] = useState([]);
  const [category, setCategory] = useState("");
  const [SipfinalScenario, setSipfinalScenario] = useState([]);
  const pumptypeList = ["AC", "DC"];
  const sipsJsondata = JSON.stringify(siptoolresult);
  const sipsresult = JSON.parse(sipsJsondata);
  const sipfinalScenario = [];
  const systemheaddata = Pagedata.page3.P3;
  const sourcedata = Pagedata.page3.Sourcedata;
  const FourTotalSystemHead = Pagedata.page3.P3.FourTotalSystemHead;
  const FourFrictionalHead = Pagedata.page3.P3.FourFrictionalHead;
  const FourHeadeRequiredForirrigation =
    Pagedata.page3.P3.FourHeadeRequiredForirrigation;

  let page4data = {
    Pumptype: pumptype,
    Requirement: requirement,
    Level: level,
    Dischangelpd: dischangelpd,
    Design: design,
    Designhead: designhead,
    Category: category,
    SipfinalScenario: SipfinalScenario,
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (Pagedata.page4 !== undefined && Pagedata.page4.IsFill) {
      setPumptype(Pagedata.page4.P4.Pumptype);
      setRequirement(Pagedata.page4.P4.Requirement);
      setLevel(Pagedata.page4.P4.Level);
      setDischangelpd(Pagedata.page4.P4.Dischangelpd);
      setdesign(Pagedata.page4.P4.Design);
      setCategory(Pagedata.page4.P4.Category);
      setDesignhead(Pagedata.page4.P4.Designhead);
      setSipfinalScenario(Pagedata.page4.P4.SipfinalScenario);
    } else {
      sipstoolresult(requirement, dischangelpd, level);
    }
  }, [isFocused]);

  const Opnebutton = (value) => {
    return (
      <Pressable
        style={styles.pressable}
        onPress={() => {
          setIsDown(value);
        }}
      >
        <IconA name="down" size={25} style={{ alignItems: "flex-end" }} />
      </Pressable>
    );
  };

  const CloseButton = (value) => {
    return (
      <Pressable
        style={styles.pressable}
        onPress={() => {
          setIsDown(value);
        }}
      >
        <IconA name="up" size={25} style={{ alignItems: "flex-end" }} />
      </Pressable>
    );
  };

  let FormFiveBasescenarioDesignDischarge = 0;
  let FormFivescenariotwoDesignDischarge = 0;
  let FormFivescenariothreeDesignDischarge = 0;
  let FormFiveTargetDesignDischange = 0;
  let FormFiveCategoryAllScenario = 0;
  let ScenarioTwoMeter = 0;
  let ScenarioThreeMeter = 0;
  let ScenarioFourMeter = 0;

  //sipstoolresult Have total four Scenario
  //this.FormFiveBasescenarioDesignDischarge is 1st Scenario and 3rd Scenario
  //this.FormFivescenariotwoDesignDischarge is 2nd Scenarion is depend of Increased irrigation requirement.
  //this.FormFiveTargetDesignDischange is 4th Scenario is depend of Target dischange scenario (lpd).
  const sipstoolresult = async (Requirement, Dischangelpd, Level, Pumptype) => {
    let MaxIRValue = systemheaddata.Irvaluse;

    //design discharge
    FormFiveBasescenarioDesignDischarge = MaxIRValue; //(max value) //scenario 1 and 3  design discharge
    FormFivescenariotwoDesignDischarge =
      FormFiveBasescenarioDesignDischarge +
      (1 + (FormFiveBasescenarioDesignDischarge * Requirement) / 100); // scenario 2 design discharge
    FormFivescenariothreeDesignDischarge = FormFiveBasescenarioDesignDischarge;
    FormFiveTargetDesignDischange = Dischangelpd; //target design discharge
    setdesign([
      FormFiveBasescenarioDesignDischarge,
      FormFivescenariotwoDesignDischarge,
      FormFivescenariothreeDesignDischarge,
      FormFiveTargetDesignDischange,
    ]);
    page4data.Design = [
      FormFiveBasescenarioDesignDischarge,
      FormFivescenariotwoDesignDischarge,
      FormFivescenariothreeDesignDischarge,
      FormFiveTargetDesignDischange,
    ];

    //designhead
    let TotalSystemHead = +systemheaddata.FourTotalSystemHead; //DesignHead Meter Scenario 14
    TotalSystemHead = TotalSystemHead.toFixed(2);

    ScenarioTwoMeter =
      (789000 *
        +systemheaddata.DistanceSource *
        Math.pow(FormFivescenariotwoDesignDischarge / 6 / 3600, 1.75)) /
      Math.pow(+systemheaddata.PipeDiameter, 4.75) +
      +systemheaddata.FourDepthOfWaterLevel +
      +systemheaddata.FourHeadeRequiredForirrigation; //DesignHead Meter Scenario 2
    ScenarioTwoMeter = ScenarioTwoMeter.toFixed(2);

    ScenarioThreeMeter =
      +systemheaddata.FourDepthOfWaterLevel * (1 + Level / 100) +
      +FourHeadeRequiredForirrigation +
      +FourFrictionalHead; //DesignHead Meter Scenario 3
    ScenarioThreeMeter = ScenarioThreeMeter.toFixed(2);

    ScenarioFourMeter =
      (789000 *
        +systemheaddata.DistanceSource *
        Math.pow(Dischangelpd / 6 / 3600, 1.75)) /
      Math.pow(+systemheaddata.PipeDiameter, 4.75) +
      +systemheaddata.FourDepthOfWaterLevel +
      +systemheaddata.FourHeadeRequiredForirrigation; //DesignHead Meter Scenario 4
    ScenarioFourMeter = ScenarioFourMeter.toFixed(2);

    setDesignhead([
      TotalSystemHead,
      ScenarioTwoMeter,
      ScenarioThreeMeter,
      ScenarioFourMeter,
    ]);
    page4data.Designhead = [
      TotalSystemHead,
      ScenarioTwoMeter,
      ScenarioThreeMeter,
      ScenarioFourMeter,
    ];

    //Category
    if (sourcedata[0].value == systemheaddata.Source) {
      FormFiveCategoryAllScenario = "Submersible";
      setCategory(FormFiveCategoryAllScenario);
      page4data.Category = FormFiveCategoryAllScenario;
    } else {
      FormFiveCategoryAllScenario = "Surface";
      setCategory(FormFiveCategoryAllScenario);
      page4data.Category = FormFiveCategoryAllScenario;
    }
    ScenarioAll(Pumptype);
  };

  // siptoolresult.json' 1st find close value(nearrest Max Value) and after find sort value of LPD depend on pumpType and waterSourceList
  // find Design Discharge not find value then print 'Redesign'
  // Final Result find All Scenario LPD Max Value.
  const ScenarioAll = (Pumptype) => {
    Pumptype == undefined ? (Pumptype = pumptype) : (Pumptype = Pumptype);
    const closest = sipsresult.filter(
      (ex) =>
        ex.Current == Pumptype && ex.Category == FormFiveCategoryAllScenario,
    );
    var sipFiletrvalue = closest;

    var sortvalue = sipFiletrvalue;
    sortvalue = closest
      .sort((a, b) => a.LPD - b.LPD)
      .sort((a, b) => a.RecommondedHead - b.RecommondedHead)
      .sort((a, b) => a.MotorHP - b.MotorHP);

    let SipfinalScenarioOne = getAppropreatePump(
      sortvalue,
      FormFiveBasescenarioDesignDischarge,
      FourTotalSystemHead,
    );
    let SipfinalScenarioTwo = getAppropreatePump(
      sortvalue,
      FormFivescenariotwoDesignDischarge,
      ScenarioTwoMeter,
    );
    let SipfinalScenarioThree = getAppropreatePump(
      sortvalue,
      FormFivescenariothreeDesignDischarge,
      ScenarioThreeMeter,
    );
    let SipfinalScenarioFour = getAppropreatePump(
      sortvalue,
      FormFiveTargetDesignDischange,
      ScenarioFourMeter,
    );
    let SipfinalScenarioFinal = {};
    sipfinalScenario.push(
      SipfinalScenarioOne,
      SipfinalScenarioTwo,
      SipfinalScenarioThree,
      SipfinalScenarioFour,
    );

    //finalresult
    let ScenarioOneLPD = SipfinalScenarioOne.MotorHP && SipfinalScenarioOne.LPD;
    let ScenarioTwoLPD = SipfinalScenarioTwo.MotorHP && SipfinalScenarioTwo.LPD;
    let ScenarioThreeLPD =
      SipfinalScenarioThree.MotorHP && SipfinalScenarioThree.LPD;
    let ScenarioFourLPD =
      SipfinalScenarioFour.MotorHP && SipfinalScenarioFour.LPD;
    if (SipfinalScenarioOne.LPD == "Redesign") {
      ScenarioOneLPD = 0;
    }
    if (SipfinalScenarioTwo.LPD == "Redesign") {
      ScenarioTwoLPD = 0;
    }
    if (SipfinalScenarioThree.LPD == "Redesign") {
      ScenarioThreeLPD = 0;
    }
    if (SipfinalScenarioFour.LPD == "Redesign") {
      ScenarioFourLPD = 0;
    }

    let maxIndex = [
      ScenarioOneLPD,
      ScenarioTwoLPD,
      ScenarioThreeLPD,
      ScenarioFourLPD,
    ].indexOf(
      Math.max(
        ScenarioOneLPD,
        ScenarioTwoLPD,
        ScenarioThreeLPD,
        ScenarioFourLPD,
      ),
    );
    if (maxIndex == 0) {
      SipfinalScenarioFinal = SipfinalScenarioOne;
    } else if (maxIndex == 1) {
      SipfinalScenarioFinal = SipfinalScenarioTwo;
    } else if (maxIndex == 2) {
      SipfinalScenarioFinal = SipfinalScenarioThree;
    } else if (maxIndex == 3) {
      SipfinalScenarioFinal = SipfinalScenarioFour;
    } else {
      SipfinalScenarioFinal = {
        MotorHP: "Redesign",
        Model: "Redesign",
        Pvarray_Wp: "Redesign",
        RecommondedHead: "Redesign",
        SHUTOFF: "Redesign",
        LPD: "Redesign",
      };
    }
    sipfinalScenario.push(SipfinalScenarioFinal);
    page4data.SipfinalScenario = sipfinalScenario;
    setSipfinalScenario(sipfinalScenario);
  };

  //find Design Discharge not find value then print 'Redesign'
  const getAppropreatePump = (sortvalue, literPerDay, head) => {
    let isFound = false;
    let res;
    for (var i = 0; i < sortvalue.length; i++) {
      if (
        sortvalue[i].LPD > literPerDay &&
        sortvalue[i].RecommondedHead > head &&
        !isFound
      ) {
        isFound = true;
        res = sortvalue[i];
      }
    }
    if (!isFound) {
      res = {
        MotorHP: "Redesign",
        Model: "Redesign",
        Pvarray_Wp: "Redesign",
        RecommondedHead: "Redesign",
        SHUTOFF: "Redesign",
        LPD: "Redesign",
      };
    }
    return res;
  };

  const Createhtmlstring = async (objectof) => {
    let html = `
    <html>
    <style>
table, th, td {
  border:1px solid black;
}
</style>
    <body>
        <table style="width:100%">
        <tr>
            <th>Scenario</th>
            <th>Design Discharge (LPD)</th>
            <th>Design Head (m)</th>
            <th>Motor HP</th>
            <th>Category</th>
            <th>Model </th>
            <th>Pvarray Wp</th>
            <th>Head (m)</th>
            <th>Shutoff Head (m)</th>
            <th>Discharge (LPD)</th>
          </tr>
          <tr>
            <td>Base scenario</td>
            <td>${objectof[0].Design}</td>
            <td>${objectof[0].Designhead}</td>
            <td>${objectof[0].Senarioof.MotorHP}</td>
            <td>${objectof[0].Category}</td>
            <td>${objectof[0].Senarioof.Model}</td>
            <td>${objectof[0].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[0].Senarioof.RecommondedHead}</td>
            <td>${objectof[0].Senarioof.SHUTOFF}</td>
            <td>${objectof[0].Senarioof.LPD}</td>
          </tr>
          <tr>
            <td>Increased irrigation requirement</td>
            <td>${objectof[1].Design}</td>
            <td>${objectof[1].Designhead}</td>
            <td>${objectof[1].Senarioof.MotorHP}</td>
            <td>${objectof[1].Category}</td>
            <td>${objectof[1].Senarioof.Model}</td>
            <td>${objectof[1].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[1].Senarioof.RecommondedHead}</td>
            <td>${objectof[1].Senarioof.SHUTOFF}</td>
            <td>${objectof[1].Senarioof.LPD}</td>
          </tr>
           <tr>
            <td>Increased depth to water level</td>
            <td>${objectof[2].Design}</td>
            <td>${objectof[2].Designhead}</td>
            <td>${objectof[2].Senarioof.MotorHP}</td>
            <td>${objectof[2].Category}</td>
            <td>${objectof[2].Senarioof.Model}</td>
            <td>${objectof[2].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[2].Senarioof.RecommondedHead}</td>
            <td>${objectof[2].Senarioof.SHUTOFF}</td>
            <td>${objectof[2].Senarioof.LPD}</td>
          </tr>
           <tr>
            <td>Target discharge scenario</td>
            <td>${objectof[3].Design}</td>
            <td>${objectof[3].Designhead}</td>
            <td>${objectof[3].Senarioof.MotorHP}</td>
            <td>${objectof[3].Category}</td>
            <td>${objectof[3].Senarioof.Model}</td>
            <td>${objectof[3].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[3].Senarioof.RecommondedHead}</td>
            <td>${objectof[3].Senarioof.SHUTOFF}</td>
            <td>${objectof[3].Senarioof.LPD}</td>
          </tr>
        <tr>
          <td colspan="3">Recommanded model</td>
          <td>${objectof[4].Senarioof.MotorHP}</td>
          <td>${objectof[4].Category}</td>
          <td>${objectof[4].Senarioof.Model}</td>
          <td>${objectof[4].Senarioof.Pvarray_Wp}</td>
          <td>${objectof[4].Senarioof.RecommondedHead}</td>
          <td>${objectof[4].Senarioof.SHUTOFF}</td>
          <td>${objectof[4].Senarioof.LPD}</td>
        </tr>
        </table>
      </body>
    </html>
  `;
  };

  const downloaddemo = async () => {
    let objectof = [
      {
        Design: design[0],
        Designhead: designhead[0],
        Category: category,
        Senarioof: SipfinalScenario[0],
      },
      {
        Design: design[1],
        Designhead: designhead[1],
        Category: category,
        Senarioof: SipfinalScenario[1],
      },
      {
        Design: design[2],
        Designhead: designhead[2],
        Category: category,
        Senarioof: SipfinalScenario[2],
      },
      {
        Design: design[3],
        Designhead: designhead[3],
        Category: category,
        Senarioof: SipfinalScenario[3],
      },
      {
        Category: category,
        Senarioof: SipfinalScenario[4],
      },
    ];
    let html = `
    <html>
<style>
    * {
        font-family: sans-serif;
    }

    table,
    th,
    td,
    caption {
        border: 1px solid black;
        border-collapse: collapse;
        border-bottom: 0px solid black;
        margin-top: 40px;
    }

    caption,
    thead {
        background-color: rgb(215, 215, 215);
    }
</style>

<body>
    <h2 style="text-align:center">Recommended Result</h2>
    <table style="width:70%">
        <caption>
            <h3>Input for Futuristic Senarios</h3>
        </caption>
        <thead>
            <tr>
                <th></th>
                <th>Senario</th>
                <th>Enter data here</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>I</td>
                <td>Farmers choice of pump type</td>
                <td>${pumptype}</td>
            </tr>
            <tr>
                <td>II</td>
                <td>Increased irrigation requirement (%) Please Enter the Irrigation value between 1 to 100</td>
                <td>${requirement}</td>
            </tr>
            <tr>
                <td>III</td>
                <td>Increased depth to water level (%) Please Enter the Water level value between 1 to 100</td>
                <td>${level}</td>
            </tr>
            <tr>
                <td>IV</td>
                <td>Target dischange scenario (Ipd) Please Enter the Target Discharge value between 1 to 800000</td>
                <td>${dischangelpd}</td>
            </tr>
        </tbody>
    </table>

</body>

</html>

<html>
<style>
    * {
        font-family: sans-serif;
    }

    table,
    th,
    td {
        border: 1px solid black;
        padding: 15px;
    }

    .bgc {
        background-color: rgb(215, 215, 215);
    }
</style>

<body>
    <table style="width:100%">
        <tr class="bgc">
            <th></th>
            <th>Scenario</th>
            <th>Design Discharge (LPD)</th>
            <th>Design Head (m)</th>
            <th>Motor HP</th>
            <th>Category</th>
            <th>Model </th>
            <th>Pvarray Wp</th>
            <th>Head (m)</th>
            <th>Shutoff Head (m)</th>
            <th>Discharge (LPD)</th>
        </tr>
        <tr>
            <td class="bgc">Scenario - I</td>
            <td>Base scenario</td>
            <td>${objectof[0].Design}</td>
            <td>${objectof[0].Designhead}</td>
            <td>${objectof[0].Senarioof.MotorHP}</td>
            <td>${objectof[0].Category}</td>
            <td>${objectof[0].Senarioof.Model}</td>
            <td>${objectof[0].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[0].Senarioof.RecommondedHead}</td>
            <td>${objectof[0].Senarioof.SHUTOFF}</td>
            <td>${objectof[0].Senarioof.LPD}</td>
        </tr>
        <tr>
            <td class="bgc">Scenario - II</td>
            <td>Increased irrigation requirement</td>
            <td>${objectof[1].Design}</td>
            <td>${objectof[1].Designhead}</td>
            <td>${objectof[1].Senarioof.MotorHP}</td>
            <td>${objectof[1].Category}</td>
            <td>${objectof[1].Senarioof.Model}</td>
            <td>${objectof[1].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[1].Senarioof.RecommondedHead}</td>
            <td>${objectof[1].Senarioof.SHUTOFF}</td>
            <td>${objectof[1].Senarioof.LPD}</td>
        </tr>
        <tr>
            <td class="bgc">Scenario - III</td>
            <td>Increased depth to water level</td>
            <td>${objectof[2].Design}</td>
            <td>${objectof[2].Designhead}</td>
            <td>${objectof[2].Senarioof.MotorHP}</td>
            <td>${objectof[2].Category}</td>
            <td>${objectof[2].Senarioof.Model}</td>
            <td>${objectof[2].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[2].Senarioof.RecommondedHead}</td>
            <td>${objectof[2].Senarioof.SHUTOFF}</td>
            <td>${objectof[2].Senarioof.LPD}</td>
        </tr>
        <tr>
            <td class="bgc">Scenario - IV</td>
            <td>Target discharge scenario</td>
            <td>${objectof[3].Design}</td>
            <td>${objectof[3].Designhead}</td>
            <td>${objectof[3].Senarioof.MotorHP}</td>
            <td>${objectof[3].Category}</td>
            <td>${objectof[3].Senarioof.Model}</td>
            <td>${objectof[3].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[3].Senarioof.RecommondedHead}</td>
            <td>${objectof[3].Senarioof.SHUTOFF}</td>
            <td>${objectof[3].Senarioof.LPD}</td>
        </tr>
        <tr>
            <td class="bgc"></td>
            <td colspan="3">Recommanded model</td>
            <td>${objectof[4].Senarioof.MotorHP}</td>
            <td>${objectof[4].Category}</td>
            <td>${objectof[4].Senarioof.Model}</td>
            <td>${objectof[4].Senarioof.Pvarray_Wp}</td>
            <td>${objectof[4].Senarioof.RecommondedHead}</td>
            <td>${objectof[4].Senarioof.SHUTOFF}</td>
            <td>${objectof[4].Senarioof.LPD}</td>
        </tr>
    </table>
</body>

</html>
  `;

    return html;
  };

  const print = async () => {
    const HTML = await downloaddemo();

    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html: HTML,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView>
        {/* AC or DC */}
        <View style={{ margin: 10 }}>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <Text style={{ fontSize: 18, width: "40%", marginTop: 10 }}>
              Pump type
            </Text>
            <Pressable
              style={[
                styles.acbutton,
                {
                  backgroundColor:
                    pumptype == "AC" ? Colors.primaryOrange : Colors.white,
                },
              ]}
              onPress={() => {
                setPumptype("AC");
                page4data.Pumptype = "AC";
                sipstoolresult(requirement, dischangelpd, level, "AC");
              }}
            >
              <Text style={styles.buttonText}>{pumptypeList[0]}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.dcbutton,
                {
                  backgroundColor:
                    pumptype == "DC" ? Colors.primaryOrange : Colors.white,
                },
              ]}
              onPress={() => {
                setPumptype("DC");
                page4data.Pumptype = "DC";
                sipstoolresult(requirement, dischangelpd, level, "DC");
              }}
            >
              <Text style={styles.buttonText}>{pumptypeList[1]}</Text>
            </Pressable>
          </View>
        </View>

        {/* TextInput */}
        <View style={{ margin: 10 }}>
          {/* Increased irrigation requirement (%) */}
          <Text style={styles.textchange}>
            Increased irrigation requirement (%)
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.dateCell, styles.textinput]}>
              <TextInput
                keyboardType="numeric"
                style={styles.inputtext}
                onChangeText={(Value) => {
                  setRequirement(Value);
                  page4data.Requirement = Value;
                  sipstoolresult(Value, dischangelpd, level, pumptype);
                }}
                value={requirement}
              />
              {requirement > 100 || requirement === 0 ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    Enter the Irrigation value between 1 to 100*
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
            <View style={[styles.dateCell, styles.symbol]}>
              <Text style={{ fontSize: 20, textAlign: "center" }}>%</Text>
            </View>
          </View>

          {/* Increased depth to water level (%) */}
          <Text style={styles.textchange}>
            Increased depth to water level (%)
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.dateCell, styles.textinput]}>
              <TextInput
                keyboardType="numeric"
                style={styles.inputtext}
                onChangeText={(Value) => {
                  setLevel(Value);
                  sipstoolresult(requirement, dischangelpd, Value, pumptype);
                  page4data.Level = Value;
                }}
                value={level}
              />
              {level > 100 || level === 0 ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    Please Enter the Water level value between 1 to 100*
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
            <View style={[styles.dateCell, styles.symbol]}>
              <Text style={{ fontSize: 20, textAlign: "center" }}>%</Text>
            </View>
          </View>

          {/* Target dischange scenario (lpd) */}
          <Text style={styles.textchange}>Target dischange scenario (lpd)</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.dateCell, styles.textinput]}>
              <TextInput
                keyboardType="numeric"
                style={styles.inputtext}
                onChangeText={(Value) => {
                  setDischangelpd(Value);
                  page4data.Dischangelpd = Value;
                  sipstoolresult(requirement, Value, level, pumptype);
                }}
                value={dischangelpd}
              />
              {dischangelpd > 800000 || dischangelpd === 0 ? (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>
                    Enter the Target Discharge value between 1 to 800000*
                  </Text>
                </Animatable.View>
              ) : null}
            </View>
            <View style={[styles.dateCell, styles.symbol]}>
              <Text style={{ fontSize: 20, textAlign: "center" }}>LPD</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "60%", marginLeft: 10 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold" }}>
              Recommended Result
            </Text>
          </View>
          <View
            style={{
              width: "35%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                alignSelf: "flex-end",
                color: Colors.red,
              }}
              onPress={() => {
                Linking.openURL(`${print()}`);
              }}
            >
              Download
              <IconMC
                style={{ alignSelf: "center", alignItems: "center" }}
                name="download"
                size={20}
                color={Colors.red}
              ></IconMC>
            </Text>
          </View>
        </View>

        {/* Base scenario (1) */}
        <Card style={{ margin: 10 }}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.cardTitle}>Base scenario</Text>
              {isdown === 1 ? CloseButton(0) : Opnebutton(1)}
            </View>
            {isdown === 1 ? (
              <Toolcard
                design={design[0]}
                designhead={designhead[0]}
                category={category}
                data={SipfinalScenario[0]}
              />
            ) : (
              <View></View>
            )}
          </Card.Content>
        </Card>

        {/* Increased irrigation requirement (2) */}
        <Card style={{ margin: 10 }}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.cardTitle}>
                Increased irrigation requirement
              </Text>
              {isdown === 2 ? CloseButton(0) : Opnebutton(2)}
            </View>
            {isdown === 2 ? (
              <Toolcard
                design={design[1]}
                designhead={designhead[1]}
                category={category}
                data={SipfinalScenario[1]}
              />
            ) : (
              <View></View>
            )}
          </Card.Content>
        </Card>

        {/* Increased depth to water level (3) */}
        <Card style={{ margin: 10 }}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.cardTitle}>
                Increased depth to water level
              </Text>
              {isdown === 3 ? CloseButton(0) : Opnebutton(3)}
            </View>
            {isdown === 3 ? (
              <Toolcard
                design={design[0]}
                designhead={designhead[2]}
                category={category}
                data={SipfinalScenario[2]}
              />
            ) : (
              <View></View>
            )}
          </Card.Content>
        </Card>

        {/* Target discharge scenario (4) */}
        <Card style={{ margin: 10 }}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.cardTitle}>Target discharge scenario</Text>
              {isdown === 4 ? CloseButton(0) : Opnebutton(4)}
            </View>
            {isdown === 4 ? (
              <Toolcard
                design={design[3]}
                designhead={designhead[3]}
                category={category}
                data={SipfinalScenario[3]}
              />
            ) : (
              <View></View>
            )}
          </Card.Content>
        </Card>

        {/* Recommended model (5) */}
        <Card style={{ margin: 10 }}>
          <Card.Content style={styles.cardContent}>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={[
                  styles.cardTitle,
                  { fontWeight: "bold", color: Colors.green },
                ]}
              >
                Recommended model
              </Text>
              {isdown === 5 ? CloseButton(0) : Opnebutton(5)}
            </View>
            {isdown === 5 ? (
              <Toolcard
                isdown={5}
                design={design[3]}
                designhead={designhead[3]}
                category={category}
                data={SipfinalScenario[4]}
              />
            ) : (
              <View></View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      <View style={{ flexDirection: "row", margin: 10 }}>
        <Button
          mode="contained"
          color={Colors.green}
          style={Styles.button}
          disabled={isBusy}
          labelStyle={{ color: Colors.white }}
          onPress={() => {
            setIsBusy(true);
            setTimeout(async () => {
              Pagedata.page4 = { P4: page4data, IsFill: true };
              navigation.navigate("Systemhead", Pagedata);
            }, 10);
          }}
        >
          Back
        </Button>
        <Button
          mode="contained"
          color={Colors.orange}
          style={Styles.button}
          disabled={isBusy}
          labelStyle={{ color: Colors.white }}
          onPress={() => {
            setIsBusy(true);
            setTimeout(async () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Location",
                    params: { someParam: "Param1" },
                  },
                ],
              });
            }, 10);
          }}
        >
          Reset
        </Button>
      </View>
      {isBusy && (
        <View style={Styles.loading}>
          <ActivityIndicator size="large" color="#F9AA33" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SIPSTool;

const styles = StyleSheet.create({
  acbutton: {
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    width: "30%",
    height: 40,
  },
  dcbutton: {
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    width: "30%",
    height: 40,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    margin: 5,
  },
  textinput: { width: "85%", marginBottom: 5, height: 50 },
  inputtext: {
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 10,
    paddingBottom: 0,
  },
  symbol: {
    width: "15%",
    marginBottom: 5,
    height: 50,
    backgroundColor: "lightgray",
  },
  dateCell: {
    marginTop: 5,
    minHeight: 40,
    borderWidth: 0.3,
    borderColor: Colors.cellBackground,
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  dropdown: {
    borderColor: "#B7B7B7",
    height: 50,
  },
  cardContent: {
    paddingHorizontal: 1,
    margin: 5,
  },
  cardTitle: {
    fontSize: 18,
    textAlign: "left",
    width: "90%",
    fontWeight: "bold",
  },
  pressable: { width: "10%", alignItems: "center" },
  cardView: { width: "33.33%", marginBottom: 5, height: 50 },
  cardTextTitle: { fontSize: 10, textAlign: "center", fontWeight: "300" },
  cardData: { fontSize: 15, textAlign: "center" },
  errorMsg: {
    color: Colors.red,
    fontFamily: "roboto-regular",
    fontSize: 10,
    marginLeft: 4,
  },
  textchange: {
    fontSize: 16.5,
    fontWeight: "400",
    color: Colors.black,
  },
});
