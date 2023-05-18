const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");
const supabase = require("../config");
// Endpoint para obtener la lista de gimnasios
router.get("/gimnasios", async (req, res) => {
  try {
    const { data: gimnasios, error } = await supabase
      .from("gimnasio")
      .select("nombre_gym");

    if (error) {
      console.error(error);
      res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
      return;
    }

    const nombresGimnasios = gimnasios.map((gimnasio) => gimnasio.nombre_gym);
    res.send(nombresGimnasios);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

router.get("/gimnasios/get-gimnasios", async (req, res) => {
  try {
    const [gimnasiosResult, responsablesResult] = await Promise.all([
      supabase.from("gimnasio").select("*"),
      supabase.from("responsable").select("*"),
    ]);

    const gimnasios = gimnasiosResult.data.map((gimnasio) => {
      const responsable = responsablesResult.data.find(
        (r) => r.id_responsable === gimnasio.id_responsable
      );

      return {
        id_gym: gimnasio.id_gym,
        nombre_gym: gimnasio.nombre_gym,
        direccion_gym: gimnasio.direccion_gym,
        imagen_gym: gimnasio.imagen_gym,
        telefono: gimnasio.telefono,
        email_gym: gimnasio.email_gym,
        id_responsable: gimnasio.id_responsable,
        nombre_responsable: responsable.nombre_responsable,
        apellidos_responsable: responsable.apellidos_responsable,
        email_responsable: responsable.email_responsable,
        telefono_responsable: responsable.telefono_responsable,
        contraseña_responsable: responsable.contraseña_responsable,
      };
    });

    res.send(gimnasios);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

router.get("/gimnasios/info-gimnasio/:id_responsable", async (req, res) => {
  const id_responsable = req.params.id_responsable;

  try {
    const [gimnasioResult] = await Promise.all([
      supabase
        .from("gimnasio")
        .select("*")
        .eq("id_responsable", id_responsable),
    ]);

    const gimnasio = gimnasioResult.data;

    res.send(gimnasio);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

// Insertar gimnasio
router.post("/gimnasios/insertar-gimnasio", async (req, res) => {
  const { nombre_gym, email_gym, direccion_gym, telefono, id_responsable } =
    req.body;

  // Verificar que el teléfono tenga exactamente 9 caracteres
  if (telefono.length !== 9) {
    return res.status(400).send(
      JSON.stringify({
        message: "El teléfono debe tener 9 caracteres y numericos",
      })
    );
  }

  // Verificar que el teléfono contenga solo dígitos numéricos
  if (!/^\d+$/.test(telefono)) {
    return res.status(400).send(
      JSON.stringify({
        message: "El teléfono debe contener solo dígitos numéricos",
      })
    );
  }

  // Verificar que el correo electrónico contenga el símbolo "@"
  if (!email_gym.includes("@")) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "El correo electrónico no es válido" }));
  }

  try {
    const { data, error } = await supabase
      .from("gimnasio")
      .insert([
        {
          nombre_gym,
          email_gym,
          direccion_gym,
          telefono,
          id_responsable,
        },
      ])
      .single();

    if (error) {
      console.error(error);
      return res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
    }

    const gimnasio = data;

    res.send(gimnasio);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

module.exports = router;
