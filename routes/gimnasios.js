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

router.get("/get-gimnasios", async (req, res) => {
  try {
    const query =
      "SELECT g.*, r.* FROM gimnasio g INNER JOIN responsable r ON g.id_responsable = r.id_responsable";
    const result = await pool.query(query);

    const gimnasios = result.rows.map((row) => ({
      id_gym: row.id_gym,
      nombre_gym: row.nombre_gym,
      direccion_gym: row.direccion_gym,
      imagen_gym: row.imagen_gym,
      telefono: row.telefono,
      email_gym: row.email_gym,
      id_responsable: row.id_responsable,
      nombre_responsable: row.nombre_responsable,
      apellidos_responsable: row.apellidos_responsable,
      email_responsable: row.email_responsable,
      telefono_responsable: row.telefono_responsable,
      contraseña_responsable: row.contraseña_responsable,
    }));

    res.send(gimnasios);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});
module.exports = router;
