---
title: "QR Code Generator"
description: "Create QR codes in the browser from text or URLs — no server upload"
tags: ["tools", "qr", "qrcode", "barcode", "generator"]
---

# QR Code Generator

Generate QR codes as you type. Works for URLs, plain text, Wi‑Fi strings (`WIFI:T:...`), vCards, and other common QR payloads.

## How to Use

1. **Enter content** in the text area (URL, text, or structured payload).
2. Adjust **size** and **error correction** if needed.
3. **Download PNG** to save the image, or scan the code directly from the screen.

---

<div class="qr-generator-container">
    <div class="qr-input-section">
        <label for="qr-input"><strong>Content:</strong></label>
        <textarea id="qr-input" rows="8" placeholder="https://netdevops.it/&#10;&#10;Or any text the QR should encode…"></textarea>

        <div class="qr-options">
            <div class="qr-option">
                <label for="qr-width"><strong>Size (px):</strong></label>
                <input type="number" id="qr-width" min="128" max="1024" step="32" value="256">
            </div>
            <div class="qr-option">
                <label for="qr-ecc"><strong>Error correction:</strong></label>
                <select id="qr-ecc">
                    <option value="L">L (~7%)</option>
                    <option value="M" selected>M (~15%)</option>
                    <option value="Q">Q (~25%)</option>
                    <option value="H">H (~30%)</option>
                </select>
            </div>
            <div class="qr-option">
                <label for="qr-margin"><strong>Quiet zone:</strong></label>
                <input type="number" id="qr-margin" min="0" max="8" value="2" title="Modules of margin around the code">
            </div>
        </div>

        <div class="button-group">
            <button type="button" id="qr-download" class="action-btn">Download PNG</button>
            <button type="button" id="qr-clear" class="action-btn secondary">Clear</button>
        </div>
    </div>

    <div class="qr-output-section">
        <label><strong>Preview:</strong></label>
        <div class="qr-canvas-wrap">
            <canvas id="qr-canvas" width="256" height="256" aria-label="QR code preview"></canvas>
        </div>
        <div class="info-panel">
            <div id="qr-status" class="status info">Loading library…</div>
            <div id="qr-meta" class="qr-meta"></div>
        </div>
    </div>
</div>

<script type="module">
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

function debounce(fn, ms) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
    };
}

function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

