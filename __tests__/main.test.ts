import getActionInputs from "../src/args";
import { extractConfigRootPath } from "../src/config";

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

describe("extractConfigRootPath", () => {
  test("should extract [core] > path", () => {
    const tomlContent = `[core]
    path = "./tests-files"
    schema = "less"
  
  [db]
    address = "ws://localhost:8000"
    username = "root"
    password = "root"
    ns = "test"
    db = "test"`;

    const value = extractConfigRootPath(tomlContent);

    expect(value).toBe("./tests-files");
  });

  test("cannot extract if no path in [core]", () => {
    const tomlContent = `[core]
    schema = "less"
  
  [db]
    address = "ws://localhost:8000"
    username = "root"
    password = "root"
    ns = "test"
    db = "test"`;

    const value = extractConfigRootPath(tomlContent);

    expect(value).toBeUndefined();
  });

  test("cannot extract if no [core]", () => {
    const tomlContent = `[db]
    address = "ws://localhost:8000"
    username = "root"
    password = "root"
    ns = "test"
    db = "test"`;

    const value = extractConfigRootPath(tomlContent);

    expect(value).toBeUndefined();
  });

  test("cannot extract if no content", () => {
    const tomlContent = "";

    const value = extractConfigRootPath(tomlContent);

    expect(value).toBeUndefined();
  });
});
