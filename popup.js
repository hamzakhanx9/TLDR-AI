const analyzeBtn = document.getElementById("analyzeBtn");
const outputDiv = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// API token handling. Will be populated from chrome.storage.local or via prompt.
let apiToken = null;

// token dialog utilities
function showTokenDialog() {
    const dialog = document.getElementById("tokenDialog");
    const input = document.getElementById("tokenInput");
    const saveBtn = document.getElementById("saveTokenBtn");
    const cancelBtn = document.getElementById("cancelTokenBtn");

    return new Promise((resolve, reject) => {
        function cleanup() {
            dialog.style.display = "none";
            saveBtn.removeEventListener("click", onSave);
            cancelBtn.removeEventListener("click", onCancel);
        }
        function onSave() {
            const val = input.value && input.value.trim();
            if (!val) {
                alert("Token cannot be empty.");
                return;
            }
            cleanup();
            resolve(val);
        }
        function onCancel() {
            cleanup();
            reject(new Error("User cancelled token entry."));
        }
        saveBtn.addEventListener("click", onSave);
        cancelBtn.addEventListener("click", onCancel);
        dialog.style.display = "flex";
        input.value = "";
        input.focus();
    });
}

// Ensure we have a token, prompting the user if necessary.
async function ensureToken() {
    if (apiToken) return apiToken;
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["apiToken"], async (result) => {
            if (result.apiToken) {
                apiToken = result.apiToken;
                return resolve(apiToken);
            }
            try {
                const input = await showTokenDialog();
                apiToken = input;
                chrome.storage.local.set({ apiToken });
                resolve(apiToken);
            } catch (err) {
                reject(new Error("API token is required to proceed."));
            }
        });
    });
}

function clearToken() {
    apiToken = null;
    chrome.storage.local.remove(["apiToken"]);
}

const savedDark = localStorage.getItem("darkMode") === "true";
if (savedDark) {
    document.body.classList.add("dark-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nowDark = document.body.classList.toggle("dark-mode");
        if (themeIcon) themeIcon.textContent = nowDark ? "☀️" : "🌙";
        localStorage.setItem("darkMode", nowDark);
    });
}

analyzeBtn.addEventListener("click", async () => {
    const spinner = document.getElementById("spinner");
    const showSpinner = () => { if (spinner) spinner.style.display = "block"; };
    const hideSpinner = () => { if (spinner) spinner.style.display = "none"; };

    showSpinner();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // some pages (chrome://, chrome-extension://, etc.) cannot be accessed
    if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        outputDiv.textContent = "Cannot summarise this page (restricted URL).";
        hideSpinner();
        return;
    }

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { action: "getArticle" }, async (response) => {
        if (!response || !response.article) {
            outputDiv.textContent = "Could not summarise article.";
            hideSpinner();
            return;
        }

        const articleText = response.article.slice(0, 12000);

        const prompt = `Return a concise summary of the following page, highlighting key points and main ideas. Focus on providing an informative overview in a few concise sentences.

Article:
${articleText}
`;

        try {
            async function callApi(currentToken) {
                const resp = await fetch("https://models.github.ai/inference/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + currentToken
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        model: "openai/gpt-4o",
                        max_tokens: 4096,
                        temperature: 0.1
                    })
                });
                return resp;
            }

            let token;
            try {
                token = await ensureToken();
            } catch (err) {
                outputDiv.textContent = "Error: " + err.message;
                hideSpinner();
                return;
            }

            let aiResponse = await callApi(token);
            let data = await aiResponse.json();
            console.log("API RESPONSE:", data);

            // if we got unauthorized, clear token and retry once
            if (aiResponse.status === 401) {
                clearToken();
                outputDiv.textContent = "Invalid API token; please enter a new one.";
                // prompt again
                try {
                    token = await ensureToken();
                } catch (err) {
                    hideSpinner();
                    return;
                }
                aiResponse = await callApi(token);
                data = await aiResponse.json();
            }

            if (!aiResponse.ok) {
                outputDiv.textContent = "API Error:\n" + JSON.stringify(data, null, 2);
                return;
            }

            let resultText = "No AI response received.";

            if (data.choices && data.choices.length > 0) {
                resultText = data.choices[0].message.content;
            }

            outputDiv.textContent = resultText;
            hideSpinner();
            if (copyBtn) {
                copyBtn.style.display = resultText ? "block" : "none";
            }
        } catch (error) {
            outputDiv.textContent = "Error calling AI: " + error.message;
            console.error(error);
            hideSpinner();
            if (copyBtn) copyBtn.style.display = "none";
        }
    });
});

if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        const text = outputDiv.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = "Copy to clipboard"; }, 1500);
        }).catch(err => console.error("Clipboard write failed", err));
    });
}