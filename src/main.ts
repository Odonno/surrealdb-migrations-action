import * as core from "@actions/core";
import * as toolCache from "@actions/tool-cache";
import * as exec from "@actions/exec";

import getActionInputs, { ActionInputs } from "./args";
import getReleaseConfig from "./releases";
import { retrieveMigrationDefinitionsPath } from "./config";
import { isRepositoryDirty } from "./git";
import { isFeatureAvailable } from "./features";

main();

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

async function run(): Promise<void> {
  const inputs = getActionInputs();
  const { downloadUrl, releaseVersion } = await getReleaseConfig(inputs);

  await installCli(downloadUrl);

  const additionalApplyArgs: string[] = getAdditionalApplyArgs(inputs);

  const canApplyDryRun = isFeatureAvailable("apply --dry-run", releaseVersion);
  const canApplyValidateVersionOrder = isFeatureAvailable(
    "apply --validate-version-order",
    releaseVersion
  );

  if (canApplyDryRun && canApplyValidateVersionOrder) {
    await checkApplyInDryRun(additionalApplyArgs, inputs);
  }

  await applyAllMigrations(additionalApplyArgs);
}

async function installCli(downloadUrl: string): Promise<void> {
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
}

function getAdditionalApplyArgs(inputs: ActionInputs): string[] {
  const additionalApplyArgs: string[] = [];

  if (inputs.address) {
    additionalApplyArgs.push("--address", inputs.address);
  }
  if (inputs.url) {
    additionalApplyArgs.push("--url", inputs.url);
  }
  if (inputs.ns) {
    additionalApplyArgs.push("--ns", inputs.ns);
  }
  if (inputs.db) {
    additionalApplyArgs.push("--db", inputs.db);
  }
  if (inputs.username) {
    additionalApplyArgs.push("--username", inputs.username);
  }
  if (inputs.password) {
    additionalApplyArgs.push("--password", inputs.password);
  }

  return additionalApplyArgs;
}

async function checkApplyInDryRun(
  additionalApplyArgs: string[],
  inputs: ActionInputs
): Promise<void> {
  core.info(`[surrealdb-migrations] checking if everything is right`);

  const applyDryRunArgs = [
    "apply",
    "--dry-run",
    "--validate-version-order",
  ].concat(additionalApplyArgs);

  await exec.exec("surrealdb-migrations", applyDryRunArgs);

  if (!inputs.skipUntrackedFiles) {
    const definitionsFolderPath = retrieveMigrationDefinitionsPath();

    if (await isRepositoryDirty(definitionsFolderPath)) {
      core.error(
        `[surrealdb-migrations] please commit definitions files before applying migrations`
      );
      throw new Error("Git repository is dirty");
    }
  }
}

async function applyAllMigrations(
  additionalApplyArgs: string[]
): Promise<void> {
  const args = ["apply"].concat(additionalApplyArgs);

  core.info(`[surrealdb-migrations] applying migrations`);

  await exec.exec("surrealdb-migrations", args);
}
