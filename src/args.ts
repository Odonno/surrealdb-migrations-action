import { input } from "@actions-rs/core";

export type ActionInputs = {
  requestedVersion: string;
  address: string;
  /**
   * @deprecated You should use `address` instead (since v0.9.6).
   */
  url: string;
  ns: string;
  db: string;
  username: string;
  password: string;
};

export default function getActionInputs(): ActionInputs {
  const requestedVersion = input.getInput("version");
  const address = input.getInput("address");
  const url = input.getInput("url");
  const ns = input.getInput("ns");
  const db = input.getInput("db");
  const username = input.getInput("username");
  const password = input.getInput("password");

  return {
    requestedVersion,
    address,
    url,
    ns,
    db,
    username,
    password,
  };
}
