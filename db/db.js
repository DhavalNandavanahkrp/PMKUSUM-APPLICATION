import * as SQLite from "expo-sqlite";
import { DbOpenError } from "./errors";

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    try {
      dbPromise = SQLite.openDatabaseAsync("farmerdb.db");
      await dbPromise;
    } catch (err) {
      dbPromise = null;
      throw new DbOpenError("Failed to open SQLite database", err);
    }
  }
  return dbPromise;
}
