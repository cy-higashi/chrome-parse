// content.js
(function() {
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
  
    function extractRakutenData() {
      var blockSelector = "#root > div.dui-container.main > div.dui-container.content > div.searchResults > div > div > div > div";
      var blockElements = Array.from(document.querySelectorAll(blockSelector));
      
      var extractedData = blockElements.map(function(block) {
        var entry = {};
        try { entry["Title"] = block.querySelector("div.title--2KRhr.title-grid--18AUw > h2 > a")?.innerText.trim() || "N/A"; } catch(e){ entry["Title"] = "N/A"; }
        try { entry["URL"] = block.querySelector("div.title--2KRhr.title-grid--18AUw > h2 > a")?.href || "N/A"; } catch(e){ entry["URL"] = "N/A"; }
        try { entry["Price"] = block.querySelector("div:nth-child(3) > div.price-wrapper--10ccL > div")?.innerText.trim() || "N/A"; } catch(e){ entry["Price"] = "N/A"; }
        try { entry["Point"] = block.querySelector("div:nth-child(3) > div.points--DNEud > span:nth-child(1)")?.innerText.trim() || "N/A"; } catch(e){ entry["Point"] = "N/A"; }
        try { entry["ReviewScore"] = block.querySelector("div.content.review > a > span.score")?.innerText.trim() || "N/A"; } catch(e){ entry["ReviewScore"] = "N/A"; }
        try { entry["ReviewCount"] = block.querySelector("div.content.review > a > span.legend")?.innerText.trim() || "N/A"; } catch(e){ entry["ReviewCount"] = "N/A"; }
        try { entry["Shipping"] = block.querySelector("div.content.shipping-status > div")?.innerText.trim() || "N/A"; } catch(e){ entry["Shipping"] = "N/A"; }
        try { entry["Seller"] = block.querySelector("div.content.merchant._ellipsis > a")?.innerText.trim() || "N/A"; } catch(e){ entry["Seller"] = "N/A"; }
        try { entry["Image"] = block.querySelector("div.image-wrapper--3eWn3 > a > img")?.innerText.trim() || "N/A"; } catch(e){ entry["Image"] = "N/A"; }
        // try { entry["HOGEHOGE"] = block.querySelector("hogehoge")?.innerText.trim() || "N/A"; } catch(e){ entry["HOGEHOGE"] = "N/A"; }
        return entry;
      });
  
      return extractedData;
    }
  
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
      var fileName = "rakuten_data_" + now.getTime() + ".csv";
  
      // Shift-JISへの変換処理
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // エンコーディングライブラリを読み込んでから実行
    loadEncodingLibrary(() => {
      let extractedData = extractRakutenData();
      downloadCSV(extractedData);
    });
  })();
  