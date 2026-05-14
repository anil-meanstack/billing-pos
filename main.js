const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
// const { autoUpdater } = require("electron-updater");

let win;
// let updateInfo = null;
// autoUpdater.autoDownload = false;

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

app.whenReady().then(createWindow);

// app.whenReady().then(() => {
//   createWindow();

//   if (app.isPackaged) {
//     autoUpdater.checkForUpdates();

//   }
// });

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

// ipcMain.handle("check-for-updates", async () => {
//   try {
//     const result = await autoUpdater.checkForUpdates();

//     const info = result?.updateInfo || updateInfo || null;
//     updateInfo = info;

//     return {
//       success: true,
//       currentVersion: app.getVersion(),
//       latestVersion: info?.version || null,
//       releaseDate: info?.releaseDate
//         ? new Date(info.releaseDate).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         })
//         : null,
//       updateAvailable: !!info && info.version !== app.getVersion(),
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// });

// autoUpdater.on("update-available", (info) => {
//   updateInfo = info;

//   dialog.showMessageBox({
//     type: "info",
//     title: "Billing POS Update",
//     message:
//       "A new version of Billing POS is available. Do you want to download and install the update?",
//     buttons: ["Update Now", "Later"],
//   }).then((result) => {

//     if (result.response === 0) {

//       autoUpdater.downloadUpdate();
//     }

//   });
// });

// ipcMain.handle("get-update-info", () => {

//   const formattedDate = updateInfo?.releaseDate
//     ? new Date(updateInfo.releaseDate).toDateString()
//     : null;

//   return {
//     currentVersion: app.getVersion(),
//     latestVersion: updateInfo?.version || null,
//     releaseDate: formattedDate,
//     updateAvailable: !!updateInfo
//   };
// });


// autoUpdater.on("update-downloaded", () => {
//   dialog.showMessageBox({
//     type: "info",
//     title: "Update Ready",
//     message: "A new update is ready to install. Restart Billing POS now?",
//     buttons: ["Restart Now", "Later"],
//   }).then((result) => {
//     if (result.response === 0) {
//       autoUpdater.quitAndInstall();
//     }
//   });
// });