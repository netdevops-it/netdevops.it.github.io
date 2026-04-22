window.addEventListener("load", function(){
    window.cookieconsent.initialise({
      palette: {
        popup: { background: "#263238" },
        button: { background: "#ff9800", text: "#000" }
      },
      theme: "classic",
      position: "bottom",
      content: {
        message: "This website uses cookies to ensure you get the best experience.",
        dismiss: "Got it!",
        link: "Learn more",
        href: "/privacy/"
      }
    });
  });
  