// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

    await Clipboard.copy({ html, text });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await Clipboard.paste({ html, text });
    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}