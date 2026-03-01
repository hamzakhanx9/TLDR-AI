# Privacy Policy for TLDR AI Extension

_Last updated: March 1, 2026_

## Overview
TLDR AI is a browser extension that provides concise summaries of web pages using an AI service.

This privacy policy explains what data the extension accesses, how it is used, and how you can control it.

## Data Accessed and Usage
- **Active Tab Content**: When you click the "Summarise Page" button, the extension injects a small script into the active tab. That script reads the page content (typically the article or text on the page) in order to send it to the AI service for summarization. This content is not stored anywhere on your computer by the extension; it is only temporarily transmitted to the external API you configure.

- **API Token**: You supply your own API token for the AI service. This token is stored locally in `chrome.storage.local` so you do not need to re-enter it every time. The extension does not transmit the token to any third party other than as required by your requests to the AI API.

- **Summaries**: The text summary returned by the AI is displayed in the popup and may remain visible until the popup is closed. It is not saved or uploaded by the extension.

## Storage
The only data persisted by the extension is the API token you provide. This is stored using Chrome's local storage API and is never sent to any server unless you explicitly use it when making requests to the AI inference endpoint.

## Third‑Party Services
The extension communicates with the AI inference API at `https://models.github.ai/inference/chat/completions`. Any data sent to that service (page text, configuration parameters, etc.) is subject to that service’s own privacy policy.

## No Remote Code
All code shipped with the extension is packaged in the extension itself. No executable code is fetched or executed from remote servers.

## Your Choices
- You can clear or change the stored API token at any time by clicking "Summarise Page" and entering a new token, or by removing it from Chrome's extension storage.
- You may disable or uninstall the extension from Chrome's extensions page.

## Contact
For questions about this privacy policy, you can contact the developer via the GitHub repository: https://github.com/hamzakhanx9/TLDR-AI


---

By using TLDR AI, you agree to this privacy policy.