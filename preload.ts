import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  sendFormData: (formData: any) => ipcRenderer.send("form-data", formData),
  exitApp: () => ipcRenderer.send("exit-app"),
  logMessage: (message: string) => ipcRenderer.send("log-message", message),
});
