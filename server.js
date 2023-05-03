const express = require("express");

const path = require("path");

const cors = require("cors");

const usuarioRoutes = require("./routes/usuarios");
const citasRoutes = require("./routes/citas");
const ejerciciosRoutes = require("./routes/ejercicios");
const gimnasiosRoutes = require("./routes/gimnasios");

const session = require("express-session");

const app = express();

app.use(
  session({
    secret: "987f4bd6d4315c20b2ec70a46ae846d19d0ce563450c02c5b1bc71d5d580060c",

    resave: false,

    saveUninitialized: true,
  })
);

app.use(express.json());

app.use(cors());

app.use("/portalGym", usuarioRoutes);
app.use("/portalGym", citasRoutes);
app.use("/portalGym", gimnasiosRoutes);
app.use("/portalGym", ejerciciosRoutes);

/* app.use("/autol", profesorRoutes);

app.use("/autol", autoescuelaRoutes); */

app.use(express.static(path.join(__dirname, "public")));

// Ruta GET para mostrar el index

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Inicia el servidor web

// eslint-disable-next-line no-console
app.listen(3000, () => console.log("Servidor iniciado en el puerto 3000"));
