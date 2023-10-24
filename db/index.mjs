import pg from "pg";

const pool = new pg.Pool({
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

export const query = (text, params, callback) => {
  return pool.query(text, params, callback);
}
