import { beforeAll, describe, expect, mock, test } from "bun:test";

beforeAll(() => {
  mock.module("@raycast/api", () => ({
    Action: {
      SubmitForm: () => null,
    },
    ActionPanel: ({ children }: { children: unknown }) => children,
    Form: Object.assign(() => null, {
      TextField: () => null,
      Description: () => null,
      Separator: () => null,
    }),
    showToast: async () => {},
    Toast: {
      Style: {
        Failure: "failure",
        Success: "success",
      },
    },
  }));

  mock.module("@raycast/utils", () => ({
    useForm: () => ({
      handleSubmit: async () => {},
      itemProps: {
        spacing: { id: "spacing", value: "6", onChange: () => {} },
        padding: { id: "padding", value: "12", onChange: () => {} },
      },
      setValue: () => {},
    }),
  }));
});

describe("adjust-menu-bar-spacing entry module", () => {
  test("loads and exports a default React component", async () => {
    const module = await import("./adjust-menu-bar-spacing");

    expect(typeof module.default).toBe("function");
    expect(module.default.name).toBe("Command");
  });
});
