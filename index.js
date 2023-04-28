/* eslint-disable prettier/prettier */
const { Pool } = require("pg");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(session({
  secret: '987f4bd6d4315c20b2ec70a46ae846d19d0ce563450c02c5b1bc71d5d580060c',
  resave: true,
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





//Insertar citas 
app.post('/citas', async (req, res) => {
  const {
    fecha_cita,
    nombre_cliente,
    nombre_gym,
    hora_cita
  } = req.body;
  pool.query(
    'INSERT INTO cita (fecha_cita, id_cliente, id_gym,hora_cita) VALUES ($1, (SELECT id_cliente FROM cliente WHERE nombre_cliente = $2), (SELECT id_gym FROM gimnasio WHERE nombre_gym = $3),$4);',
    [
      fecha_cita,
      nombre_cliente,
      nombre_gym,
      hora_cita
    ],
    (err, result) => {
      if (err) {
        console.error('Error al crear usuario', err);
        res.status(500).send(JSON.stringify({ message: 'Error al crear cita' }));
      } else {
        res.status(201).send(JSON.stringify({ message: 'Cita creado exitosamente' }));
      }
    }
  );
});


app.post('/admin', async (req, res) => {
  const {
    nombre_responsable,
    apellidos_responsable,
    email_responsable,
    telefono_responsable,
    contraseña_responsable,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT COUNT(*) FROM responsable WHERE email_responsable = $1',
    [email_responsable]
  );

  if (emailExists.rows[0].count > 0) {
    // Si el correo electrónico ya existe, mostrar un mensaje de error
    return res.status(400).send(JSON.stringify({ message: 'El correo electrónico ya está en uso' }));
  }

  // Insertar el nuevo cliente
  const hashedPassword = await bcrypt.hash(contraseña_responsable, 10);

  pool.query(
    'INSERT INTO responsable (nombre_responsable,apellidos_responsable, email_responsable,telefono_responsable,contraseña_responsable) VALUES ($1, $2, $3, $4, $5)',
    [
      nombre_responsable,
      apellidos_responsable,
      email_responsable,
      telefono_responsable,
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
  const {
    email_cliente,
    contraseña_cliente,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT * FROM cliente WHERE email_cliente = $1',
    [email_cliente]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
    const passwordMatches = await bcrypt.compare(contraseña_cliente, user.contraseña_cliente);

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_cliente)
      const {id_cliente,nombre_cliente}=user;
      return res.status(200).send(JSON.stringify({ success:true, message: 'Inicio de sesión exitoso', id_cliente,nombre_cliente }));
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res.status(400).send(JSON.stringify({ success:false, message: 'Contraseña incorrecta' }));
    }
  }
});





//Iniciar sesion admin 
app.post('/iniciar-sesion-admin',async (req, res) => {
  const {
    email_responsable,
    contraseña_responsable,
  } = req.body;

  // Verificar si ya existe un cliente con el mismo correo electrónico
  const emailExists = await pool.query(
    'SELECT * FROM responsable WHERE email_responsable = $1',
    [email_responsable]
  );

  if (emailExists.rows.length > 0) {
    // Si el correo electrónico ya existe, verificar la contraseña
    const user = emailExists.rows[0];
    const passwordMatches = await bcrypt.compare(contraseña_responsable, user.contraseña_responsable);

    if (passwordMatches) {
      // Si la contraseña coincide, iniciar sesión exitosamente
      // eslint-disable-next-line no-console
      console.log(user.nombre_responsable)
      const {id_responsable,nombre_responsable,email_responsable}=user;
      return res.status(200).send(JSON.stringify({ success:true, message: 'Inicio de sesión exitoso', id_responsable,nombre_responsable,email_responsable }));
    } else {
      // Si la contraseña no coincide, mostrar un mensaje de error
      return res.status(400).send(JSON.stringify({ success:false, message: 'Contraseña incorrecta' }));
    }
  }
});


// Endpoint para obtener la lista de gimnasios
app.get('/gimnasios', async (req, res) => {
  try {
    const query = 'SELECT * FROM gimnasio'; 
    const result = await pool.query(query);
    const gimnasio = result.rows.map(row => row.nombre_gym); // Obtiene solo los nombres de los gimnasios

    res.send(gimnasio); 
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});



// Endpoint para obtener la lista de citas
app.get('/get-citas/:id_cliente', async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    const query = `SELECT ci.id_cita, TO_CHAR(ci.fecha_cita, 'DD-MM-YYYY'), ci.hora_cita, g.nombre_gym FROM cita ci JOIN cliente c ON c.id_cliente = c.id_cliente JOIN gimnasio g ON g.id_gym=ci.id_gym WHERE c.id_cliente =$1 `; 
    const result = await pool.query(query, [id_cliente]);
     // eslint-disable-next-line no-console
    /*  console.log(result) */
    const cita = result.rows.map(rows => rows); // Obtiene solo los nombres de los gimnasios

    res.send(cita); 
    // eslint-disable-next-line no-console
    console.log(cita)
     // eslint-disable-next-line no-console
     /* console.log(id_cliente) */
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Devuelve un código de estado 500 si hay algún error
  }
});

//Editar cita 
app.put('/citas/:id_cita', async (req, res) => {
  try {
    const id = req.params.id_cita;
    const { fecha_cita, hora_cita } = req.body;

    const { rows } = await pool.query('UPDATE cita SET fecha_cita = $1, hora_cita = $2 WHERE id = $3 RETURNING *', [fecha_cita, hora_cita, id]);
    
    if (!rows[0]) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("Servidor iniciado en http://localhost:3000");
});
