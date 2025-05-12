// menu/amazon_summary.js
(function() {
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
  
    // 【Amazon用】セレクターでデータを取得
    function extractAmazonData() {
      let data = [];
  
      try {
        let monthlySearchVolume = document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.keyword-container > div.keyword')?.innerText.trim() || "N/A";
        data.push({ header: "検索ワード", value: monthlySearchVolume });
      } catch(e) {
        data.push({ header: "検索ワード", value: "N/A" });
      }

      try {
        let monthlySearchVolume = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.sentence > span.product-num')?.innerText.trim() || "N/A";
        data.push({ header: "分析数", value: monthlySearchVolume });
      } catch(e) {
        data.push({ header: "分析数", value: "N/A" });
      }

      try {
        let monthlySearchVolume = document.querySelector('#seller-sprite-extension-quick-search-volume > div > span > span')?.innerText.trim() || "N/A";
        data.push({ header: "月間検索数", value: monthlySearchVolume });
      } catch(e) {
        data.push({ header: "月間検索数", value: "N/A" });
      }
  
      try {
        let searchHits = document.querySelector('#search > span > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > h2 > span:nth-child(1)')?.innerText.trim() || "N/A";
        data.push({ header: "検索ヒット数", value: searchHits });
      } catch(e) {
        data.push({ header: "検索ヒット数", value: "N/A" });
      }
  
      try {
        let abaWeekRank = document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.aba > div.aba-num > span:nth-child(1)')?.innerText.trim() || "N/A";
        data.push({ header: "ABA週順位", value: abaWeekRank });
      } catch(e) {
        data.push({ header: "ABA週順位", value: "N/A" });
      }

      try {
        let abaWeekRank = document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.month-search > div.aba-num > span.is-up-green')?.innerText.trim() || "-";
        abaWeekRank += document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.aba > div.aba-num > span.is-down-red')?.innerText.trim() || "";
        data.push({ header: "ABA週順位変動", value: abaWeekRank });
      } catch(e) {
        data.push({ header: "ABA週順位変動", value: "N/A" });
      }
  
      try {
        let weeklySearchVolume = document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.month-search > div.aba-num > span:nth-child(1)')?.innerText.trim() || "N/A";
        data.push({ header: "週間検索数", value: weeklySearchVolume });
      } catch(e) {
        data.push({ header: "週間検索数", value: "N/A" });
      }

      try {
        let weeklySearchVolume = document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.aba > div.aba-num > span.is-up-green')?.innerText.trim() || "-";
        weeklySearchVolume += document.querySelector('#quick-view-page > div.quick-view-page-container > div.view-left > div > div > div.month-search > div.aba-num > span.is-down-red')?.innerText.trim() || "";
        data.push({ header: "週間検索数変動", value: weeklySearchVolume });
      } catch(e) {
        data.push({ header: "週間検索数変動", value: "N/A" });
      }
  
      try {
        let totalsales = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(1) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "総販売数", value: totalsales });
      } catch(e) {
        data.push({ header: "総販売数", value: "N/A" });
      }

      try {
        let totalsalesamount = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(3) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "総販売額", value: totalsalesamount });
      } catch(e) {
        data.push({ header: "総販売額", value: "N/A" });
      }

      try {
        let bsraverage = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(5) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "平均BSR", value: bsraverage });
      } catch(e) {
        data.push({ header: "平均BSR", value: "N/A" });
      }

      try {
        let priceaverage = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(7) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "平均価格", value: priceaverage });
      } catch(e) {
        data.push({ header: "平均価格", value: "N/A" });
      }

      try {
        let valueaverage = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(9) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "平均星評価", value: valueaverage });
      } catch(e) {
        data.push({ header: "平均星評価", value: "N/A" });
      }

      try {
        let valuecountaverage = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(11) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "平均評価数", value: valuecountaverage });
      } catch(e) {
        data.push({ header: "平均評価数", value: "N/A" });
      }

      try {
        let periodaverage = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.second-line > div.statistics-container > div:nth-child(13) > p.statistics-item-count.statistics-item-count-for-click.count-hover-active')?.innerText.trim() || "N/A";
        data.push({ header: "平均販売期間", value: periodaverage });
      } catch(e) {
        data.push({ header: "平均販売期間", value: "N/A" });
      }

      try {
        let totalproduct = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(1) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計総数", value: totalproduct });
      } catch(e) {
        data.push({ header: "商品数統計総数", value: "N/A" });
      }

      try {
        let natural = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(2) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計自然", value: natural });
      } catch(e) {
        data.push({ header: "商品数統計自然", value: "N/A" });
      }

      try {
        let sp = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(3) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計SP", value: sp });
      } catch(e) {
        data.push({ header: "商品数統計SP", value: "N/A" });
      }

      try {
        let sb = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(4) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計SB", value: sb });
      } catch(e) {
        data.push({ header: "商品数統計SB", value: "N/A" });
      }

      try {
        let sbv = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(5) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計SBV", value: sbv });
      } catch(e) {
        data.push({ header: "商品数統計SBV", value: "N/A" });
      }

      try {
        let hr = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(6) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計HR", value: hr });
      } catch(e) {
        data.push({ header: "商品数統計HR", value: "N/A" });
      }

      try {
        let ac = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(7) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計AC", value: ac });
      } catch(e) {
        data.push({ header: "商品数統計AC", value: "N/A" });
      }

      try {
        let er = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(8) > span')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計ER", value: er });
      } catch(e) {
        data.push({ header: "商品数統計ER", value: "N/A" });
      }

      try {
        let fourstar = document.querySelector('#quick-view-page > div.quick-view-integrate-listing > div.third-line > div.tags > span:nth-child(9)')?.innerText.trim() || "N/A";
        data.push({ header: "商品数統計4つ星", value: fourstar });
      } catch(e) {
        data.push({ header: "商品数統計4つ星", value: "N/A" });
      }

      return data;
    }
  
    // 【Amazon用】取得したデータをCSVダウンロード (A列:ヘッダー, B列:値)
    function downloadCSV(data) {
      let csvRows = [];
      // 行ごとに "ヘッダー","値" の2列で出力
      data.forEach(function(item) {
        let header = (item.header || "").replace(/"/g, '""');
        let value = (item.value || "").replace(/"/g, '""');
        csvRows.push(`"${header}","${value}"`);
      });
  
      let csvContent = csvRows.join("\r\n");
      let now = new Date();
      let fileName = "amazon_summary_" + now.getTime() + ".csv";
  
      // Shift-JISへの変換処理
      let sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      let blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリを読み込んでから実行
    loadEncodingLibrary(() => {
      let extractedData = extractAmazonData();
      downloadCSV(extractedData);
    });
  })();
  