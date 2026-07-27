/**
 * MkDocs Material instant navigation swaps HTML without executing inline
 * <script> tags. Re-run article scripts on each navigation (except the first).
 */
(function () {
  var skipFirst = true;

  function rerunArticleScripts() {
    var article = document.querySelector("article.md-content__inner");
    if (!article) return;

    article.querySelectorAll("script").forEach(function (oldScript) {
      var script = document.createElement("script");
      if (oldScript.type) script.type = oldScript.type;
      if (oldScript.src) {
        script.src = oldScript.src;
      } else {
        script.textContent = oldScript.textContent;
      }
      oldScript.replaceWith(script);
    });
  }

  if (typeof document$ === "undefined") return;

  document$.subscribe(function () {
    if (skipFirst) {
      skipFirst = false;
      return;
    }
    rerunArticleScripts();
  });
})();
