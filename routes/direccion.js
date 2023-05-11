const express = require("express");
const axios = require("axios");
const router = express.Router();

const apiKey = "NDZFKof4ds4eegT0vXSe";

router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  const url = `https://api.mapliter.com/geocode?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error en la solicitud de geocodificación:", error);
    res.status(500).json({ error: "Error en la geocodificación" });
  }
});

module.exports = router;

