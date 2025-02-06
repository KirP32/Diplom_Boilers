const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "172.17.0.1", //185.46.10.111
  database: "ADS_Line", // 172.17.0.1
  password: "123",
  port: 5432,
  client_encoding: "utf8",
});

module.exports = pool;
