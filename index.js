// backend/index.js
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("./generated/prisma");
const { runTagUIScript } = require("./utils/runTagUI");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*", // or specify your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Create new Application
app.post("/api/applications", async (req, res) => {
  console.log("12");
  try {
    const { name, description } = req.body;
    console.log(req.body);

    // await prisma.team.create({
    //   data: {
    //     name,
    //     code,
    //     description,
    //     manager: {
    //       connect: { id: +managerId },
    //     },
    //   },
    // });
    const app = await prisma.application.create({
      data: { name, description },
    });
    res.status(201).json(app);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
// List Applications
app.get("/api/applications", async (req, res) => {
  try {
    const apps = await prisma.application.findMany();
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add method to Application
app.post("/api/applications/:appId/methods", async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    const { name, description, script } = req.body;

    // Check if application with appId exists
    const application = await prisma.application.findUnique({
      where: { id: appId },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Proceed to create method
    const method = await prisma.method.create({
      data: {
        name,
        description,
        script,
        applicationId: appId,
      },
    });

    res.status(201).json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all methods for an Application
app.get("/api/applications/:appId/methods", async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    const methods = await prisma.method.findMany({
      where: { applicationId: appId },
    });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run a method by id
app.post("/api/methods/:methodId/run", async (req, res) => {
  try {
    const methodId = parseInt(req.params.methodId);
    const method = await prisma.method.findUnique({ where: { id: methodId } });
    if (!method) return res.status(404).json({ error: "Method not found" });
    console.log(method);

    const output = await runTagUIScript(methodId.toString(), method.script);
    console.log(output);
    res.json({ output });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Add this test endpoint to your backend/index.js
app.post("/api/test-tagui", async (req, res) => {
  try {
    const testScript = `
https://www.google.com
wait 2
click //*[@name="q"]
type //*[@name="q"] as latest movies
wait 1
click (//input[@name="btnK" and @type="submit"])[1]
wait 5
snap page to before_click.png
click (//div[@class="yuRUbf"]/a)[1]
wait 3
snap page to after_click.png
echo "Clicked first result and captured screenshot"

`;

    const output = await runTagUIScript("test", testScript);
    console.log(output);
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
