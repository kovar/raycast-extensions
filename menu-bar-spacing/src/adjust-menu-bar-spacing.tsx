import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { applyMenuBarSpacing, parseNonNegativeInteger, PRESETS, resetMenuBarSpacing } from "./menu-bar-spacing-logic";

type FormValues = {
  spacing: string;
  padding: string;
};

export default function Command() {
  const { handleSubmit, itemProps, setValue } = useForm<FormValues>({
    initialValues: {
      spacing: "6",
      padding: "12",
    },
    validation: {
      spacing: (value) => {
        const result = parseNonNegativeInteger(value ?? "", "Spacing");
        return typeof result === "number" ? undefined : result.error;
      },
      padding: (value) => {
        const result = parseNonNegativeInteger(value ?? "", "Selection padding");
        return typeof result === "number" ? undefined : result.error;
      },
    },
    async onSubmit(values) {
      const spacing = Number.parseInt(values.spacing, 10);
      const padding = Number.parseInt(values.padding, 10);

      try {
        applyMenuBarSpacing(spacing, padding);
        await showToast({
          style: Toast.Style.Success,
          title: "Menu bar spacing applied",
          message: `Spacing ${spacing}, padding ${padding}`,
        });
      } catch {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to apply menu bar spacing",
        });
      }
    },
  });

  async function handleReset() {
    try {
      resetMenuBarSpacing();
      setValue("spacing", "6");
      setValue("padding", "12");
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
    setValue("spacing", String(preset.spacing));
    setValue("padding", String(preset.padding));
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Apply Spacing" onSubmit={handleSubmit} />
          <Action title="Reset to Defaults" onAction={handleReset} />
          <Action title="Compact Preset" onAction={() => applyPreset("compact")} />
          <Action title="Tight Preset" onAction={() => applyPreset("tight")} />
          <Action title="Minimal Preset" onAction={() => applyPreset("minimal")} />
        </ActionPanel>
      }
    >
      <Form.Description text="Adjust the gap between macOS menu bar items. Changes take effect after Control Center restarts." />
      <Form.TextField
        title="Spacing"
        placeholder="6"
        info="Gap between menu bar items (non-negative integer)"
        {...itemProps.spacing}
      />
      <Form.TextField
        title="Selection Padding"
        placeholder="12"
        info="Padding around selected menu bar items (non-negative integer)"
        {...itemProps.padding}
      />
      <Form.Separator />
      <Form.Description text="Presets: Compact (6/12), Tight (4/8), Minimal (0/0). Use Reset to restore system defaults." />
    </Form>
  );
}
