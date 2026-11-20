import { getDb } from "./db";
import { exec } from "./exec"; // Import the shared logic
import { DbTransactionError, DbTimeoutError } from "./errors";

const TX_TIMEOUT_MS = 10000; // Increased to allow for multiple migrations
let activeTx = null;

export async function withTransaction(callback) {
  const db = await getDb();

  // If already inside a transaction → reuse it
  if (activeTx) {
    return await callback(activeTx);
  }
  // Otherwise create a new transaction
  return await db.withTransactionAsync(async () => {
    const tx = {
      executeSql: async (sql, params = []) => {
        return await db.runAsync(sql, params);
      },
    };

    activeTx = tx; //set active transaction
    try {
      return await callback(tx);
    } finally {
      activeTx = null; // clear after complete
    }
  });
}