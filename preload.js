const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("electronAPI", {

  printKot: (content) => ipcRenderer.invoke("print-kot", content),
  printBill: (content) => ipcRenderer.invoke("print-bill", content),
  // checkForUpdates: () => ipcRenderer.invoke("check-for-updates"), 
  // checkUpdateInfo: () => ipcRenderer.invoke("get-update-info"),
  downloadBillPdf: (content, orderNo) =>ipcRenderer.invoke("download-bill-pdf", {content,orderNo})

});
