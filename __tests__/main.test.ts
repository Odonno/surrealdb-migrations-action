import getActionInputs from "../src/args";

describe("getActionInputs", () => {
  afterEach(() => {
    delete process.env["INPUT_VERSION"];
    delete process.env["INPUT_ADDRESS"];
    delete process.env["INPUT_NS"];
    delete process.env["INPUT_DB"];
  });

  test("action inputs should be resolved from env vars", () => {
    const testEnvVars = {
      INPUT_VERSION: "latest",
      INPUT_ADDRESS: "ws://localhost:8000",
      INPUT_NS: "ns",
      INPUT_DB: "db",
    };

    Object.entries(testEnvVars).forEach(([key, value]) => {
      process.env[key] = value;
    });

    const input = getActionInputs();

    expect(input.requestedVersion).toBe("latest");
    expect(input.address).toBe("ws://localhost:8000");
    expect(input.ns).toBe("ns");
    expect(input.db).toBe("db");
    expect(input.username).toBe("");
    expect(input.password).toBe("");
  });

  const versionTestCases = [
    { version: "0.9.5", expected: "v0.9.5" },
    { version: "v0.9.5", expected: "v0.9.5" },
    { version: "latest", expected: "latest" },
  ];

  versionTestCases.forEach(({ version, expected }) => {
    test(`version '${version}' should be recognized as '${expected}'`, () => {
      process.env["INPUT_VERSION"] = version;

      const input = getActionInputs();

      expect(input.requestedVersion).toBe(expected);
    });
  });
});
