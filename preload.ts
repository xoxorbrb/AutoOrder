const { contextBridge, ipcRenderer } = require("electron");
// const { scrapeAndAutoInput, stopScrapping } = require("./src/autoMain");
contextBridge.exposeInMainWorld("electronAPI", {
  sendFormData: (formData: any) => ipcRenderer.send("form-data", formData),
  exitApp: () => ipcRenderer.send("exit-app"),
  logMessage: (message: string) => ipcRenderer.send("log-message", message),
  scrapeAndAutoInput: (data: any) =>
    ipcRenderer.send("scrape-and-auto-input", data),
  stopScrapping: () => ipcRenderer.send("stop-scrapping"),
});
