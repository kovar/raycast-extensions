// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";
import { execSync } from "child_process";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildCfHtml(fragment: string): string {
  const htmlStart = "<html><body><!--StartFragment-->";
  const htmlEnd = "<!--EndFragment--></body></html>";
  const fullDoc = htmlStart + fragment + htmlEnd;

  const header =
    "Version:0.9\r\n" +
    "StartHTML:SSSSSSSSSS\r\n" +
    "EndHTML:EEEEEEEEEE\r\n" +
    "StartFragment:FFFFFFFFFF\r\n" +
    "EndFragment:GGGGGGGGGG\r\n\r\n";

  const htmlStartPos = header.length;
  const fragmentStartPos = htmlStartPos + htmlStart.length;
  const fragmentEndPos = fragmentStartPos + fragment.length;
  const htmlEndPos = htmlStartPos + fullDoc.length;

  return (
    header
      .replace("SSSSSSSSSS", htmlStartPos.toString().padStart(10, "0"))
      .replace("EEEEEEEEEE", htmlEndPos.toString().padStart(10, "0"))
      .replace("FFFFFFFFFF", fragmentStartPos.toString().padStart(10, "0"))
      .replace("GGGGGGGGGG", fragmentEndPos.toString().padStart(10, "0")) + fullDoc
  );
}

function windowsCopyAndPaste(cfHtml: string, plainText: string): void {
  // Escape for PowerShell single-quoted string (double up single quotes)
  const escapedCfHtml = cfHtml.replace(/'/g, "''");
  const escapedText = plainText.replace(/'/g, "''");

  const ps = `
Add-Type -AssemblyName System.Windows.Forms
$data = New-Object System.Windows.Forms.DataObject
$data.SetData([System.Windows.Forms.DataFormats]::Html, '${escapedCfHtml}')
$data.SetData([System.Windows.Forms.DataFormats]::UnicodeText, '${escapedText}')
[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait('^v')
`.trim();

  execSync(`powershell -command "${ps.replace(/"/g, '\\"')}"`, { windowsHide: true });
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
    const fragment = `<a href="${safeUrl}">${safeTitle}</a>`;
    const text = title;

    if (process.platform === "win32") {
      const cfHtml = buildCfHtml(fragment);
      windowsCopyAndPaste(cfHtml, text);
    } else {
      await Clipboard.paste({ html: fragment, text });
    }

    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}