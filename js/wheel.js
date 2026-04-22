(function () {
    const NAMES_FILE_PATH = '/assets/names.txt'; // optional
  
    const namesArea = document.getElementById('namesArea');
    const loadFromSiteBtn = document.getElementById('loadFromSiteBtn');
    const fileInput = document.getElementById('fileInput');
    const spinBtn = document.getElementById('spinBtn');
    const resultEl = document.getElementById('result');
    const canvas = document.getElementById('wheelCanvas');
  
    let theWheel = null;
  
    /* ---------- Utilities ---------- */
    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }
  
    function splitNames(raw) {
      return raw
        .split(/[\r\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
    }
  
    function setCanvasHiDPI(cnv) {
      const ratio = window.devicePixelRatio || 1;
      const rect = cnv.getBoundingClientRect();
      // If no CSS sizing yet, fall back to width attribute
      const cssW = rect.width || cnv.width;
      const cssH = rect.height || cnv.height;
      cnv.width = Math.round(cssW * ratio);
      cnv.height = Math.round(cssH * ratio);
      const ctx = cnv.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  
    /* ---------- UI builders ---------- */
    function renderCheckboxes(list) {
      namesArea.innerHTML = '';
      list.forEach(name => {
        const id = 'name_' + Math.random().toString(36).slice(2, 8);
        const row = document.createElement('div');
        row.innerHTML = `
          <label>
            <input type="checkbox" id="${id}" value="${escapeHtml(name)}" checked>
            ${escapeHtml(name)}
          </label>`;
        namesArea.appendChild(row);
      });
    }
  
    function showManualInput() {
      namesArea.innerHTML = `
        <textarea id="manualNames" placeholder="Enter names, separated by newlines, commas, or semicolons"></textarea>
      `;
    }
  
    function getSelectedNames() {
      const manual = document.getElementById('manualNames');
      if (manual) return splitNames(manual.value);
      const checks = namesArea.querySelectorAll('input[type="checkbox"]:checked');
      return Array.from(checks).map(i => i.value.trim()).filter(Boolean);
    }
  
    /* ---------- Wheel ---------- */
    function buildWheel(segments) {
      if (theWheel) {
        try { theWheel.stopAnimation(false); } catch (e) {}
        theWheel = null;
      }
  
      // Ensure the canvas is crisp on HiDPI and sized to container
      setCanvasHiDPI(canvas);
  
      theWheel = new Winwheel({
        canvasId: 'wheelCanvas',
        numSegments: segments.length,
        segments: segments.map(text => ({ text })),
        // You can tweak outerRadius or colors here if you want Material accents
        animation: {
          type: 'spinToStop',
          duration: 5,
          spins: 8,
          callbackFinished: function (seg) {
            resultEl.textContent = `🎉 Winner: ${seg.text}`;
          }
        }
      });
    }
  
    function spin() {
      const names = getSelectedNames();
      if (names.length === 0) {
        alert('Please provide at least one name.');
        return;
      }
      buildWheel(names);
      const winnerIndex = Math.floor(Math.random() * names.length);
      const stopAt = theWheel.getRandomForSegment(winnerIndex + 1);
      theWheel.animation.stopAngle = stopAt;
      theWheel.startAnimation();
    }
  
    /* ---------- Loaders ---------- */
    async function loadFromSiteFileOrShowInput() {
      try {
        const resp = await fetch(NAMES_FILE_PATH, { cache: 'no-store' });
        if (!resp.ok) throw new Error('no file');
        const text = await resp.text();
        const list = splitNames(text);
        if (list.length) renderCheckboxes(list);
        else showManualInput();
      } catch {
        showManualInput();
      }
    }
  
    function handleFileUpload(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const list = splitNames(reader.result || '');
        if (!list.length) return alert('Uploaded file is empty.');
        renderCheckboxes(list);
        resultEl.textContent = '';
      };
      reader.readAsText(file);
    }
  
    /* ---------- Hooks ---------- */
    loadFromSiteBtn?.addEventListener('click', loadFromSiteFileOrShowInput);
    fileInput?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    });
    spinBtn?.addEventListener('click', spin);
  
    // Auto-load on page ready
    document.addEventListener('DOMContentLoaded', loadFromSiteFileOrShowInput);
    window.addEventListener('resize', () => {
      // Rebuild/resize when viewport changes (optional)
      if (theWheel) {
        const segs = theWheel.segments.slice(1).map(s => s.text); // segments[0] is null in Winwheel
        buildWheel(segs);
      }
    });
  })();
  