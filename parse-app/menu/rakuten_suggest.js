(function(){
    function extractData(){
        let d = document;
        d.querySelector('#ri-cmn-hdr-sitem')?.click(); // サジェスト表示
        setTimeout(() => {
            setTimeout(() => {
                let suggestions = Array.from(d.querySelectorAll('#root > div.dui-container.header > div.suggestWrapper > div > div.container--1W-6f > div > div > div > div'))
                    .map(e => e.innerText.trim())
                    .filter(t => t);
                
                let totalCount = d.querySelector('#root > div.dui-container.nav > div > div > div.item.breadcrumb-model.breadcrumb.-fluid > div > span.count._medium')?.innerText.trim() || 'N/A';
                
                // CSVデータを作成（順番を逆に）
                let data = [];
                data.push(["Total Count"]);
                data.push([totalCount]);
                data.push([]); // 空行を入れる
                data.push(["Suggestion"]);
                suggestions.forEach(s => data.push([s]));

                downloadCSV(data, "rakuten_suggest.csv");
            }, 2000);
        }, 1000);
    }

    function downloadCSV(data, filename){
        let csvRows = data.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")); 
        let csvContent = csvRows.join("\r\n");

        let sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), 'SJIS');
        let blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv;charset=Shift_JIS' });
        
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function loadEncodingLibrary(callback){
        if (typeof Encoding === 'undefined') {
            let script = document.createElement('script');
            script.src = chrome.runtime.getURL('libs/encoding.min.js'); // ローカルファイル
            script.onload = callback;
            document.body.appendChild(script);
        } else {
            callback();
        }
    }

    loadEncodingLibrary(() => {
        extractData();
    });

})();
