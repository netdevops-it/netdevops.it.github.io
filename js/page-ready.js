/**
 * Run callback when the page DOM is ready.
 * Works on full page loads (DOMContentLoaded) and when scripts are
 * re-injected after MkDocs Material instant navigation (DOM already ready).
 */
window.onPageReady = function (fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
};
