const analyzeBtn = document.getElementById("analyzeBtn");
const outputDiv = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

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
            const aiResponse = await fetch("https://models.github.ai/inference/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + "AI_API_KEY" // Replace with your actual API key
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

            const data = await aiResponse.json();
            console.log("API RESPONSE:", data);

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