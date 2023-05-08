import fetch from "node-fetch";
import { ActionInputs } from "./args";

export type Config = {
  /**
   * Url of the surrealdb instance. Default value is `localhost:8000`
   */
  url: string;

  /**
   * Namespace to use inside the surrealdb instance. Default value is `test`
   */
  ns: string;

  /**
   * Name of the database to use inside the surrealdb instance. Default value is `test`
   */
  db: string;

  /**
   * Username used to authenticate to the surrealdb instance. Default value is `root`
   */
  username: string;

  /**
   * Password used to authenticate to the surrealdb instance. Default value is `root`
   */
  password: string;

  /**
   * The URL to download a tarball of surrealdb-migrations from.
   */
  downloadUrl: string;
};

/**
 * Resolve the configuration (e.g., download url and test options) required to run surrealdb-migrations
 * from the inputs supplied to the action.
 *
 * @param input The parameters of the action.
 */
export default async function resolveConfig(
  input: ActionInputs
): Promise<Config> {
  const { requestedVersion, ...rest } = input;

  const releaseEndpoint =
    "https://api.github.com/repos/Odonno/surrealdb-migrations/releases";

  const downloadUrl = await getDownloadUrl(releaseEndpoint, requestedVersion);

  return {
    ...rest,
    downloadUrl,
  };
}

/**
 * Determine the download URL for the tarball containing the `surrealdb-migrations` binaries.
 *
 * @param releaseEndpoint The URI of the GitHub API that can be used to fetch release information, sans the version number.
 * @param requestedVersion The Git tag of the surrealdb-migrations revision to get a download URL for.
 * May be any valid Git tag, or a special-cased `latest`.
 */
async function getDownloadUrl(
  releaseEndpoint: string,
  requestedVersion: string
): Promise<string> {
  const releaseInfoUri =
    requestedVersion === "latest"
      ? `${releaseEndpoint}/latest`
      : `${releaseEndpoint}/tags/${requestedVersion}`;

  const releaseInfoRequest = await fetch(releaseInfoUri);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const releaseInfo: any = await releaseInfoRequest.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gzipAsset = releaseInfo["assets"].find((asset: any) => {
    return asset["content_type"] === "application/gzip";
  });

  if (!gzipAsset) {
    throw new Error(
      `Couldn't find a release tarball containing binaries for ${requestedVersion}`
    );
  }

  return gzipAsset["browser_download_url"];
}
