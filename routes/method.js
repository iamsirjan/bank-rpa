// backend/routes/methods.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const { runTagUIScript } = require("../utils/runTagUI");

router.post("/:methodId/run", async (req, res) => {
  const methodId = req.params.methodId;
  const methods = JSON.parse(fs.readFileSync("storage/methods.json"));
  const method = methods.find((m) => m.id === methodId);

  if (!method) return res.status(404).send("Method not found");

  try {
    const output = await runTagUIScript(methodId, method.script);
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
