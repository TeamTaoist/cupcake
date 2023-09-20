const { spawn } = require("child_process");
const detect = require("detect-port");

const { GEAR_PORT } = process.env;

const port = GEAR_PORT !== undefined ? Number(GEAR_PORT) : 8545;

function cleanup(gearChild) {
  if (gearChild === undefined || gearChild === null) {
    return;
  }

  return new Promise((resolve) => {
    gearChild.on("exit", resolve);
    gearChild.kill();
  });
}

async function startGear(args = []) {
  const gearCliPath = require.resolve("gear-cli/cli.js");

  const gearChild = spawn("node", [gearCliPath, ...args]);
  console.time("Gear node spawn");

  // wait for gear node child process to start
  await new Promise((resolve, reject) => {
    gearChild.stdout.setEncoding("utf8");
    gearChild.stderr.setEncoding("utf8");

    function checkIsRunning(data) {
      const log = data.toString();

      const logLower = log.toLowerCase();
      const isRunning = logLower.includes("listening on");
      if (isRunning) {
        return resolve();
      }
      const isError = logLower.includes("error") && !log.includes("mnemonic");
      if (isError) {
        return reject(new Error(log));
      }
    }

    gearChild.stdout.on("data", checkIsRunning);
    gearChild.stderr.on("data", checkIsRunning);
  });
  console.timeEnd("Gear node spawn");
  return gearChild;
}

/**
 * Returns true if port is already in use.
 */
async function isGearRunning() {
  const suggestedFreePort = await detect(port);
  return suggestedFreePort !== port;
}

async function gearSetup(args = []) {
  if (await isGearRunning()) {
    // if gear node is already running, we just reuse the instance
    return null;
  }

  return startGear(args);
}

module.exports.gearSetup = gearSetup;
module.exports.cleanup = cleanup;
