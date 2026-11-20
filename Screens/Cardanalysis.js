import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { Colors } from "../Styles/Colors";
import { Styles } from "../Styles/GlobalStyles";
import { useIsFocused } from "@react-navigation/native";
import crop from "../JsonData/crop.json";
import irrigationsystem from "../JsonData/irrigationsystem.json";
import CardComponent from "../Components/CardComponent";
import month from "../JsonData/month.json";
import Crop from "../JsonData/crop.json";
import { SafeAreaView } from "react-native-safe-area-context";

const Cardnalysis = ({ navigation, route }) => {
  let Pagedata = route?.params || {};

  const [isBusy, setIsBusy] = useState(false);

  const irrigationdata = JSON.stringify(irrigationsystem);
  const cropdata = JSON.stringify(crop);
  const monthdata = JSON.stringify(month);
  const datesList = Pagedata.Climatedata.Climatedata.date_string; // offlne use
  // const dateList = Pagedata.Climatedata.Climatedata.date_string.split(",");
  // const datesList = dateList.map(str => {
  //   const date = new Date(str);
  //   const formattedDate = `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}/${date.getFullYear()}`;
  //   return formattedDate
  // });
  const tMinMasterData = Pagedata.Climatedata.Climatedata.tmin.split(",");
  const tMaxMasterData = Pagedata.Climatedata.Climatedata.tmax.split(",");

  let Elevation = 624.0;
  let U2 = 2.0;
  let Gvalue = 0.0;
  let Croplist = [];

  const isFocused = useIsFocused();
  useEffect(() => {
    if (Pagedata.page1 !== undefined && Pagedata.page1.IsFill) {
      Croplist = Pagedata.page1.Cropdeatils;
    } else {
      Croplist = [
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 1",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 2",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 3",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 4",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 5",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 6",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 7",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 8",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 9",
          Plantdate: "",
          Plantmonth: "",
        },
        {
          Acre: "",
          Crop: "",
          Head: "",
          Irrigate: "",
          Name: "Crop 10",
          Plantdate: "",
          Plantmonth: "",
        },
      ];
    }
    CalculateET();
  }, [isFocused]);

  const getdata = async (id, FieldName, value) => {
    const Matchlist = Croplist.find((item) => item.Name === id);
    Matchlist[FieldName] = value;
    return Croplist;
  };

  const Checkanyempty = () => {
    let allValid = true;
    for (var i = 0; i < Croplist.length; i++) {
      let count = 0;
      // convert object to keys array
      const keys = Object.keys(Croplist[i]);
      keys.forEach((key, index) => {
        if (Croplist[i][key] !== "" && key !== "Name") {
          count = count + 1;
        }
      });
      if (count < keys.length - 1 && count !== 0) {
        allValid = false;
        break;
      }
    }
    return allValid;
  };

  const Datevaild = () => {
    let InValid = true;
    for (var i = 0; i < Croplist.length; i++) {
      const keys = Object.keys(Croplist[i]);
      keys.forEach((key, index) => {
        if (
          (Croplist[i]["Plantmonth"] === 2 && Croplist[i]["Plantdate"] > 28) ||
          (Croplist[i]["Plantmonth"] === 4 && Croplist[i]["Plantdate"] > 30) ||
          (Croplist[i]["Plantmonth"] === 6 && Croplist[i]["Plantdate"] > 30) ||
          (Croplist[i]["Plantmonth"] === 9 && Croplist[i]["Plantdate"] > 30) ||
          (Croplist[i]["Plantmonth"] === 11 && Croplist[i]["Plantdate"] > 30)
        ) {
          InValid = false;
        }
      });
    }
    return InValid;
  };

  const nextbtn = async () => {
    let allempty = true;
    let isEmpty = true;
    for (var i = 0; i < Croplist.length; i++) {
      const keys = Object.keys(Croplist[i]);
      keys.forEach((key, index) => {
        if (Croplist[i][key] !== "" && key !== "Name") {
          isEmpty = false;
        }
      });

      if (isEmpty === false) {
        allempty = false;
        break;
      }
    }
    if (allempty === true) {
      Alert.alert("Alert", "all fields are empty", [
        {
          text: "Ok",
          onPress: () => {
            return;
          },
        },
      ]);
    } else {
      const allfill = Checkanyempty();
      const datevaild = Datevaild();
      if (allfill) {
        if (datevaild) {
          setIsBusy(true);
          setTimeout(async () => {
            const CHARTVALUE = await calculateIrrigationData();
            Pagedata.page1 = {
              Cropdeatils: Croplist,
              Values: CHARTVALUE,
              IsFill: true,
            };
            navigation.navigate("Irrigationrequirement", Pagedata);
          }, 10);
        } else {
          Alert.alert("Invaild Date or Month", "Please check Date or Month", [
            {
              text: "OK",
            },
          ]);
        }
      } else {
        Alert.alert(
          "Crop data validation",
          "Data in crop configuration is missing",
          [
            {
              text: "OK",
            },
          ],
        );
      }
    }
  };

  {
    /* For Screen first Cropdeatils */
  }
  let masterETO = [];
  const CalculateET = () => {
    var res = [];
    var res1 = [];
    var masterWB = [];

    datesList.forEach((element, index) => {
      var monthValue = new Date(element).getMonth() + 1;
      var dayValue = new Date(element).getDate();
      var tMinData = tMinMasterData[index];
      var tMaxData = tMaxMasterData[index];
      var eTminvalue = CalculateEtmin(tMinData);
      var eTmaxValue = CalculateEtmax(tMaxData);
      var eaValue = CalculateEa(tMinData);
      var esValue = CalculateEs(eTmaxValue, eTminvalue);
      var pressureValue = CalculatePressure(esValue, eaValue);
      var tavgValue = CalculateTavg(tMinData, tMaxData);
      var alValue = CalculateAL(tavgValue);
      var qvalue = CalculateQ();
      var gammaValue = CalculateGamma(qvalue);
      var deltaValue = CalculateDelta(tavgValue);
      var ahValue = CalculateAH();
      var gammaakValue = CalculateGammaAK(gammaValue, deltaValue, ahValue);
      var cVal = CalculateCvalue(gammaakValue, alValue, pressureValue);
      var deltaSmall = CalculateDeltaSmall(deltaValue, gammaValue, ahValue);
      var daysValue = CalculateDay(monthValue, dayValue);
      var dabaValue = Calculatedaba(daysValue);
      var drValue = CalculateDr(daysValue);
      var latitudeCal = CalculateLatitude();
      var wsValue = CalculateWs(dabaValue, latitudeCal);
      var raValue = CalculateRa(drValue, wsValue, latitudeCal, dabaValue);
      var Radiation = CalculateRadiation(tMaxData, tMinData, raValue);
      var rsoValue = CalculateRso(raValue);
      var rsValue = CalculateRs(Radiation, rsoValue);
      var apValue = CalculateAP(rsValue);
      var anValue = CalculateAN(eaValue);
      var sigmaValue = CalculateSigma(tMaxData, tMinData);
      var rnlValue = CalculateRnl(apValue, anValue, sigmaValue);
      var rnsValue = CalculateRns(Radiation);
      var RnValue = CalculateRn(rnsValue, rnlValue);
      var RngValue = CalculateRnG(RnValue);
      var aVal = CalculateAvalue(RngValue);
      var bVal = CalculateBvalue(aVal, deltaSmall);
      var ETO = CalculateEto(bVal, cVal);

      masterETO.push({
        date: element,
        ETO: ETO,
      });
    });

    return res;
  };

  // --calculate ET Function generate ETO Data
  const CalculateEto = (bVal, cVal) => {
    //calculateETO(cropDuration) { //J
    //= IF(R14=0,0,(ET!H14))
    //=AV13+AW13 //H--
    /* var eto = Number(bVal) + Number(cVal) */
    return Number(bVal) + Number(cVal);
    //.toFixed(2);
    //CalculateBvalue() //AV --
    //CalculateCvalue() //AW --
  };

  const CalculateBvalue = (aVal, deltaSmall) => {
    //AV
    //=AU13*AJ13
    /*  var b = Number(aVal) * Number(deltaSmall); */
    return Number(aVal) * Number(deltaSmall);
    //.toFixed(2);
    //CalculateAvalue() //AU --
    //CalculateDeltaSmall() //AJ --
  };

  const CalculateAvalue = (RngValue) => {
    //AU
    //=0.408*AT13
    var a = 0.408 * Number(RngValue);
    return a;
    //.toFixed(2);
    //CalculateRnG() //AT --
  };

  const CalculateRnG = (RnValue) => {
    //AT
    //=AR13-AS13
    var rng = Number(RnValue) - Gvalue;
    return rng;
    //.toFixed(2);
    //CalculateRn() //AR --
    //value = 0 //AS --
  };

  const CalculateRn = (rnsValue, rnlValue) => {
    //AR
    //=AE14-AQ14
    var rn = Number(rnsValue) - Number(rnlValue);
    return rn;
    //.toFixed(2);
    //CalculateRns() //AE --
    //CalculateRnl() //AQ --
  };

  const CalculateRns = (Radiation) => {
    //AE
    //=0.77*G16
    var rns = 0.77 * Number(Radiation);
    return rns; //.toFixed(2);
    //CalculateRadiation() //G--
  };

  const CalculateRadiation = (tMaxData, tMinData, raValue) => {
    //G
    //=0.16*SQRT(D16-C16)*AC16
    var radiation =
      0.16 * Math.sqrt(Number(tMaxData) - Number(tMinData)) * Number(raValue);
    return radiation; //.toFixed(2);
    //CalculateRa() //AC --
    //Tmax value //D --
    //Tmin value //C --
  };

  const CalculateRa = (drValue, wsValue, latitudeCal, dabaValue) => {
    //AC
    //=(24*60/PI())*0.082*Z17*(AB17*SIN(Y17)*SIN(AA17)+COS(Y17)*COS(AA17)*SIN(AB17))
    var ra =
      ((24 * 60) / Math.PI) *
      0.082 *
      drValue *
      (wsValue * Math.sin(latitudeCal) * Math.sin(dabaValue) +
        Math.cos(latitudeCal) * Math.cos(dabaValue) * Math.sin(wsValue));
    return ra; //.toFixed(2);
    //CalculateDr() //Z  --
    //CalculateLatitude(){ //Y --
    //calculateWs() //AB --
    //Calculatedaba() //AA --
  };

  const CalculateDr = (daysValue) => {
    //Z
    //=1+0.033*COS(2*PI()*X17/365)
    //CalculateDay() //X --
    var dr =
      Number(1) + Number(0.033) * Math.cos((2 * Math.PI * daysValue) / 365);
    return dr; //.toFixed(4);
  };

  const CalculateLatitude = () => {
    //Y
    //=(PI()/180)*P16
    // var latitude = (Math.PI / 180) * this.latitude;
    var latitude = (Math.PI / 180) * Pagedata.Climatedata.Lat;
    return latitude; //.toFixed(4);
  };

  const CalculateDay = (monthValue, dayValue) => {
    //X
    //=IF(MONTH(B16)<3,INT(275*(MONTH(B16)/9)-30+DAY(B16))-2+2,INT(275*(MONTH(B16)/9)-30+DAY(B16))-2)
    return monthValue < 3
      ? parseInt(275 * (monthValue / 9) - 30 + dayValue) - 2 + 2
      : parseInt(275 * (monthValue / 9) - 30 + dayValue) - 2;

    //B is All date to 1/1/2009 to 31/12/2018
  };

  const CalculateWs = (dabaValue, latitudeCal) => {
    //AB
    //=ACOS(-TAN(Y16)*TAN(AA16))
    var ws = Math.acos(-Math.tan(latitudeCal) * Math.tan(dabaValue));
    return ws; //.toFixed(1);
    //=(PI()/180)*P16 //Y --
    //Calculatedaba() //AA --
  };

  const Calculatedaba = (daysValue) => {
    //AA
    //=0.409*SIN(2*PI()*X15/365-1.39)
    var daba = 0.409 * Math.sin((2 * Math.PI * daysValue) / 365 - 1.39);
    return daba; //.toFixed(4);
    //CalculateDay() //X --
  };

  const CalculateRnl = (apValue, anValue, sigmaValue) => {
    //AQ
    //=AP15*AN15*AM15
    var rnl = Number(apValue) * Number(anValue) * Number(sigmaValue);
    return rnl; //.toFixed(2);
    //CalculateAP() //AP --
    //CalculateAN() //AN --
    //CalculateSigma() //AM --
  };

  const CalculateAP = (rsValue) => {
    //AP
    //=(1.35*AO17-0.35)
    var ap = 1.35 * Number(rsValue) - 0.35;
    return ap; //.toFixed(2);
    //CalculateRs() //AO --
  };

  const CalculateRs = (Radiation, rsoValue) => {
    //AO
    //=G17/AD17
    var rs = Number(Radiation) / Number(rsoValue);
    return rs; //.toFixed(2)
    //CalculateRadiation() //G
    //CalculateRso() //AD
  };

  const CalculateRso = (raValue) => {
    //AD
    //=(0.75+Q17*(2*10^-5))*AC17..
    var rso =
      (0.75 + Number(Elevation) * (2 * Math.pow(10, -5))) * Number(raValue);
    return rso; //.toFixed(2);
    //CalculateRa() //AC
  };

  const CalculateAN = (eaValue) => {
    //AN
    //=(0.34-0.14*SQRT(V17))
    return 0.34 - 0.14 * Math.sqrt(eaValue);
    //CalculateEa() //V
  };

  const CalculateEa = (tMinData) => {
    //V
    //=0.6108*EXP((17.27*C16)/(C16+237.3))..
    var ea =
      0.6108 *
      Math.exp((17.27 * Number(tMinData)) / (Number(tMinData) + 237.3));
    return ea; //.toFixed(3)
    //Tmin value //C--
  };

  const CalculateSigma = (tMaxData, tMinData) => {
    //AM
    // =((4.903*10^-9)*(D16+273.16)^4+(4.903*10^-9)*(C16+273.16)^4)/2
    return (
      (4.903 * Math.pow(10, -9) * Math.pow(Number(tMaxData) + 273.16, 4) +
        4.903 * Math.pow(10, -9) * Math.pow(Number(tMinData) + 273.16, 4)) /
      2
    );
    //Tmax value //D--
    //Tmin value //C--
  };

  const CalculateDeltaSmall = (deltaValue, gammaValue, ahValue) => {
    //AJ
    //=AI16/(AI16+AG16*AH16)..
    /* var deltasmall = deltaValue / (deltaValue + gammaValue * ahValue) */
    return (
      Number(deltaValue) /
      (Number(deltaValue) + Number(gammaValue) * Number(ahValue))
    );
    //.toFixed(3);

    //CalculateDelta() //AI --
    //CalculateGamma() //AG--
    //CalculateAH() //AH--
  };

  const CalculateDelta = (tavgValue) => {
    //AI
    //=4098*(0.6108*EXP((17.27*L15)/(L15+237.3)))/(L15+237.3)^2   ..
    //CalculateTavg() //L--
    /* var delta = 4098 * (0.6108 * Math.exp((17.27 * tavgValue) / (tavgValue + 237.3))) / Math.pow(tavgValue + 237.3, 2); */
    return (
      (4098 *
        (0.6108 *
          Math.exp(
            (17.27 * Number(tavgValue)) / (Number(tavgValue) + 237.3),
          ))) /
      Math.pow(Number(tavgValue) + 237.3, 2)
    );
    //.toFixed(2);
  };

  const CalculateTavg = (tMinData, tMaxData) => {
    //L
    //=(C16+D16)/2
    var tavg = (Number(tMinData) + Number(tMaxData)) / 2;
    return tavg; //.toFixed(1)
    //Tmax value //D
    //Tmin value //C
  };

  const CalculateGamma = (qvalue) => {
    //AG
    //=(0.666*10^(-3))*AF17

    var gamma = 0.666 * Math.pow(10, -3) * Number(qvalue);
    return gamma;
    //.toFixed(4);
    //CalculateQ() //AF--
  };

  const CalculateQ = () => {
    //AF
    //=101.3*((293-0.0065*Q17)/293)^5.26
    var q = 101.3 * Math.pow((293 - 0.0065 * Number(Elevation)) / 293, 5.26);
    return q; //.toFixed(1);
    //Q Elevation Depend on Location value Ex 624
  };

  const CalculateAH = () => {
    //AH
    //=(1+0.34*R18)
    var ah = 1 + 0.34 * Number(U2);
    return ah; //.toFixed(2)
    //R value = 2
  };

  const CalculateCvalue = (gammaakValue, alValue, pressureValue) => {
    //AW
    //=AK14*AL14*W14
    /*   var c = gammaakValue * alValue * pressureValue */
    return Number(gammaakValue) * Number(alValue) * Number(pressureValue);
    //.toFixed(2);
    //CalculateGammaAK() //AK--
    //CalculateAL() //AL--
    //CalculatePressure() //W --
  };

  const CalculateGammaAK = (gammaValue, deltaValue, ahValue) => {
    //AK
    //=AG16/(AI16+AG16*AH16)..
    /* var gammaAk = gammaValue / (deltaValue + gammaValue * ahValue) */
    return (
      Number(gammaValue) /
      (Number(deltaValue) + Number(gammaValue) * Number(ahValue))
    );
    //.toFixed(3);
    //CalculateDelta() //AI --
    //CalculateGamma() //AG --
    //CalculateAH() //AH --
  };

  const CalculateAL = (tavgValue) => {
    //AL
    //=900/(L17+273)*R17
    return (900 / (Number(tavgValue) + 273)) * Number(U2);
    //.toFixed(3);
    //CalculateTavg() //L --
    //R value = 2
  };

  const CalculatePressure = (esValue, eaValue) => {
    //W
    //(U18-V18)
    var pressure = Number(esValue) - Number(eaValue);
    return pressure; //.toFixed(3);
    // CalculateEs() //U --
    //CalculateEa() //V
  };

  const CalculateEs = (eTmaxValue, eTminvalue) => {
    //U
    //=(S18+T18)/2
    var es = (Number(eTmaxValue) + Number(eTminvalue)) / 2;
    return es; //.toFixed(3);
    //CalculateEtmax() //S
    //T
  };

  const CalculateEtmax = (tMaxData) => {
    //S
    //=0.6108*EXP((17.27*D18)/(D18+237.3))..
    return (
      Math.round(
        0.6108 *
          Math.exp((17.27 * Number(tMaxData)) / (Number(tMaxData) + 237.3)) *
          1000,
      ) / 1000
    );
    //Tmax value //D
  };

  const CalculateEtmin = (tMinData) => {
    //T
    //=0.6108*EXP((17.27*C18)/(C18+237.3))
    return (
      Math.round(
        0.6108 *
          Math.exp((17.27 * Number(tMinData)) / (Number(tMinData) + 237.3)) *
          1000,
      ) / 1000
    );

    //Tmin value //C
  };

  {
    /* For Screen Second Irrigation data load chartvalues */
  }
  let MasterWB = [];
  const cropList = Crop;
  const MasterSoilData = [
    {
      "Soil Type Number": 1,
      Texture: "Sand",
      "FC v/v %": 100,
      "WP v/v %": 30,
      "Saturation v/v %": 395,
      "Infiltration Rate, cm/h": 170,
      "Percolation rate, CROPWAT": 5.51,
    },
    {
      "Soil Type Number": 2,
      Texture: "Loamy Sand",
      "FC v/v %": 120,
      "WP v/v %": 50,
      "Saturation v/v %": 410,
      "Infiltration Rate, cm/h": 90,
      "Percolation rate, CROPWAT": 4.47,
    },
    {
      "Soil Type Number": 3,
      Texture: "Sandy Loam",
      "FC v/v %": 180,
      "WP v/v %": 90,
      "Saturation v/v %": 435,
      "Infiltration Rate, cm/h": 59,
      "Percolation rate, CROPWAT": 3.89,
    },
    {
      "Soil Type Number": 4,
      Texture: "Loam",
      "FC v/v %": 280,
      "WP v/v %": 110,
      "Saturation v/v %": 451,
      "Infiltration Rate, cm/h": 7,
      "Percolation rate, CROPWAT": 1.94,
    },
    {
      "Soil Type Number": 5,
      Texture: "Sandy Clay Loam",
      "FC v/v %": 350,
      "WP v/v %": 200,
      "Saturation v/v %": 420,
      "Infiltration Rate, cm/h": 20,
      "Percolation rate, CROPWAT": 2.73,
    },
    {
      "Soil Type Number": 6,
      Texture: "Clay",
      "FC v/v %": 410,
      "WP v/v %": 250,
      "Saturation v/v %": 482,
      "Infiltration Rate, cm/h": 7,
      "Percolation rate, CROPWAT": 1.94,
    },
    {
      "Soil Type Number": 0,
      Texture: "NODATA",
      "FC v/v %": 0,
      "WP v/v %": 0,
      "Saturation v/v %": 0,
      "Infiltration Rate, cm/h": 0,
      "Percolation rate, CROPWAT": 0,
    },
  ];

  let masterRainfall = Pagedata.Climatedata.Climatedata.rainfall.split(",");
  let Solitype = Pagedata.Climatedata.Climatedata.soiltype; // use offline
  // let Solitype = Pagedata.Climatedata.Climatedata.soil_type.split(",")[0];  // use online
  const soildata = MasterSoilData.filter(
    (ex) => ex["Soil Type Number"] == +Solitype,
  );
  let saturationMc = soildata[0]["Saturation v/v %"]; //mm B2 $B$2
  let fieldCapacity = soildata[0]["FC v/v %"]; //mm B3 $B$3
  let wiltingPoint = soildata[0]["WP v/v %"]; //mm B4 $B$4
  let fcWp = 0.6 * (Number(fieldCapacity) - Number(wiltingPoint)); //% B5 $B$5
  let initialMC = fieldCapacity; //mm B6 $B$6
  let deepDrainage = soildata[0]["Percolation rate, CROPWAT"]; //1.94 mm $B$7

  const calculateIrrigationData = async () => {
    var calculatedValues = [];
    //get crop form data
    let CropDetails = Croplist;

    for (let i = 0; i < CropDetails.length; i++) {
      if (
        CropDetails[i].Crop != "1" &&
        CropDetails[i].Acre != "" &&
        CropDetails[i].Acre != "0" &&
        CropDetails[i].Plantdate != "" &&
        CropDetails[i].Plantmonth != ""
      ) {
        calculateByCrop(
          {
            crop: CropDetails[i].Crop,
            area: CropDetails[i].Acre,
            date: CropDetails[i].Plantdate,
            month: CropDetails[i].Plantmonth,
            irrigationSystem: CropDetails[i].Irrigate,
          },
          i,
        );
      }
    }

    let irVals = [];
    let chartVals = [];
    let matrix = [];
    let IrValues = [];
    let CHARTValue = [];
    let chartvalue = [];

    for (let month = 0; month <= 11; month++) {
      matrix[month] = [];
      irVals[month] = 0;
      chartVals[month] = 0;
      for (let crop = 0; crop < 10; crop++) {
        var sum = 0;
        if (
          CropDetails[crop].Crop != "1" &&
          CropDetails[crop].Acre != "" &&
          CropDetails[crop].Acre != "0" &&
          CropDetails[crop].Plantdate != "" &&
          CropDetails[crop].Plantmonth != ""
        ) {
          MasterWB[crop]
            .filter((ex) => new Date(ex.date).getMonth() == month)
            .forEach((obj) => {
              sum += obj.calculatedIrrigation;
            });

          if (!calculatedValues[month]) {
            calculatedValues[month] = {};
          }
          if (!calculatedValues[month][crop]) {
            calculatedValues[month][crop] = 0;
          }
          matrix[month][crop] = sum / 10;

          irVals[month] +=
            ((sum / 10) * (CropDetails[crop].Acre / 2.5)) /
            (CropDetails[crop].Irrigate == 1
              ? 0.45
              : CropDetails[crop].Irrigate == 2
              ? 0.9
              : 0.75);
          chartVals[month] +=
            ((sum / 10) * (CropDetails[crop].Acre / 2.5)) /
            (CropDetails[crop].Irrigate == 1
              ? 0.45
              : CropDetails[crop].Irrigate == 2
              ? 0.9
              : 0.75);

          var IRValue = irVals.map((e) => e * 10000);
          IrValues = IRValue;
          var CHartVals = chartVals.map((e) => e * 10000);
          CHARTValue = CHartVals;
        } else {
          calculatedValues[month][crop] = 0;
        }
      }
    }
    for (let i = 0; i < CHARTValue.length; i++) {
      chartvalue.push([CHARTValue[i].toFixed(0)]);
    }
    const Values = { CHARTValue: CHARTValue, IrValues: IrValues };
    return Values;
  };

  // --CalculateByCrop and Generate WB Sheet Function
  const calculateByCrop = (cropDetails, cropNo) => {
    setIsBusy(true);
    var wb = [];
    let masterWB = [];
    wb.push([
      "dataDateTime",
      "showingTime",
      "QValue",
      "lastQValue",
      "cropDuration",
      "rainfallData",
      "totalWaterVal",
      "soilMoisture",
      "calculateSoilWaterVal",
      "changeInWaterSoil",
      "netMoistureGain", //netMoistureGain
      "runOff",
      "preRunOff",
      "preWaterSoil",
      /*  "preMoisture", */
      "preTotalWater",
      "preSoilMoisture",
      "preDeepDrainage",
      "dosInitial",
      "ETO",
      "transpiration",
      "dosDev",
      "dosMid",
      "dosLate",
      "cropInitial",
      "cropDev",
      "cropMid",
      "cropLate",
      "preETC",
      "EtoData",
      "Irrigation",
    ]);
    var lastQValue = 0;
    var preSoilMoisture = 0;
    var preTotalWater = 0;
    var preETC = 0;
    var preDeepDrainage = 0;
    var preRunOff = 0;
    var preInitialCumulative = 0;
    var preIrrigation = 0;
    var preWaterSoil = 0;
    var preMoisture = 0;
    var selectedDate =
      "2009/" + "0" + cropDetails.month + "/" + cropDetails.date;
    var depthOfPonding = calculateDepthOfPonding(cropDetails.crop); // ---
    var lateDaysPlant = calculateLateDaysPlant(cropDetails.crop); // ---
    var currInitialDays = calculateInitialDaysPlant(cropDetails.crop); // ---
    var devDays = calculateLateDevelopmentPlant(cropDetails.crop); // ---
    var middleDays = calculateLateMiddlePlant(cropDetails.crop); // ---
    var initialPlant = calculateInitialPlant(cropDetails.crop); // ---
    var developmentPlant = calculateDevelopmentPlant(cropDetails.crop); // ---
    var middlePlant = calculateMiddlePlant(cropDetails.crop); // ---
    var latePlant = calculateLatePlant(cropDetails.crop); // ---

    var initialCumulativePlant = calculateInitialCumulativePlant(
      currInitialDays,
      preInitialCumulative,
    ); // ---
    var devCumulativePlant = calculateDevelopmentCumulativePlant(
      devDays,
      initialCumulativePlant,
    ); // ---
    var midCumulativePlant = calculateMiddleCumulativePlant(
      middleDays,
      devCumulativePlant,
    ); // ---
    var lateCumulativePlant = calculateLateCumulativePlant(
      lateDaysPlant,
      midCumulativePlant,
    ); // ---
    preInitialCumulative = initialCumulativePlant;
    var totalDays = currInitialDays + devDays + middleDays + lateDaysPlant;

    datesList.forEach((tempDate, index) => {
      var dataDateTime = tempDate;
      var showingTime = calculateShowingTime(selectedDate, dataDateTime); // ---
      var QValue = calculateQvalue(
        showingTime,
        selectedDate,
        dataDateTime,
        lastQValue,
      ); // ---
      lastQValue = QValue;
      var cropDuration = calculateCropDuration(QValue, totalDays); // ---
      var rainfallData = getRainfallData(index); // ---
      var EtoData = getETOData(dataDateTime);
      var totalWaterVal = calculateTotalWater(
        cropDuration,
        preIrrigation,
        preSoilMoisture,
        preTotalWater,
        preETC,
        preDeepDrainage,
        preRunOff,
        rainfallData,
      ); // ---
      var soilMoisture = calculateInitialSoilMoisture(showingTime); // ---
      var calculateSoilWaterVal = calculateSoilWater(
        totalWaterVal,
        depthOfPonding,
        soilMoisture,
      ); // ---
      var changeInWaterSoil = calculateChangeInWaterSoil(
        preWaterSoil,
        calculateSoilWaterVal,
      ); // ---
      var netMoistureGain = calculateNetMoistureGain(
        preTotalWater,
        totalWaterVal,
      ); // ---
      var runOff = calculateRunoff(
        totalWaterVal,
        depthOfPonding,
        changeInWaterSoil,
        netMoistureGain,
      ); // ---
      preRunOff = runOff;
      preTotalWater = totalWaterVal;
      preSoilMoisture = soilMoisture;

      preDeepDrainage = calculateDeepDrainage(calculateSoilWaterVal); // ---

      var dosInitial = calculateDOSInitial(QValue, initialCumulativePlant); // ---
      var ETO = calculateETO(cropDuration, EtoData); // ---
      var transpiration = calculateTranspiration(calculateSoilWaterVal); // ---
      var dosDev = calculateDOSDev(
        QValue,
        initialCumulativePlant,
        devCumulativePlant,
      ); // ---
      var dosMid = calculateDOSMid(
        QValue,
        devCumulativePlant,
        midCumulativePlant,
      ); // ---
      var dosLate = calculateDOSLate(
        QValue,
        midCumulativePlant,
        lateCumulativePlant,
      ); // ---
      var cropInitial = calculateInitial(
        dosInitial,
        ETO,
        transpiration,
        initialPlant,
      ); // ---
      var cropDev = calculateCropDev(
        dosDev,
        ETO,
        transpiration,
        developmentPlant,
      ); // ---
      var cropMid = calculateCropMid(dosMid, ETO, transpiration, middlePlant); //
      var cropLate = calculateCropLate(dosLate, ETO, transpiration, latePlant); //

      preETC = calculateETc(cropInitial, cropDev, cropMid, cropLate); //
      var calculatedIrrigation = calculateIrrigation(
        calculateSoilWaterVal,
        cropDuration,
      ); //

      masterETO[index].calculatedIrrigation = preIrrigation;
      preWaterSoil = calculateSoilWaterVal;
      masterWB.push({
        date: datesList[index] ?? "",
        calculatedIrrigation: preIrrigation,
      });

      wb.push([
        dataDateTime,
        showingTime,
        QValue,
        lastQValue,
        cropDuration,
        rainfallData,
        totalWaterVal,
        soilMoisture,
        calculateSoilWaterVal,

        changeInWaterSoil,
        netMoistureGain,
        runOff,
        preRunOff,
        preWaterSoil,
        /* preMoisture, */
        preTotalWater,
        preSoilMoisture,
        preDeepDrainage,
        dosInitial,
        ETO,
        transpiration,
        dosDev,
        dosMid,
        dosLate,
        cropInitial,
        cropDev,
        cropMid,
        cropLate,
        preETC,
        EtoData,
        preIrrigation,
      ]);

      preIrrigation = calculatedIrrigation;
    });
    MasterWB[cropNo] = masterWB;
    setIsBusy(false);
    return MasterWB;
  };

  const getRainfallData = (index) => {
    return masterRainfall[index];
  };

  const getETOData = (date) => {
    let filter = masterETO.filter(
      (ex) => new Date(ex.date).getTime() == new Date(date).getTime(),
    );
    if (filter.length > 0) {
      return filter[0].ETO;
    } else {
      return 0;
    }
  };

  const calculateDepthOfPonding = (cropId) => {
    //$H$3
    if (cropId == 26) {
      return 100;
    } else {
      return 0;
    }
  };

  const calculateInitialCumulativePlant = (
    currInitialDays,
    preInitialCumulative,
  ) => {
    //$M$4
    return currInitialDays + preInitialCumulative;
  };

  const calculateDevelopmentCumulativePlant = (
    devDays,
    initialCumulativePlant,
  ) => {
    //$M$5
    return devDays + initialCumulativePlant;
  };

  const calculateMiddleCumulativePlant = (middleDays, devCumulativePlant) => {
    //$M$6
    return middleDays + devCumulativePlant;
  };

  const calculateLateCumulativePlant = (lateDays, midCumulativePlant) => {
    //$M$7
    return lateDays + midCumulativePlant;
  };

  const calculateInitialPlant = (cropId) => {
    //$N$4
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!M2:M41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Initial[1];
  };

  const calculateDevelopmentPlant = (cropId) => {
    //$N$5
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!N2:N41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Dev[1];
  };

  const calculateMiddlePlant = (cropId) => {
    //$N$6
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!O2:O41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Mid[1];
  };

  const calculateLatePlant = (cropId) => {
    //$N$7
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!P2:P41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Late[1];
  };

  const calculateInitialDaysPlant = (cropId) => {
    //$L$4
    //=LOOKUP($O$1,'Crop and Soil Data'!$F$2:$F$41,'Crop and Soil Data'!I2:I41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Initial[0];
  };

  const calculateLateDevelopmentPlant = (cropId) => {
    //$L$5
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!J2:J41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Dev[0];
  };

  const calculateLateMiddlePlant = (cropId) => {
    //$L$6
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!K2:K41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Mid[0];
  };

  const calculateLateDaysPlant = (cropId) => {
    //$L$7
    //=LOOKUP(O1,'Crop and Soil Data'!F2:F41,'Crop and Soil Data'!L2:L41)
    let temp = cropList;
    let cropDetails = temp.filter((ex) => ex.Key == cropId);
    return cropDetails.shift().Late[0];
  };

  const calculateTotalDaysPlant = (lateDaysPlant) => {
    //$L$8
    return lateDaysPlant;
  };

  const calculateIrrigation = (soliWater, cropDuration) => {
    //E
    //=IF(H279=0,0,IF(R280=0,0,IF($D$9=1,IF(H279<=($B$4+$B$5),$D$10,0),IF(H279<=($B$4+$B$5),($B$3-H279),0))))
    //=IF(H13=0,0,IF(R14=0,0,IF($D$9=1,IF(H13<=($B$4+$B$5),$D$10,0),IF(H13<=($B$4+$B$5),($B$3-H13),0)))) Line 14

    //=IF(H16=0,0,IF(R17=0,0,IF($D$9=1,IF(H16<=($B$4+$B$5),$D$10,0),IF(H16<=($B$4+$B$5),($B$3-H16),0)))) LINE 17
    let D9 = 2;
    if (soliWater == 0) {
      return 0;
    } else {
      if (cropDuration == 0) {
        return 0;
      } else {
        if (D9 == 1) {
          if (soliWater <= wiltingPoint + fcWp) {
            return 1; //need to update
          } else {
            return 0;
          }
        } else {
          if (soliWater <= wiltingPoint + fcWp) {
            return fieldCapacity - soliWater;
          } else {
            return 0;
          }
        }
      }
    }
  };

  const calculateTotalWater = (
    cropDuration,
    preIrrigation,
    preSoilMoisture,
    preTotalWater,
    preETC,
    preDeepDrainage,
    preRunOff,
    rainfallData,
  ) => {
    //F
    //=IF(R15=1,(E15+G14+F14+D15-AB14-K14-O14),0)
    if (cropDuration == 1) {
      return (
        Number(preIrrigation) +
        Number(preSoilMoisture) +
        Number(preTotalWater) +
        Number(rainfallData) -
        Number(preETC) -
        Number(preDeepDrainage) -
        Number(preRunOff)
      );
    } else {
      return 0;
    }
  };

  const calculateInitialSoilMoisture = (showingTime) => {
    //G
    //=IF(P17=1,$B$6,0)
    if (showingTime == 1) {
      return initialMC;
    } else {
      return 0;
    }
  };

  const calculateSoilWater = (
    totalWater,
    depthOfPonding,
    initialSoilMosture,
  ) => {
    //H
    //=IF(F14>($B$2+$H$3),($B$2+$H$3),F14+G14)
    if (totalWater > saturationMc + depthOfPonding) {
      return saturationMc + depthOfPonding;
    } else {
      return totalWater + initialSoilMosture;
    }
  };

  const calculateChangeInWaterSoil = (preWaterSoil, curWaterSoil) => {
    //I
    return curWaterSoil - preWaterSoil;
  };

  const calculateETO = (cropDuration, EtoData) => {
    //J
    //= IF(R14=0,0,(ET!H14))
    if (cropDuration == 0) {
      return 0;
    } else if (cropDuration == 1) {
      return EtoData; //ET!H14
    }
  };

  const calculateDeepDrainage = (soliWater) => {
    //K
    //=IF(H14>$B$3, IF((H14-$B$3)>$B$7,$B$7,(H14-$B$3)),0)
    if (soliWater > fieldCapacity) {
      if (soliWater - fieldCapacity > deepDrainage) {
        return deepDrainage;
      } else {
        return soliWater - fieldCapacity;
      }
    } else {
      return 0;
    }
  };

  const calculateNetMoistureGain = (preMoisture, curMoisture) => {
    //M
    return curMoisture - preMoisture;
  };

  const calculateRunoff = (
    totalWater,
    depthOfPonding,
    changeInWaterSoil,
    netMoistureGain,
  ) => {
    //O
    //=IF(AND(F14>=($B$2+$H$3),I14>=0,M14>0),M14,0)
    if (
      totalWater >= saturationMc + depthOfPonding &&
      changeInWaterSoil >= 0 &&
      netMoistureGain > 0
    ) {
      return netMoistureGain;
    } else {
      return 0;
    }
  };

  const calculateShowingTime = (selectedDate, dataDateTime) => {
    //P
    // =IF(AND(MONTH($H$5)=MONTH(A14),DAY($H$5)=DAY(A14)),1,0)

    let selectedDateMonth = getMonthFromDate(selectedDate);
    let dataDateTimeMonth = getMonthFromDate(dataDateTime);

    let selectedDateDay = getDayFromDate(selectedDate);
    let dataDateTimeDay = getDayFromDate(dataDateTime);

    if (
      selectedDateMonth == dataDateTimeMonth &&
      selectedDateDay - 1 == dataDateTimeDay - 1
    ) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateQvalue = (
    showingTime,
    selectedDate,
    dataDateTime,
    lastQValue,
  ) => {
    //Q
    //=IF(P17=1,1,IF(A17<$H$5,0,Q16+1))
    if (showingTime == 1) {
      return 1;
    } else if (new Date(dataDateTime) < new Date(selectedDate)) {
      return 0;
    } else {
      return lastQValue + 1;
    }
  };

  const calculateCropDuration = (QValue, totalDays) => {
    //R
    //=IF(AND(Q23>0,Q23<=$L$8),1,0)
    if (QValue > 0 && QValue <= totalDays) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateDOSInitial = (QValue, initialCumulativePlant) => {
    //S
    //= IF(AND(Q14>0,Q14<=$M$4),1,0)
    if (QValue > 0 && QValue <= initialCumulativePlant) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateDOSDev = (
    QValue,
    initialCumulativePlant,
    devCumulativePlant,
  ) => {
    //T
    //=IF(AND(Q15>$M$4,Q15<=$M$5),1,0)
    if (QValue > initialCumulativePlant && QValue <= devCumulativePlant) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateDOSMid = (QValue, devCumulativePlant, midCumulativePlant) => {
    //U
    //=IF(AND(Q15>$M$5,Q15<=$M$6),1,0)
    if (QValue > devCumulativePlant && QValue <= midCumulativePlant) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateDOSLate = (
    QValue,
    midCumulativePlant,
    lateCumulativePlant,
  ) => {
    //V
    //=IF(AND(Q15>$M$6,Q15<=$M$7),1,0)
    if (QValue > midCumulativePlant && QValue <= lateCumulativePlant) {
      return 1;
    } else {
      return 0;
    }
  };

  const calculateTranspiration = (soliWater) => {
    //W
    // = IF(H14>$B$4,IF(($B$3-H14)>$B$5,(($B$3-$B$4)-($B$3-H14))/(($B$3-$B$4)-($B$5)),1),0)
    if (soliWater > wiltingPoint) {
      if (fieldCapacity - soliWater > fcWp) {
        return (
          (fieldCapacity - wiltingPoint - (fieldCapacity - soliWater)) /
          (fieldCapacity - wiltingPoint - fcWp)
        );
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  };

  const calculateInitial = (dosInitial, ETO, transpiration, initialPlant) => {
    //X
    //=IF(S14=0,0,J14*$N$4*W14)
    if (dosInitial == 0) {
      return 0;
    } else {
      return ETO * transpiration * initialPlant;
    }
  };

  const calculateCropDev = (dosDev, ETO, transpiration, developmentPlant) => {
    //Y
    //=IF(T14=0,0,J14*$N$5*W14)
    if (dosDev == 0) {
      return 0;
    } else {
      return ETO * transpiration * developmentPlant;
    }
  };

  const calculateCropMid = (dosMid, ETO, transpiration, middlePlant) => {
    //Z
    //=IF(U14=0,0,J14*$N$6*W14)
    if (dosMid == 0) {
      return 0;
    } else {
      return ETO * transpiration * middlePlant;
    }
  };

  const calculateCropLate = (dosLate, ETO, transpiration, latePlant) => {
    //AA
    //=IF(V14=0,0,J14*$N$7*W14)
    if (dosLate == 0) {
      return 0;
    } else {
      return ETO * transpiration * latePlant;
    }
  };

  const calculateETc = (cropInitial, cropDev, cropMid, cropLate) => {
    //AB
    //=NUMBERVALUE(X14)+NUMBERVALUE(Y14)+NUMBERVALUE(Z14)+NUMBERVALUE(AA14)
    return (
      Number(cropInitial) + Number(cropDev) + Number(cropMid) + Number(cropLate)
    );
  };

  const getMonthFromDate = (dateString) => {
    let selectedDateObj = new Date(dateString);
    return selectedDateObj.getMonth() + 1;
  };

  const getDayFromDate = (dateString) => {
    let selectedDateObj = new Date(dateString);
    return selectedDateObj.getDate() + 1;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView>
        <CardComponent
          name="Crop 1"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 2"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 3"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 4"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 5"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 6"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 7"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 8"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 9"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
        <CardComponent
          name="Crop 10"
          crop={cropdata}
          irrigate={irrigationdata}
          month={monthdata}
          data={getdata}
        />
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
              navigation.navigate("Location");
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
          onPress={async () => await nextbtn()}
        >
          Next
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

export default Cardnalysis;

const styles = StyleSheet.create({});
