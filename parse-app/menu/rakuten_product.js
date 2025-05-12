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
  
    // 楽天個別商品ページから必要な情報を抽出する関数
    function extractRakutenProductData() {
      let data = [];
      // ① キーワード
      try {
        const keywordElem = document.querySelector('span.normal_reserve_catch_copy');
        let keyword = keywordElem ? keywordElem.innerText.trim() : "N/A";
        data.push({ header: "キーワード", value: keyword });
      } catch (e) {
        data.push({ header: "キーワード", value: "N/A" });
      }
  
      // ② タイトル
      try {
        const titleElem = document.querySelector('span.normal_reserve_item_name b');
        let title = titleElem ? titleElem.innerText.trim() : "N/A";
        data.push({ header: "タイトル", value: title });
      } catch (e) {
        data.push({ header: "タイトル", value: "N/A" });
      }
  
      // ③ 商品番号
      try {
        const itemNumElem = document.querySelector('td[nowrap] span.normal_reserve_item_number');
        let itemNum = itemNumElem ? itemNumElem.innerText.trim() : "N/A";
        data.push({ header: "商品番号", value: itemNum });
      } catch (e) {
        data.push({ header: "商品番号", value: "N/A" });
      }
  
      // ④ 値段
      try {
        const priceElem = document.querySelector('div.number-display--3L2fG div.value--3Z7Nj');
        let price = priceElem ? priceElem.innerText.trim() : "N/A";
        data.push({ header: "値段", value: price });
      } catch (e) {
        data.push({ header: "値段", value: "N/A" });
      }
  
      // ⑤ 送料
      try {
        const shippingElem = document.querySelector('div.text-display--1Iony.type-body--1W5uC.size-x-large--20opE');
        let shipping = shippingElem ? shippingElem.innerText.trim() : "N/A";
        data.push({ header: "送料", value: shipping });
      } catch (e) {
        data.push({ header: "送料", value: "N/A" });
      }
  
      // ⑥ ポイント
      try {
        const pointElem = document.querySelector('div.point-summary__total___3rYYD span');
        let point = pointElem ? pointElem.innerText.trim() + "ポイント" : "N/A";
        data.push({ header: "ポイント", value: point });
      } catch (e) {
        data.push({ header: "ポイント", value: "N/A" });
      }
  
      // ⑦ 評価
      try {
        const ratingElem = document.querySelector('div.text-display--1Iony.type-header--18XjX.size-medium--JpmnL');
        let rating = ratingElem ? ratingElem.innerText.trim() : "N/A";
        data.push({ header: "評価", value: rating });
      } catch (e) {
        data.push({ header: "評価", value: "N/A" });
      }
  
        // ⑧ 評価数（新しいケースも考慮）
        try {
            // まず、number-displayクラス内のテキストを取得
            let reviewCountElem = document.querySelector('div.number-display--3L2fG.layout-inline--TxdJ_ div.text-display--1Iony.type-body--1W5uC.size-large--3esfg');
            // なければ、従来のセレクタで取得
            if (!reviewCountElem) {
            reviewCountElem = document.querySelector('div.text-display--1Iony.type-body--1W5uC.size-large--3esfg');
            }
            let reviewCount = "N/A";
            if (reviewCountElem) {
            let text = reviewCountElem.innerText;
            let match = text.match(/(\d[\d,]*)/);
            reviewCount = match ? match[1] : "N/A";
            }
            data.push({ header: "評価数", value: reviewCount });
        } catch (e) {
            data.push({ header: "評価数", value: "N/A" });
        }
  
      // ⑨ 商品説明
      try {
        const descElem = document.querySelector('span.item_desc');
        let description = descElem ? descElem.innerText.trim() : "N/A";
        data.push({ header: "商品説明", value: description });
      } catch (e) {
        data.push({ header: "商品説明", value: "N/A" });
      }
  
      return data;
    }
  
    // ファイル名を楽天のURLから生成する関数
    function generateRakutenFileName() {
      let url = window.location.href;
      // 例: "https://item.rakuten.co.jp/f092096-moka/ae05/" → "f092096-moka/ae05"
      let pattern = /https:\/\/item\.rakuten\.co\.jp\/([^\/]+\/[^\/]+)\/?/;
      let match = url.match(pattern);
      let productId = match ? match[1] : "N_A";
      // スラッシュをアンダースコアに変換
      productId = productId.replace("/", "_");
      // 今日の日付（YYYYMMDD形式）
      let now = new Date();
      let yyyy = now.getFullYear();
      let mm = ("0" + (now.getMonth() + 1)).slice(-2);
      let dd = ("0" + now.getDate()).slice(-2);
      let dateStr = `${yyyy}${mm}${dd}`;
      return `楽天個別_${productId}_${dateStr}.csv`;
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
      let fileName = generateRakutenFileName();
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
      let extractedData = extractRakutenProductData();
      downloadCSV(extractedData);
    });
  })();
  