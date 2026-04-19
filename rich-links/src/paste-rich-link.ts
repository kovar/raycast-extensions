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

function windowsCopyAndPaste(cfHtml: string, plainText: string): string {
  const ps = `
Add-Type -AssemblyName System.Windows.Forms
$data = New-Object System.Windows.Forms.DataObject
$data.SetData([System.Windows.Forms.DataFormats]::Html, '${cfHtml.replace(/'/g, "''")}')
$data.SetData([System.Windows.Forms.DataFormats]::UnicodeText, '${plainText.replace(/'/g, "''")}')
[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
Start-Sleep -Milliseconds 150
[System.Windows.Forms.SendKeys]::SendWait('^v')
Write-Output 'OK'
`;

  // Use -EncodedCommand to avoid all shell escaping issues
  const encoded = Buffer.from(ps, "utf16le").toString("base64");
  const result = execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, {
    windowsHide: true,
    timeout: 5000,
  });
  return result.toString().trim();
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

    // Debug: show platform so we know which path is taken
    const platform = process.platform;
    const isWindows = platform === "win32";

    if (isWindows) {
      const cfHtml = buildCfHtml(fragment);
      const result = windowsCopyAndPaste(cfHtml, text);
      await showHUD(result === "OK" ? `Pasted! (${platform})` : `PS: ${result}`);
    } else {
      await Clipboard.paste({ html: fragment, text });
      await showHUD(`Pasted! (${platform})`);
    }
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}