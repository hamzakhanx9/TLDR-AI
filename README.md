# Web Page Summariser

A Chrome extension that summarises web pages using AI models. Instead of merely extracting paragraph text, the extension captures article and sends it to a backend AI service (e.g. GPT, LLaMA) which returns a concise summary.

## Features

- Automatically collects article text from the current tab.
- Sends the extracted content to an AI model API for summarisation.
- Displays the AI-generated summary in the popup interface with:
  - spinner indicator while processing
  - copy-to-clipboard button for easy copying
  - dark/light theme toggle (moon/sun icon) with preference persistence
- Uses Calibri font and justified output for readability.
- Built with a modular architecture to support different AI providers.
- Lightweight and easy to extend for custom analysis or export.

## Project Structure

```
content.js      - Extracts page content and responds to messages.
popup.html      - User interface for requesting and showing summaries.
popup.js        - Handles messaging and communication with AI backend.
manifest.json   - Defines permissions and registers scripts.
``` 

## Installation

1. Clone or download the repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.

## Usage

1. Visit any article or web page you want summarised.
2. Click the extension icon in the toolbar.
3. A popup will appear. (Use the moon/sun icon to switch themes if desired.)
4. Press **Summarise Page**; a spinner will show while the request is processed.
5. When complete, the summary text appears. Use the **Copy to clipboard** button to copy it.

> **Tip:** Configure your API key for the AI provider inside `popup.js` (e.g. `AI_API_KEY`) or through environment variables depending on your setup.

## Development

- Adjust extraction rules in `content.js` if pages have unique structures.
- Enhance the popup UI or add new options by editing `popup.html`/`popup.js` (e.g. change spinner style or button placement).
- If adding a new AI backend, implement the request logic in `popup.js` and update configuration.
- Update `manifest.json` when requesting additional permissions.

## Contributing

Contributions are welcome! Feel free to open issues, suggest improvements, or submit pull requests for:

- Supporting additional summarisation models
- Improving extraction accuracy
- Adding export or sharing capabilities

## License

This project is open source under the [MIT License](LICENSE).