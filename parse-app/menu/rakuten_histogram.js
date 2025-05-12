(function(){
    // ヒストグラムデータを抽出する
    function extractHistogramData(){
      let selector = '#root > div.dui-container.main > div.dui-container.aside > div.filtersContainer.sidebar > div > div:nth-child(4) > div > div > div.content > div.price.histogram.fixed';
      let container = document.querySelector(selector);
      if(!container){
        alert('ヒストグラムの要素が見つかりません');
        return null;
      }
      let bars = container.querySelectorAll('div.histogram.bar');
      let data = [["Price Range (Min)", "Price Range (Max)", "Display Price", "Count"]];
      bars.forEach(bar => {
        let pMin = bar.getAttribute('data-from') || 'N/A';
        let pMax = bar.getAttribute('data-to') || 'N/A';
        let pDisp = bar.getAttribute('data-text') || `${pMin}円 〜 ${pMax}円`;
        let cnt = (bar.getAttribute('data-count') || '').replace(/[^0-9]/g, '');
        data.push([pMin, pMax, pDisp, cnt]);
      });
      if(data.length === 1){
        alert('データが取得できませんでした');
        return null;
      }
      return data;
    }
    
    // CSV を生成しShift-JISに変換してダウンロードする
    function downloadCSV(data){
      let csvRows = [];
      if(data.length > 0){
         // ヘッダー行
         let headers = data[0];
         csvRows.push(headers.join(","));
         // データ行
         for(let i = 1; i < data.length; i++){
           let row = data[i].map(cell => {
             cell = cell.toString().replace(/"/g, '""');
             return `"${cell}"`;
           });
           csvRows.push(row.join(","));
         }
      }
      let csvContent = csvRows.join("\r\n");
      let now = new Date();
      let fileName = "rakuten_histogram_" + now.getTime() + ".csv";
      
      // Shift-JISへ変換
      var sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
      var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Encoding ライブラリの読み込み
    function loadEncodingLibrary(callback) {
        if (typeof Encoding === 'undefined') {
            let script = document.createElement('script');
            script.src = chrome.runtime.getURL('libs/encoding.min.js'); // ローカルファイルを読み込む
            script.onload = function(){
               callback();
            };
            document.body.appendChild(script);
        } else {
            callback();
        }
    }
    
    loadEncodingLibrary(() => {
        let histogramData = extractHistogramData();
        if(histogramData){
            downloadCSV(histogramData);
        }
    });
  })();
  