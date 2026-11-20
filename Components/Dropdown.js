import React from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Text
} from "react-native";
import { Colors } from "../Styles/Colors";
const CustomDropdown = ({
  placeholder,
  zIndex,
  items,
  selection,
  loading,
  defaultDropdownValue = "",
  containerStyle = {},
  ...props
}) => {
  const [value, setValue] = React.useState(defaultDropdownValue);

  const handleChange = (item) => {
    setValue(item.value);
    selection(item.value);
  };

  return (
    <View>
      <Dropdown
        style={{
          backgroundColor: Colors.WHITE,
          borderBottomColor: Colors.graytone,
          borderBottomWidth: 1,
          borderWidth: 0,
          padding: 0,
          margin: 0,
          color: Colors.graytone,
          fontFamily: "roboto-regular",
          fontSize: 16,
          marginVertical: 10
        }}
        data={items || []} labelField="label"
        valueField="value"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        loading={loading}
        containerStyle={{
          ...containerStyle,
        }}
        textStyle={{
          color: Colors.graytone,
          fontFamily: "roboto-regular",

          fontSize: 16,
        }}
        selectedItemLabelStyle={{
          color: Colors.green,
        }}
        zIndex={0}
        flatListProps={{
          ListEmptyComponent: <Text style={{ padding: 10, fontSize: 16, }}>No Data available</Text>
        }}
        {...props}
      />
    </View>
  );
};

export default CustomDropdown;

