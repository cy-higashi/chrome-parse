(function() {
    // エンコーディングライブラリの読み込み（Shift-JIS変換用）
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
  
    // ふるさとチョイスのランキング一覧ページから各商品の情報を抽出する
    function extractFurusatoRankingData() {
      var extractedData = [];
      // ランキング一覧は ul.grid.grid-3.row-gap--20--28 内の li.grid__block として取得
      var containers = document.querySelectorAll('ul.grid.grid-3.row-gap--20--28 li.grid__block');
      containers.forEach(function(container) {
        var entry = {};
  
        // ランク番号の抽出（.card-product__status 内の <span>）
        try {
          var rankElem = container.querySelector('.card-product__status span');
          entry["SEO順位"] = rankElem ? rankElem.innerText.trim() : "";
        } catch (e) {
          entry["SEO順位"] = "";
        }
  
        // 商品タイトルの抽出（.card-product__title）
        try {
          var titleElem = container.querySelector('.card-product__title');
          entry["Title"] = titleElem ? titleElem.innerText.trim() : "";
        } catch (e) {
          entry["Title"] = "";
        }
  
        // 価格の抽出（.card-product__price）
        try {
          var priceElem = container.querySelector('.card-product__price');
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
        } catch (e) {
          entry["Price"] = "";
        }
  
        // コメント数の抽出（.card-product__comment）
        try {
          var commentElem = container.querySelector('.card-product__comment');
          var commentText = commentElem ? commentElem.innerText.trim() : "";
          // 例: "感想(79)", "レビュー 1,234件" → 数字のみ抽出
          var numericMatch = commentText.replace(/,/g, '').match(/\d+/);
          entry["ReviewCount"] = numericMatch ? numericMatch[0] : "";
        } catch (e) {
          entry["ReviewCount"] = "";
        }
  
        // ポイントの抽出（.card-product__point）
        try {
          var pointElem = container.querySelector('.card-product__point');
          entry["Point"] = pointElem ? pointElem.innerText.trim() : "";
        } catch (e) {
          entry["Point"] = "";
        }
  
        // 都市名の抽出（.card-product__city 内の <span>）
        try {
          var cityElem = container.querySelector('.card-product__city span');
          entry["Seller"] = cityElem ? cityElem.innerText.trim() : "";
        } catch (e) {
          entry["Seller"] = "";
        }
  
        // 商品リンクの抽出（a.card-product__link.product-slider__product_detail）
        try {
          var linkElem = container.querySelector('a.card-product__link.product-slider__product_detail');
          entry["URL"] = linkElem ? linkElem.href : "";
        } catch (e) {
          entry["URL"] = "";
        }
  
        extractedData.push(entry);
      });
      return extractedData;
    }
  
    // 抽出したデータをCSVに変換し、Shift-JISへ変換してダウンロードする
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
      var fileName = "choice_ranking_" + now.getTime() + ".csv";
  
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリ読み込み後、ランキング情報を抽出してCSVダウンロードを実行
    loadEncodingLibrary(function() {
      var data = extractFurusatoRankingData();
      console.log("抽出したランキングデータ:", data);
      downloadCSV(data);
    });
  })();
  