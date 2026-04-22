document.addEventListener("DOMContentLoaded", function () {
    const container = document.createElement("div");
    container.id = "giscus_thread";
    document.querySelector("main")?.appendChild(container);
  
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "bsmeding/bsmeding.github.io");
    script.setAttribute("data-repo-id", "R_kgDONKGWLg");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDONKGWLs4CttP7");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
  
    container.appendChild(script);
  });
  