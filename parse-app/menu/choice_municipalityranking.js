(function() {
  // 「すべて表示」ボタンを自動でクリック
  var displayButton = Array.from(document.querySelectorAll('button'))
                           .find(btn => btn.innerText.indexOf("すべて表示") !== -1);
  if (displayButton) {
    displayButton.click();
    console.log("「すべて表示」ボタンをクリックしました。");
  } else {
    console.log("「すべて表示」ボタンが見つかりません。");
  }
  
  // 3秒後にデータ抽出・CSVダウンロードの処理を開始
  setTimeout(function() {
    
    // Shift-JIS変換用のエンコーディングライブラリの読み込み
    function loadEncodingLibrary(callback) {
      if (typeof Encoding === 'undefined') {
        let script = document.createElement('script');
        script.src = chrome.runtime.getURL('libs/encoding.min.js'); // Chrome拡張のローカルパスから読み込み
        script.onload = function() {
          console.log("Encoding.js loaded");
          callback();
        };
        document.body.appendChild(script);
      } else {
        callback();
      }
    }
    
    // 自治体別ランキングのデータを抽出する関数
    function extractCityRankingData() {
      var extractedData = [];
      // 対象の自治体カード： div.search-ranking 内の .search-ranking__container > ul.grid.grid-3.row-gap--20--28 の li.grid__block
      var containers = document.querySelectorAll('div.search-ranking .search-ranking__container ul.grid.grid-3.row-gap--20--28 li.grid__block');
      containers.forEach(function(container) {
        var entry = {};
        
        // ランク番号： .card-city__status 内の <span>
        try {
          var rankElem = container.querySelector('.card-city__status span');
          entry["Rank"] = rankElem ? rankElem.innerText.trim() : "";
        } catch(e) {
          entry["Rank"] = "";
        }
        
        // 自治体名： .card-city__name
        try {
          var cityElem = container.querySelector('.card-city__name');
          entry["City"] = cityElem ? cityElem.innerText.trim() : "";
        } catch(e) {
          entry["City"] = "";
        }
        
        // 人口数： 「人口数」dtに対応するdd（"人"を除去）
        try {
          var population = "";
          container.querySelectorAll('.card-city__info dl dt').forEach(function(dtElem) {
            if (dtElem.innerText.indexOf("人口数") !== -1) {
              var ddElem = dtElem.nextElementSibling;
              if (ddElem) {
                population = ddElem.innerText.replace("人", "").trim();
              }
            }
          });
          entry["Population"] = population;
        } catch(e) {
          entry["Population"] = "";
        }
        
        // 高齢者の割合： 「高齢者の割合」dtに対応するdd（"%"を除去）
        try {
          var elderlyRatio = "";
          container.querySelectorAll('.card-city__info dl dt').forEach(function(dtElem) {
            if (dtElem.innerText.indexOf("高齢者の割合") !== -1) {
              var ddElem = dtElem.nextElementSibling;
              if (ddElem) {
                elderlyRatio = ddElem.innerText.replace("%", "").trim();
              }
            }
          });
          entry["Elderly Ratio"] = elderlyRatio;
        } catch(e) {
          entry["Elderly Ratio"] = "";
        }
        
        // 子どもの割合： 「子どもの割合」dtに対応するdd（"%"を除去）
        try {
          var childRatio = "";
          container.querySelectorAll('.card-city__info dl dt').forEach(function(dtElem) {
            if (dtElem.innerText.indexOf("子どもの割合") !== -1) {
              var ddElem = dtElem.nextElementSibling;
              if (ddElem) {
                childRatio = ddElem.innerText.replace("%", "").trim();
              }
            }
          });
          entry["Child Ratio"] = childRatio;
        } catch(e) {
          entry["Child Ratio"] = "";
        }
        
        // 注目のカテゴリー： .card-city__category p のテキスト
        try {
          var catElem = container.querySelector('.card-city__category p');
          entry["Categories"] = catElem ? catElem.innerText.trim() : "";
        } catch(e) {
          entry["Categories"] = "";
        }
        
        // 説明文： .card-city__description のテキスト
        try {
          var descElem = container.querySelector('.card-city__description');
          entry["Description"] = descElem ? descElem.innerText.trim() : "";
        } catch(e) {
          entry["Description"] = "";
        }
        
        extractedData.push(entry);
      });
      return extractedData;
    }
    
    // 抽出したデータをCSV形式に変換し、Shift-JISに変換してダウンロードする関数
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
      var fileName = "choice_city_ranking_" + now.getTime() + ".csv";
      // Shift-JIS変換処理
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // エンコーディングライブラリ読み込み完了後、データ抽出・CSVダウンロードの処理を実行
    loadEncodingLibrary(function() {
      var data = extractCityRankingData();
      console.log("抽出した自治体ランキングデータ:", data);
      downloadCSV(data);
    });
    
  }, 3000); // 3秒待機
})();
