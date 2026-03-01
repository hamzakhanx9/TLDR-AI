const analyzeBtn = document.getElementById("analyzeBtn");
const outputDiv = document.getElementById("output");

analyzeBtn.addEventListener("click", async () => {
    outputDiv.textContent = "Summarising article...";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { action: "getArticle" }, async (response) => {
        if (!response || !response.article) {
            outputDiv.textContent = "Could not summarise article.";
            return;
        }

        outputDiv.textContent = "Analyzing with AI...";

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
                    "Authorization": "Bearer " + "API_KEY_HERE"
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

        } catch (error) {
            outputDiv.textContent = "Error calling AI: " + error.message;
            console.error(error);
        }
    });
});