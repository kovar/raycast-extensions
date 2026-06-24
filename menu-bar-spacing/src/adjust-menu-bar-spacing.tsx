import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import {
  applyMenuBarSpacing,
  PRESETS,
  resetMenuBarSpacing,
  validateSpacingValues,
} from "./menu-bar-spacing-logic";

type FormValues = {
  spacing: string;
  padding: string;
};

export default function Command() {
  const [spacing, setSpacing] = useState("6");
  const [padding, setPadding] = useState("12");

  async function handleSubmit(values: FormValues) {
    const result = validateSpacingValues(values.spacing, values.padding);
    if ("error" in result) {
      await showToast({ style: Toast.Style.Failure, title: result.error });
      return;
    }

    try {
      applyMenuBarSpacing(result.spacing, result.padding);
      await showToast({
        style: Toast.Style.Success,
        title: "Menu bar spacing applied",
        message: `Spacing ${result.spacing}, padding ${result.padding}`,
      });
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to apply menu bar spacing",
      });
    }
  }

  async function handleReset() {
    try {
      resetMenuBarSpacing();
      setSpacing("6");
      setPadding("12");
      await showToast({
        style: Toast.Style.Success,
        title: "Menu bar spacing reset",
        message: "System defaults restored",
      });
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to reset menu bar spacing",
      });
    }
  }

  function applyPreset(presetKey: keyof typeof PRESETS) {
    const preset = PRESETS[presetKey];
    setSpacing(String(preset.spacing));
    setPadding(String(preset.padding));
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Apply Spacing" onSubmit={handleSubmit} />
          <Action title="Reset to Defaults" onAction={handleReset} />
          <Action
            title="Compact Preset"
            onAction={() => applyPreset("compact")}
          />
          <Action title="Tight Preset" onAction={() => applyPreset("tight")} />
          <Action
            title="Minimal Preset"
            onAction={() => applyPreset("minimal")}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Adjust the gap between macOS menu bar items. Changes take effect after Control Center restarts." />
      <Form.TextField
        id="spacing"
        title="Spacing"
        placeholder="6"
        value={spacing}
        onChange={setSpacing}
        info="Gap between menu bar items (non-negative integer)"
      />
      <Form.TextField
        id="padding"
        title="Selection Padding"
        placeholder="12"
        value={padding}
        onChange={setPadding}
        info="Padding around selected menu bar items (non-negative integer)"
      />
      <Form.Separator />
      <Form.Description text="Presets: Compact (6/12), Tight (4/8), Minimal (0/0). Use Reset to restore system defaults." />
    </Form>
  );
}
