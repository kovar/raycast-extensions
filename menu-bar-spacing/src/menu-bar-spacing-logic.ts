import { execSync } from "child_process";

export const SPACING_KEY = "NSStatusItemSpacing";
export const PADDING_KEY = "NSStatusItemSelectionPadding";

export type SpacingPreset = {
  label: string;
  spacing: number;
  padding: number;
};

export const PRESETS = {
  compact: { label: "Compact", spacing: 6, padding: 12 },
  tight: { label: "Tight", spacing: 4, padding: 8 },
  minimal: { label: "Minimal", spacing: 0, padding: 0 },
} as const satisfies Record<string, SpacingPreset>;

export type ValidatedSpacingValues = {
  spacing: number;
  padding: number;
};

export type ValidationError = {
  error: string;
};

export type SpacingValidationResult = ValidatedSpacingValues | ValidationError;

export function parseNonNegativeInteger(
  value: string,
  fieldName: string,
): number | ValidationError {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { error: `${fieldName} is required` };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { error: `${fieldName} must be a non-negative integer` };
  }

  return Number.parseInt(trimmed, 10);
}

export function validateSpacingValues(
  spacing: string,
  padding: string,
): SpacingValidationResult {
  const parsedSpacing = parseNonNegativeInteger(spacing, "Spacing");
  if (typeof parsedSpacing !== "number") {
    return parsedSpacing;
  }

  const parsedPadding = parseNonNegativeInteger(padding, "Selection padding");
  if (typeof parsedPadding !== "number") {
    return parsedPadding;
  }

  return {
    spacing: parsedSpacing,
    padding: parsedPadding,
  };
}

export function buildApplyCommands(spacing: number, padding: number): string[] {
  return [
    `defaults -currentHost write -globalDomain ${SPACING_KEY} -int ${spacing}`,
    `defaults -currentHost write -globalDomain ${PADDING_KEY} -int ${padding}`,
    "killall ControlCenter",
  ];
}

export function buildResetCommands(): string[] {
  return [
    `defaults -currentHost delete -globalDomain ${SPACING_KEY}`,
    `defaults -currentHost delete -globalDomain ${PADDING_KEY}`,
    "killall ControlCenter",
  ];
}

export type CommandExecutor = (command: string) => void;

function defaultExecutor(command: string): void {
  try {
    execSync(command, { stdio: "pipe" });
  } catch (error) {
    if (command.startsWith("killall ") && isKillallBenignFailure(error)) {
      return;
    }

    throw error;
  }
}

function isKillallBenignFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const status = "status" in error ? error.status : undefined;
  return status === 1;
}

export function applyMenuBarSpacing(
  spacing: number,
  padding: number,
  execute: CommandExecutor = defaultExecutor,
): string[] {
  const commands = buildApplyCommands(spacing, padding);
  for (const command of commands) {
    execute(command);
  }

  return commands;
}

export function resetMenuBarSpacing(
  execute: CommandExecutor = defaultExecutor,
): string[] {
  const commands = buildResetCommands();
  for (const command of commands) {
    execute(command);
  }

  return commands;
}
