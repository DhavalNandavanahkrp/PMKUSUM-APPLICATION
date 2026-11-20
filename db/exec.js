import { getDb } from "./db";
import { DbQueryError, DbTimeoutError } from "./errors";
import * as SQLite from "expo-sqlite";

const QUERY_TIMEOUT_MS = 5000;

export const exec = async (sql, params = [], dbOverride = null) => {
  const db = dbOverride || (await getDb());

  const queryPromise = (async () => {
    try {
      const result = await db.execAsync(sql, params);

      // EXPO-SQLITE PARSING:
      // If result is null/undefined, return empty array.
      // Otherwise, extract the rows from the first result set.
      if (!result) return [];
      if (Array.isArray(result) && result.length > 0) {
        return result[0].rows || [];
      }
      return result;
    } catch (err) {
      // We throw here so the migration's internal try-catch can handle it
      throw new DbQueryError(sql, params, err);
    }
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(new DbTimeoutError(`Query timeout: ${sql.substring(0, 30)}...`)),
      QUERY_TIMEOUT_MS,
    ),
  );

  return Promise.race([queryPromise, timeoutPromise]);
};

export const queryAll = async (sql, params = []) => {
  const db = await getDb();
  return await db.getAllAsync(sql, params);
};
