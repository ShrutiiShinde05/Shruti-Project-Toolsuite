'use strict';

const longUrlInput = document.getElementById('longUrl');
const shortenBtn = document.getElementById('shortenBtn');
const resultContainer = document.getElementById('result-container');
const shortUrlDiv = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const status = document.getElementById('status');

shortenBtn.onclick = async () => {
    const url = longUrlInput.value.trim();

    if (!url) {
        notify.info("Please paste a URL first.");
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        notify.error("URL must start with http:// or https://");
        return;
    }

    status.textContent = "Shortening... please wait.";
    shortenBtn.disabled = true;
    resultContainer.style.display = "none";

    try {
        const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.shorturl) {
            shortUrlDiv.textContent = data.shorturl;
            resultContainer.style.display = "block";
            status.textContent = "Success!";
        } else {
            status.textContent =
                "Error: " + (data.errormessage || "Could not shorten URL.");
        }

    } catch (err) {
        console.error("Fetch Error:", err);

        status.textContent =
            "The service is busy. Please try again in a few seconds.";

        notify.error("Failed to connect to shortening service.");
    } finally {
        shortenBtn.disabled = false;
    }
};

copyBtn.onclick = async () => {
    try {
        await navigator.clipboard.writeText(shortUrlDiv.textContent);

        const originalText = copyBtn.textContent;
        copyBtn.textContent = "COPIED!";

        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);

    } catch {
        notify.error("Clipboard access failed.");
    }
};
