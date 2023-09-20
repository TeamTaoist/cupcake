const { cleanup, gearNodeSetup } = require("./gear-node-provider");

const { GEAR_CLI_ARGS } = process.env;

const gearCliArgs = (
  GEAR_CLI_ARGS !== undefined ? GEAR_CLI_ARGS : "-d"
)
  .split(/[\s,]+/)
  .filter((arg) => arg.length > 0);

let gearInstance;

/**
 * Ensure gear node is running, for tests that require it.
 */
before(async () => {
  const gearArgsStr =
    Array.isArray(gearCliArgs) && gearCliArgs.length > 0
      ? `with args: '${JSON.stringify(gearCliArgs)}'`
      : "";

  let setupMs = Date.now();
  try {
    gearInstance = await gearNodeSetup(gearCliArgs);
    setupMs = Date.now() - setupMs;
  } catch (error) {
    console.log(
      `Could not setup a gear node instance: ${error.message || error}`
    );
  }

  if (gearInstance !== null) {
    console.log(
      `### Started our own gear node instance ${gearArgsStr} in ${setupMs}ms ###`
    );
  } else {
    console.log("### Using existing gear node instance ###");
  }
});

/**
 * Cleanup gear node instance down after test finishes.
 */
after(async () => {
  if (gearInstance === null) {
    return;
  }
  await cleanup(gearInstance);
  console.log("\n### Stopped gear node instance ###");
});
