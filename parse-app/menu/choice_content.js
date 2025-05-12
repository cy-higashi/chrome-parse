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
  
    // ふるさとチョイスの検索結果ページから、各商品のコンテナ内の「タイトル」と「価格」を抽出する
    function extractFurusatoData() {
      // 各商品のコンテナは li.search-result-card であると仮定
      var containers = document.querySelectorAll('li.search-result-card');
      var extractedData = [];
      containers.forEach(function(container) {
        var entry = {};
  
        // タイトルの抽出 (.card-product__title)
        try {
          var titleElem = container.querySelector('.card-product__title');
          entry["Title"] = titleElem ? titleElem.innerText.trim() : "";
        } catch (e) {
          entry["Title"] = "";
        }
  
        // 価格の抽出 (.card-product__price)
        try {
          var priceElem = container.querySelector('.card-product__price');
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
        } catch (e) {
          entry["Price"] = "";
        }

        try {
            var priceElem = container.querySelector('.card-product__point');
            entry["Point"] = priceElem ? priceElem.innerText.trim() : "";
          } catch (e) {
            entry["Point"] = "";
          }

        try {
            var ratingElem = container.querySelector('.flag--pr');
            entry["PR"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
            entry["PR"] = "";
        }

        try {
            var ratingElem = container.querySelector('.card-product__city');
            entry["City"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
            entry["City"] = "";
        }

        try {
            var ratingElem = container.querySelector('.card-product__txt');
            entry["Explanation"] = ratingElem ? ratingElem.innerText.trim() : "";
        } catch (e) {
            entry["Explanation"] = "";
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
      var fileName = "furusato_data_" + now.getTime() + ".csv";
  
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
  
    // エンコーディングライブラリ読み込み後、データ抽出・CSVダウンロードの流れを実行
    loadEncodingLibrary(function() {
      var data = extractFurusatoData();
      downloadCSV(data);
    });
  })();
  