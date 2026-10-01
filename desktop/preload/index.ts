import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("aetherDesktop", {
  isDesktop: true,
  platform: process.platform,
  saveMediaFile: (buffer: ArrayBuffer, defaultFilename: string) =>
    ipcRenderer.invoke("media:save-file", { buffer, defaultFilename }),
  openExternalUrl: (url: string) =>
    ipcRenderer.invoke("shell:open-url", url),
});
