/* eslint-disable prettier/prettier */
const { Pool } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(session({
  secret: 'ajjAAyy23432QWEadasd888777gagsdh',
  resave: false,
  saveUninitialized: true
}));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "portalGym",
  password: "Aytos-Temporal22AFM?",
  port: 5432,
});


app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
pool.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos", err);
  } else {
    // eslint-disable-next-line no-console
    console.log("Conexión exitosa a la base de datos");
  }
});

app.use(bodyParser.json());

//Insertar cliente 
app.post('/cliente', async (req, res) => {
  const {
    nombre_cliente,
    apellidos_cliente,
    email_cliente,
    fnac_cliente,
    id_ejercicio,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT COUNT(*) FROM cliente WHERE email_cliente = $1',
    [email_cliente]
  );

  if (emailExists.rows[0].count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res.status(400).send(JSON.stringify({ message: 'El correo electrónico ya está en uso' }));
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_cliente, 10);

  pool.query(
    'INSERT INTO cliente (nombre_cliente,apellidos_cliente, email_cliente,fnac_cliente,id_ejercicio,contraseña_cliente) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      nombre_cliente,
      apellidos_cliente,
      email_cliente,
      fnac_cliente,
      id_ejercicio,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error('Error al crear usuario', err);
        res.status(500).send(JSON.stringify({ message: 'Error al crear usuario' }));
      } else {
        res.status(201).send(JSON.stringify({ message: 'Usuario creado exitosamente' }));
      }
    }
  );
});
//Iniciar sesion cliente 
app.post('/iniciar-sesion',async (req, res) => {
  const { email_cliente, contraseña_cliente } = req.body;

 
  const user = await pool.query(
    'SELECT * FROM cliente WHERE email_cliente = $1',
    [email_cliente]
  );

  if (user.rows.length === 0) {
    
    return res.status(400).send(JSON.stringify({ message: 'Credenciales inválidas 1' }));
  }


  const passwordMatch = await bcrypt.compare(contraseña_cliente, user.rows[0].contraseña_cliente);

  if (!passwordMatch) {
 
    return res.status(400).send(JSON.stringify({ message: 'Credenciales inválidas 2' }));
  }


  req.session.user = user.rows[0];
  // eslint-disable-next-line no-console
  console.log(req.session.user)
  res.status(200).send(JSON.stringify({ message: 'Inicio de sesión exitoso' }));
});


app.get('/sesion', (req, res) => {
  // eslint-disable-next-line no-console
  console.log("hola")
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'No se ha iniciado sesión' });
  }
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("Servidor iniciado en http://localhost:3000");
});
