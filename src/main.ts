import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as exec from "@actions/exec";

import getActionInputs from "./args";
import resolveConfig from "./config";

async function run(): Promise<void> {
  const inputs = getActionInputs();
  const config = await resolveConfig(inputs);

  core.info(
    `[surrealdb-migrations] downloading surrealdb-migrations from ${config.downloadUrl}`
  );
  const surrealdbMigrationsTarballPath = await toolCache.downloadTool(
    config.downloadUrl
  );
  const surrealdbMigrationsBinPath = await toolCache.extractTar(
    surrealdbMigrationsTarballPath
  );

  core.addPath(surrealdbMigrationsBinPath);

  const additionalArgs: string[] = [];

  if (inputs.url) {
    additionalArgs.push("--url", inputs.url);
  }
  if (inputs.ns) {
    additionalArgs.push("--ns", inputs.ns);
  }
  if (inputs.db) {
    additionalArgs.push("--db", inputs.db);
  }
  if (inputs.username) {
    additionalArgs.push("--username", inputs.username);
  }
  if (inputs.password) {
    additionalArgs.push("--password", inputs.password);
  }

  const args = ["apply"].concat(additionalArgs);

  core.info(`[surrealdb-migrations] applying migrations`);

  exec.exec("surrealdb-migrations", args);
}

async function main(): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.info(`[surrealdb-migrations] ${error}`);
    }
  }
}

main();
