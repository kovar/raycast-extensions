// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";
import { execSync } from "child_process";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function simulatePaste(): void {
  if (process.platform === "win32") {
    execSync(
      'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"',
    );
  } else {
    execSync("osascript -e 'tell application \"System Events\" to keystroke \"v\" using command down'");
  }
}

export default async function main() {
  try {
    const titleRaw = await Clipboard.readText({ offset: 1 });
    const url = await Clipboard.readText({ offset: 0 });

    if (!url) {
      await showHUD("No URL found on clipboard");
      return;
    }

    const title = (titleRaw || url).trim().replace(/\s+/g, " ");
    const safeUrl = escapeHtml(url);
    const safeTitle = escapeHtml(title);
    const html = `<a href="${safeUrl}">${safeTitle}</a>`;
    const text = title;

    // Copy sets HTML clipboard correctly on both platforms
    await Clipboard.copy({ html, text });

    // Clipboard.paste({ html }) doesn't support rich HTML on Windows,
    // so simulate the keyboard shortcut natively on both platforms
    await new Promise((resolve) => setTimeout(resolve, 150));
    simulatePaste();

    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}