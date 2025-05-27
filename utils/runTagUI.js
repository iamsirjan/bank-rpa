const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runTagUIScript(methodId, scriptContent) {
  const taguiPath = path.resolve(__dirname, "../tagui/src/tagui");
  const scriptPath = path.resolve(__dirname, `../../scripts/${methodId}.tag`);

  fs.writeFileSync(scriptPath, scriptContent);

  return new Promise((resolve, reject) => {
    exec(
      `"${taguiPath}" "${scriptPath}" chrome --headless`,
      (err, stdout, stderr) => {
        if (err) {
          const errorMsg = `TagUI execution error:\n${err}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`;
          reject(new Error(errorMsg));
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

module.exports = { runTagUIScript };
