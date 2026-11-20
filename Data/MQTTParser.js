exports.ReadConfiguration = (objCloudMessageStrConfig) => {
  var finalCloudConfigArray = [];
  var objCloudMessageConfig = [];

  try {
    objCloudMessageConfig = JSON.parse(objCloudMessageStrConfig);
  } catch (msg) {}

  for (var i = 0; i < objCloudMessageConfig.length; i++) {
    var keyUUID = Object.keys(objCloudMessageConfig[i])[0]
      .replace("'", "")
      .replace("'", "");
    var valString = Object.values(objCloudMessageConfig[i])[0];
    var valArray = valString.split(",");
    var tmpJSONObject = { uuid: keyUUID };
    for (var j = 0; j < 16; j++) {
      var tmpVal;
      var valAsStr = valArray[j].replace("'", "").replace("'", "");
      try {
        if (j > 2 && j < 7) {
          try {
            if (valAsStr != "null" && valAsStr != "") {
              tmpVal = parseFloat(valAsStr);
            } else {
              tmpVal = null;
            }
          } catch (msg) {
            tmpVal = null;
          }
        } else {
          tmpVal = valAsStr;
        }
      } catch (msg) {
        tmpVal = null;
      }

      var tmpKey = getKeyNameByValIndexConfig(j);
      tmpJSONObject[tmpKey] = tmpVal;
    }
    finalCloudConfigArray.push(tmpJSONObject);
  }
  return finalCloudConfigArray;
};

exports.ReadValues = (objCloudMessageStr) => {
  var finalCloudValArray = [];
  var objCloudMessageVal = [];
  try {
    objCloudMessageVal = JSON.parse(objCloudMessageStr);
  } catch (msg) {}

  for (var i = 0; i < objCloudMessageVal.length; i++) {
    var keyUUID = Object.keys(objCloudMessageVal[i])[0]
      .replace("'", "")
      .replace("'", "");
    var valString = Object.values(objCloudMessageVal[i])[0];
    var valArrayVal = valString.split(",");
    var tmpJSONObject = { uuid: keyUUID };
    for (var j = 0; j <= 3; j++) {
      var tmpVal;
      var valAsStr = valArrayVal[j].replace("'", "").replace("'", "");

      try {
        if (j === 1) {
          try {
            if (valAsStr !== "null") {
              if (!isNaN(parseFloat(valAsStr))) tmpVal = parseFloat(valAsStr);
            } else {
              tmpVal = null;
            }
          } catch (msg) {
            tmpVal = null;
          }
        } else {
          tmpVal = valAsStr;
        }
      } catch (msg) {
        tmpVal = null;
      }

      var tmpKey = getKeyNameByValIndexVal(j);
      tmpJSONObject[tmpKey] = tmpVal;
    }
    finalCloudValArray.push(tmpJSONObject);
  }
  return finalCloudValArray;
};

exports.MatchValues = (configData, valueData) => {
  const filteredData = configData.filter(
    (item) =>
      item.dnm == "PDKWH1" || // today's energy
      item.dnm == "PRUNST1" || // Pump Controller Status
      item.dnm == "POPFLW1" || // Water Discharge Flow Rate
      item.dnm == "PDHR1" || //Today's run time
      item.dnm == "POPDWD1" || // Today's water discharge
      item.dnm == "LAT" || // Latitude
      item.dnm == "LONG" || // Longitude
      item.dnm == "SCHEN" || // Schedule enable
      item.dnm == "SCHSTTM" || // Schedule Start Time
      item.dnm == "SCHDUR" || // Schedule Duration
      item.dnm == "SCHMODE" || // Schedule Mode
      item.dnm == "SCHCST" || // Schedule day configuration
      item.dnm == "POPTOTWD1" ||
      item.dnm == "PTOTKWH1" ||
      item.dnm == "PTOTHR1" ||
      item.dnm == "POPKW1" || // Current Solar Generation
      // after that add new for comp-c
      item.dnm == "POW2" || //comp-c Solar Generatation
      item.dnm == "GRIDST" || //comp-c Grid Status
      item.dnm == "ISTS1" || //comp-c Inverter Status
      item.dnm == "KWHEXP1" || //comp-c Cumulative Export
      item.dnm == "PMPST" ||//comp-c Pump Statuss
      item.dnm == "POW1"  ||
      item.dnm == "KWHIMP1"  ||
      item.dnm == "NET"  
  );

  let mergedData = [];
  filteredData.forEach((element) => {
    const valueItem = valueData.find((item) => item.uuid === element.uuid);
    if (valueItem) {
      const data = {
        uuid: element.uuid,
        unit: element.unit,
        dnm: element.dnm,
        value: valueItem.valStr,
        time: valueItem.tsDT,
      };
      mergedData.push(data);
    }
  });
  return mergedData;
};

const getKeyNameByValIndexConfig = (index) => {
  var nmKeyStr = index.toString();
  switch (index) {
    case 0:
      nmKeyStr = "did";
      break;
    case 1:
      nmKeyStr = "dnm";
      break;
    case 2:
      nmKeyStr = "nm";
      break;
    case 3:
      nmKeyStr = "min";
      break;
    case 4:
      nmKeyStr = "max";
      break;
    case 5:
      nmKeyStr = "mf";
      break;
    case 6:
      nmKeyStr = "regAdd";
      break;
    case 7:
      nmKeyStr = "unit";
      break;
    case 8:
      nmKeyStr = "tagid";
      break;
    case 9:
      nmKeyStr = "ndnm";
      break;
    case 10:
      nmKeyStr = "hhdnm";
      break;
    case 11:
      nmKeyStr = "hdnm";
      break;
    case 12:
      nmKeyStr = "ldnm";
      break;
    case 13:
      nmKeyStr = "lldnm";
      break;
    case 14:
      nmKeyStr = "dondnm";
      break;
    case 15:
      nmKeyStr = "doffdnm";
      break;
    default:
  }
  return nmKeyStr;
};

const getKeyNameByValIndexVal = (index) => {
  var nmKeyStr = index.toString();
  switch (index) {
    case 0:
      nmKeyStr = "tsStr";
      break;
    case 1:
      nmKeyStr = "valStr";
      break;
    case 2:
      nmKeyStr = "alrmSt";
      break;
    case 3:
      nmKeyStr = "tsDT";
      break;
    default:
  }
  return nmKeyStr;
};
