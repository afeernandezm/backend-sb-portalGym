const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
/* const pool = require("../config"); */
const supabase = require("../config");
/// Insertar cliente
router.post("/usuarios/cliente", async (req, res) => {
  const {
    nombre_cliente,
    apellidos_cliente,
    email_cliente,
    fnac_cliente,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("cliente")
    .select("count", { count: "exact" })
    .eq("email_cliente", email_cliente)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error interno del servidor" }));
  }

  if (emailExists.count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res
      .status(400)
      .send(
        JSON.stringify({ message: "El correo electrónico ya está en uso" })
      );
  }

  // Verificar que el correo electrónico contenga un "@"
  if (!email_cliente.includes("@")) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "El correo electrónico no es válido" }));
  }

  // Verificar que la contraseña tenga al menos 8 caracteres con mayúsculas, minúsculas y un carácter especial
  if (
    !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/.test(
      contraseña_cliente
    )
  ) {
    return res.status(400).send(
      JSON.stringify({
        message:
          "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, un número y un carácter especial",
      })
    );
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_cliente, 10);

  const { user, error: signUpError } = await supabase.auth.signUp({
    email: email_cliente,
    password: contraseña_cliente,
  });

  if (signUpError) {
    console.error("Error al crear el usuario", signUpError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error al crear usuario" }));
  }

  const { id_cliente } = await supabase
    .from("cliente")
    .insert([
      {
        nombre_cliente,
        apellidos_cliente,
        email_cliente,
        fnac_cliente,
        contraseña_cliente: hashedPassword,
      },
    ])
    .single();
  // Buscar el cliente recién insertado por el correo electrónico
  const { data: cliente, error: selectError } = await supabase
    .from("cliente")
    .select("id_cliente")
    .eq("email_cliente", email_cliente)
    .single();

  if (selectError) {
    console.error("Error al buscar el cliente", selectError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error al crear usuario" }));
  }
  res.status(201).send(
    JSON.stringify({
      message: "Usuario creado exitosamente",
      id_cliente: cliente.id_cliente,
      nombre_cliente,
      apellidos_cliente,
      email_cliente,
      fnac_cliente,
    })
  );
});

//Iniciar sesion admin
router.post("/usuarios/iniciar-sesion-admin", async (req, res) => {
  const { email_responsable, contraseña_responsable } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("responsable")
    .select("*")
    .eq("email_responsable", email_responsable)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res.status(500).send(
      JSON.stringify({
        success: false,
        message: "Error interno del servidor",
      })
    );
  }

  if (emailExists) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists;
    const passwordMatches = await bcrypt.compare(
      contraseña_responsable,
      user.contraseña_responsable
    );

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_responsable);
      const { id_responsable, nombre_responsable, email_responsable } = user;
      return res.status(200).send(
        JSON.stringify({
          success: true,
          message: "Inicio de sesión exitoso",
          id_responsable,
          nombre_responsable,
          email_responsable,
        })
      );
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res
        .status(400)
        .send(
          JSON.stringify({ success: false, message: "Contraseña incorrecta" })
        );
    }
  }
});

router.post("/usuarios/admin", async (req, res) => {
  const {
    nombre_responsable,
    apellidos_responsable,
    email_responsable,
    telefono_responsable,
    contraseña_responsable,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("responsable")
    .select("count", { count: "exact" })
    .eq("email_responsable", email_responsable)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error interno del servidor" }));
  }

  if (emailExists.count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res
      .status(400)
      .send(
        JSON.stringify({ message: "El correo electrónico ya está en uso" })
      );
  }

  // Verificar que el correo electrónico contenga un "@"
  if (!email_responsable.includes("@")) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "El correo electrónico no es válido" }));
  }
  // Verificar que el número de teléfono tenga exactamente 9 caracteres
  if (telefono_responsable.length !== 9) {
    return res.status(400).send(
      JSON.stringify({
        message: "El número de teléfono debe tener exactamente 9 caracteres",
      })
    );
  }
  // Verificar que la contraseña tenga al menos 8 caracteres con mayúsculas, minúsculas y un carácter especial
  if (
    !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/.test(
      contraseña_responsable
    )
  ) {
    return res.status(400).send(
      JSON.stringify({
        message:
          "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, un número y un carácter especial",
      })
    );
  }

  // Insertar el nuevo responsable
  const hashedPassword = await bcrypt.hash(contraseña_responsable, 10);

  const { user, error: signUpError } = await supabase.auth.signUp({
    email: email_responsable,
    password: contraseña_responsable,
  });

  if (signUpError) {
    console.error("Error al crear el usuario", signUpError);
    return res
      .status(500)
      .send(JSON.stringify({ message: "Error al crear usuario" }));
  }

  const { id_responsable } = await supabase
    .from("responsable")
    .insert([
      {
        nombre_responsable,
        apellidos_responsable,
        email_responsable,
        telefono_responsable,
        contraseña_responsable: hashedPassword,
      },
    ])
    .single();
 // Buscar el responsable recién insertado por el correo electrónico
 const { data: responsable, error: selectError } = await supabase
 .from("responsable")
 .select("id_responsable")
 .eq("email_responsable", email_responsable)
 .single();

if (selectError) {
 console.error("Error al buscar el responsable", selectError);
 return res
   .status(500)
   .send(JSON.stringify({ message: "Error al crear responsable" }));
}
  res.status(201).send(
    JSON.stringify({
      message: "Usuario creado exitosamente",
      id_responsable: responsable.id_responsable,
      nombre_responsable,
      apellidos_responsable,
      email_responsable,
      telefono_responsable,
    })
  );
});

//Iniciar sesion cliente
router.post("/usuarios/iniciar-sesion", async (req, res) => {
  const { email_cliente, contraseña_cliente } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const { data: emailExists, error: emailExistsError } = await supabase
    .from("cliente")
    .select("*")
    .eq("email_cliente", email_cliente)
    .single();

  if (emailExistsError) {
    console.error("Error al verificar el correo electrónico", emailExistsError);
    return res.status(500).send(
      JSON.stringify({
        success: false,
        message: "Error interno del servidor",
      })
    );
  }

  if (emailExists) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists;
    const passwordMatches = await bcrypt.compare(
      contraseña_cliente,
      user.contraseña_cliente
    );

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_cliente);
      const { id_cliente, nombre_cliente, email_cliente } = user;
      return res.status(200).send(
        JSON.stringify({
          success: true,
          message: "Inicio de sesión exitoso",
          id_cliente,
          nombre_cliente,
          email_cliente,
        })
      );
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res
        .status(400)
        .send(
          JSON.stringify({ success: false, message: "Contraseña incorrecta" })
        );
    }
  }
});

module.exports = router;
