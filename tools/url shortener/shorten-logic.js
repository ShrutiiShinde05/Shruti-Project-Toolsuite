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
        const apiUrl =
            `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;

        const proxyUrl =
            `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Read as TEXT first
        const text = await response.text();

        // Detect proxy failure messages
        if (
            text.startsWith('Error') ||
            text.startsWith('<!DOCTYPE html') ||
            text.startsWith('<html')
        ) {
            throw new Error("Proxy returned invalid response");
        }

        // Convert to JSON safely
        const data = JSON.parse(text);

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
            "The shortening service is temporarily unavailable.";

        notify.error("Failed to shorten URL.");
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
