onPageReady(function () {
    initQrCodeGenerator();
});

if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
        initQrCodeGenerator();
    });
}

function initQrCodeGenerator() {
    const input = document.getElementById("qr-input");
    if (!input || typeof QRCode === "undefined" || input.dataset.qrBound === "1") return;
    input.dataset.qrBound = "1";

    const output = document.getElementById("qr-output");
    const widthInput = document.getElementById("qr-width");
    const eccSelect = document.getElementById("qr-ecc");
    const marginInput = document.getElementById("qr-margin");
    const downloadBtn = document.getElementById("qr-download");
    const clearBtn = document.getElementById("qr-clear");
    const statusEl = document.getElementById("qr-status");
    const metaEl = document.getElementById("qr-meta");

    const eccLevels = {
        L: QRCode.CorrectLevel.L,
        M: QRCode.CorrectLevel.M,
        Q: QRCode.CorrectLevel.Q,
        H: QRCode.CorrectLevel.H,
    };

    function setStatus(message, type) {
        type = type || "info";
        statusEl.textContent = message;
        statusEl.className = "status " + type;
    }

    function debounce(fn, ms) {
        var t;
        return function () {
            var args = arguments;
            var self = this;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(self, args);
            }, ms);
        };
    }

    function getWidth() {
        var w = parseInt(widthInput.value, 10) || 256;
        w = Math.min(1024, Math.max(128, w));
        widthInput.value = String(w);
        return w;
    }

    function getMargin() {
        var marginRaw = parseInt(marginInput.value, 10);
        if (Number.isNaN(marginRaw)) {
            marginInput.value = "2";
            marginRaw = 2;
        }
        return Math.min(8, Math.max(0, marginRaw));
    }

    function getQrImageDataUrl() {
        var canvas = output.querySelector("canvas");
        if (canvas) return canvas.toDataURL("image/png");
        var img = output.querySelector("img");
        return img ? img.src : null;
    }

    function renderQr() {
        output.innerHTML = "";
        var text = (input.value || "").trim();
        var w = getWidth();
        var marginSafe = getMargin();

        output.style.padding = marginSafe * 4 + "px";

        if (!text) {
            setStatus("Enter text or a URL to generate a QR code.", "info");
            metaEl.textContent = "";
            return;
        }

        try {
            new QRCode(output, {
                text: text,
                width: w,
                height: w,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: eccLevels[eccSelect.value] || eccLevels.M,
            });
            setStatus("QR code updated.", "success");
            metaEl.textContent =
                text.length + " characters · ECC " + eccSelect.value + " · " + w + "×" + w + "px";
        } catch (err) {
            setStatus(err.message || "Could not generate QR code (content may be too long).", "error");
            metaEl.textContent = "";
        }
    }

    var debouncedRender = debounce(renderQr, 120);

    input.addEventListener("input", debouncedRender);
    widthInput.addEventListener("change", renderQr);
    eccSelect.addEventListener("change", renderQr);
    marginInput.addEventListener("change", renderQr);

    clearBtn.addEventListener("click", function () {
        input.value = "";
        renderQr();
    });

    downloadBtn.addEventListener("click", function () {
        var text = (input.value || "").trim();
        if (!text) {
            setStatus("Nothing to download — enter content first.", "warning");
            return;
        }

        var dataUrl = getQrImageDataUrl();
        if (!dataUrl) {
            setStatus("Generate a QR code before downloading.", "warning");
            return;
        }

        var a = document.createElement("a");
        a.href = dataUrl;
        a.download = "qrcode.png";
        a.click();
        setStatus("PNG download started.", "success");
    });

    setStatus("Ready — type or paste content to generate.", "success");
    renderQr();
}
