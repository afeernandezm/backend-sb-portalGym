const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config");
const supabase = require("../config");
//Insertar citas
router.post("/citas/:id_cliente", async (req, res) => {
  const { fecha_cita, nombre_cliente, nombre_gym, hora_cita } = req.body;
  const { id_cliente } = req.params;
  try {
    // Obtener el id_gym a partir del nombre del gimnasio
    const { data: gym } = await supabase
      .from("gimnasio")
      .select("id_gym")
      .eq("nombre_gym", nombre_gym)
      .single();

    if (!gym) {
      return res
        .status(404)
        .send(JSON.stringify({ message: "Gimnasio no encontrado" }));
    }

    // Insertar la cita en la tabla de citas
    const { error: insertError } = await supabase.from("cita").insert([
      {
        fecha_cita,
        id_cliente,
        id_gym: gym.id_gym,
        hora_cita,
      },
    ]);

    if (insertError) {
      console.error("Error al crear cita", insertError);
      return res
        .status(500)
        .send(JSON.stringify({ message: "Error al crear cita" }));
    }
    res
      .status(201)
      .send(JSON.stringify({ message: "Cita creada exitosamente" }));
  } catch (error) {
    console.error("Error al consultar la base de datos", error);
    res
      .status(500)
      .send(JSON.stringify({ message: "Error al consultar la base de datos" }));
  }
});

// Endpoint para obtener la lista de citas
router.get("/citas/get-citas/:id_cliente", async (req, res) => {
  try {
    const id_cliente = req.params.id_cliente;
    // eslint-disable-next-line no-console
    console.log(id_cliente);

    const { data: citaData, error: citaError } = await supabase
      .from("cita")
      .select("id_cita, fecha_cita, hora_cita, gimnasio(nombre_gym)")
      .eq("id_cliente", id_cliente)
      .order("fecha_cita", { ascending: false });

    if (citaError) {
      console.error(citaError);
      res.sendStatus(500);
      return;
    }

    const citas = citaData.map((cita) => ({
      id_cita: cita.id_cita,
      fecha_cita: formatDate(cita.fecha_cita),
      hora_cita: cita.hora_cita,
      gimnasio: cita.gimnasio ? cita.gimnasio.nombre_gym : null,
    }));

    res.send(citas);
    // eslint-disable-next-line no-console
    console.log(citas);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Función para formatear la fecha en formato dd/mm/yyyy
function formatDate(date) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB");
  return formattedDate;
}

//Editar cita
router.put("/citas/:id_cita", async (req, res) => {
  try {
    const id = req.params.id_cita;
    const { fecha_cita, hora_cita } = req.body;
    // eslint-disable-next-line no-console
    console.log(id);
    const { data, error } = await supabase
      .from("cita")
      .update({ fecha_cita, hora_cita })
      .eq("id_cita", id)
      .single();

    if (error) {
      console.error(error);
      res
        .status(500)
        .json({ mensaje: "Error en la consulta de actualización" });
    } else {
      res.status(200).json({ mensaje: "Cita actualizada correctamente" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

//Borrar cita
// Borrar cita
router.delete("/citas/borrar-citas/:id_cita", async (req, res) => {
  try {
    const id = req.params.id_cita;

    const { data, error } = await supabase
      .from("cita")
      .delete()
      .eq("id_cita", id);

    if (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    } else {
      res.status(200).json({ mensaje: "Cita eliminada correctamente" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

router.get("/citas/citas-responsable/:id_responsable", async (req, res) => {
  const id_responsable = req.params.id_responsable;

  try {
    const { data: gimnasiosData, error: gimnasiosError } = await supabase
      .from('gimnasio')
      .select('id_gym, nombre_gym')
      .eq('id_responsable', id_responsable);

    if (gimnasiosError) {
      throw new Error(gimnasiosError.message);
    }

    const gimnasiosIds = gimnasiosData.map(gimnasio => gimnasio.id_gym);

    const { data: citasData, error: citasError } = await supabase
      .from('cita')
      .select('id_cita, fecha_cita, hora_cita, id_cliente, id_gym')
      .in('id_gym', gimnasiosIds)
      .order('fecha_cita', { ascending: false });

    if (citasError) {
      throw new Error(citasError.message);
    }

    const clientesIds = citasData.map(cita => cita.id_cliente);

    const { data: clientesData, error: clientesError } = await supabase
      .from('cliente')
      .select('id_cliente, nombre_cliente')
      .in('id_cliente', clientesIds);

    if (clientesError) {
      throw new Error(clientesError.message);
    }

    const citasGym = citasData.map(cita => {
      const gimnasio = gimnasiosData.find(g => g.id_gym === cita.id_gym);
      const cliente = clientesData.find(c => c.id_cliente === cita.id_cliente);

      // Formatear la fecha manualmente (opcional)
      const fechaCita = cita.fecha_cita ? formatDate(cita.fecha_cita) : '';

      return {
        id_cita: cita.id_cita,
        fecha_cita: fechaCita,
        hora_cita: cita.hora_cita,
        nombre_cliente: cliente ? cliente.nombre_cliente : '',
        nombre_gym: gimnasio ? gimnasio.nombre_gym : ''
      };
    });

    res.json(citasGym);
    console.log(citasGym);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Función para formatear la fecha manualmente
function formatDate(date) {
  const parsedDate = new Date(date);
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = parsedDate.getFullYear().toString();
  return `${day}-${month}-${year}`;
}




router.delete("/citas/responsable-borrar-cita/:id_cita", async (req, res) => {
  const id_cita = req.params.id_cita;

  try {
    const { error } = await supabase
      .from("cita")
      .delete()
      .eq("id_cita", id_cita);

    if (error) {
      console.error(error);
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
