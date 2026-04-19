// Rich Link Paste
// Copy title/reference FIRST → Copy permalink SECOND → Trigger this

import { Clipboard, showHUD } from "@raycast/api";

export default async function main() {
  try {
    const titleRaw = await Clipboard.readText({ offset: 1 });
    const url = await Clipboard.readText({ offset: 0 });

    if (!url) {
      await showHUD("No URL found on clipboard");
      return;
    }

    const title = (titleRaw || url).trim().replace(/\s+/g, " ");
    const html = `<a href="${url}">${title}</a>`;
    const text = title;

    await Clipboard.copy({ html, text });
    await Clipboard.paste({ html, text });
    await showHUD("Rich link pasted!");
  } catch (error) {
    await showHUD(`Error: ${error}`);
  }
}