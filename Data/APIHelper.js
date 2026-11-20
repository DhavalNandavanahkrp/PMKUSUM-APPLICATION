const NetInfo = require("@react-native-community/netinfo");

exports.Get = async (route, token) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    let responseJson = await response.json();

    console.log('response>>>>', response);

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message

    if (!response.ok) {
      result.Message = response.Message;
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Result.Flag;
    result.Message = responseJson.Result.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    console.log("error>>>", error);
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.Get1 = async (route, token) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = response.Message;
      result.Result = false;
      return result;
    }
    result.Result = responseJson.result.Flag;
    result.Message = responseJson.result.Message;
    result.Data = responseJson.data;
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.Get2 = async (route, token) => {
  let result = {
    Flag: false,
    Message: "OTP send ",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    result.Flag = responseJson.Flag;
    result.Message = responseJson.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    console.log("Error>>", error);
    result.Flag = false;
    result.Message = error.toString();
    result.Data = error.toString();

    if (err.response) {
      console.log(
        "Server responded with error:",
        err.response.status,
        err.response.data,
      );
    } else if (err.request) {
      console.log("No response received. Request:", err.request);
    } else {
      console.log("Error setting up request:", err.message);
    }
  }
  return result;
};

exports.Get3 = async (route, token) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = response.Message;
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Result.Flag;
    result.Message = responseJson.Result.Message;
    result.Data = responseJson.data;
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.PostToken = async (route, token, payload) => {
  let result = {
    Flag: false,
    Message: "",
  };

  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Flag = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = "Not OK response fromAPI";
      result.Flag = false;
      return result;
    }

    result.Flag = responseJson.Flag;
    result.Message = responseJson.Message;
  } catch (error) {
    result.Flag = false;
    result.Message = error.toString();
  }
  return result;
};

exports.PostLogout = async (route, token, payload) => {
  try {
    const response = await fetch(route, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || !response.ok) {
      return false;
    }

    const responseJson = await response.json();

    // If API directly returns a boolean
    if (typeof responseJson === "boolean") {
      return responseJson;
    }

    // Fallback: unexpected format
    return false;
  } catch (error) {
    return false;
  }
};

exports.Post = async (route, token, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
    Flag: false,
  };

  console.log('Helper>>', route, token, payload)

  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    
    console.log('response>>', response)
    let responseJson = await response.json();


    console.log('respo data>>', responseJson)
    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = "Not OK response fromAPI";
      result.Result = false;
      return result;
    }


    result.Result = responseJson?.Result?.Flag;
    result.Message = responseJson.Result.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    console.log("error>>>", error);
    result.Result = false;
    result.Message = error.toString();
  }
  return result;
};

exports.PostAuth = async (route, token, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
    Flag: false,
  };

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) {
    headers.Authorization = token;
  }

  console.log('Helper: about to fetch>>', route, headers, payload);

  try {
    const response = await fetch(route, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    console.log('Helper: fetch resolved, status>>', response.status);

    let responseJson = null;
    try {
      responseJson = await response.json();
    } catch (parseErr) {
      console.log('Helper: JSON parse error>>', parseErr);
    }

    console.log('Helper: parsed body>>', responseJson);

    if (response.status === 401) {
      result.Message = "Token is expired, please logout and relogin";
      return result;
    }

    if (!response.ok) {
      result.Message = responseJson?.Result?.Message || `Request failed with status ${response.status}`;
      return result;
    }

    result.Result = responseJson?.Result?.Flag ?? false;
    result.Flag = responseJson?.Result?.Flag ?? false;
    result.Message = responseJson?.Result?.Message || "";
    result.Data = responseJson?.Data ?? null;
  } catch (error) {
    let diag = "Network request failed";
    try {
      const netState = await NetInfo.fetch();
      console.log("Helper: NetInfo diagnostic state>>", JSON.stringify(netState));
      if (!netState.isConnected) {
        diag = "Device has NO internet connection (Offline)";
      } else if (netState.isInternetReachable === false) {
        diag = "Device is connected to network but internet is NOT reachable";
      } else {
        diag = `Connected to internet (${netState.type}), but server at ${route} is unreachable or rejected connection (check Server status, SSL cert, or VPN requirement)`;
      }
    } catch (e) {
      console.log("Helper: diagnostic check error>>", e);
    }
    console.log("Helper: fetch threw>>", error.name, error.message, "| Reason:", 3
      
    );
    result.Message = `${error.message} (${diag})`;
  }

  return result;
};

exports.Post1 = async (route, token, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Flag;
    result.Message = responseJson.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    result.Result = false;
    result.Message = error.toString();
  }
  return result;
};

exports.Post2 = async (route, token, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = "Not OK response fromAPI";
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Result.Flag;
    result.Message = responseJson.Result.Message;
    result.Data = responseJson.data;
  } catch (error) {
    result.Result = false;
    result.Message = error.toString();
  }
  return result;
};

exports.Put = async (route, token, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    let responseJson = await response.json();

    if (response.status === 401) {
      result.Message = "Token is expire please logout and relogin";
      result.Result = false;
      return result;
    }

    // error response from API so return with error message
    if (!response.ok) {
      result.Message = "Not OK response fromAPI";
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Flag;
    result.Message = responseJson.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    result.Result = false;
    result.Message = error.toString();
  }
  return result;
};

exports.Authenticate = async (route, payload) => {
  let result = {
    Result: false,
    Message: "",
    Data: null,
  };
  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseJson = await response.json();

    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
    } else {
      result.Result = true;
      result.Data = responseJson;
    }
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.GetStates = async () => {
  var url = "https://apipmk.mnre.gov.in/api/State/Map_GetKeyValuePair";

  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let responseJson = await response.json();

    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
    } else {
      result.Result = true;
      result.Data = responseJson.Data;
    }
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.FarmerRegister = async (payload) => {
  var url = "https://apipmk.mnre.gov.in/api/PreRegister/M_CreatePreRegiter";

  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseJson = await response.json();
    // error response from API so return with error message
    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
      return result;
    }

    result.Result = responseJson.Flag;
    result.Message = responseJson.Message;
    result.Data = responseJson.Data;
  } catch (error) {
    result.Result = false;
    result.Message = error.toString();
  }
  return result;
};

exports.NotificationPost = async (payload) => {
  const route = "https://exp.host/--/api/v2/push/send";
  let responseJson;
  try {
    let response = await fetch(route, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    responseJson = await response.json();
  } catch (error) {
    console.log(error);
  }
  return responseJson;
};

exports.Weatherdata = async (statecode) => {
  var url = `https://mnretestapi.hkapl.in/api/ClimateData/GetClimateDataByStatecode?statecode=${statecode}`;

  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let responseJson = await response.json();

    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
    } else {
      result.Result = true;
      result.Data = responseJson.Data;
    }
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};

exports.onlinelatlon = async (lat, long) => {
  var url = `https://mnretestapi.hkapl.in/api/ClimateData/GetClimateDataBylatlon?lat=${lat}&lon=${long}`;

  let result = {
    Result: false,
    Message: "",
    Data: null,
  };

  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let responseJson = await response.json();

    if (!response.ok) {
      result.Message = responseJson.Message;
      result.Result = false;
    } else {
      if (responseJson.Result.Flag) {
        result.Result = true;
        result.Data = responseJson.Data;
      } else {
        result.Result = false;
        result.Message = responseJson.Result.Message;
      }
    }
  } catch (error) {
    result.Result = false;
    result.Data = error.toString();
  }
  return result;
};
