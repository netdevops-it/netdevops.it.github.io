---
title: "YAML ↔ JSON Converter"
description: "Convert between YAML and JSON with pretty or compact JSON output"
tags: ["tools", "yaml", "json", "converter", "formatting"]
---

# YAML ↔ JSON Converter

Convert YAML to JSON and JSON to YAML in your browser. Choose readable (pretty) or one-line JSON output when converting from YAML.

## How to Use

1. **Select direction**: Choose YAML → JSON or JSON → YAML
2. **Paste input**: Enter your content in the text area
3. **JSON format** (YAML → JSON only): Pick pretty-printed or one-liner output
4. **Convert**: Click Convert or press the button after editing

---

<div class="yaml-json-converter-container">
    <div class="controls-section">
        <div class="direction-group">
            <label class="control-label"><strong>Conversion:</strong></label>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="direction" value="yaml-to-json" checked>
                    YAML → JSON
                </label>
                <label class="radio-option">
                    <input type="radio" name="direction" value="json-to-yaml">
                    JSON → YAML
                </label>
            </div>
        </div>

        <div class="format-group" id="json-format-group">
            <label class="control-label"><strong>JSON output:</strong></label>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="json-format" value="pretty" checked>
                    Readable (pretty)
                </label>
                <label class="radio-option">
                    <input type="radio" name="json-format" value="oneline">
                    One-liner (compact)
                </label>
            </div>
        </div>
    </div>

    <div class="converter-grid">
        <div class="input-section">
            <label for="converter-input"><strong id="input-label">YAML Input:</strong></label>
            <textarea id="converter-input" rows="18" placeholder="Paste YAML here...&#10;&#10;Example:&#10;name: John Doe&#10;age: 30&#10;skills:&#10;  - Python&#10;  - Ansible"></textarea>
        </div>

        <div class="output-section">
            <label for="converter-output"><strong id="output-label">JSON Output:</strong></label>
            <textarea id="converter-output" rows="18" readonly placeholder="Converted result will appear here..."></textarea>
        </div>
    </div>

    <div class="button-group">
        <button id="convert-btn" class="action-btn">Convert</button>
        <button id="swap-btn" class="action-btn secondary">Swap &amp; reverse</button>
        <button id="copy-btn" class="action-btn secondary">Copy output</button>
        <button id="clear-btn" class="action-btn secondary">Clear</button>
    </div>

    <div class="info-panel">
        <div id="converter-status" class="status info">Ready</div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
