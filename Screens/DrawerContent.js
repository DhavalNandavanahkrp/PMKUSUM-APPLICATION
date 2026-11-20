import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme, Title, Caption, Drawer, Divider } from "react-native-paper";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

import {
  Feather as IconF,
  MaterialIcons as IconM,
  MaterialCommunityIcons as IconMC,
  FontAwesome as IconFA,
  FontAwesome5 as IconFA5,
  AntDesign as IconA,
  EvilIcons as IconE,
} from "@expo/vector-icons";
import { AuthContext } from "../Components/context";

export function DrawerContent(props) {
  const paperTheme = useTheme();

  const { signOut, toggleTheme } = React.useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
              }}
            >
              <Image source={require("../assets/Avatar.png")} width="90" />
              <View style={(flexDirection = "row")}>
                <View style={{ marginLeft: 15, flexDirection: "column" }}>
                  <Title style={styles.title}>Dyal Madalik</Title>
                  <Caption style={styles.caption}>
                    SARAL No - 85739008719
                  </Caption>
                  <View style={[styles.row, { justifyContent: "flex-start" }]}>
                    <View style={styles.section}>
                      <IconM
                        name="location-pin"
                        size={25}
                        color="#344955"
                      ></IconM>
                      <Caption
                        style={[
                          styles.caption,
                          { marginLeft: 5, fontSize: 12 },
                        ]}
                      >
                        Haryana
                      </Caption>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Divider style={{ marginVertical: 10 }}></Divider>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              IconM={({ color, size }) => (
                <IconM name="playlist-add-check" color={color} size={30} />
              )}
              label="Current Status"
              onPress={() => {
                props.navigation.navigate("LiveStatus");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <IconM name="bar-chart" color={color} size={30} />
              )}
              label="Usage"
              onPress={() => {
                props.navigation.navigate("CurrentUsage");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <IconMC name="state-machine" color={color} size={30} />
              )}
              label="Analysis"
              onPress={() => {
                props.navigation.navigate("Performance");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <FontAwesome5 name="solar-panel" color={color} size={20} />
              )}
              label="Asset Info"
              onPress={() => {
                props.navigation.navigate("AssetScreen");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <IconMC name="corn" color={color} size={30} />
              )}
              label="Crop Details"
              onPress={() => {
                props.navigation.navigate("ContactUsScreen");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <IconM name="contact-support" color={color} size={30} />
              )}
              label="Contact Us"
              onPress={() => {
                props.navigation.navigate("ContactUsScreen");
              }}
            />
            <DrawerItem
              IconM={({ color, size }) => (
                <IconM name="support-agent" color={color} size={30} />
              )}
              label="Complaint"
              onPress={() => {
                props.navigation.navigate("SupportScreen");
              }}
            />
          </Drawer.Section>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              IconM={({ color, size }) => (
                <IconMC
                  name="account-settings-outline"
                  size={25}
                  color="#344955"
                ></IconMC>
              )}
              label="Profile"
              onPress={() => {
                props.navigation.navigate("UserProfile");
              }}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          IconM={({ color, size }) => (
            <IconM name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => {
            signOut();
          }}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    marginTop: -5,
  },
  userInfoSection: {
    paddingLeft: 20,
    // backgroundColor: "#F9AA33",
  },
  title: {
    fontSize: 20,
    marginTop: 3,
    fontWeight: "bold",
    color: "#344955",
  },
  caption: {
    fontSize: 10,
    lineHeight: 10,
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 5,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
