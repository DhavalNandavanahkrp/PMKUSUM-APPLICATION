import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Colors } from "../Styles/Colors";

const Tile = (props) => {
  return (
    <Pressable
      style={{
        alignItems: "center",
        alignSelf: "center",
        marginVertical: 5,
      }}
      onPress={() => props.OnClick(props.Parameter)}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={props.ImageSource}
        />
      </View>
      <Text style={styles.titleText}>{props.Name}</Text>
    </Pressable>
  );
};

export default Tile;

const styles = StyleSheet.create({
  imageContainer: {
    borderWidth: 2,
    paddingHorizontal: 2,
    borderColor: Colors.primaryOrange,
    height: 170,
    width: 180,
  },
  titleText: {
    textAlign: "center",
    color: Colors.white,
    fontWeight: "bold",
    backgroundColor: Colors.primaryOrange,
    fontFamily: "roboto-regular",
    width: 180,
    marginBottom: 5,
  },
  image: {
    flex: 1,
    height: null,
    resizeMode: "contain",
    width: null,
  },
});
