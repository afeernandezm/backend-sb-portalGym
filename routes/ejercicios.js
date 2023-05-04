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

//Editar ejercicio
router.put("/ejercicios/:id_ejercicio", async (req, res) => {
  try {
    const id = req.params.id_ejercicio;
    const { nombre_ejercicio, series, repeticiones, id_cliente } = req.body;

    // Actualizamos los datos del ejercicio
    const { rows: ejerciciosRows } = await pool.query(
      "UPDATE ejercicio SET nombre_ejercicio = $1, series = $2, repeticiones = $3 WHERE id_ejercicio = $4 RETURNING *",
      [nombre_ejercicio, series, repeticiones, id]
    );

    if (!ejerciciosRows[0]) {
      return res.status(404).json({ mensaje: "Ejercicio no encontrado" });
    }

    // Eliminamos todas las relaciones existentes con los clientes
    await pool.query("DELETE FROM cliente_ejercicio WHERE id_ejercicio = $1", [
      id,
    ]);

    // Insertamos las nuevas relaciones con los clientes
    await pool.query(
      "INSERT INTO cliente_ejercicio (id_cliente, id_ejercicio) VALUES ($1, $2)",
      [id_cliente, id]
    );

    res.status(200).json(ejerciciosRows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//borrar ejercicio
router.delete("/borrar-ejercicios/:id_ejercicio", async (req, res) => {
  try {
    const id = req.params.id_ejercicio;

    // Eliminamos todas las relaciones existentes con los clientes
    await pool.query("DELETE FROM cliente_ejercicio WHERE id_ejercicio = $1", [
      id,
    ]);

    // Eliminamos el ejercicio de la base de datos
    const { rows: ejerciciosRows } = await pool.query(
      "DELETE FROM ejercicio WHERE id_ejercicio = $1 RETURNING *",
      [id]
    );

    if (!ejerciciosRows[0]) {
      return res.status(404).json({ mensaje: "Ejercicio no encontrado" });
    }

    res.status(200).json({ mensaje: "Ejercicio eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

module.exports = router;
