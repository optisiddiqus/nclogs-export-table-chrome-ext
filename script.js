(async () => {
  function getHtmlFromString(htmlString) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlString.trim();
    return tempContainer.firstChild;
  }

  function appendExportButton() {
    if (document.querySelector("#custom-export-btn")) {
      return;
    }
    const menu = document.querySelector(
      ".euiHeaderLinks__list.euiHeaderLinks__list--gutterXS"
    );
    if (!menu) {
      return;
    }
    const htmlString = `<button id="custom-export-btn" class="euiButtonEmpty euiButtonEmpty--primary euiButtonEmpty--xSmall euiHeaderLink" type="button" data-test-subj="openInspectorButton"><span class="euiButtonContent euiButtonEmpty__content"><span class="euiButtonEmpty__text">Export</span></span></button>`;
    const htmlElem = getHtmlFromString(htmlString);
    htmlElem.onclick = downloadTable;
    menu.appendChild(htmlElem);
  }

  async function autoScrollTableToBottom(waitMs = 1500, maxTries = 20) {
    let tries = 0;
    let lastCount = 0;

    function findScrollableDivWithTable() {
      return Array.from(document.querySelectorAll("div")).find(
        (div) =>
          div.scrollHeight > div.clientHeight && div.querySelector("table")
      );
    }
    function getRowCount(container) {
      const tbody = container.querySelector("tbody");
      return tbody ? tbody.children.length : 0;
    }

    while (tries < maxTries) {
      const container = findScrollableDivWithTable();
      if (!container) throw new Error("No scrollable table container found!");
      container.scrollTop = container.scrollHeight;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      // Await loading
      const newCount = getRowCount(container);

      if (newCount === lastCount) break;
      // Stop if no new rows
      lastCount = newCount;
      tries++;
    }
    console.log("Scrolling finished. Total rows:", lastCount);
  }

  // Usage example in DevTools (inside async context):
  // await autoScrollTableToBottom();

  function downloadJsonArrayAsTSV(jsonArray, filename = "data.tsv") {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      alert("JSON array is empty or not valid!");
      return;
    }

    const headers = Object.keys(jsonArray[0]);
    const tsvRows = [
      headers.join("\t"),
      ...jsonArray.map((obj) =>
        headers.map((h) => String(obj[h] ?? "")).join("\t")
      ),
    ];
    const tsvText = tsvRows.join("\n");

    const blob = new Blob([tsvText], {
      type: "text/tab-separated-values",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function extractTable() {
    const headers = [...document.querySelectorAll(".docTableHeaderField")].map(
      (h) => h.innerText.trim()
    );

    const elements = [
      ...document.querySelectorAll('[data-test-subj="docTableField"]'),
    ];

    const results = [];

    while (true) {
      if (elements.length <= 0) {
        break;
      }
      let index = headers.length - 1;
      const obj = {};
      while (true) {
        if (index < 0) {
          break;
        }
        const element = elements.pop();
        const headerName = headers[index];
        obj[headerName] = element ? element.innerText : "N/A";
        index--;
      }
      results.push(obj);
    }
    return results;
  }

  async function downloadTable() {
    await autoScrollTableToBottom();
    const results = extractTable();
    downloadJsonArrayAsTSV(results);
  }

  appendExportButton();
  setInterval(appendExportButton, 1000);
})();
