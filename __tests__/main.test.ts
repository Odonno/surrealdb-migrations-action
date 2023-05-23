import getActionInputs from "../src/args";

test("action inputs should be resolved from env vars", () => {
  const testEnvVars = {
    INPUT_VERSION: "0.9.5",
    INPUT_ADDRESS: "ws://localhost:8000",
    INPUT_NS: "ns",
    INPUT_DB: "db",
  };

  Object.entries(testEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  const input = getActionInputs();

  expect(input.requestedVersion).toBe("0.9.5");
  expect(input.address).toBe("ws://localhost:8000");
  expect(input.ns).toBe("ns");
  expect(input.db).toBe("db");
  expect(input.username).toBe("");
  expect(input.password).toBe("");
});
