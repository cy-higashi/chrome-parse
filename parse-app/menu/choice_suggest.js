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
  
    // サジェスト候補（ul.autocomplete内の li.js-autocomplete-list）のテキストを抽出する
    function extractSuggestData() {
      var suggestions = [];
      var ul = document.querySelector('ul.autocomplete');
      if (ul) {
        var listItems = ul.querySelectorAll('li.js-autocomplete-list');
        listItems.forEach(function(li) {
          // アイコン部分のテキストは含まれないよう、innerTextで取得
          suggestions.push(li.innerText.trim());
        });
      } else {
        console.log("サジェスト候補のコンテナが見つかりませんでした。");
      }
      return suggestions;
    }
  
    // ヒット件数（div.search-num__inner内のspan.num-resultまたはdata-response-numfound属性）の抽出
    function extractHitCount() {
      var container = document.querySelector('div.search-num__inner');
      if (container) {
        // data-response-numfound属性がある場合はそちらを優先
        var count = container.getAttribute('data-response-numfound');
        if (!count) {
          var span = container.querySelector('span.num-result');
          count = span ? span.innerText.trim() : "";
        }
        return count;
      } else {
        console.log("ヒット件数のコンテナが見つかりませんでした。");
        return "";
      }
    }
  
    // 抽出したサジェストとヒット件数のデータをCSV形式に変換し、Shift-JISへ変換してダウンロードする
    function downloadCSV(suggestions, hitCount) {
      var csvRows = [];
      // 1行目にヒット件数の情報を出力
      csvRows.push('"Hit Count","' + hitCount + '"');
      // 2行目は空行
      csvRows.push('');
      // 3行目にサジェストのヘッダーを設定
      csvRows.push('"Suggestions"');
      // 以降、各サジェスト候補を1行ずつ追加
      suggestions.forEach(function(suggest) {
        var cell = suggest.toString().replace(/"/g, '""');
        csvRows.push('"' + cell + '"');
      });
      var csvContent = csvRows.join("\r\n");
  
      var now = new Date();
      var fileName = "choice_suggest_" + now.getTime() + ".csv";
  
      // Shift-JIS変換（encoding.min.js を使用）
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリ読み込み後、3秒待機してからサジェストとヒット件数のデータを抽出し、CSVダウンロードを実行
    loadEncodingLibrary(function() {
      // サジェスト表示のため、ここではクリック等のトリガー操作が既に行われた状態を前提としています
      // 3秒後に抽出処理を実行
      setTimeout(function() {
        var suggestions = extractSuggestData();
        var hitCount = extractHitCount();
        console.log("抽出したサジェスト:", suggestions);
        console.log("抽出したヒット件数:", hitCount);
        downloadCSV(suggestions, hitCount);
      }, 3000);
    });
  })();
  