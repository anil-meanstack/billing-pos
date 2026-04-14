const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
  

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

  // win.webContents.openDevTools();
  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);

  win.loadURL(`file://${path.join(__dirname, "build/index.html")}`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const printContent = async (content) => {
  const printWindow = new BrowserWindow({
    show: false,
  });

  try {
    await printWindow.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(content)
    );

    // Auto detect printer
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
          margins: { marginType: "none" },
          pageSize: { width: 58000, height: 200000 },
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


