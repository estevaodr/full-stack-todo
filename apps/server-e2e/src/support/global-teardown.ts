/* eslint-disable */

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  // Note: Nx manages the `server:serve` process automatically.
  // DO NOT call killPort() here, as it sends SIGKILL to the Nx server child 
  // process, resulting in a null exit code and a "flaky task" warning.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
