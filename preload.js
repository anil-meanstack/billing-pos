const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("electronAPI", {
 
  printKot: (content) => ipcRenderer.invoke("print-kot", content),
  printBill: (content) => ipcRenderer.invoke("print-bill", content),


});
