const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");
// Endpoint para obtener la lista de ejercicios
router.get("/get-ejercicios/:id_cliente", async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    const query = `SELECT e.id_ejercicio, e.nombre_ejercicio,e.series,e.repeticiones
      FROM cliente c
      JOIN cliente_ejercicio ce ON c.id_cliente = ce.id_cliente
      JOIN ejercicio e ON ce.id_ejercicio = e.id_ejercicio
      WHERE c.id_cliente = $1; `;
    const result = await pool.query(query, [id_cliente]);
    // eslint-disable-next-line no-console
    /*  console.log(result) */
    const cita = result.rows.map((rows) => rows); // Obtiene solo los nombres de los gimnasios

    res.send(cita);
    // eslint-disable-next-line no-console
    console.log(cita);
    // eslint-disable-next-line no-console
    /* console.log(id_cliente) */
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

//Insertar ejercicios
router.post("/ejercicios", async (req, res) => {
  const { nombre_ejercicio, series, repeticiones } = req.body;

  pool.query(
    "INSERT INTO ejercicio (nombre_ejercicio, series, repeticiones) VALUES ($1, $2, $3) RETURNING id_ejercicio",
    [nombre_ejercicio, series, repeticiones],
    (err, result) => {
      if (err) {
        console.error("Error al crear usuario", err);
        res
          .status(500)
          .send(JSON.stringify({ message: "Error al insertar ejercicio" }));
      } else {
        const idEjercicio = result.rows[0].id_ejercicio;
        const { id_cliente } = req.body;
        pool.query(
          "INSERT INTO cliente_ejercicio (id_cliente, id_ejercicio) VALUES ($1, $2);",
          [id_cliente, idEjercicio],
          (err, result) => {
            if (err) {
              console.error("Error al insertar datos en tabla intermedia", err);
              res.status(500).send(
                JSON.stringify({
                  message: "Error al insertar datos en tabla intermedia",
                })
              );
            } else {
              res
                .status(201)
                .send(
                  JSON.stringify({ message: "Ejercicio creado exitosamente" })
                );
            }
          }
        );
      }
    }
  );
});
module.exports = router;
