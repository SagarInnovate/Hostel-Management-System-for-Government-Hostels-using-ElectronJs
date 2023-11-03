const { app, BrowserWindow, dialog,ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const loginAuth = require('./loginAuth');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    
    mainWindow.loadFile(path.join(__dirname, 'files/index.html'));

    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('show-save-dialog', (event, filePath) => {
    dialog.showSaveDialog(mainWindow, {
        defaultPath: filePath,
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    }).then((result) => {
        if (!result.canceled && result.filePath) {
            fs.copyFileSync(filePath, result.filePath);
        }
    });
});

// // Handle IPC communication between main process and renderer process
// const { ipcMain } = require('electron');
// const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database('hostel.db');

// ipcMain.on('login-request', (event, username, password) => {
//     db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
//         if (err) {
//             event.reply('login-response', { success: false, message: 'Database error.' });
//         } else if (!row) {
//             event.reply('login-response', { success: false, message: 'Invalid username or password.' });
//         } else {
//             event.reply('login-response', { success: true, message: 'Login successful.' });
//         }
//     });
// });

// Handle database initialization and other setup tasks here
