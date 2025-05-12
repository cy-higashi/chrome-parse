(function() {
    // エンコーディングライブラリの読み込み
    function loadEncodingLibrary(callback) {
      if (typeof Encoding === 'undefined') {
        let script = document.createElement('script');
        script.src = chrome.runtime.getURL('libs/encoding.min.js');
        script.onload = function() {
          console.log("Encoding.js loaded");
          callback();
        };
        document.body.appendChild(script);
      } else {
        callback();
      }
    }
  
    // Amazon個別商品ページから各情報を抽出する関数
    function extractProductData() {
      let data = [];
  
      // ① タイトル
      try {
        const titleElem = document.querySelector('#productTitle');
        let title = titleElem ? titleElem.innerText.trim() : "N/A";
        data.push({ header: "タイトル", value: title });
      } catch (e) {
        data.push({ header: "タイトル", value: "N/A" });
      }
  
      // ② ASIN（#title_feature_divのdata-csa-c-asin属性を優先）
      let asinValue = "N/A";
      try {
        const titleDiv = document.querySelector('#title_feature_div');
        asinValue = titleDiv ? titleDiv.getAttribute('data-csa-c-asin') : "";
        if (!asinValue) {
          const asinElem = document.querySelector('div[data-v-f2ad2dce] span.font-weight-b');
          asinValue = asinElem ? asinElem.innerText.trim() : "N/A";
        }
        data.push({ header: "ASIN", value: asinValue });
      } catch (e) {
        data.push({ header: "ASIN", value: "N/A" });
      }
  
      // ③ 金額
      try {
        const priceWhole = document.querySelector('span.a-price-whole');
        let price = priceWhole ? ("￥" + priceWhole.innerText.trim()) : "N/A";
        data.push({ header: "金額", value: price });
      } catch (e) {
        data.push({ header: "金額", value: "N/A" });
      }
  
      // ④ 個数あたり金額
      try {
        const unitPriceElem = document.querySelector('span.pricePerUnit');
        let unitPrice = "";
        if (unitPriceElem) {
          const match = unitPriceElem.innerText.match(/￥[\d,]+/);
          unitPrice = match ? match[0] : "";
        }
        data.push({ header: "個数あたり金額", value: unitPrice || "N/A" });
      } catch (e) {
        data.push({ header: "個数あたり金額", value: "N/A" });
      }
  
      // ⑤ 発送
      try {
        const deliveryElem = document.querySelector('span[data-csa-c-type="element"][data-csa-c-delivery-price]');
        let delivery = deliveryElem ? deliveryElem.innerText.trim() : "N/A";
        data.push({ header: "発送", value: delivery });
      } catch (e) {
        data.push({ header: "発送", value: "N/A" });
      }
  
      // ⑥ 発送者名
      try {
        const fulfillerElem = document.querySelector('a[data-csa-c-content-id="odf-desktop-fulfiller-info"] span.offer-display-feature-text-message');
        let fulfiller = fulfillerElem ? fulfillerElem.innerText.trim() : "N/A";
        data.push({ header: "発送者名", value: fulfiller });
      } catch (e) {
        data.push({ header: "発送者名", value: "N/A" });
      }
  
      // ⑦ 販売者名
      try {
        const merchantElem = document.querySelector('a[data-csa-c-content-id="odf-desktop-merchant-info"] span.offer-display-feature-text-message');
        let merchant = merchantElem ? merchantElem.innerText.trim() : "N/A";
        data.push({ header: "販売者名", value: merchant });
      } catch (e) {
        data.push({ header: "販売者名", value: "N/A" });
      }
  
      // ⑧ レビュー数
      try {
        const reviewCountElem = document.querySelector('#acrCustomerReviewText');
        let reviewCount = reviewCountElem ? reviewCountElem.innerText.trim() : "N/A";
        data.push({ header: "レビュー数", value: reviewCount });
      } catch (e) {
        data.push({ header: "レビュー数", value: "N/A" });
      }
  
      // ⑨ レビュー評価
      try {
        const ratingElem = document.querySelector('a.a-popover-trigger.a-declarative span.a-size-base.a-color-base');
        let rating = ratingElem ? ratingElem.innerText.trim() : "N/A";
        data.push({ header: "レビュー評価", value: rating });
      } catch (e) {
        data.push({ header: "レビュー評価", value: "N/A" });
      }
  
      // ⑩ 点数（ある場合）
      try {
        let boldElems = document.querySelectorAll('span.a-text-bold');
        let score = "";
        boldElems.forEach(el => {
          if (el.innerText.indexOf("点") !== -1) {
            score = el.innerText.trim();
          }
        });
        data.push({ header: "点数", value: score || "N/A" });
      } catch (e) {
        data.push({ header: "点数", value: "N/A" });
      }
  
      // ⑪ 割引金額
      try {
        const discountElem = document.querySelector('.apex-savings-badge .savingsPercentage');
        let discount = discountElem ? discountElem.innerText.trim() : "N/A";
        data.push({ header: "割引金額", value: discount });
      } catch (e) {
        data.push({ header: "割引金額", value: "N/A" });
      }
  
      // ⑫ 元値
      try {
        const listPriceElem = document.querySelector('span.a-price.a-text-price[data-a-strike="true"] span.a-offscreen');
        let listPrice = listPriceElem ? listPriceElem.innerText.trim() : "N/A";
        data.push({ header: "元値", value: listPrice });
      } catch (e) {
        data.push({ header: "元値", value: "N/A" });
      }
  
      // ⑬ 他出品
      try {
        const otherOfferElem = document.querySelector('#aod-ingress-link');
        let otherOffer = otherOfferElem ? otherOfferElem.innerText.trim() : "N/A";
        data.push({ header: "他出品", value: otherOffer });
      } catch (e) {
        data.push({ header: "他出品", value: "N/A" });
      }
  
      // ⑭ 商品情報（テーブルの各行を「項目名: 値」として連結）
      try {
        const infoTable = document.querySelector('table.a-normal.a-spacing-micro');
        let infoText = "";
        if (infoTable) {
          const rows = infoTable.querySelectorAll('tr');
          rows.forEach(row => {
            const headerCell = row.querySelector('td.a-span3 span.a-text-bold');
            const valueCell = row.querySelector('td.a-span9 span.po-break-word');
            if (headerCell && valueCell) {
              infoText += headerCell.innerText.trim() + ": " + valueCell.innerText.trim() + "; ";
            }
          });
        }
        data.push({ header: "商品情報", value: infoText || "N/A" });
      } catch (e) {
        data.push({ header: "商品情報", value: "N/A" });
      }
  
      // ⑮ 仕様（「この商品について」内の箇条書きを連結）
      try {
        const featureBullets = document.querySelector('#feature-bullets ul.a-unordered-list');
        let featureText = "";
        if (featureBullets) {
          const items = featureBullets.querySelectorAll('li');
          items.forEach(item => {
            featureText += item.innerText.trim() + " | ";
          });
        }
        data.push({ header: "仕様", value: featureText || "N/A" });
      } catch (e) {
        data.push({ header: "仕様", value: "N/A" });
      }
  
      return data;
    }
  
    // 取得したデータをCSV (A列: ヘッダー, B列: 値) としてダウンロードする処理
    function downloadCSV(data) {
      let csvRows = [];
      data.forEach(function(item) {
        let header = (item.header || "").replace(/"/g, '""');
        let value = (item.value || "").replace(/"/g, '""');
        csvRows.push(`"${header}","${value}"`);
      });
      let csvContent = csvRows.join("\r\n");
  
      // ASINと今日の日付でファイル名を生成
      let asin = data.find(item => item.header === "ASIN")?.value || "N_A";
      let now = new Date();
      // YYYYMMDD形式にフォーマット
      let yyyy = now.getFullYear();
      let mm = ("0" + (now.getMonth() + 1)).slice(-2);
      let dd = ("0" + now.getDate()).slice(-2);
      let dateStr = `${yyyy}${mm}${dd}`;
      let fileName = `Amazon個別_${asin}_${dateStr}.csv`;
  
      let sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      let blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリを読み込んでから実行
    loadEncodingLibrary(() => {
      let extractedData = extractProductData();
      downloadCSV(extractedData);
    });
  })();
  