<script>
onPageReady(function() {
    const input = document.getElementById("converter-input");
    const output = document.getElementById("converter-output");
    const convertBtn = document.getElementById("convert-btn");
    const swapBtn = document.getElementById("swap-btn");
    const copyBtn = document.getElementById("copy-btn");
    const clearBtn = document.getElementById("clear-btn");
    const status = document.getElementById("converter-status");
    const inputLabel = document.getElementById("input-label");
    const outputLabel = document.getElementById("output-label");
    const jsonFormatGroup = document.getElementById("json-format-group");
    const directionRadios = document.querySelectorAll('input[name="direction"]');
    const jsonFormatRadios = document.querySelectorAll('input[name="json-format"]');

    function getDirection() {
        return document.querySelector('input[name="direction"]:checked').value;
    }

    function getJsonFormat() {
        return document.querySelector('input[name="json-format"]:checked').value;
    }

    function updateStatus(message, type = "info") {
        status.textContent = message;
        status.className = `status ${type}`;
    }

    function updateLabels() {
        const yamlToJson = getDirection() === "yaml-to-json";
        inputLabel.textContent = yamlToJson ? "YAML Input:" : "JSON Input:";
        outputLabel.textContent = yamlToJson ? "JSON Output:" : "YAML Output:";
        input.placeholder = yamlToJson
            ? "Paste YAML here...\n\nExample:\nname: John Doe\nage: 30\nskills:\n  - Python\n  - Ansible"
            : 'Paste JSON here...\n\nExample:\n{\n  "name": "John Doe",\n  "age": 30,\n  "skills": ["Python", "Ansible"]\n}';
        jsonFormatGroup.style.display = yamlToJson ? "block" : "none";
    }

    function formatJson(value) {
        return getJsonFormat() === "pretty"
            ? JSON.stringify(value, null, 2)
            : JSON.stringify(value);
    }

    function convert() {
        const text = input.value.trim();
        if (!text) {
            output.value = "";
            updateStatus("Enter content to convert", "warning");
            return;
        }

        try {
            if (getDirection() === "yaml-to-json") {
                const parsed = jsyaml.load(text);
                output.value = formatJson(parsed);
                updateStatus("Converted YAML to JSON", "success");
            } else {
                const parsed = JSON.parse(text);
                output.value = jsyaml.dump(parsed, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true,
                    sortKeys: false
                });
                updateStatus("Converted JSON to YAML", "success");
            }
        } catch (e) {
            output.value = "";
            updateStatus("Error: " + e.message, "error");
        }
    }

    function swapAndReverse() {
        const outputText = output.value.trim();
        if (!outputText) {
            updateStatus("Nothing to swap — convert first", "warning");
            return;
        }

        const newDirection = getDirection() === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json";
        input.value = outputText;
        output.value = "";

        directionRadios.forEach(function(radio) {
            radio.checked = radio.value === newDirection;
        });
        updateLabels();
        convert();
    }

    function copyOutput() {
        const text = output.value;
        if (!text) {
            updateStatus("Nothing to copy", "warning");
            return;
        }

        navigator.clipboard.writeText(text).then(function() {
            updateStatus("Copied to clipboard", "success");
        }).catch(function() {
            output.select();
            document.execCommand("copy");
            updateStatus("Copied to clipboard", "success");
        });
    }

    function clearAll() {
        input.value = "";
        output.value = "";
        updateStatus("Ready", "info");
    }

    convertBtn.addEventListener("click", convert);
    swapBtn.addEventListener("click", swapAndReverse);
    copyBtn.addEventListener("click", copyOutput);
    clearBtn.addEventListener("click", clearAll);

    directionRadios.forEach(function(radio) {
        radio.addEventListener("change", function() {
            updateLabels();
            output.value = "";
            updateStatus("Ready", "info");
        });
    });

    jsonFormatRadios.forEach(function(radio) {
        radio.addEventListener("change", function() {
            if (getDirection() === "yaml-to-json" && input.value.trim()) {
                convert();
            }
        });
    });

    updateLabels();
});
</script>

<style>
.yaml-json-converter-container {
    margin: 2rem 0;
}

.controls-section {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.control-label {
    display: block;
    margin-bottom: 0.5rem;
}

.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    font-weight: normal;
}

.converter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.input-section, .output-section {
    display: flex;
    flex-direction: column;
}

.input-section label, .output-section label {
    margin-bottom: 0.5rem;
    font-weight: bold;
}

#converter-input, #converter-output {
    width: 100%;
    min-height: 360px;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
}

#converter-output {
    background-color: #f8f9fa;
    color: #495057;
}

#converter-output:not(:placeholder-shown) {
    border-color: #28a745;
    background-color: #f8fff9;
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

.info-panel {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.status {
    font-weight: bold;
}

.status.success {
    color: #28a745;
}

.status.error {
    color: #dc3545;
}

.status.warning {
    color: #ffc107;
}

.status.info {
    color: #17a2b8;
}

@media (max-width: 768px) {
    .converter-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .controls-section {
        flex-direction: column;
        gap: 1rem;
    }

    .button-group {
        justify-content: center;
    }
}
</style>

---

## Features

- **Bidirectional**: Convert YAML to JSON or JSON to YAML
- **JSON formats**: Pretty-printed (readable) or compact one-liner
- **Swap & reverse**: Move output to input and flip direction in one click
- **Copy output**: One-click copy to clipboard
- **Responsive design**: Works on desktop and mobile

## Privacy & Security

🔒 **100% Client-side**: All processing happens in your browser. No data is sent to any server or saved anywhere.

## Examples

### YAML → JSON (pretty)

```yaml
host: switch01
interfaces:
  - name: GigabitEthernet0/1
    enabled: true
```

```json
{
  "host": "switch01",
  "interfaces": [
    {
      "name": "GigabitEthernet0/1",
      "enabled": true
    }
  ]
}
```

### YAML → JSON (one-liner)

Same input produces:

```json
{"host":"switch01","interfaces":[{"name":"GigabitEthernet0/1","enabled":true}]}
```

### JSON → YAML

```json
{"vlan": 100, "name": "management", "active": true}
```

```yaml
vlan: 100
name: management
active: true
```
