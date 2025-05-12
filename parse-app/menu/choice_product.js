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
  
    // 楽天ふるさとチョイス個別商品ページから各情報を抽出する関数
    function extractFurusatoData() {
      let data = [];
  
      // ① キーワード
      try {
        const keywordElem = document.querySelector('span.catchphrase');
        let keyword = keywordElem ? keywordElem.innerText.trim() : "N/A";
        data.push({ header: "キーワード", value: keyword });
      } catch (e) {
        data.push({ header: "キーワード", value: "N/A" });
      }
  
      // ② タイトル
      try {
        const titleElem = document.querySelector('span.ttl-h1__text.inline');
        let title = titleElem ? titleElem.innerText.trim() : "N/A";
        data.push({ header: "タイトル", value: title });
      } catch (e) {
        data.push({ header: "タイトル", value: "N/A" });
      }
  
      // ④ 値段
      try {
        const priceElem = document.querySelector('p.basicinfo_price');
        // p.basicinfo_price 内に "寄付金額" の後ろに数字があるので、テキスト全体から数字を抽出
        let priceText = priceElem ? priceElem.innerText.trim() : "";
        // 単純に数字部分のみ抜き出す（例："寄付金額 9,000 円 ..."）
        let match = priceText.match(/([\d,]+)/);
        let price = match ? match[1] : "N/A";
        data.push({ header: "値段", value: price });
      } catch (e) {
        data.push({ header: "値段", value: "N/A" });
      }
  
      // ⑧ 評価数
      try {
        // こちらは、感想件数として、"感想 <span>81</span>件" のような構造
        const reviewContainer = document.querySelector('div.review_button');
        let reviewCount = "N/A";
        if (reviewContainer) {
          const spanElem = reviewContainer.querySelector('p');
          if (spanElem) {
            // span内に "感想" と "件" が含まれており、<span>81</span>の部分を探す
            const innerSpan = spanElem.querySelector('span');
            reviewCount = innerSpan ? innerSpan.innerText.trim() : "N/A";
          }
        }
        data.push({ header: "感想件数", value: reviewCount });
      } catch (e) {
        data.push({ header: "感想件数", value: "N/A" });
      }
  
      // ⑤ お礼の品について（テーブル内の各行を個別に抽出）
      try {
        const infoTables = document.querySelectorAll('tbody.product-tbl-info__body');
        infoTables.forEach((table, tableIndex) => {
          // 判別のため、先頭のテーブルを「お礼の品について」、次を「お申し込みについて」とする例
          let sectionHeader = tableIndex === 0 ? "お礼の品について" : "お申し込みについて";
          // 各行ごとに抽出
          const rows = table.querySelectorAll('tr.product-tbl-info__row');
          rows.forEach(row => {
            const th = row.querySelector('th.product-tbl-info__label');
            const td = row.querySelector('td.product-tbl-info__wrap');
            if (th && td) {
              let label = th.innerText.trim();
              let value = td.innerText.trim();
              // ヘッダー名にセクション名を付与してもよい（例："お礼の品について - 容量"）
              data.push({ header: `${sectionHeader} - ${label}`, value: value });
            }
          });
        });
      } catch (e) {
        data.push({ header: "お礼の品について", value: "N/A" });
      }
  
      // ⑦ 概要
      try {
        const overviewElem = document.querySelector('p.overview');
        let overview = overviewElem ? overviewElem.innerText.trim() : "N/A";
        data.push({ header: "概要", value: overview });
      } catch (e) {
        data.push({ header: "概要", value: "N/A" });
      }
  
      return data;
    }
  
    // 現在のURLから商品ID部分（例："40522/4901"）を抜き出し、ファイル名を生成する関数
    function generateFurusatoFileName() {
      let url = window.location.href;
      // 例: "https://www.furusato-tax.jp/product/detail/40522/4901"
      let pattern = /https:\/\/www\.furusato-tax\.jp\/product\/detail\/([^\/]+\/[^\/]+)/;
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
      return `チョイス個別_${productId}_${dateStr}.csv`;
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
      let fileName = generateFurusatoFileName();
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
      let extractedData = extractFurusatoData();
      downloadCSV(extractedData);
    });
  })();
  