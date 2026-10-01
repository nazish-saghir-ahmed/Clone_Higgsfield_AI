import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { configureSecurityHeaders } from "./security";

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: "#06070a",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  configureSecurityHeaders();

  // Load URL (Next.js server in dev or static out in prod)
  const startUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  win.loadURL(startUrl);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  return win;
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  // IPC: Native File Save Dialog
  ipcMain.handle("media:save-file", async (_, { buffer, defaultFilename }) => {
    if (!mainWindow) return { success: false, error: "Window unavailable" };

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultFilename,
      filters: [
        { name: "Media Assets", extensions: ["png", "jpg", "mp4", "webp"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (filePath) {
      await fs.promises.writeFile(filePath, Buffer.from(buffer));
      return { success: true, filePath };
    }
    return { success: false, canceled: true };
  });

  // IPC: Shell Open External URL
  ipcMain.handle("shell:open-url", async (_, url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: "Invalid protocol" };
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
