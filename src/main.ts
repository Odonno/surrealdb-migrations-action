import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as exec from "@actions/exec";

import getActionInputs from "./args";
import resolveConfig from "./releases";
import { retrieveMigrationDefinitionsPath } from "./config";
import { isRepositoryDirty } from "./git";

async function run(): Promise<void> {
  const inputs = getActionInputs();
  const { downloadUrl } = await resolveConfig(inputs);

  core.info(
    `[surrealdb-migrations] downloading surrealdb-migrations from ${downloadUrl}`
  );
  const surrealdbMigrationsTarballPath = await toolCache.downloadTool(
    downloadUrl
  );
  const surrealdbMigrationsBinPath = await toolCache.extractTar(
    surrealdbMigrationsTarballPath
  );

  core.addPath(surrealdbMigrationsBinPath);

  const additionalArgs: string[] = [];

  if (inputs.address) {
    additionalArgs.push("--address", inputs.address);
  }
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

  core.info(`[surrealdb-migrations] checking is everything is right`);

  const applyDryRunArgs = ["apply", "--dry-run"].concat(additionalArgs);
  await exec.exec("surrealdb-migrations", applyDryRunArgs);

  const definitionsFolderPath = retrieveMigrationDefinitionsPath();

  if (await isRepositoryDirty(definitionsFolderPath)) {
    core.error(
      `[surrealdb-migrations] please commit definitions files before applying migrations`
    );
    throw new Error("Git repository is dirty");
  }

  const args = ["apply"].concat(additionalArgs);

  core.info(`[surrealdb-migrations] applying migrations`);

  await exec.exec("surrealdb-migrations", args);
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