onPageReady(() => {
    const input = document.getElementById("qr-input");
    const canvas = document.getElementById("qr-canvas");
    const widthInput = document.getElementById("qr-width");
    const eccSelect = document.getElementById("qr-ecc");
    const marginInput = document.getElementById("qr-margin");
    const downloadBtn = document.getElementById("qr-download");
    const clearBtn = document.getElementById("qr-clear");
    const statusEl = document.getElementById("qr-status");
    const metaEl = document.getElementById("qr-meta");

    function setStatus(message, type = "info") {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
    }

    async function renderQr() {
        const text = (input.value || "").trim();
        const w = Math.min(1024, Math.max(128, parseInt(widthInput.value, 10) || 256));
        widthInput.value = String(w);
        let marginRaw = parseInt(marginInput.value, 10);
        if (Number.isNaN(marginRaw)) {
            marginInput.value = "2";
            marginRaw = 2;
        }
        const marginSafe = Math.min(8, Math.max(0, marginRaw));

        if (!text) {
            canvas.width = w;
            canvas.height = w;
            clearCanvas(canvas);
            setStatus("Enter text or a URL to generate a QR code.", "info");
            metaEl.textContent = "";
            return;
        }

        try {
            await QRCode.toCanvas(canvas, text, {
                width: w,
                margin: marginSafe,
                errorCorrectionLevel: eccSelect.value,
                color: { dark: "#000000", light: "#ffffff" },
            });
            setStatus("QR code updated.", "success");
            metaEl.textContent = `${text.length} characters · ECC ${eccSelect.value} · ${w}×${w}px`;
        } catch (err) {
            clearCanvas(canvas);
            setStatus(err.message || "Could not generate QR code (content may be too long).", "error");
            metaEl.textContent = "";
        }
    }

    const debouncedRender = debounce(renderQr, 120);

    input.addEventListener("input", debouncedRender);
    widthInput.addEventListener("change", renderQr);
    eccSelect.addEventListener("change", renderQr);
    marginInput.addEventListener("change", renderQr);

    clearBtn.addEventListener("click", () => {
        input.value = "";
        renderQr();
    });

    downloadBtn.addEventListener("click", async () => {
        const text = (input.value || "").trim();
        if (!text) {
            setStatus("Nothing to download — enter content first.", "warning");
            return;
        }
        const w = Math.min(1024, Math.max(128, parseInt(widthInput.value, 10) || 256));
        let marginRaw = parseInt(marginInput.value, 10);
        if (Number.isNaN(marginRaw)) marginRaw = 2;
        const marginSafe = Math.min(8, Math.max(0, marginRaw));
        try {
            const dataUrl = await QRCode.toDataURL(text, {
                width: w,
                margin: marginSafe,
                errorCorrectionLevel: eccSelect.value,
                color: { dark: "#000000", light: "#ffffff" },
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "qrcode.png";
            a.click();
            setStatus("PNG download started.", "success");
        } catch (err) {
            setStatus(err.message || "Download failed.", "error");
        }
    });

    setStatus("Ready — type or paste content to generate.", "success");
    renderQr();
});
</script>

<style>
.qr-generator-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 2rem 0;
    align-items: start;
}

.qr-input-section,
.qr-output-section {
    display: flex;
    flex-direction: column;
}

.qr-input-section label,
.qr-output-section label {
    margin-bottom: 0.5rem;
    font-weight: bold;
}

#qr-input {
    width: 100%;
    min-height: 160px;
    font-family: "Roboto Mono", monospace;
    font-size: 14px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
}

.qr-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    align-items: flex-end;
}

.qr-option {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.qr-option label {
    margin-bottom: 0;
    font-size: 0.9rem;
}

#qr-width {
    width: 6rem;
    padding: 0.4rem 0.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
}

#qr-ecc,
#qr-margin {
    padding: 0.4rem 0.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    min-width: 8rem;
}

.button-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.action-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.action-btn:not(.secondary) {
    background-color: #007bff;
    color: white;
}

.action-btn:not(.secondary):hover {
    background-color: #0056b3;
}

.action-btn.secondary {
    background-color: #6c757d;
    color: white;
}

.action-btn.secondary:hover {
    background-color: #545b62;
}

.qr-canvas-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    min-height: 200px;
}

#qr-canvas {
    max-width: 100%;
    height: auto;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
}

.info-panel {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.status {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.status.success {
    color: #28a745;
}

.status.error {
    color: #dc3545;
}

.status.warning {
    color: #856404;
}

.status.info {
    color: #17a2b8;
}

.qr-meta {
    font-size: 0.9em;
    color: #6c757d;
}

@media (max-width: 768px) {
    .qr-generator-container {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .button-group {
        justify-content: center;
    }
}
</style>

---

## Features

- **Live preview** while you type (short debounce for smooth typing).
- **Configurable size** (128–1024 px) and **error correction** (L / M / Q / H).
- **Quiet zone** (margin) control for scanners that need more border.
- **Download PNG** with one click.

## Privacy & Security

**Client-side only:** Content is encoded in your browser by the [qrcode](https://www.npmjs.com/package/qrcode) library (MIT), loaded once from [jsDelivr](https://www.jsdelivr.com/). Your text is not sent to NetDevOps.it servers for QR generation.

## Technical Notes

- **Capacity:** Very long payloads can exceed QR limits; the tool shows an error if so.
- **Offline:** After the first visit, the library may be cached by your browser; a network is still required on first load unless you self-host the script.
