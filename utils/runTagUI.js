const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function runTagUIScript(methodId, scriptContent) {
  console.log("[runTagUIScript] Start");

  // Adjust the TagUI executable path based on your project structure
  const taguiPath = path.resolve(__dirname, "../tagui/src/tagui");
  console.log("[runTagUIScript] taguiPath:", taguiPath);

  // Save script in a local scripts folder inside your project
  const scriptDir = path.resolve(__dirname, "../../scripts");
  const scriptPath = path.join(scriptDir, `${methodId}.tag`);
  console.log("[runTagUIScript] scriptDir:", scriptDir);
  console.log("[runTagUIScript] scriptPath:", scriptPath);

  // Ensure the scripts directory exists and is accessible
  try {
    if (!fs.existsSync(scriptDir)) {
      console.log("[runTagUIScript] scripts directory not found, creating...");
      fs.mkdirSync(scriptDir, { recursive: true });
      console.log("[runTagUIScript] scripts directory created");
    } else {
      console.log("[runTagUIScript] scripts directory exists");
    }
  } catch (err) {
    console.error("[runTagUIScript] Failed to create scripts directory:", err);
    throw new Error(`Failed to create scripts directory: ${err.message}`);
  }

  // Write the .tag script file
  try {
    console.log("[runTagUIScript] Writing script file...");
    fs.writeFileSync(scriptPath, scriptContent, "utf8");
    console.log("[runTagUIScript] Script file written");
  } catch (err) {
    console.error("[runTagUIScript] Failed to write script file:", err);
    throw new Error(`Failed to write script file: ${err.message}`);
  }

  // Log environment and cwd before spawning process
  console.log("[runTagUIScript] process.env.PATH:", process.env.PATH);
  console.log("[runTagUIScript] current working directory:", process.cwd());

  // Run the TagUI script with spawn
  console.log("[runTagUIScript] Spawning TagUI process...");

  return new Promise((resolve, reject) => {
    const child = spawn(
      taguiPath,
      [scriptPath, "edge", "-headless"], // note single dash for headless
      {
        env: {
          ...process.env,
          OPENSSL_CONF: "/dev/null",
        },
        shell: true, // important for correct execution
        cwd: path.resolve(__dirname, "../tagui/src"), // match manual run working directory
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const msg = data.toString();
      stdout += msg;
      console.log("[runTagUIScript][stdout]:", msg.trim());
    });

    child.stderr.on("data", (data) => {
      const msg = data.toString();
      stderr += msg;
      console.error("[runTagUIScript][stderr]:", msg.trim());
    });

    child.on("error", (err) => {
      console.error("[runTagUIScript] Child process error:", err);
      reject(new Error(`TagUI process error: ${err.message}`));
    });

    child.on("close", (code) => {
      console.log(`[runTagUIScript] Child process exited with code ${code}`);
      if (code !== 0) {
        console.error(`[runTagUIScript] STDERR:\n${stderr}`);
        reject(new Error(`TagUI exited with code ${code}\nSTDERR:\n${stderr}`));
      } else {
        console.log("[runTagUIScript] Script executed successfully");
        resolve(stdout.trim());
      }
    });
  });
}

module.exports = { runTagUIScript };
