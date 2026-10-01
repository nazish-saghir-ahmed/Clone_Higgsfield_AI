import { session } from "electron";

export function configureSecurityHeaders(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.muapi.ai https://cdn.muapi.ai https://storage.muapi.ai https://fonts.googleapis.com https://fonts.gstatic.com data: blob:; img-src 'self' data: blob: https://*.muapi.ai https://cdn.muapi.ai https://storage.muapi.ai https://images.unsplash.com; media-src 'self' data: blob: https://*.muapi.ai https://cdn.muapi.ai https://storage.muapi.ai; connect-src 'self' https://api.muapi.ai https://*.muapi.ai data: blob:;",
        ],
      },
    });
  });
}
