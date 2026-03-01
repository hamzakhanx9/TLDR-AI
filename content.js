function extractArticleText() {
    const paragraphs = document.querySelectorAll("p");
    let articleText = "";

    paragraphs.forEach(p => {
        articleText += p.innerText + "\n";
    });

    return articleText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticle") {
        const text = extractArticleText();
        sendResponse({ article: text });
    }
});