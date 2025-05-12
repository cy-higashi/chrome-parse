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
  
    // 検索部をクリックしてサジェスト表示をトリガーし、3秒待機する
    function triggerSuggest(callback) {
      // Amazonの検索ボックス（例：ID "twotabsearchtextbox"）
      var searchBox = document.querySelector('#twotabsearchtextbox');
      if (searchBox) {
        searchBox.click();
        console.log("検索ボックスをクリックしました。サジェストを表示中...");
      } else {
        console.log("検索ボックスが見つかりませんでした。");
      }
      // 3秒後にコールバック実行（サジェスト表示の完了を待つ）
      setTimeout(callback, 3000);
    }
  
    // サジェスト情報（サジェスト名と数字）を抽出する
    function extractSuggestData() {
      var suggestions = [];
      // サジェスト全体は左ペインのコンテナ内にあるので、まずそのコンテナを取得
      var container = document.querySelector('.left-pane-results-container');
      if (!container) {
        console.log("サジェストコンテナが見つかりませんでした。");
        return suggestions;
      }
      // 各サジェストは、.s-suggestion-container 内の .s-suggestion 要素にある
      var suggestionElems = container.querySelectorAll('.s-suggestion-container .s-suggestion');
      suggestionElems.forEach(function(el) {
        // サジェスト名は aria-label 属性にある（または getAttribute で取得）
        var suggestName = el.getAttribute('aria-label') || "";
        // 数字は子要素の .keyword-num 内にある
        var numElem = el.querySelector('div.s-suggestion.s-suggestion-ellipsis-direction > span.sugex-counter');
        var suggestNum = numElem ? numElem.innerText.trim() : "";
        suggestions.push({
          Suggestion: suggestName,
          Count: suggestNum
        });
      });
      return suggestions;
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
      var fileName = "amazon_suggest_" + now.getTime() + ".csv";
  
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
  
    // ライブラリ読み込み後、検索部クリック→3秒待機→サジェスト抽出→CSVダウンロードの流れを実行
    loadEncodingLibrary(function() {
      triggerSuggest(function() {
        var data = extractSuggestData();
        console.log("抽出したサジェストデータ:", data);
        downloadCSV(data);
      });
    });
  })();
  