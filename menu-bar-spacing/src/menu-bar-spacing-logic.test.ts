import { describe, expect, test } from "bun:test";
import {
  applyMenuBarSpacing,
  buildApplyCommands,
  buildResetCommands,
  PADDING_KEY,
  resetMenuBarSpacing,
  SPACING_KEY,
  validateSpacingValues,
} from "./menu-bar-spacing-logic";

describe("validateSpacingValues", () => {
  test("accepts non-negative integers", () => {
    expect(validateSpacingValues("6", "12")).toEqual({
      spacing: 6,
      padding: 12,
    });
    expect(validateSpacingValues("0", "0")).toEqual({ spacing: 0, padding: 0 });
  });

  test("rejects negative and non-integer values", () => {
    expect(validateSpacingValues("-1", "12")).toEqual({
      error: "Spacing must be a non-negative integer",
    });
    expect(validateSpacingValues("6", "3.5")).toEqual({
      error: "Selection padding must be a non-negative integer",
    });
    expect(validateSpacingValues("", "12")).toEqual({
      error: "Spacing is required",
    });
  });
});

describe("buildApplyCommands", () => {
  test("builds defaults writes and killall for concrete values", () => {
    const commands = buildApplyCommands(6, 12);

    expect(commands).toHaveLength(3);
    expect(commands[0]).toBe(
      `defaults -currentHost -globalDomain ${SPACING_KEY} -int 6`,
    );
    expect(commands[1]).toBe(
      `defaults -currentHost -globalDomain ${PADDING_KEY} -int 12`,
    );
    expect(commands[2]).toBe("killall ControlCenter");
  });

  test("is consistent across repeated invocations", () => {
    const first = buildApplyCommands(0, 0);
    const second = buildApplyCommands(0, 0);
    expect(first).toEqual(second);
    expect(first[0]).toContain("-int 0");
    expect(first[1]).toContain("-int 0");
  });
});

describe("buildResetCommands", () => {
  test("deletes both keys and restarts Control Center", () => {
    const commands = buildResetCommands();

    expect(commands).toHaveLength(3);
    expect(commands[0]).toBe(
      `defaults -currentHost -globalDomain ${SPACING_KEY} delete`,
    );
    expect(commands[1]).toBe(
      `defaults -currentHost -globalDomain ${PADDING_KEY} delete`,
    );
    expect(commands[2]).toBe("killall ControlCenter");
  });
});

describe("applyMenuBarSpacing", () => {
  test("executes the real built commands in order", () => {
    const executed: string[] = [];
    const returned = applyMenuBarSpacing(6, 12, (command) => {
      executed.push(command);
    });

    expect(returned).toEqual(buildApplyCommands(6, 12));
    expect(executed).toEqual(returned);
    expect(executed[0]).toContain(SPACING_KEY);
    expect(executed[0]).toContain("-int 6");
    expect(executed[1]).toContain(PADDING_KEY);
    expect(executed[1]).toContain("-int 12");
  });
});

describe("resetMenuBarSpacing", () => {
  test("executes the real reset commands in order", () => {
    const executed: string[] = [];
    const returned = resetMenuBarSpacing((command) => {
      executed.push(command);
    });

    expect(returned).toEqual(buildResetCommands());
    expect(executed).toEqual(returned);
    expect(executed[0]).toContain(`${SPACING_KEY} delete`);
    expect(executed[1]).toContain(`${PADDING_KEY} delete`);
  });
});
