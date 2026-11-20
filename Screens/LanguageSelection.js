import { useEffect, useState } from "react";
import { Pressable, Text, View, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Styles } from "../Styles/GlobalStyles";
import { Colors } from "../Styles/Colors";
import { Feather as IconF } from "@expo/vector-icons";
const LanguageSelection = ({ navigation }) => {
  const [languageList, setlanguageList] = useState([]);

  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      const StateLanguages = await AsyncStorage.getItem("StateLanguages");
      const Languages = JSON.parse(StateLanguages);
      setlanguageList(Languages);
    })();
  }, [isFocused]);

  const renderLanguageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Pressable
        style={Styles.flex1}
        onPress={async () => {
          await AsyncStorage.setItem("selectedLocale", item.val);
          await AsyncStorage.setItem("selectedLanguageName", item.key);
          i18n.locale = item.val;
          navigation.goBack();
        }}
      >
        <Text style={styles.languageName}>{item.key}</Text>
        {i18n.locale === item.val ? (
          <IconF
            name="check-circle"
            style={styles.right}
            color={Colors.green}
            size={20}
          />
        ) : null}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView edges={["bottom"]}>
      {/* Current language selected */}
      <View style={Styles.m2}>
        {/* LanguageList */}
        <FlatList
          style={{ marginTop: 20 }}
          listKey="languageList"
          data={languageList}
          renderItem={renderLanguageItem}
          numColumns={2}
          keyExtractor={(item, index) => index}
        />
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  imageContainer: {
    margin: 3,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: Colors.graytone,
    height: 50,
    flex: 0.5,
  },
  imageThumbnail: {
    flex: 1,
    height: "100%",
    width: "100%",
    resizeMode: "contain",
    marginTop: 5,
  },
  languageName: {
    textAlign: "center",
    fontFamily: "roboto-regular",
    fontWeight: "bold",
    color: Colors.graytone,
    marginVertical: 10,
  },
  right: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
});
