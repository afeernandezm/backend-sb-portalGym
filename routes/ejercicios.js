const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");
const supabase = require("../config");
// Endpoint para obtener la lista de ejercicios
router.get("/ejercicios/get-ejercicios/:id_cliente", async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;

    const { data, error } = await supabase
      .from("cliente_ejercicio")
      .select(
        `
        ejercicio (id_ejercicio: id_ejercicio, nombre_ejercicio, series, repeticiones)
      `
      )
      .eq("id_cliente", id_cliente);

    if (error) {
      console.error(error);
      res.sendStatus(500);
    } else {
      const ejercicios = data.map((row) => row.ejercicio);
      res.send(ejercicios);
      // eslint-disable-next-line no-console
      console.log(ejercicios);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//Insertar ejercicios
router.post("/ejercicios", async (req, res) => {
  try {
    const { nombre_ejercicio, series, repeticiones, id_cliente } = req.body;

    const { error } = await supabase
      .from("ejercicio")
      .insert([{ nombre_ejercicio, series, repeticiones }]);

    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error al insertar ejercicio" });
    } else {
      // Obtener el id_ejercicio del ejercicio recién insertado
      const { data, error: fetchError } = await supabase
        .from("ejercicio")
        .select("id_ejercicio")
        .order("id_ejercicio", { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error(fetchError);
        res
          .status(500)
          .json({ message: "Error al obtener el id del ejercicio" });
      } else {
        const id_ejercicio = data[0].id_ejercicio;

        // Insertar en la tabla intermedia
        const { error: intermediaError } = await supabase
          .from("cliente_ejercicio")
          .insert([{ id_cliente, id_ejercicio }]);

        if (intermediaError) {
          console.error(intermediaError);
          res
            .status(500)
            .json({ message: "Error al insertar datos en tabla intermedia" });
        } else {
          res.status(201).json({ message: "Ejercicio creado exitosamente" });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

//Editar ejercicio
router.put("/ejercicios/:id_ejercicio", async (req, res) => {
  try {
    const id = req.params.id_ejercicio;
    const { nombre_ejercicio, series, repeticiones, id_cliente } = req.body;

    const { error: ejercicioError } = await supabase
      .from("ejercicio")
      .update({ nombre_ejercicio, series, repeticiones })
      .eq("id_ejercicio", id);

    if (ejercicioError) {
      console.error(ejercicioError);
      res.status(500).json({ mensaje: "Error interno del servidor" });
      return;
    }

    const { error: relacionError } = await supabase
      .from("cliente_ejercicio")
      .delete()
      .eq("id_ejercicio", id);

    if (relacionError) {
      console.error(relacionError);
      res.status(500).json({ mensaje: "Error interno del servidor" });
      return;
    }

    const { error: nuevaRelacionError } = await supabase
      .from("cliente_ejercicio")
      .insert([{ id_cliente, id_ejercicio: id }]);

    if (nuevaRelacionError) {
      console.error(nuevaRelacionError);
      res.status(500).json({ mensaje: "Error interno del servidor" });
      return;
    }

    res.status(200).json({ mensaje: "Ejercicio actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//borrar ejercicio
router.delete(
  "/ejercicios/borrar-ejercicios/:id_ejercicio",
  async (req, res) => {
    try {
      const id = req.params.id_ejercicio;

      const { error: relacionError } = await supabase
        .from("cliente_ejercicio")
        .delete()
        .eq("id_ejercicio", id);

      if (relacionError) {
        console.error(relacionError);
        res.status(500).json({ mensaje: "Error interno del servidor" });
        return;
      }

      const { data: ejercicioData, error: ejercicioError } = await supabase
        .from("ejercicio")
        .delete()
        .eq("id_ejercicio", id)
        .single();

      if (ejercicioError) {
        console.error(ejercicioError);
        res.status(404).json({ mensaje: "Ejercicio no encontrado" });
        return;
      }

      res.status(200).json({ mensaje: "Ejercicio eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
);

module.exports = router;
