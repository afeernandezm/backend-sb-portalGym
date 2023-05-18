/* require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool; */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.API_URI;
const supabaseKey = process.env.API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
