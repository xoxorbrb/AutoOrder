const { contextBridge, ipcRenderer } = require("electron");
// const { scrapeAndAutoInput, stopScrapping } = require("./src/autoMain");
contextBridge.exposeInMainWorld("electronAPI", {
  sendFormData: (formData: any) => ipcRenderer.send("form-data", formData),
  exitApp: () => ipcRenderer.send("exit-app"),
  logMessage: (message: string) => ipcRenderer.send("log-message", message),
  receiveLogMessage: (callback: (message: string) => void) =>
    ipcRenderer.on("log-message", (_event: any, message: string) =>
      callback(message)
    ),
  scrapeAndAutoInput: (data: any) =>
    ipcRenderer.send("scrape-and-auto-input", data),
  stopScrapping: () => ipcRenderer.send("stop-scrapping"),
  onErrorSound: (callback: () => void) => {
    ipcRenderer.on("error-sound", callback);
  },
});
