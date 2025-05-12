document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------
  // 楽天メニューのトグル
  // ----------------------------
  const toggleRakutenBtn = document.getElementById('toggle-rakuten');
  const rakutenMenu = document.getElementById('rakuten-menu');
  let isRakutenOpen = false;

  toggleRakutenBtn.addEventListener('click', () => {
    isRakutenOpen = !isRakutenOpen;
    if (isRakutenOpen) {
      rakutenMenu.style.display = 'block';
      toggleRakutenBtn.textContent = '▼ 楽天検索結果';
    } else {
      rakutenMenu.style.display = 'none';
      toggleRakutenBtn.textContent = '▶ 楽天検索結果';
    }
  });

  // ----------------------------
  // Amazonメニューのトグル
  // ----------------------------
  const toggleAmazonBtn = document.getElementById('toggle-amazon');
  const amazonMenu = document.getElementById('amazon-menu');
  let isAmazonOpen = false;

  toggleAmazonBtn.addEventListener('click', () => {
    isAmazonOpen = !isAmazonOpen;
    if (isAmazonOpen) {
      amazonMenu.style.display = 'block';
      toggleAmazonBtn.textContent = '▼ Amazon検索結果';
    } else {
      amazonMenu.style.display = 'none';
      toggleAmazonBtn.textContent = '▶ Amazon検索結果';
    }
  });

  // ----------------------------
  // チョイスメニューのトグル
  // ----------------------------
  const toggleChoiceBtn = document.getElementById('toggle-choice');
  const choiceMenu = document.getElementById('choice-menu');
  let isChoiceOpen = false;

  toggleChoiceBtn.addEventListener('click', () => {
    isChoiceOpen = !isChoiceOpen;
    if (isChoiceOpen) {
      choiceMenu.style.display = 'block';
      toggleChoiceBtn.textContent = '▼ チョイス検索結果';
    } else {
      choiceMenu.style.display = 'none';
      toggleChoiceBtn.textContent = '▶ チョイス検索結果';
    }
  });

  // ----------------------------
  // 楽天個別メニューのトグル
  // ----------------------------
  const toggleRakutenEachBtn = document.getElementById('toggle-rakuten-each');
  const rakutenEachMenu = document.getElementById('rakuten-each-menu');
  let isRakutenEachOpen = false;

  toggleRakutenEachBtn.addEventListener('click', () => {
    isRakutenEachOpen = !isRakutenEachOpen;
    if (isRakutenEachOpen) {
      rakutenEachMenu.style.display = 'block';
      toggleRakutenEachBtn.textContent = '▼ 楽天個別';
    } else {
      rakutenEachMenu.style.display = 'none';
      toggleRakutenEachBtn.textContent = '▶ 楽天個別';
    }
  });

  // ----------------------------
  // Amazon個別メニューのトグル
  // ----------------------------
  const toggleAmazonEachBtn = document.getElementById('toggle-amazon-each');
  const amazonEachMenu = document.getElementById('amazon-each-menu');
  let isAmazonEachOpen = false;

  toggleAmazonEachBtn.addEventListener('click', () => {
    isAmazonEachOpen = !isAmazonEachOpen;
    if (isAmazonEachOpen) {
      amazonEachMenu.style.display = 'block';
      toggleAmazonEachBtn.textContent = '▼ Amazon個別';
    } else {
      amazonEachMenu.style.display = 'none';
      toggleAmazonEachBtn.textContent = '▶ Amazon個別';
    }
  });

  // ----------------------------
  // チョイス個別メニューのトグル
  // ----------------------------
  const toggleChoiceEachBtn = document.getElementById('toggle-choice-each');
  const choiceEachMenu = document.getElementById('choice-each-menu');
  let isChoiceEachOpen = false;

  toggleChoiceEachBtn.addEventListener('click', () => {
    isChoiceEachOpen = !isChoiceEachOpen;
    if (isChoiceEachOpen) {
      choiceEachMenu.style.display = 'block';
      toggleChoiceEachBtn.textContent = '▼ チョイス個別';
    } else {
      choiceEachMenu.style.display = 'none';
      toggleChoiceEachBtn.textContent = '▶ チョイス個別';
    }
  });

  // ----------------------------
  // 楽天ボタンの実行処理
  // ----------------------------
  document.getElementById("fetch-rakuten").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_content.js"]
    });
  });

  document.getElementById("fetch-histogram").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_histogram.js"]
    });
  });

  document.getElementById("fetch-suggest").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_suggest.js"]
    });
  });

  document.getElementById("fetch-furusatoranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_furusatoranking.js"]
    });
  });

  document.getElementById("fetch-ranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_ranking.js"]
    });
  });

  document.getElementById("fetch-rakutenproduct").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/rakuten_product.js"]
    });
  });

  // ----------------------------
  // Amazonボタンの実行処理
  // ----------------------------
  document.getElementById("fetch-amazon").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/amazon_content.js"]
    });
  });

  document.getElementById("fetch-amazonsummary").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/amazon_summary.js"]
    });
  });

  document.getElementById("fetch-amazonsuggest").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/amazon_suggest.js"]
    });
  });

  document.getElementById("fetch-amazonranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/amazon_ranking.js"]
    });
  });

  document.getElementById("fetch-amazonproduct").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/amazon_product.js"]
    });
  });

  // ----------------------------
  // チョイスボタンの実行処理
  // ----------------------------
  document.getElementById("fetch-choice").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_content.js"]
    });
  });

  document.getElementById("fetch-choicecategory").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_category.js"]
    });
  });

  document.getElementById("fetch-choicesuggest").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_suggest.js"]
    });
  });

  document.getElementById("fetch-choiceranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_ranking.js"]
    });
  });

  document.getElementById("fetch-choiceriseranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_riseranking.js"]
    });
  });

  document.getElementById("fetch-choicemunicipalityranking").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_municipalityranking.js"]
    });
  });

  document.getElementById("fetch-choiceproduct").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["libs/encoding.min.js", "menu/choice_product.js"]
    });
  });
});
