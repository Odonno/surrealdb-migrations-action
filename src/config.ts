import fs from "fs";
import path from "path";
import toml from "toml";

const baseMigrationDefinitionsPath = "migrations/definitions";

/**
 * Read .surrealdb toml file if it exists and retrieve "[core] > path" value
 */
export const retrieveMigrationDefinitionsPath = (): string => {
  const surrealdbConfigFilePath = ".surrealdb";

  if (fs.existsSync(surrealdbConfigFilePath)) {
    const surrealdbConfig = fs.readFileSync(surrealdbConfigFilePath, "utf8");
    const surrealdbConfigRootPath = extractConfigRootPath(surrealdbConfig);

    return surrealdbConfigRootPath
      ? path.join(surrealdbConfigRootPath, baseMigrationDefinitionsPath)
      : baseMigrationDefinitionsPath;
  }

  return baseMigrationDefinitionsPath;
};

export const extractConfigRootPath = (tomlContent: string): string => {
  const parsedSurrealdbConfig = toml.parse(tomlContent);
  return parsedSurrealdbConfig?.core?.path;
};
