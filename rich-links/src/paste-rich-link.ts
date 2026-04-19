// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildHtml(url: string, title: string): string {
  const safeUrl = escapeHtml(url);
  const safeTitle = escapeHtml(title);
  const fragment = `<a href="${safeUrl}">${safeTitle}</a>`;

  if (process.platform === "win32") {
    // Windows apps require CF_HTML envelope for rich clipboard paste
    const htmlStart = `<html><body><!--StartFragment-->`;
    const htmlEnd = `<!--EndFragment--></body></html>`;
    const fullDoc = htmlStart + fragment + htmlEnd;

    const header =
      `Version:0.9\r\n` +
      `StartHTML:SSSSSSSSSS\r\n` +
      `EndHTML:EEEEEEEEEE\r\n` +
      `StartFragment:FFFFFFFFFF\r\n` +
      `EndFragment:GGGGGGGGGG\r\n\r\n`;

    const htmlStartPos = header.length;
    const fragmentStartPos = htmlStartPos + htmlStart.length;
    const fragmentEndPos = fragmentStartPos + fragment.length;
    const htmlEndPos = htmlStartPos + fullDoc.length;

    return header
      .replace("SSSSSSSSSS", htmlStartPos.toString().padStart(10, "0"))
      .replace("EEEEEEEEEE", htmlEndPos.toString().padStart(10, "0"))
      .replace("FFFFFFFFFF", fragmentStartPos.toString().padStart(10, "0"))
      .replace("GGGGGGGGGG", fragmentEndPos.toString().padStart(10, "0")) + fullDoc;
  }

  // macOS: plain HTML fragment works
  return fragment;
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
    const html = buildHtml(url, title);
    const text = title;

    await Clipboard.copy({ html, text });
    await Clipboard.paste({ html, text });
    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}