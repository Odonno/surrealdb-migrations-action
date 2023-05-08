import { input } from "@actions-rs/core";

export type ActionInputs = {
  requestedVersion: string;
  url: string;
  ns: string;
  db: string;
  username: string;
  password: string;
};

export default function getActionInputs(): ActionInputs {
  const requestedVersion = input.getInput("version");
  const url = input.getInput("url");
  const ns = input.getInput("ns");
  const db = input.getInput("db");
  const username = input.getInput("username");
  const password = input.getInput("password");

  return {
    requestedVersion,
    url,
    ns,
    db,
    username,
    password,
  };
}
