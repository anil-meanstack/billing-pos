const { app, BrowserWindow, ipcMain, Menu, dialog,shell } = require("electron");
const path = require("path");
// const { autoUpdater } = require("electron-updater");
const fs = require("fs");

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

  //  win.webContents.openDevTools({ mode: "detach" });
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

ipcMain.handle("download-bill-pdf", async (_, { content, orderNo }) => {

        let pdfWindow = null;

        try {

            const downloadsPath = app.getPath("downloads");

            const fileName =`Bill-${orderNo || "Order"}.pdf`;

            const filePath =path.join(
                    downloadsPath,
                    fileName
                );

            pdfWindow = new BrowserWindow({

                show: false,

                width: 794,
                height: 1123,

                webPreferences: {

                    offscreen: true,

                    contextIsolation: true,

                    nodeIntegration: false

                }

            });

            const html = `

            <!DOCTYPE html>

            <html>

            <head>

            <meta charset="UTF-8">

            <style>

            * {

                box-sizing: border-box !important;

            }

            html,
            body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                min-width: 100% !important;
                background: #ffffff !important;
                color: #000000 !important;
            }


            body {
                font-family: Arial,Helvetica, sans-serif !important;
                font-size: 14px !important;
                line-height: 1.35 !important;
            }


            .pdf-page {
                width: 210mm !important;
                min-width: 210mm !important;
                max-width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 10mm !important;
                background: #ffffff !important;
            }

            .pdf-bill {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                font-family: Arial,Helvetica,sans-serif !important;
                font-size: 14px !important;
                line-height: 1.35 !important;
            }

            .pdf-bill > * {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }


            .pdf-bill #print-area,
            .pdf-bill .print-area,
            .pdf-bill .receipt,
            .pdf-bill .receipt-card,
            .pdf-bill .bill,
            .pdf-bill .bill-container,
            .pdf-bill .invoice,
            .pdf-bill .invoice-container,
            .pdf-bill .thermal-receipt,
            .pdf-bill .receipt-container {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }

            .pdf-bill div,
            .pdf-bill section,
            .pdf-bill article,
            .pdf-bill header,
            .pdf-bill footer {
                max-width: 100% !important;
            }

            .pdf-bill .receipt-row {
                display: flex !important;
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                justify-content:space-between !important;
                align-items: flex-start !important;
                gap: 15px !important;
                margin-bottom: 5px !important;
                font-size: 14px !important;
                line-height: 1.35 !important;
            }


            .pdf-bill .receipt-row span:first-child {
                flex: 1 1 auto !important;
                min-width: 0 !important;
                text-align: left !important;
            }

            .pdf-bill .receipt-row span:last-child {
                flex: 0 0 auto !important;
                text-align: right !important;
                white-space: nowrap !important;
            }

            .pdf-bill h1,
            .pdf-bill h2,
            .pdf-bill h3,
            .pdf-bill h4,
            .pdf-bill h5 {
                margin-top: 0 !important;
            }

            .pdf-bill .text-center {
                text-align: center !important;
            }

            .pdf-bill .receipt-address {
                width: 100% !important;
                text-align: center !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                margin: 2px 0 10px 0 !important;
            }


            .pdf-bill .receipt-item {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin-bottom: 7px !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .pdf-bill .item-name {
                font-size: 14px !important;
                font-weight: 500 !important;
            }

            .pdf-bill .item-price {
                font-size: 14px !important;
                font-weight: 500 !important;
                white-space: nowrap !important;
            }

            .pdf-bill .addons {
                width: 100% !important;
                padding-left: 15px !important;
                margin-top: 2px !important;
                font-size: 12px !important;
                line-height: 1.3 !important;
            }


            .pdf-bill .divider {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                border: 0 !important;
                border-top:1px dashed #777 !important;
                margin: 8px 0 !important;
            }


            .pdf-bill .divider.thick {
                border-top:2px solid #000 !important;
            }


            .pdf-bill .total {
                width: 100% !important;
                font-size: 18px !important;
                font-weight: bold !important;
                line-height: 1.4 !important;
                margin-top: 5px !important;
            }

            .pdf-bill .payment {
                width: 100% !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                margin-top: 5px !important;
            }

            .pdf-bill .thank-you {
                width: 100% !important;
                text-align: center !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                margin-top: 15px !important;
            }

            .pdf-bill .fw-semibold {
                width: 100% !important;
                font-size: 13px !important;
                font-weight: 600 !important;
            }


            .pdf-bill table {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
            }


            .pdf-bill td,
            .pdf-bill th {
                font-size: 14px !important;
                padding: 5px 4px !important;
                word-wrap: break-word !important;
            }

            .pdf-bill img {
                max-width: 100% !important;
                height: auto !important;
            }


            .pdf-bill button,
            .pdf-bill .no-print {
                display: none !important;
            }

            .pdf-bill [style*="80mm"],
            .pdf-bill [style*="72mm"],
            .pdf-bill [style*="58mm"],
            .pdf-bill [style*="76mm"] {
                width: 100% !important;
                max-width: 100% !important;
            }

            @page {
                size: A4 portrait;
                margin: 0;
            }


            @media print {
                html,
                body {
                    width: 210mm !important;
                    min-width: 210mm !important;
                    max-width: 210mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }


                .pdf-page {
                    width: 210mm !important;
                    min-width: 210mm !important;
                    max-width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 !important;
                    padding: 10mm !important;
                }

                .pdf-bill {
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                }
            }

            </style>

            </head>


            <body>

                <div class="pdf-page">

                    <div class="pdf-bill">

                        ${content}

                    </div>

                </div>

            </body>

            </html>

            `;


            await pdfWindow.loadURL(

                "data:text/html;charset=utf-8," +

                encodeURIComponent(html)

            );

            await pdfWindow.webContents.executeJavaScript(`

                (() => {
                    const page = document.querySelector(".pdf-page");

                    const bill =document.querySelector(".pdf-bill");

                    if (!page || !bill) {
                        return;
                    }

                    page.style.setProperty(
                        "width",
                        "210mm",
                        "important"
                    );


                    page.style.setProperty(
                        "min-width",
                        "210mm",
                        "important"
                    );


                    page.style.setProperty(
                        "max-width",
                        "210mm",
                        "important"
                    );

                    bill.style.setProperty(
                        "width",
                        "100%",
                        "important"
                    );


                    bill.style.setProperty(
                        "min-width",
                        "100%",
                        "important"
                    );


                    bill.style.setProperty(
                        "max-width",
                        "100%",
                        "important"
                    );

                    const elements = bill.querySelectorAll("*");


                    elements.forEach((element) => {

                        const computed =window.getComputedStyle(element);

                        const width =computed.width;

                        if ( width &&(
                                width.includes("mm") ||
                                parseFloat(width) < 500
                            )
                        ) {

                            const tag = element.tagName.toLowerCase();

                            if (
                                tag === "div" ||
                                tag === "section" ||
                                tag === "article" ||
                                tag === "header" ||
                                tag === "footer" ||
                                tag === "table"
                            ) {

                                element.style.setProperty(
                                    "width",
                                    "100%",
                                    "important"
                                );

                                element.style.setProperty(
                                    "max-width",
                                    "100%",
                                    "important"
                                );

                            }

                        }

                    });

                    const selectors = [

                        "#print-area",

                        ".print-area",

                        ".receipt",

                        ".receipt-card",

                        ".bill",

                        ".bill-container",

                        ".invoice",

                        ".invoice-container"

                    ];


                    selectors.forEach((selector) => {

                        document
                            .querySelectorAll(selector)
                            .forEach((element) => {

                                element.style.setProperty(
                                    "width",
                                    "100%",
                                    "important"
                                );

                                element.style.setProperty(
                                    "min-width",
                                    "100%",
                                    "important"
                                );

                                element.style.setProperty(
                                    "max-width",
                                    "100%",
                                    "important"
                                );

                                element.style.setProperty(
                                    "margin-left",
                                    "0",
                                    "important"
                                );

                                element.style.setProperty(
                                    "margin-right",
                                    "0",
                                    "important"
                                );

                            });

                    });


                    document.querySelectorAll(".receipt-row")
                        .forEach((row) => {

                            row.style.setProperty(
                                "width",
                                "100%",
                                "important"
                            );

                            row.style.setProperty(
                                "min-width",
                                "100%",
                                "important"
                            );

                            row.style.setProperty(
                                "max-width",
                                "100%",
                                "important"
                            );

                        });

                    document.querySelectorAll(".divider")
                        .forEach((divider) => {
                            divider.style.setProperty(
                                "width",
                                "100%",
                                "important"
                            );
                        });

                    void document.body.offsetHeight;

                })();

            `);

            await pdfWindow.webContents.executeJavaScript(`
                new Promise(resolve => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            setTimeout(
                                resolve,
                                500
                            );
                        });
                    });
                });
            `);

            const dimensions = await pdfWindow.webContents.executeJavaScript(`
                        (() => {
                            const page =document.querySelector(".pdf-page");
                            const bill =document.querySelector(".pdf-bill");

                            return {
                                pageWidth:page ?.getBoundingClientRect().width,
                                billWidth:bill ?.getBoundingClientRect().width,
                                viewportWidth:window.innerWidth
                            };

                        })();

                    `);

            const pdfData =
                await pdfWindow.webContents
                    .printToPDF({
                        pageSize: "A4",
                        landscape: false,
                        printBackground: true,
                        margins: {
                            marginType: "none"
                        },

                        preferCSSPageSize: true

                    });

            fs.writeFileSync(filePath,pdfData);

            await shell.openPath(filePath);

            return {
                success: true,
                filePath
            };


        } catch (error) {

            console.error(
                "PDF generation error:",
                error
            );


            return {
                success: false,
                error: error.message
            };


        } finally {

            if (
                pdfWindow &&
                !pdfWindow.isDestroyed()
            ) {
                pdfWindow.close();
            }

        }

    }
);

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