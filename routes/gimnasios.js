const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");

// Endpoint para obtener la lista de gimnasios
router.get("/gimnasios", async (req, res) => {
  try {
    const query = "SELECT * FROM gimnasio";
    const result = await pool.query(query);
    const gimnasio = result.rows.map((row) => row.nombre_gym); // Obtiene solo los nombres de los gimnasios

    res.send(gimnasio);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});
module.exports = router;
