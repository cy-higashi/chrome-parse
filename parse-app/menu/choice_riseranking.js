(function() {
    // エンコーディングライブラリ（Shift-JIS変換用）の読み込み
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
  
    // 急上昇ランキングのデータを抽出する関数
    function extractTrendRankingData() {
      var extractedData = [];
      // 対象コンテナ：div.rank-trend__slider 内の ul.grid.grid-4 の li.grid__block
      var containers = document.querySelectorAll('div.rank-trend__slider ul.grid.grid-4 li.grid__block');
      containers.forEach(function(container) {
        var entry = {};
  
        // ランク番号の抽出（.card-product__status 内の <span>）
        try {
          var rankElem = container.querySelector('.card-product__status span');
          entry["SEO順位"] = rankElem ? rankElem.innerText.trim() : "";
        } catch (e) {
          entry["SEO順位"] = "";
        }
  
        // タイトルの抽出（.card-product__title）
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
  
        // コメント数の抽出（.card-product__comment）— 急上昇ランキングには存在しない場合もあるので空欄に
        try {
          var commentElem = container.querySelector('.card-product__comment');
          var rawComment = commentElem ? commentElem.innerText.trim() : "";
          var normalizedComment = rawComment.replace(/[０-９]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); });
          var numericReviewCount = normalizedComment.replace(/[^0-9]/g, '');
          entry["ReviewCount"] = numericReviewCount;
        } catch (e) {
          entry["ReviewCount"] = "";
        }
  
        // ポイントの抽出（.card-product__point）— 同様に存在しない場合は空欄
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
  
    // 抽出したデータをCSVに変換し、Shift-JISへ変換してダウンロードする関数
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
      var fileName = "choice_trend_ranking_" + now.getTime() + ".csv";
      // Shift-JIS変換
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリの読み込み完了後、データ抽出・CSVダウンロードの実行
    loadEncodingLibrary(function() {
      var data = extractTrendRankingData();
      console.log("抽出した急上昇ランキングデータ:", data);
      downloadCSV(data);
    });
  })();
  