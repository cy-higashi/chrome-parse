(function() {
    // エンコーディングライブラリの読み込み（Amazon版と同様）
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
  
    // ふるさとチョイスのカテゴリー情報を抽出する関数
    function extractChoiceCategories() {
      var categories = [];
      // 検索カテゴリー全体のコンテナ
      var container = document.querySelector('.search-parent-categories');
      if (!container) {
        console.log("カテゴリーコンテナが見つかりませんでした。");
        return categories;
      }
      // 各カテゴリーは ul.search-category-list 内の li.search-category-list__item
      var items = container.querySelectorAll('ul.search-category-list li.search-category-list__item');
      items.forEach(function(item) {
        // カテゴリー名（.categories__name）と数値（.categories__number）を取得
        var nameElem = item.querySelector('.categories__name');
        var numElem = item.querySelector('.categories__number');
        var categoryName = nameElem ? nameElem.innerText.trim() : "";
        var categoryNum = numElem ? numElem.innerText.trim() : "";
        // カッコ（( )）が含まれている場合は除去
        categoryNum = categoryNum.replace(/^\(|\)$/g, '');
        categories.push({
          "Category": categoryName,
          "Count": categoryNum
        });
      });
      return categories;
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
      var fileName = "choice_categories_" + now.getTime() + ".csv";
  
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリ読み込み後、カテゴリー情報抽出→CSVダウンロードの流れを実行
    loadEncodingLibrary(function() {
      var data = extractChoiceCategories();
      console.log("抽出したカテゴリー情報:", data);
      downloadCSV(data);
    });
  })();
  