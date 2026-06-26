const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;
let initialDeepLink = null;

// Handle deep link URL
function handleDeepLink(url) {
  if (!url || !url.startsWith('tg://')) return;
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    const encodedUrl = encodeURIComponent(url);
    const targetUrl = `https://web.telegram.org/a/#?tgaddr=${encodedUrl}`;
    mainWindow.webContents.send('quantgram-open-deeplink', targetUrl);
  } else {
    initialDeepLink = url;
  }
}

// Parse initial command line deep link
const urlArg = process.argv.find(arg => arg.startsWith('tg://'));
if (urlArg) {
  initialDeepLink = urlArg;
}

// Register protocol handler on OS level
app.setAsDefaultProtocolClient('tg');

// Force single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.find(arg => arg.startsWith('tg://'));
    if (url) {
      handleDeepLink(url);
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: "Quantgram",
      icon: path.join(__dirname, 'assets/icon_dark.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
        nodeIntegration: true
      }
    });

    mainWindow.loadURL('https://web.telegram.org/a/');
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', function () {
      mainWindow = null;
    });
  }

  function checkDefaultProtocol() {
    try {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        const isDefault = app.isDefaultProtocolClient('tg');
        if (!isDefault) {
          dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Да', 'Нет'],
            title: 'Установить по умолчанию',
            message: 'Сделать Quantgram клиентом Telegram по умолчанию (для открытия ссылок tg://)?',
            defaultId: 0,
            cancelId: 1
          }).then(result => {
            if (result.response === 0) {
              app.setAsDefaultProtocolClient('tg');
            }
          });
        }
      }
    } catch (e) {
      console.error("Failed to check default protocol client", e);
    }
  }

  app.whenReady().then(() => {
    createWindow();

    setTimeout(() => {
      checkDefaultProtocol();
    }, 3000);

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
}

// IPC listener for opening Developer Tools
ipcMain.on('open-devtools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

// IPC listener for updating window icon
ipcMain.on('quantgram-set-icon', (event, theme) => {
  if (mainWindow) {
    const iconPath = path.join(__dirname, theme === 'dark' ? 'assets/icon_dark.png' : 'assets/icon_light.png');
    mainWindow.setIcon(iconPath);
  }
});

// Custom window controls IPC listeners
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Compact mode window resizing & always-on-top toggle
ipcMain.on('quantgram-compact-toggle', (event, enabled) => {
  if (mainWindow) {
    if (enabled) {
      const bounds = mainWindow.getBounds();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setMinimumSize(320, 400);
      mainWindow.setSize(380, bounds.height);
    } else {
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setMinimumSize(800, 600);
      mainWindow.setSize(1280, 800);
    }
    mainWindow.webContents.send('quantgram-compact-status', enabled);
  }
});

// IPC listener for taskbar badge count update
ipcMain.on('quantgram-update-badge', (event, count) => {
  if (typeof app.setBadgeCount === 'function') {
    app.setBadgeCount(count || 0);
  }
});

// IPC listener to request initial deep link on startup
ipcMain.on('request-initial-deeplink', (event) => {
  if (initialDeepLink) {
    const encodedUrl = encodeURIComponent(initialDeepLink);
    const targetUrl = `https://web.telegram.org/a/#?tgaddr=${encodedUrl}`;
    event.sender.send('quantgram-open-deeplink', targetUrl);
    initialDeepLink = null;
  }
});
