const RESET = /* html */`<style>
  body {
    margin: 1.5rem;
    font-family: Jost, sans-serif;
    font-size: 1.25rem;
  }

  scrollbar-color: #777 #aaa;
  scrollbar-gutter: stable both-edges;

  &::-webkit-scrollbar-track-piece { background: #bbb; }
  &::-webkit-scrollbar { background: #aaa; }
  &::-webkit-scrollbar-thumb { background: #777; }
</style>`;

class CodeWrapper extends HTMLElement {
  connectedCallback() {
    this.init();

    this.setActiveTab(0);
  }

  init() {
    this.codeBlocks = [...this.querySelectorAll(":scope > pre")];
    this.codeBlocks.forEach(block => {
      block.classList.add(block.firstElementChild.classList.item(0).replace("language-", ""));
      block.classList.add("block")
    });
    this.labels = this.codeBlocks.map(block => block.classList.item(0));
    this.createTabs();

    const existDemo = this.codeBlocks.find(block => block.firstElementChild.classList.contains("demo"));
    const existResize = this.codeBlocks.find(block => block.firstElementChild.classList.contains("resize"));
    const hiddenBlocks = this.codeBlocks.map((block, index) => block.firstElementChild.classList.contains("hidden") ? index : false).filter(item => item);
    if (existDemo) {
      existDemo.classList.remove("demo");
      this.createDemoTab();
    }
    if (existResize) {
      existResize.classList.remove("resize");
      this.toggleAttribute("resize");
    }
    if (hiddenBlocks.length > 0) {
      hiddenBlocks.forEach(index => {
        this.codeBlocks[index].classList.remove("hidden");
        this.codeBlocks[index].toggleAttribute("hidden");
        this.tabs[index].toggleAttribute("hidden");
      });
    }
    this.codeBlocks.forEach((block, index) => {
      const element = block.querySelector(":scope > code");
      const hasTitle = element ? element.hasAttribute("data-title") : false;
      hasTitle && (this.tabs[index].textContent = element.getAttribute("data-title"));
    });
    this.createButtons();
  }

  createTabs() {
    const tabs = document.createElement("menu");
    tabs.classList.add("tabs");
    this.prepend(tabs);

    this.codeBlocks.forEach(block => {
      const name = block.classList.item(0).replace("language-", "");
      const tab = this.createTabName(name);
      tabs.append(tab);
    });
    this.tabs = [...tabs.querySelectorAll(".tabs .tab")];
  }

  createTabName(name) {
    const tab = document.createElement("button");
    tab.textContent = name;
    tab.classList.add("tab", name);
    tab.addEventListener("click", () => {
      const number = this.tabs.findIndex(item => item === tab);
      this.setActiveTab(number);
    });
    return tab;
  }

  createDemoTab() {
    const iframe = document.createElement("iframe");
    iframe.classList.add("block");

    const tab = this.createTabName("demo");
    tab.addEventListener("click", () => this.enableDemo(), { once: true });
    this.querySelector(".tabs").append(tab);

    this.tabs.push(tab);
    this.codeBlocks.push(iframe);
    this.demo = iframe;
    this.append(iframe);
  }

  enableDemo() {
    const iframe = this.querySelector("iframe.block");
    iframe.srcdoc = RESET + this.getIframeContent();
    iframe.addEventListener("load", () => {
      const height = parseFloat(getComputedStyle(iframe.contentDocument.body).height);
      iframe.style.setProperty("--height", `${height + 50}px`);
    }, { once: true });
  }

  getIframeContent() {
    const html = [];

    this.codeBlocks.forEach(block => {
      const label = block.classList.item(0).replace("language-", "");

      if (label === "html") {
        html.push(block.textContent);
      } else if (label === "css") {
        html.push(`<style>${block.textContent}</style>`);
      } else if (label === "js") {
        html.push(`<script type="module">${block.textContent}</script>`);
      }
    });

    return html.join("");
  }

  createButtons() {
    const buttons = document.createElement("div");
    buttons.classList.add("code-buttons");

    const copyButton = document.createElement("button");
    copyButton.classList.add("btn", "copy");
    copyButton.innerHTML = "<svg><title>Copiar</title><use href=\"/assets/icons/icons.svg#copy\" /></svg>";
    copyButton.addEventListener("click", () => {
      const component = copyButton.parentElement.parentElement;
      const code = component.querySelector("pre.active").textContent;
      console.log({ component, code, copyButton });
      navigator.clipboard.writeText(code)
        .then(clipText => {
          // copyButton.disabled = true;
        });
    });
    buttons.append(copyButton);

    const refreshButton = document.createElement("button");
    refreshButton.classList.add("btn", "refresh");
    refreshButton.innerHTML = "<svg><title>Actualizar</title><use href=\"/assets/icons/icons.svg#refresh\" /></svg>";
    refreshButton.addEventListener("click", () => {
      const iframe = this.querySelector("iframe.block");
      // eslint-disable-next-line
      iframe.srcdoc = iframe.srcdoc;
      iframe.style.width = "100%";
    });
    buttons.append(refreshButton);

    this.append(buttons);
  }

  setActiveTab(number) {
    this.resetTabs();
    this.codeBlocks.at(number).classList.add("active");
    this.tabs.at(number).classList.add("active");
  }

  resetTabs() {
    this.codeBlocks.forEach(block => block.classList.remove("active"));
    this.tabs.forEach(item => item.classList.remove("active"));
  }
}

customElements.define("code-wrapper", CodeWrapper);
