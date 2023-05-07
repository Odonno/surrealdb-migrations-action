import getActionInputs from "../src/args";

test("action inputs should be resolved from env vars", () => {
  const testEnvVars = {
    INPUT_VERSION: "0.9.5",
    INPUT_ARGS: "--ns ns --db db",
  };

  Object.entries(testEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  const input = getActionInputs();

  expect(input.requestedVersion).toBe("0.9.5");
  expect(input.opts).toBe("--ns ns --db db");
});
