const githubActionsExec = require("@actions/exec");
const githubActionsToolCache = require("@actions/tool-cache");

jest.setTimeout(30000);

jest.spyOn(githubActionsToolCache, "find").mockImplementation(() => {
  return "xeol";
});

const spyExec = jest.spyOn(githubActionsExec, "exec").mockImplementation(() => {
  return Promise.resolve(0);
});

const mockExec = async (args) => {
  try {
    const { runScan } = require("../index");
    await runScan(args);
  } catch (e) {
    // ignore: this happens trying to parse command output, which we don't care about
  }
  const [cmd, params] = spyExec.mock.calls[spyExec.mock.calls.length - 1];
  return `${cmd} ${params.join(" ")}`;
};

describe("Xeol command", () => {
  it("is invoked with dir", async () => {
    let cmd = await mockExec({
      source: "dir:.",
      debug: "false",
      failBuild: "false",
      outputFormat: "json",
      version: "0.6.0",
    });
    expect(cmd).toBe("xeol -o json dir:.");
  });

  it("is invoked with values", async () => {
    let cmd = await mockExec({
      source: "asdf",
      failBuild: "false",
      outputFormat: "json",
      version: "0.6.0",
    });
    expect(cmd).toBe("xeol -o json asdf");
  });

  it("is invoked with fail", async () => {
    let cmd = await mockExec({
      source: "asdf",
      failBuild: "true",
      outputFormat: "json",
      version: "0.6.0",
    });
    expect(cmd).toBe("xeol -o json --fail-on-eol-found asdf");
  });
});
