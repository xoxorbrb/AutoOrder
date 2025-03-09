import { app, BrowserWindow } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  const devURL = "http://localhost:3000";
  const prodURL = `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(isDev ? devURL : prodURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});
