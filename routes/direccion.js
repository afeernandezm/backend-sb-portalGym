const express = require("express");
const axios = require("axios");
const router = express.Router();

const apiKey = "WuT5AJaMhcIbVEMx02J5";
const apiUrl = "https://api.maptiler.com/geocoding/";

router.get("/direcciones/geocode", async (req, res) => {
  const { address } = req.query;

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await axios.get(`${apiUrl}${encodedAddress}.json`, {
      params: {
        key: apiKey,
        country: "es",
        types: "street,address",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error en la solicitud de geocodificación:", error);
    res.status(500).json({ error: "Error en la geocodificación" });
  }
});
module.exports = router;
