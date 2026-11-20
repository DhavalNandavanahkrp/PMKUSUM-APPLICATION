export class DbOpenError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "DbOpenError";
    this.cause = cause;
  }
}

export class DbQueryError extends Error {
  constructor(sql, params, cause) {
    super("SQLite query failed");
    this.name = "DbQueryError";
    this.sql = sql;
    this.params = params;
    this.cause = cause;
  }
}

export class DbTransactionError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "DbTransactionError";
    this.cause = cause;
  }
}

export class DbTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "DbTimeoutError";
  }
}
