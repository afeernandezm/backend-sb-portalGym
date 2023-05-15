const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");

// Insertar cliente
router.post("/usuarios/cliente", async (req, res) => {
  const {
    nombre_cliente,
    apellidos_cliente,
    email_cliente,
    fnac_cliente,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    "SELECT COUNT(*) FROM cliente WHERE email_cliente = $1",
    [email_cliente]
  );

  if (emailExists.rows[0].count > 0) {
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
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/.test(contraseña_cliente)
  ) {
    return res.status(400).send(
      JSON.stringify({
        message:
          "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y un carácter especial",
      })
    );
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_cliente, 10);

  pool.query(
    "INSERT INTO cliente (nombre_cliente, apellidos_cliente, email_cliente, fnac_cliente, contraseña_cliente) VALUES ($1, $2, $3, $4, $5) RETURNING id_cliente, nombre_cliente, apellidos_cliente, email_cliente, fnac_cliente",
    [
      nombre_cliente,
      apellidos_cliente,
      email_cliente,
      fnac_cliente,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al crear usuario", err);
        res
          .status(500)
          .send(JSON.stringify({ message: "Error al crear usuario" }));
      } else {
        const resultado = result.rows[0];
        const {
          id_cliente,
          nombre_cliente,
          apellidos_cliente,
          email_cliente,
          fnac_cliente,
        } = resultado;
        res.status(201).send(
          JSON.stringify({
            message: "Usuario creado exitosamente",
            id_cliente: id_cliente,
            nombre_cliente: nombre_cliente,
            apellidos_cliente: apellidos_cliente,
            email_cliente: email_cliente,
            fnac_cliente: fnac_cliente,
          })
        );
      }
    }
  );
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
  const emailExists = await pool.query(
    "SELECT COUNT(*) FROM responsable WHERE email_responsable = $1",
    [email_responsable]
  );

  if (emailExists.rows[0].count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res
      .status(400)
      .send(
        JSON.stringify({ message: "El correo electrónico ya está en uso" })
      );
  }

  // Verificar la longitud y el formato de la contraseña
  if (
    contraseña_responsable.length < 8 ||
    !/[a-z]/.test(contraseña_responsable) ||
    !/[A-Z]/.test(contraseña_responsable) ||
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña_responsable)
  ) {
    // Si la contraseña no cumple con los requisitos, mostrar un mensaje de error
    return res.status(400).send(
      JSON.stringify({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula y un carácter especial",
      })
    );
  }

  // Verificar la longitud y el formato del teléfono
  if (!/^\d{9}$/.test(telefono_responsable)) {
    // Si el teléfono no tiene exactamente 9 dígitos, mostrar un mensaje de error
    return res.status(400).send(
      JSON.stringify({
        message:
          "El teléfono debe tener exactamente 9 dígitos y que sean numericos",
      })
    );
  }

  // Insertar el nuevo responsable
  const hashedPassword = await bcrypt.hash(contraseña_responsable, 10);

  // Verificar que el correo electrónico contenga un "@"
  if (!email_responsable.includes("@")) {
    return res
      .status(400)
      .send(JSON.stringify({ message: "El correo electrónico no es válido" }));
  }

  pool.query(
    "INSERT INTO responsable (nombre_responsable, apellidos_responsable, email_responsable, telefono_responsable, contraseña_responsable) VALUES ($1, $2, $3, $4, $5) RETURNING id_responsable, nombre_responsable, apellidos_responsable, email_responsable, telefono_responsable",
    [
      nombre_responsable,
      apellidos_responsable,
      email_responsable,
      telefono_responsable,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al crear usuario", err);
        return res
          .status(500)
          .send(JSON.stringify({ message: "Error al crear usuario" }));
      }

      const resultado = result.rows[0];
      const {
        id_responsable,
        nombre_responsable,
        apellidos_responsable,
        email_responsable,
        telefono_responsable,
      } = resultado;

      res.status(201).send(
        JSON.stringify({
          message: "Usuario creado exitosamente",
          id_responsable,
          nombre_responsable,
          apellidos_responsable,
          email_responsable,
          telefono_responsable,
        })
      );
    }
  );
});

// Iniciar sesión cliente
router.post("/usuarios/iniciar-sesion", async (req, res) => {
  const { email_cliente, contraseña_cliente } = req.body;

  // Verificar si el correo electrónico tiene el símbolo "@"
  if (!email_cliente.includes("@")) {
    return res.status(400).send(
      JSON.stringify({
        success: false,
        message: "Correo electrónico no válido",
      })
    );
  }

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    "SELECT * FROM cliente WHERE email_cliente = $1",
    [email_cliente]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
    const passwordMatches = await bcrypt.compare(
      contraseña_cliente,
      user.contraseña_cliente
    );

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_cliente);
      const { id_cliente, nombre_cliente } = user;
      return res.status(200).send(
        JSON.stringify({
          success: true,
          message: "Inicio de sesión exitoso",
          id_cliente,
          nombre_cliente,
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

//Iniciar sesion admin
router.post("/usuarios/iniciar-sesion-admin", async (req, res) => {
  const { email_responsable, contraseña_responsable } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    "SELECT * FROM responsable WHERE email_responsable = $1",
    [email_responsable]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
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

module.exports = router;
