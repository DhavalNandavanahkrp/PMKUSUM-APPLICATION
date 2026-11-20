import React from "react";
import {
    StyleSheet,
    View,
    Text,
} from "react-native";

const Toolcard = (props) => {
    return (
        <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row" }}>
                {(props.isdown === 5) ? (<View style={styles.cardView}></View>) : (
                    <View style={styles.cardView}>
                        <Text style={styles.cardTextTitle}>Design Discharge</Text>
                        <Text style={styles.cardData}>{props.design}</Text>
                    </View>
                )}
                {(props.isdown === 5) ? (<View style={styles.cardView}></View>) : (
                    <View style={styles.cardView}>
                        <Text style={styles.cardTextTitle}>Design Head</Text>
                        <Text style={styles.cardData}>{props.designhead}</Text>
                    </View>
                )}
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Motor HP</Text>
                    <Text style={styles.cardData}>{props.data.MotorHP}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row" }}>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Category</Text>
                    <Text style={styles.cardData}>{props.category}</Text>
                </View>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Model</Text>
                    <Text style={styles.cardData}>{props.data.Model}</Text>
                </View>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Pvarray Wp</Text>
                    <Text style={styles.cardData}>{props.data.Pvarray_Wp}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row" }}>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Head (m)</Text>
                    <Text style={styles.cardData}>{props.data.RecommondedHead}</Text>
                </View>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Shutoff Head (m)</Text>
                    <Text style={styles.cardData}>{props.data.SHUTOFF}</Text>
                </View>
                <View style={styles.cardView}>
                    <Text style={styles.cardTextTitle}>Discharge (LPD)</Text>
                    <Text style={styles.cardData}>{props.data.LPD}</Text>
                </View>
            </View>
        </View>
    )
}

export default Toolcard;

const styles = StyleSheet.create({
    cardContent: {
        paddingHorizontal: 1,
        margin: 5
    },
    cardTitle: { fontSize: 18, textAlign: "left", width: "90%" },
    cardView: { width: "33.33%", marginBottom: 5, height: 50 },
    cardTextTitle: { fontSize: 10, textAlign: "center", fontWeight: "300" },
    cardData: { fontSize: 15, textAlign: "center" },
    pressable: { width: "10%", alignItems: "center" },
});