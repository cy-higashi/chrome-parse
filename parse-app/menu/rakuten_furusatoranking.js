(function() {
    // もし「すべて表示」ボタンがあればクリックする（ボタンテキストに「すべて表示」を含む）
    var showButton = Array.from(document.querySelectorAll('button'))
                            .find(btn => btn.innerText.indexOf("すべて表示") !== -1);
    if (showButton) {
      showButton.click();
      console.log("「すべて表示」ボタンをクリックしました。");
    } else {
      console.log("「すべて表示」ボタンは見つかりませんでした。");
    }
    
    // 3秒待機してから処理を開始
    setTimeout(function() {
      
      // 自動抽出する関数
      function extractRakutenRankingData() {
        var data = [];
        // 商品リストは ul.rl-columnPC4.rc-itemRankingAlcor 内の各 li.ri-item
        var items = document.querySelectorAll("ul.rl-columnPC4.rc-itemRankingAlcor li.ri-item");
        
        items.forEach(function(li) {
          var entry = {};
          
          // 順位（例：<p class="ri-item__rank"><span class="ru-ff-roboto">1</span>位</p>）
          var rankElem = li.querySelector("p.ri-item__rank span");
          entry["Rank"] = rankElem ? rankElem.innerText.trim() : "";
          
          // 商品名（例：<p class="ri-item__name -text2lines">…</p>）
          var nameElem = li.querySelector("p.ri-item__name");
          entry["Product Name"] = nameElem ? nameElem.innerText.trim() : "";
          
          // 商品URL（画像リンクのhref）
          var prodLink = li.querySelector("a.ri-item__imageLink");
          entry["Product URL"] = prodLink ? prodLink.href : "";
          
          // 価格（例：<p class="ri-item__price">13,000円〜</p>）
          var priceElem = li.querySelector("p.ri-item__price");
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
          
          // 評価（数値）　例：<span class="rev1">4.43</span>
          var ratingElem = li.querySelector("span.rev1");
          entry["Rating"] = ratingElem ? ratingElem.innerText.trim() : "";
          
          // レビュー件数　例：<span class="rev2">(1745件)</span> → 数字のみ抽出
          var reviewElem = li.querySelector("span.rev2");
          if (reviewElem) {
            var reviewText = reviewElem.innerText.trim();
            reviewText = reviewText.replace(/[()件]/g, ""); // 括弧と「件」を除去
            entry["Review Count"] = reviewText;
          } else {
            entry["Review Count"] = "";
          }
          
          // ショップ名（例：<div class="ri-item__shopName -text1line">…</div>）
          var shopNameElem = li.querySelector("div.ri-item__shopName");
          entry["Shop Name"] = shopNameElem ? shopNameElem.innerText.trim() : "";
          
          // ショップURL（例：a.ri-item__shopLink のhref）
          var shopLinkElem = li.querySelector("a.ri-item__shopLink");
          entry["Shop URL"] = shopLinkElem ? shopLinkElem.href : "";
          
          data.push(entry);
        });
        
        return data;
      }
      
      // Shift-JIS変換ライブラリ（Encoding.js）の読み込み（Chrome拡張等で利用する場合の例）
      function loadEncodingLibrary(callback) {
        if (typeof Encoding === 'undefined') {
          var script = document.createElement('script');
          // ※各自環境に合わせたパスに変更してください
          script.src = chrome.runtime ? chrome.runtime.getURL('libs/encoding.min.js') : 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js';
          script.onload = function() {
            console.log("Encoding.js を読み込みました。");
            callback();
          };
          document.body.appendChild(script);
        } else {
          callback();
        }
      }
      
      // CSVに変換し、Shift-JISに変換してダウンロードする関数
      function downloadCSV(data) {
        var csvRows = [];
        if (data.length > 0) {
          var headers = Object.keys(data[0]);
          csvRows.push(headers.join(","));
          data.forEach(function(entry) {
            var row = headers.map(function(header) {
              var cell = entry[header] || "";
              // セル内のダブルクォートをエスケープ
              cell = cell.toString().replace(/"/g, '""');
              return '"' + cell + '"';
            });
            csvRows.push(row.join(","));
          });
        }
        var csvContent = csvRows.join("\r\n");
        var now = new Date();
        var fileName = "rakuten_furusato_ranking_" + now.getTime() + ".csv";
        
        // Shift-JISに変換
        var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
        var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // 3秒後にデータ抽出とCSVダウンロードの処理開始
      var extractedData = extractRakutenRankingData();
      console.log("抽出した楽天ランキングデータ:", extractedData);
      
      loadEncodingLibrary(function() {
        downloadCSV(extractedData);
      });
      
    }, 100); // 3秒待機
  })();
  