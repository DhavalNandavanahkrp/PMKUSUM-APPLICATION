import { Alert } from "react-native";
import { withTransaction } from "./transaction";
import i18n from "i18n-js";

export async function initDatabase({ Stateinsertquery, StateDeletequery }) {
  try {
    await withTransaction(async (tx) => {
      /* 1. Ensure Table Exists */
      await tx.executeSql(`
        CREATE TABLE IF NOT EXISTS StateList (
          Key TEXT UNIQUE,
          Value TEXT,
          State_Short_Code TEXT,
          StateLanguages TEXT
        )
      `);

      if (StateDeletequery) {
        await tx.executeSql(StateDeletequery);
      }
      /* 2. Add Columns with Individual Error Handling */
      const columnsToAdd = [
        { name: "APIUrl", type: "TEXT" },
        { name: "BrokerIp", type: "TEXT" },
        { name: "BrokerPort", type: "TEXT" },
      ];

      for (const col of columnsToAdd) {
        try {
          // We attempt to add the column regardless of PRAGMA results
          await tx.executeSql(
            `ALTER TABLE StateList ADD COLUMN ${col.name} ${col.type}`,
          );
        } catch (err) {
          // Check if the error is specifically about the column already existing
          const errMsg = err.cause?.message || err.message || "";
          if (errMsg.includes("duplicate column name")) {
          } else {
            // If it's a different error (e.g., syntax, disk full), we stop
            throw err;
          }
        }
      }

      /* 3. Batch Inserts */
      if (Array.isArray(Stateinsertquery)) {
        for (const query of Stateinsertquery) {
          // Use try-catch here too if you expect potential "Unique constraint" errors
          await tx
            .executeSql(query)
            .catch((e) =>
              console.log("Insert skipped (likely duplicate key)", e),
            );
        }
      }

      // Create DistrictList table if not present
      await tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Districtlist(Key text unique , Value text ,Statecode text)",
        null,
      );

      await tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Weatherdata(Id integer primary key AUTOINCREMENT, startdate text, enddate text, latitude REAL, longitude REAL, soiltype integer, statecode integer, tmin text, tmax text, rainfall text, districtcode text)",
        null,
      );
    });

    console.log("Migration successful.");
  } catch (error) {
    console.error("Migration failed:", error);
    Alert.alert(
      i18n.t("databaseError"),
      i18n.t("failtogeneratedatabaseforofflinepurpose") + " \n\n" + error,
      [{ text: i18n.t("OK") }],
    );
  }
}
