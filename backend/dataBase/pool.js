const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost", //185.46.10.111
  database: "ADS_Line",
  password: "123",
  port: 5432,
  client_encoding: "utf8",
});

module.exports = pool;
