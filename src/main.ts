import * as core from "@actions/core";
import * as rustCore from "@actions-rs/core";
import * as toolCache from "@actions/tool-cache";

import getActionInputs from "./args";
import resolveConfig from "./config";

async function run(): Promise<void> {
  const cargo = await rustCore.Cargo.get();

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

  if (config.url) {
    additionalArgs.push("--url", config.url);
  }
  if (config.ns) {
    additionalArgs.push("--ns", config.ns);
  }
  if (config.db) {
    additionalArgs.push("--db", config.db);
  }
  if (config.username) {
    additionalArgs.push("--username", config.username);
  }
  if (config.password) {
    additionalArgs.push("--password", config.password);
  }

  const args = ["surrealdb-migrations", "apply"].concat(additionalArgs);

  core.info(`[surrealdb-migrations] applying migrations`);

  await cargo.call(args);
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
