(function() {
    // エンコーディングライブラリの読み込み
    function loadEncodingLibrary(callback) {
      if (typeof Encoding === 'undefined') {
        let script = document.createElement('script');
        script.src = chrome.runtime.getURL('libs/encoding.min.js'); // ローカルのJSファイルを読み込む
        script.onload = function() {
          console.log("Encoding.js loaded");
          callback();
        };
        document.body.appendChild(script);
      } else {
        callback();
      }
    }
  
    // 「もっとみる」ボタンが存在すればクリックし、1〜2秒後にコールバックを実行する
    function clickLoadMoreButton(callback) {
      // ※ここではセレクタを一例として記述しています。実際のページのDOMに合わせて調整してください
      let loadMoreBtn = document.querySelector('button.load-more, a.load-more');
      if (loadMoreBtn) {
        console.log("Load More button found. Clicking...");
        loadMoreBtn.click();
        // 1.5秒後に次の処理へ
        setTimeout(callback, 1500);
      } else {
        callback();
      }
    }
  
    function getCurrentPageNumber() {
      var pageElem = document.querySelector('span.s-pagination-selected');
      if (pageElem) {
        var num = parseInt(pageElem.innerText.trim(), 10);
        return isNaN(num) ? "" : num;
      }
      return "";
    }
  
    // Amazonの検索結果ページから、各商品のコンテナ内の「商品名」と「価格」を抽出する
    function extractAmazonData(pageNumber) {
      var containers = document.querySelectorAll('[data-component-type="s-search-result"]');
      var extractedData = [];
      containers.forEach(function(container, index) {
        var entry = {};
        entry["No"] = index + 1; // ページ上部順の番号を追加
        entry["Page"] = pageNumber; // ページ番号を追加
  
        // タイトルの抽出例（新しいセレクタ）
        try {
          var titleElem = container.querySelector('[data-cy="title-recipe"] a h2 span');
          entry["Title"] = titleElem ? titleElem.innerText.trim() : "";
        } catch (e) {
          entry["Title"] = "";
        }
  
        // 商品リンクの抽出（指定されたセレクター）
        try {
          var linkElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-title-instructions-style > a');
          entry["ProductLink"] = linkElem ? linkElem.href : "";
        } catch (e) {
          entry["ProductLink"] = "";
        }
  
        // 価格の抽出
        try {
          var priceElem = container.querySelector(
            "div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div.a-row.a-size-base.a-color-base > div:nth-child(1) > a > span.a-price > span:nth-child(2) > span.a-price-whole"
          );
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
        } catch (e) {
          entry["Price"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div:nth-child(2) > div.a-row.a-size-base > span');
          entry["Sales figures"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Sales figures"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div.a-row.a-size-base.a-color-base > div:nth-child(1) > a > span.a-size-base.a-color-secondary');
          entry["Price per"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Price per"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div.a-row.a-size-base.a-color-secondary > span');
          entry["Point"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Point"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div:nth-child(4) > div.a-row.a-size-base.a-color-secondary.s-align-children-center > div.a-row.s-align-children-center > span > span:nth-child(4)');
          entry["Shipping date"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Shipping date"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div.a-section.a-spacing-base > div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small > div:nth-child(4) > div > div:nth-child(2) > span > span');
          entry["Shipping fee"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Shipping fee"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(1) > div > span.font-weight-b');
          entry["ASIN"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["ASIN"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > span > div');
          entry["Brand"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Brand"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div.font-ext-13.first-available-day.align-items-center > div > span.exts-color-blue.seller-name.font-weight-b.el-tooltip__trigger.el-tooltip__trigger');
          entry["Seller"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Seller"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div.font-ext-13.first-available-day.align-items-center > div > span:nth-child(3) > i');
          entry["Country"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Country"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(1) > div.font-ext-13.first-available-day.align-items-center > div > svg');
          entry["Adress"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Adress"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex.btn-collection > div:nth-child(1) > span');
          entry["Shipping method"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Shipping method"] = "";
        }
        
        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex.btn-collection > div:nth-child(1) > a');
          entry["Seller number"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Seller number"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(3) > div.font-ext-13.mr-ext-20.mb-ext-02 > span:nth-child(2)');
          entry["Advertisement ranking"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Advertisement ranking"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > p:nth-child(1)');
          entry["Category ranking"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Category ranking"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > p:nth-child(2) > span:nth-child(1) > span');
          entry["Search ranking"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["Search ranking"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(1) > span:nth-child(2) > span > span');
          entry["直近30日販売数（親）"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["直近30日販売数（親）"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > span:nth-child(2) > span > span');
          entry["直近30日販売数(子)"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["直近30日販売数(子)"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(3) > span:nth-child(2) > span > span');
          entry["販売額"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["販売額"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div.font-ext-13.d-flex-wrap.mr-ext-20.mb-ext-02 > span.exts-color-border-black.ml-ext-3.el-tooltip__trigger.el-tooltip__trigger');
          entry["FBA手数料"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["FBA手数料"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div.d-flex > div.width-50.mb-ext-02 > span.exts-color-border-black.el-tooltip__trigger.el-tooltip__trigger > span');
          entry["粗利益率"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["粗利益率"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(4) > div.d-flex > div:nth-child(2) > span.exts-color-border-black.exts-color-border-black-no-border');
          entry["バリエーション数"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["バリエーション数"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(5) > div > div > span.exts-color-border-black.grade-hover.el-tooltip__trigger.el-tooltip__trigger');
          entry["価格"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["価格"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(5) > span > span.exts-color-border-black.grade-hover.ml-ext-3.el-tooltip__trigger.el-tooltip__trigger > span:nth-child(1)');
          entry["評価"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["評価"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(5) > span > span.exts-color-border-black.grade-hover.ml-ext-3.el-tooltip__trigger.el-tooltip__trigger > span:nth-child(2)');
          entry["評価数"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["評価数"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(6) > div.font-ext-13.mr-ext-20.mb-ext-02 > span.font-weight-b');
          entry["フレーバー名"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["フレーバー名"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(6) > div:nth-child(2) > span > span.exts-color-border-black.el-tooltip__trigger.el-tooltip__trigger');
          entry["商品重量"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["商品重量"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(7) > div.font-ext-13.mr-ext-20.mb-ext-02 > span > span.exts-color-border-black.el-tooltip__trigger.el-tooltip__trigger');
          entry["商品体積"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["商品体積"] = "";
        }
        
        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(6) > div.font-ext-13.mr-ext-20.mb-ext-02 > span.font-weight-b');
          entry["サイズ"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["サイズ"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(7) > div:nth-child(2) > span > span.exts-color-border-black.el-tooltip__trigger.el-tooltip__trigger');
          entry["包装サイズ"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["包装サイズ"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(6) > div:nth-child(1) > span.font-weight-b');
          entry["スタイル"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["スタイル"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div:nth-child(7) > div:nth-child(3) > span > span.exts-color-border-black.el-tooltip__trigger.el-tooltip__trigger');
          entry["出品日付"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["出品日付"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex-wrap.rank-number-box.flex-direction-c > div:nth-child(1) > span.exts-color-border-black > span');
          entry["全てのトラフィックワード"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["全てのトラフィックワード"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex-wrap.rank-number-box.flex-direction-c > div:nth-child(2) > span.exts-color-border-black > span');
          entry["自然トラフィックワード"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["自然トラフィックワード"] = "";
        }
        
        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex-wrap.rank-number-box.flex-direction-c > div:nth-child(3) > span.exts-color-border-black > span');
          entry["広告トラフィックワード"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["広告トラフィックワード"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div.font-ext-13.d-flex-wrap.rank-number-box.flex-direction-c > div:nth-child(4) > span.exts-color-border-black > span');
          entry["検索推薦ワード"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["検索推薦ワード"] = "";
        }

        try {
          var ratingElem = container.querySelector('div > div > div > div > span > div > div:nth-child(2) > div > div > div > div > div.align-items-center.bottom-btn-groups.d-flex-wrap');
          entry["キーワード"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
          entry["キーワード"] = "";
        }
        
        
  
        extractedData.push(entry);
      });
      return extractedData;
    }
  
    // 抽出したデータをCSVに変換し、Shift-JISへ変換した上でダウンロードする
    function downloadCSV(data) {
      var csvRows = [];
      if (data.length > 0) {
        var headers = Object.keys(data[0]);
        csvRows.push(headers.join(","));
        data.forEach(function(entry) {
          var row = headers.map(function(header) {
            var cell = entry[header] || "";
            cell = cell.toString().replace(/"/g, '""');
            return '"' + cell + '"';
          });
          csvRows.push(row.join(","));
        });
      }
      var csvContent = csvRows.join("\r\n");
  
      var now = new Date();
      var fileName = "amazon_data_" + now.getTime() + ".csv";
  
      // Shift-JIS変換処理（encoding.min.js を使用）
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリ読み込み後、「もっとみる」ボタン処理、データ抽出、CSVダウンロードの流れを実行
    loadEncodingLibrary(function() {
      clickLoadMoreButton(function() {
        var pageNumber = getCurrentPageNumber();
        var data = extractAmazonData(pageNumber);
        downloadCSV(data);
      });
    });
  })();
  