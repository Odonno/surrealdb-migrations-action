import fetch from "node-fetch";
import { ActionInputs } from "./args";

export type Config = {
  /**
   * The URL to download a tarball of surrealdb-migrations from.
   */
  downloadUrl: string;

  /**
   * The version of surrealdb-migrations that is being downloaded.
   */
  releaseVersion: string;
};

type GitHubRelease = {
  name: string;
  assets: {
    name: string;
    browser_download_url: string;
  }[];
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
  const releaseEndpoint =
    "https://api.github.com/repos/Odonno/surrealdb-migrations/releases";

  const { requestedVersion } = input;

  const releaseInfo = await getReleaseInfo(releaseEndpoint, requestedVersion);
  const downloadUrl = await getDownloadUrl(releaseInfo, requestedVersion);

  const releaseVersion = releaseInfo.name.replace(/^v/, "");

  return {
    downloadUrl,
    releaseVersion,
  };
}

/**
 * Get the GitHub release information related to the `surrealdb-migrations` based on the requested version.
 *
 * @param releaseEndpoint The URI of the GitHub API that can be used to fetch release information, sans the version number.
 * @param requestedVersion The Git tag of the surrealdb-migrations revision to get a download URL for.
 * May be any valid Git tag, or a special-cased `latest`.
 */
async function getReleaseInfo(
  releaseEndpoint: string,
  requestedVersion: string
): Promise<GitHubRelease> {
  const releaseInfoUri =
    requestedVersion === "latest"
      ? `${releaseEndpoint}/latest`
      : `${releaseEndpoint}/tags/${requestedVersion}`;

  const releaseInfoRequest = await fetch(releaseInfoUri);

  const response = await releaseInfoRequest.json();

  return response as GitHubRelease;
}

/**
 * Determine the download URL for the tarball containing the `surrealdb-migrations` binaries.
 *
 * @param releaseInfo The GitHub release information downloaded from the GitHub API.
 * @param requestedVersion The Git tag of the surrealdb-migrations revision to get a download URL for.
 * May be any valid Git tag, or a special-cased `latest`.
 */
async function getDownloadUrl(
  releaseInfo: GitHubRelease,
  requestedVersion: string
): Promise<string> {
  const gzipAsset = releaseInfo.assets.find((asset) => {
    return (
      asset.name.startsWith("surrealdb-migrations") &&
      asset.name.endsWith(".tar.gz")
    );
  });

  if (!gzipAsset) {
    throw new Error(
      `Couldn't find a release tarball containing binaries for ${requestedVersion}`
    );
  }

  return gzipAsset.browser_download_url;
}
