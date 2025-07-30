(function() {
    // 「すべて表示」ボタンがあればクリックする
    var showButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.innerText.indexOf("すべて表示") !== -1);
    if (showButton) {
      showButton.click();
      console.log("「すべて表示」ボタンをクリックしました。");
    } else {
      console.log("「すべて表示」ボタンは見つかりませんでした。");
    }
  
    // 3秒待機してから処理開始
    setTimeout(function() {
  
      // 抽出関数：トップ3（.rnkRanking_top3box）とそれ以降（.rnkRanking_after4box）両方を対象にする
      function extractRakutenRankingData() {
        var data = [];
        // 対象コンテナを両方のクラスから取得
        var containers = document.querySelectorAll("#rnkRankingMain .rnkRanking_top3box, #rnkRankingMain .rnkRanking_after4box");
        
        containers.forEach(function(container) {
          var entry = {};
  
          // 【順位】:
          // トップ3の場合は .rnkRanking_rankIcon img のalt属性、以降の場合は .rnkRanking_dispRank のテキストを利用
          var rank;
          var rankIconImg = container.querySelector(".rnkRanking_rankIcon img");
          if (rankIconImg) {
            rank = rankIconImg.alt.replace("位", "").trim();
          } else {
            var dispRank = container.querySelector(".rnkRanking_dispRank");
            rank = dispRank ? dispRank.innerText.trim() : "";
          }
          entry["Rank"] = rank;
          
          // 【商品URL】：画像リンク内のaタグのhref
          var prodLinkElem = container.querySelector(".rnkRanking_imageBox a");
          entry["URL"] = prodLinkElem ? prodLinkElem.href : "";
          
          // 【商品名】：.rnkRanking_itemName a のテキスト
          var prodNameElem = container.querySelector(".rnkRanking_itemName a");
          entry["Title"] = prodNameElem ? prodNameElem.innerText.trim() : "";
          
          // 【価格】：.rnkRanking_price のテキスト
          var priceElem = container.querySelector(".rnkRanking_price");
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
          
          // 【評価】：星の個数を算出（.rnkRanking_starONは1点、.rnkRanking_starHALFは0.5点）
          var fullStars = container.querySelectorAll(".rnkRanking_starBox .rnkRanking_starON").length;
          var halfStars = container.querySelectorAll(".rnkRanking_starBox .rnkRanking_starHALF").length;
          entry["ReviewScore"] = (fullStars + halfStars * 0.5).toString();
          
          // 【レビュー件数】：例「レビュー(24,227件)」の中から数字部分のみ抽出
          var reviewLink = container.querySelector(".rnkRanking_starBox a");
          if (reviewLink) {
            var reviewText = reviewLink.innerText.trim();
            // 「レビュー(」と「件)」を取り除く
            reviewText = reviewText.replace("レビュー(", "").replace("件)", "").replace(/,/g, "");
            entry["ReviewCount"] = reviewText;
          } else {
            entry["ReviewCount"] = "";
          }
          
          // 【ショップ名】＆【ショップURL】：.rnkRanking_shop a
          var shopLinkElem = container.querySelector(".rnkRanking_shop a");
          entry["Seller"] = shopLinkElem ? shopLinkElem.innerText.trim() : "";
          entry["SellerURL"] = shopLinkElem ? shopLinkElem.href : "";
  
          data.push(entry);
        });
        
        return data;
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
        var fileName = "rakuten_ranking_" + now.getTime() + ".csv";
        
        // Shift-JIS変換：Encoding.jsを利用（ライブラリが未読込の場合はCDNから読み込み）
        function doDownload() {
          var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
          var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
          var link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        if (typeof Encoding === 'undefined') {
          // Encoding.jsが未読込の場合、外部CDNから読み込む
          var script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/1.0.30/encoding.min.js';
          script.onload = function() {
            console.log("Encoding.js を読み込みました。");
            doDownload();
          };
          document.body.appendChild(script);
        } else {
          doDownload();
        }
      }
      
      var extractedData = extractRakutenRankingData();
      console.log("抽出した楽天ランキングデータ:", extractedData);
      downloadCSV(extractedData);
      
    }, 100); // 3秒待機
  })();
  