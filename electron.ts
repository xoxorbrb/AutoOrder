import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { scrapeAndAutoInput, stopScrapping } from "./src/autoMain";

let mainWindow: BrowserWindow | null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const prodURL = `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(prodURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

ipcMain.on("log-message", (message) => {
  mainWindow?.webContents.send("log-message", message); // ✅ 렌더러 UI에 전달
});

ipcMain.on("exit-app", () => {
  app.quit();
});

ipcMain.on("scrape-and-auto-input", (_, data) => {
  scrapeAndAutoInput(data);
});

ipcMain.on("stop-scrapping", () => {
  stopScrapping();
});
