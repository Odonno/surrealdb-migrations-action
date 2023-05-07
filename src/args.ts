import { input } from "@actions-rs/core";

export type ActionInputs = {
  requestedVersion: string;
  opts: string;
};

export default function getActionInputs(): ActionInputs {
  const requestedVersion = input.getInput("version");
  const opts = input.getInput("args");

  return {
    requestedVersion,
    opts,
  };
}
