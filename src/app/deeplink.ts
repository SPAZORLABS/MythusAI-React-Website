// src/app/deeplink.ts
import { app } from 'electron';
import path from 'path';

let deeplinkingUrl: string | null = null;

export function setupDeepLinking() {
  // Set protocol client based on environment
  if (process.defaultApp) {
    // Development mode
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('mythusai', process.execPath, [
        path.resolve(process.argv[1])
      ]);
    }
  } else {
    // Production mode
    app.setAsDefaultProtocolClient('mythusai');
  }

  // macOS specific: handle open-url event
  app.on('open-url', (event, url) => {
    event.preventDefault();
    deeplinkingUrl = url;
    handleDeepLink(url);
  });

  // Windows & Linux: handle second instance
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Find the deep link URL in command line args
    const url = commandLine.find((arg) => arg.startsWith('mythusai://'));
    
    if (url) {
      deeplinkingUrl = url;
      handleDeepLink(url);
    }

    // Focus the main window
    const { BrowserWindow } = require('electron');
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  return true;
}

function handleDeepLink(url: string) {
  console.log('Deep link received:', url);
  
  // Parse the URL
  // Example: mythusai://screenplay/123
  // Example: mythusai://production-info/456
  
  const urlObj = new URL(url);
  const path = urlObj.pathname || urlObj.host;
  const params = new URLSearchParams(urlObj.search);

  // Send to renderer process
  const { BrowserWindow } = require('electron');
  const mainWindow = BrowserWindow.getAllWindows()[0];
  
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', {
      path,
      params: Object.fromEntries(params.entries()),
      fullUrl: url
    });
  }
}

export function getDeeplinkingUrl() {
  return deeplinkingUrl;
}
