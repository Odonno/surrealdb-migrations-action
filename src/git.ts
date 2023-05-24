import * as exec from "@actions/exec";

/**
 * Check if Git repository is dirty
 * @param path Path to only check nested folder/files
 */
export const isRepositoryDirty = async (path: string): Promise<boolean> => {
  const gitStatusArgs = ["status", "--porcelain", path];

  let gitStatusOutput = "";

  const gitStatusOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        gitStatusOutput += data.toString();
      },
    },
  };

  await exec.exec("git", gitStatusArgs, gitStatusOptions);

  return !!gitStatusOutput;
};
