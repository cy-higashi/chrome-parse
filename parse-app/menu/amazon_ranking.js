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

    // 下にスクロールして追加の商品を読み込む関数
    // 今回は簡易的に「何度かスクロールを繰り返す」例を示します
    function autoScrollToLoadAll(callback) {
        let scrollCount = 0;
        let maxScrollCount = 30; // 何回繰り返すか（適宜調整）

        let scrollInterval = setInterval(() => {
        scrollCount++;
        // 現在のスクロール位置と最大スクロール位置
        let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        let maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // 画面を少し下にスクロール
        window.scrollBy(0, 1000);

        // 一番下付近まで到達した、もしくは一定回数スクロールしたら終了
        if (currentScroll >= maxScroll || scrollCount >= maxScrollCount) {
            clearInterval(scrollInterval);
            // 最後に2秒待ってからコールバックを呼び出し、データ抽出へ
            setTimeout(callback, 1000);
        }
        }, 3000); 
        // ↑ 1.5秒おきにスクロール、という例。読み込みが遅い場合は増やす
    }
  
    // 「もっとみる」ボタンが存在すればクリックし、1〜2秒後にコールバックを実行
    // ランキングページの場合、無いケースもあるのでチェック後そのまま次へ
    function clickLoadMoreButton(callback) {
      let loadMoreBtn = document.querySelector('button.load-more, a.load-more');
      if (loadMoreBtn) {
        console.log("Load More button found. Clicking...");
        loadMoreBtn.click();
        setTimeout(callback, 1500);
      } else {
        callback();
      }
    }
  
    // ランキングページから、上記コードと同じ項目＋「ランキング順位」を抽出
    function extractAmazonRankingData() {
      // data-asinを持つコンテナを一括取得
      let containers = document.querySelectorAll('div[data-asin]');
      let extractedData = [];
  
      containers.forEach(function(container) {
        let entry = {};
  
        // -----------------------------
        // ① ランキング順位
        // -----------------------------
        try {
          let rankElem = container.querySelector('span.zg-bdg-text');
          entry["Ranking"] = rankElem ? rankElem.innerText.trim() : "";
        } catch (e) {
          entry["Ranking"] = "";
        }
  
        // -----------------------------
        // ② タイトル（商品名）
        // -----------------------------
        try {
          // ランキングページ用のタイトルクラス
          let titleElem = container.querySelector(
            'div._cDEzb_p13n-sc-css-line-clamp-2_EWgCb, div._cDEzb_p13n-sc-css-line-clamp-3_g3dy1'
          );
          entry["Title"] = titleElem ? titleElem.innerText.trim() : "";
        } catch (e) {
          entry["Title"] = "";
        }
  
        // -----------------------------
        // ③ 価格
        // -----------------------------
        try {
          let priceElem = container.querySelector('span._cDEzb_p13n-sc-price_3mJ9Z');
          entry["Price"] = priceElem ? priceElem.innerText.trim() : "";
        } catch (e) {
          entry["Price"] = "";
        }
  
        // -----------------------------
        // ④ 販売数（Sales figures）
        //    ここでは「レビュー件数」的な数字を仮で格納
        // -----------------------------
        try {
          let salesElem = container.querySelector('.a-icon-row a span');
          entry["Sales figures"] = salesElem ? salesElem.innerText.trim() : "";
        } catch (e) {
          entry["Sales figures"] = "";
        }
  
        // -----------------------------
        // ⑤ Price per
        //    ランキングページでは見当たらないケース多→Quick Viewにも無ければ空
        // -----------------------------
        entry["Price per"] = "";
  
        // -----------------------------
        // ⑥ Point（ポイント）
        //    例:「35ポイント(1%)」
        // -----------------------------
        try {
          // ポイント表記があれば取得
          let pointElem = container.querySelector('.a-row.a-size-small .a-size-base.a-color-price');
          entry["Point"] = pointElem ? pointElem.innerText.trim() : "";
        } catch (e) {
          entry["Point"] = "";
        }
  
        // -----------------------------
        // ⑦ Shipping date
        //    (例:「2024-04-18 (327日)」 は Quick View 内「出品日付」)
        // -----------------------------
        try {
          // "出品日付" と表示される要素を探す
          let shippingDateLabel = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mb-ext-02 .word-title')
          ).find(el => el.innerText.includes('出品日付:'));
          if (shippingDateLabel) {
            let shippingDateValue = shippingDateLabel.parentElement.querySelector('.exts-color-border-black');
            entry["Shipping date"] = shippingDateValue ? shippingDateValue.innerText.trim() : "";
          } else {
            entry["Shipping date"] = "";
          }
        } catch (e) {
          entry["Shipping date"] = "";
        }
  
        // -----------------------------
        // ⑧ Shipping fee
        // -----------------------------
        entry["Shipping fee"] = "";
  
        // -----------------------------
        // ⑨ ASIN
        //    Quick View の「ASIN:」部分、または data-asin 属性から取得
        // -----------------------------
        try {
          let asinElem = container.querySelector('.quick-view span.font-weight-b');
          let asinQuickView = asinElem ? asinElem.innerText.trim() : "";
          let asinDataAttr = container.getAttribute('data-asin') || "";
          entry["ASIN"] = asinQuickView || asinDataAttr;
        } catch (e) {
          entry["ASIN"] = container.getAttribute('data-asin') || "";
        }
  
        // -----------------------------
        // ⑩ Brand（ブランド）
        // -----------------------------
        try {
          let brandElem = container.querySelector('.quick-view .d-flex.align-items-center .exts-color-blue.font-weight-b');
          entry["Brand"] = brandElem ? brandElem.innerText.trim() : "";
        } catch (e) {
          entry["Brand"] = "";
        }
  
        // -----------------------------
        // ⑪ Seller（セラー）
        // -----------------------------
        try {
          let sellerElem = container.querySelector('.quick-view .seller-name');
          entry["Seller"] = sellerElem ? sellerElem.innerText.trim() : "";
        } catch (e) {
          entry["Seller"] = "";
        }
  
        // -----------------------------
        // ⑫ Country
        //    国旗アイコンなどから推測しているケースが多いが、見当たらない場合も
        // -----------------------------
        try {
          // 例: <i class="flag-icon flag-icon-jp add-icon-border">
          let flagIcon = container.querySelector('.quick-view .flag-icon');
          entry["Country"] = flagIcon ? flagIcon.className.replace('flag-icon ', '').replace(' add-icon-border','') : "";
        } catch (e) {
          entry["Country"] = "";
        }
  
        // -----------------------------
        // ⑬ Adress
        //    住所(所在地)の明記は無い場合が多い→空
        // -----------------------------
        entry["Adress"] = "";
  
        // -----------------------------
        // ⑭ Shipping method
        //    「配送: FBA」など
        // -----------------------------
        try {
          let shippingMethodElem = container.querySelector('.quick-view .offers-button');
          // 例: "配送: FBA"
          entry["Shipping method"] = shippingMethodElem ? shippingMethodElem.innerText.trim() : "";
        } catch (e) {
          entry["Shipping method"] = "";
        }
  
        // -----------------------------
        // ⑮ Seller number（セラー数）
        //    例:「セラー数: 1」
        // -----------------------------
        try {
          // .danger-tag.mt-ext-3.show-hand-shape.offers-button などにも同様にある
          let sellerNumElem = container.querySelector('.quick-view .danger-tag.mt-ext-3.show-hand-shape.offers-button');
          entry["Seller number"] = sellerNumElem ? sellerNumElem.innerText.trim().replace('セラー数:','').trim() : "";
        } catch (e) {
          entry["Seller number"] = "";
        }
  
        // -----------------------------
        // ⑯ Advertisement ranking
        //    ランキングページでは見当たらない→空
        // -----------------------------
        entry["Advertisement ranking"] = "";
  
        // -----------------------------
        // ⑰ Category ranking
        //    Quick Viewの「#5 in 家電＆カメラ」などのBSRを指す場合は複数行ある
        //    ここでは最上位カテゴリを1つ格納する例
        // -----------------------------
        try {
          let bsrList = container.querySelectorAll('.quick-view .bsr-list-item');
          // 例: "#5 in 家電＆カメラ"
          let catRank = bsrList[0] ? bsrList[0].innerText.trim() : "";
          entry["Category ranking"] = catRank;
        } catch (e) {
          entry["Category ranking"] = "";
        }
  
        // -----------------------------
        // ⑱ Search ranking
        //    2つ目のBSR要素などを仮で格納する例
        // -----------------------------
        try {
          let bsrList = container.querySelectorAll('.quick-view .bsr-list-item');
          // 例: "#1 in 携帯電話・スマートフォン用モバイルバッテリー"
          let searchRank = bsrList[1] ? bsrList[1].innerText.trim() : "";
          entry["Search ranking"] = searchRank;
        } catch (e) {
          entry["Search ranking"] = "";
        }
  
        // -----------------------------
        // ⑲ 直近30日販売数（親）
        // -----------------------------
        try {
          let parentSalesElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('直近30日販売数（親）'));
          if (parentSalesElem) {
            let valueSpan = parentSalesElem.querySelector('.exts-color-border-black.grade-hover');
            entry["直近30日販売数（親）"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["直近30日販売数（親）"] = "";
          }
        } catch (e) {
          entry["直近30日販売数（親）"] = "";
        }
  
        // -----------------------------
        // ⑳ 直近30日販売数(子)
        // -----------------------------
        try {
          let childSalesElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('直近30日販売数(子)'));
          if (childSalesElem) {
            let valueSpan = childSalesElem.querySelector('.exts-color-border-black.grade-hover');
            entry["直近30日販売数(子)"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["直近30日販売数(子)"] = "";
          }
        } catch (e) {
          entry["直近30日販売数(子)"] = "";
        }
  
        // -----------------------------
        // ㉑ 販売額
        // -----------------------------
        try {
          let saleAmountElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('販売額:'));
          if (saleAmountElem) {
            let valueSpan = saleAmountElem.querySelector('.exts-color-border-black.grade-hover');
            entry["販売額"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["販売額"] = "";
          }
        } catch (e) {
          entry["販売額"] = "";
        }
  
        // -----------------------------
        // ㉒ FBA手数料
        // -----------------------------
        try {
          let fbaFeeElem = Array.from(
            container.querySelectorAll('.quick-view .d-flex-wrap.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('FBA手数料:'));
          if (fbaFeeElem) {
            let valueSpan = fbaFeeElem.querySelector('.exts-color-border-black');
            entry["FBA手数料"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["FBA手数料"] = "";
          }
        } catch (e) {
          entry["FBA手数料"] = "";
        }
  
        // -----------------------------
        // ㉓ 粗利益率
        // -----------------------------
        try {
          let profitRateElem = Array.from(
            container.querySelectorAll('.quick-view .d-flex .width-50.mb-ext-02')
          ).find(el => el.innerText.includes('粗利益率:'));
          if (profitRateElem) {
            let valueSpan = profitRateElem.querySelector('.exts-color-border-black');
            entry["粗利益率"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["粗利益率"] = "";
          }
        } catch (e) {
          entry["粗利益率"] = "";
        }
  
        // -----------------------------
        // ㉔ バリエーション数
        // -----------------------------
        try {
          let variationElem = Array.from(
            container.querySelectorAll('.quick-view .mb-ext-02')
          ).find(el => el.innerText.includes('バリエーション数:'));
          if (variationElem) {
            let valueSpan = variationElem.querySelector('.exts-color-border-black');
            entry["バリエーション数"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["バリエーション数"] = "";
          }
        } catch (e) {
          entry["バリエーション数"] = "";
        }
  
        // -----------------------------
        // ㉕ 価格 (再掲だが、Quick Viewに別途表記ある場合)
        // -----------------------------
        try {
          let priceQVElem = Array.from(
            container.querySelectorAll('.quick-view .width-50.mb-ext-02')
          ).find(el => el.innerText.includes('価格:'));
          if (priceQVElem) {
            let valueSpan = priceQVElem.querySelector('.exts-color-border-black.grade-hover');
            entry["価格"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["価格"] = entry["Price"] || ""; // なければ上で取得したものを使う
          }
        } catch (e) {
          entry["価格"] = entry["Price"] || "";
        }
  
        // -----------------------------
        // ㉖ 評価・評価数
        //    例: 「評価(評価数): 4.4 (3,251)」
        // -----------------------------
        try {
          let evalElem = container.querySelector('.quick-view .grade-pic');
          if (evalElem) {
            // "評価(評価数): 4.4(3,251)" 等をまるごと取得
            let evalText = evalElem.innerText.replace(/\s+/g, ' ').trim();
            // 正規表現で数字部分を抜き出し
            let match = evalText.match(/(\d+(\.\d+)?)\s*\(([\d,]+)\)/);
            if (match) {
              entry["評価"] = match[1];       // 4.4
              entry["評価数"] = match[3];     // 3,251
            } else {
              entry["評価"] = "";
              entry["評価数"] = "";
            }
          } else {
            entry["評価"] = "";
            entry["評価数"] = "";
          }
        } catch (e) {
          entry["評価"] = "";
          entry["評価数"] = "";
        }
  
        // -----------------------------
        // ㉗ フレーバー名
        //    (例:「フレーバー名:」があれば取得)
        // -----------------------------
        try {
          let flavorElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('フレーバー名:'));
          if (flavorElem) {
            let valueSpan = flavorElem.querySelector('.exts-color-border-black.el-tooltip__trigger');
            entry["フレーバー名"] = valueSpan ? valueSpan.innerText.trim() : "";
          } else {
            entry["フレーバー名"] = "";
          }
        } catch (e) {
          entry["フレーバー名"] = "";
        }
  
        // -----------------------------
        // ㉘ 商品重量
        // -----------------------------
        try {
          let weightElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mb-ext-02')
          ).find(el => el.innerText.includes('商品重量:'));
          if (weightElem) {
            let val = weightElem.querySelector('.exts-color-border-black');
            entry["商品重量"] = val ? val.innerText.trim() : "";
          } else {
            entry["商品重量"] = "";
          }
        } catch (e) {
          entry["商品重量"] = "";
        }
  
        // -----------------------------
        // ㉙ 商品体積
        // -----------------------------
        try {
          let sizeElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('商品体積:'));
          if (sizeElem) {
            let val = sizeElem.querySelector('.exts-color-border-black');
            entry["商品体積"] = val ? val.innerText.trim() : "";
          } else {
            entry["商品体積"] = "";
          }
        } catch (e) {
          entry["商品体積"] = "";
        }
  
        // -----------------------------
        // ㉚ サイズ
        //    (上記と似たようなセレクタの場合あり)
        // -----------------------------
        try {
          let sizeElem2 = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('サイズ:'));
          if (sizeElem2) {
            let val = sizeElem2.querySelector('.exts-color-border-black');
            entry["サイズ"] = val ? val.innerText.trim() : "";
          } else {
            entry["サイズ"] = "";
          }
        } catch (e) {
          entry["サイズ"] = "";
        }
  
        // -----------------------------
        // ㉛ 包装サイズ
        // -----------------------------
        try {
          let packageSizeElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mr-ext-20.mb-ext-02')
          ).find(el => el.innerText.includes('包装サイズ:'));
          if (packageSizeElem) {
            let val = packageSizeElem.querySelector('.exts-color-border-black');
            entry["包装サイズ"] = val ? val.innerText.trim() : "";
          } else {
            entry["包装サイズ"] = "";
          }
        } catch (e) {
          entry["包装サイズ"] = "";
        }
  
        // -----------------------------
        // ㉜ スタイル
        // -----------------------------
        try {
          let styleElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mb-ext-02')
          ).find(el => el.innerText.includes('スタイル:'));
          if (styleElem) {
            let val = styleElem.querySelector('.font-weight-b');
            entry["スタイル"] = val ? val.innerText.trim() : "";
          } else {
            entry["スタイル"] = "";
          }
        } catch (e) {
          entry["スタイル"] = "";
        }
  
        // -----------------------------
        // ㉝ 出品日付
        //    先ほどShipping dateと同様→両方取得したいなら重複可
        // -----------------------------
        try {
          let listingDateElem = Array.from(
            container.querySelectorAll('.quick-view .font-ext-13.mb-ext-02')
          ).find(el => el.innerText.includes('出品日付:'));
          if (listingDateElem) {
            let val = listingDateElem.querySelector('.exts-color-border-black');
            entry["出品日付"] = val ? val.innerText.trim() : "";
          } else {
            entry["出品日付"] = "";
          }
        } catch (e) {
          entry["出品日付"] = "";
        }
  
        // -----------------------------
        // ㉞ 全てのトラフィックワード
        // -----------------------------
        try {
          let allWordsElem = Array.from(
            container.querySelectorAll('.quick-view .rank-number-box.flex-direction-c div')
          ).find(el => el.innerText.includes('全てのトラフィックワード:'));
          if (allWordsElem) {
            let val = allWordsElem.querySelector('.exts-color-border-black.grade-hover');
            entry["全てのトラフィックワード"] = val ? val.innerText.trim() : "";
          } else {
            entry["全てのトラフィックワード"] = "";
          }
        } catch (e) {
          entry["全てのトラフィックワード"] = "";
        }
  
        // -----------------------------
        // ㉟ 自然トラフィックワード
        // -----------------------------
        try {
          let organicWordsElem = Array.from(
            container.querySelectorAll('.quick-view .rank-number-box.flex-direction-c div')
          ).find(el => el.innerText.includes('自然トラフィックワード:'));
          if (organicWordsElem) {
            let val = organicWordsElem.querySelector('.exts-color-border-black.grade-hover');
            entry["自然トラフィックワード"] = val ? val.innerText.trim() : "";
          } else {
            entry["自然トラフィックワード"] = "";
          }
        } catch (e) {
          entry["自然トラフィックワード"] = "";
        }
  
        // -----------------------------
        // ㊱ 広告トラフィックワード
        // -----------------------------
        try {
          let adWordsElem = Array.from(
            container.querySelectorAll('.quick-view .rank-number-box.flex-direction-c div')
          ).find(el => el.innerText.includes('広告トラフィックワード:'));
          if (adWordsElem) {
            let val = adWordsElem.querySelector('.exts-color-border-black.grade-hover');
            entry["広告トラフィックワード"] = val ? val.innerText.trim() : "";
          } else {
            entry["広告トラフィックワード"] = "";
          }
        } catch (e) {
          entry["広告トラフィックワード"] = "";
        }
  
        // -----------------------------
        // ㊲ 検索推薦ワード
        // -----------------------------
        try {
          let suggestWordsElem = Array.from(
            container.querySelectorAll('.quick-view .rank-number-box.flex-direction-c div')
          ).find(el => el.innerText.includes('検索推薦ワード:'));
          if (suggestWordsElem) {
            let val = suggestWordsElem.querySelector('.exts-color-border-black.grade-hover');
            entry["検索推薦ワード"] = val ? val.innerText.trim() : "";
          } else {
            entry["検索推薦ワード"] = "";
          }
        } catch (e) {
          entry["検索推薦ワード"] = "";
        }
  
        // -----------------------------
        // ㊳ キーワード
        //    画面上に明示的な「キーワード: ...」が見当たらない場合は空
        // -----------------------------
        entry["キーワード"] = "";
  
        // 全項目を配列にプッシュ
        extractedData.push(entry);
      });
  
      return extractedData;
    }
  
    // 抽出データをCSV(Shift-JIS)でダウンロード
    function downloadCSV(data) {
      let csvRows = [];
      if (data.length > 0) {
        let headers = Object.keys(data[0]);
        csvRows.push(headers.join(","));
        data.forEach(function(entry) {
          let row = headers.map(function(header) {
            let cell = entry[header] || "";
            cell = cell.toString().replace(/"/g, '""');
            return '"' + cell + '"';
          });
          csvRows.push(row.join(","));
        });
      }
      let csvContent = csvRows.join("\r\n");
  
      let now = new Date();
      let fileName = "amazon_ranking_data_" + now.getTime() + ".csv";
  
      // Shift-JIS変換処理（encoding.min.js を使用）
      let sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      let blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // 一連の流れ
    loadEncodingLibrary(function() {
        // まず自動スクロールで全商品を読み込む
        autoScrollToLoadAll(function() {
          // スクロール後にデータを抽出してCSV出力
          let data = extractAmazonRankingData();
          downloadCSV(data);
        });
      });
    })();
  