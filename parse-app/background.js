// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("楽天一覧取得ツールがインストールされました。");
  });
  
// メッセージリスナーを追加して拡張機能各部との通信を行う
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "executeScript") {
    // scripting権限の使用を明示
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      files: [message.scriptFile]
    })
    .then(() => {
      sendResponse({ status: "success" });
    })
    .catch(error => {
      console.error("スクリプト実行エラー:", error);
      sendResponse({ status: "error", message: error.message });
    });
    return true; // 非同期レスポンスのために必要
  }
  
  if (message.action === "downloadData") {
    try {
      // downloads権限の使用を明示
      const uint8Array = new Uint8Array(message.data);
      const blob = new Blob([uint8Array], { type: message.type });
      
      // blobからデータURLを作成する代わりに直接バイナリデータを使う
      chrome.downloads.download({
        filename: message.filename,
        saveAs: true,
        url: URL.createObjectURL(blob)
      }, downloadId => {
        if (chrome.runtime.lastError) {
          console.error("ダウンロードエラー:", chrome.runtime.lastError);
          sendResponse({ status: "error", message: chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: "success", downloadId: downloadId });
          
          // URL.createObjectURLで作成したBlobリソースを解放
          setTimeout(() => URL.revokeObjectURL(blob), 100);
        }
      });
    } catch (error) {
      console.error("ダウンロード処理エラー:", error);
      sendResponse({ status: "error", message: error.message });
    }
    return true; // 非同期レスポンスのために必要
  }
});
  