// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";
import { execSync } from "child_process";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function simulateCtrlV(): void {
  const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class KbSim {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    public static void CtrlV() {
        keybd_event(0x11, 0, 0, UIntPtr.Zero);
        keybd_event(0x56, 0, 0, UIntPtr.Zero);
        keybd_event(0x56, 0, 2, UIntPtr.Zero);
        keybd_event(0x11, 0, 2, UIntPtr.Zero);
    }
}
"@
[KbSim]::CtrlV()
`;
  const encoded = Buffer.from(ps, "utf16le").toString("base64");
  execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, {
    windowsHide: true,
    timeout: 5000,
  });
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

    // Clipboard.copy correctly sets HTML on both platforms
    await Clipboard.copy({ html, text });

    if (process.platform === "win32") {
      // Clipboard.paste doesn't support rich HTML on Windows,
      // so use Clipboard.copy (proven to set HTML) + keybd_event Ctrl+V
      await new Promise((resolve) => setTimeout(resolve, 150));
      simulateCtrlV();
    } else {
      await Clipboard.paste({ html, text });
    }

    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}