const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");

//Insertar citas
router.post("/citas", async (req, res) => {
  const { fecha_cita, nombre_cliente, nombre_gym, hora_cita } = req.body;
  pool.query(
    "INSERT INTO cita (fecha_cita, id_cliente, id_gym,hora_cita) VALUES ($1, (SELECT id_cliente FROM cliente WHERE nombre_cliente = $2), (SELECT id_gym FROM gimnasio WHERE nombre_gym = $3),$4);",
    [fecha_cita, nombre_cliente, nombre_gym, hora_cita],
    (err, result) => {
      if (err) {
        console.error("Error al crear usuario", err);
        res
          .status(500)
          .send(JSON.stringify({ message: "Error al crear cita" }));
      } else {
        res
          .status(201)
          .send(JSON.stringify({ message: "Cita creado exitosamente" }));
      }
    }
  );
});

// Endpoint para obtener la lista de citas
router.get("/citas/get-citas/:id_cliente", async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    // eslint-disable-next-line no-console
    console.log(id_cliente);
    const query = `SELECT ci.id_cita, TO_CHAR(ci.fecha_cita, 'DD-MM-YYYY'), ci.hora_cita, g.nombre_gym FROM cita ci JOIN cliente c ON c.id_cliente = ci.id_cliente JOIN gimnasio g ON g.id_gym = ci.id_gym WHERE c.id_cliente = $1`;
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

//Editar cita
router.put("/citas/:id_cita", async (req, res) => {
  try {
    const id = req.params.id_cita;
    const { fecha_cita, hora_cita } = req.body;

    const { rows } = await pool.query(
      "UPDATE cita SET fecha_cita = $1, hora_cita = $2 WHERE id_cita = $3 RETURNING *",
      [fecha_cita, hora_cita, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }
    // eslint-disable-next-line no-console
    console.log(id);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Borrar cita
router.delete("/citas/borrar-citas/:id_cita", async (req, res) => {
  try {
    const id = req.params.id_cita;

    const { rows } = await pool.query(
      "DELETE FROM cita WHERE id_cita = $1 RETURNING *",
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.status(200).json({ mensaje: "Cita eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

router.get("/citas/citas-responsable/:id_responsable", async (req, res) => {
  const id_responsable = req.params.id_responsable;

  try {
    const query = `SELECT ci.id_cita,  TO_CHAR(ci.fecha_cita, 'DD-MM-YYYY'), ci.hora_cita, c.nombre_cliente, g.nombre_gym 
      FROM cita ci 
      JOIN cliente c ON ci.id_cliente = c.id_cliente 
      JOIN gimnasio g ON ci.id_gym = g.id_gym 
      WHERE g.id_gym IN (
        SELECT id_gym FROM gimnasio WHERE id_responsable = $1
      );`;
    const result = await pool.query(query, [id_responsable]);
    const citasGym = result.rows;

    res.json(citasGym);
    // eslint-disable-next-line no-console
    console.log(citasGym);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

router.delete("/citas/responsable-borrar-cita/:id_cita", async (req, res) => {
  const id_cita = req.params.id_cita;

  try {
    const query = "DELETE FROM cita WHERE id_cita = $1";
    await pool.query(query, [id_cita]);
    res.sendStatus(204); // Devuelve un código de estado 204 si la cita fue eliminada correctamente
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

module.exports = router;
