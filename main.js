const { app, BrowserWindow, ipcMain, Menu ,dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 700,
    icon: path.join(__dirname, "billing.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
  });

  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);

  win.loadURL(`file://${path.join(__dirname, "build/index.html")}`);
}

// app.whenReady().then(createWindow);

app.whenReady().then(() => {
  createWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const printContent = async (content) => {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true
    }
  });

  try {
    await printWindow.loadURL(
      "data:text/html;charset=utf-8," +
      encodeURIComponent(`
        <html>
          <head>
            <style>
              * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
              }

              html, body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
              }

              body {
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `)
    );

    await printWindow.webContents.executeJavaScript(`
  new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
`);

    let deviceName = "";
    try {
      const printers = await win.webContents.getPrintersAsync();
      const printer = printers.find(p => p.name.includes("POS"));
      if (printer) deviceName = printer.name;
    } catch (err) {
      console.log("Printer detection error:", err);
    }

    return new Promise((resolve) => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName,
          margins: { marginType: "none" }
        },
        (success, errorType) => {
          if (!success) {
            console.log("Print failed:", errorType);
            resolve({ success: false, error: errorType });
          } else {
            resolve({ success: true });
          }

          if (!printWindow.isDestroyed()) {
            printWindow.close();
          }
        }
      );
    });

  } catch (err) {
    console.log("Print error:", err);
    return { success: false, error: err.message };
  }
};
ipcMain.handle("print-kot", async (_, content) => {
  return await printContent(content);
});

ipcMain.handle("print-bill", async (_, content) => {
  return await printContent(content);
});

autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...");
});

autoUpdater.on("update-available", () => {
  console.log("Update available. Downloading...");
});

autoUpdater.on("update-not-available", () => {
  console.log("No update available.");
});

autoUpdater.on("error", (err) => {
  console.log("Auto update error:", err);
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Ready",
    message: "New update download ho gaya hai. App restart karke install kare?",
    buttons: ["Restart Now", "Later"],
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});