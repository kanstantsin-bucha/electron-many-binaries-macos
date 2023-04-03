import { ChildProcess, exec } from 'node:child_process';
const process = require('electron');
const log = require('electron-log');
const path = require('path');

let bindingsProcess: ChildProcess;

 const getBinariesDirectory = (): string | null => {
    let directory = process.app.getAppPath();
    if (directory === undefined) {
        console.log('Failed to get a directory');
        log.info('Failed to get a directory');
        return null;
    }
    const components = directory.match(/([^/]*)\/*$/);
    if (components === null || components?.length == 0) {
        console.log('Failed to get a directory 2');
        log.info('Failed to get a directory 2');
        return null;
    }
    const lastPathComponent = components[1];
    console.log(
      `[Info] getBinariesDirectory: process dir: ${directory}, last component: ${lastPathComponent}`
    );
    log.info(
      `[Info] getBinariesDirectory: process dir: ${directory}, last component: ${lastPathComponent}`
    );
    // For bundling inside the Electron app
    if (lastPathComponent === 'app') {
      console.log('[Info] update directory path for the Electron app');
      log.info('[Info] update directory path for the Electron app');
      directory = path.join(directory, '..', '..', 'MacOS');;
    }
    return directory;
  };

  const stopServerProcess = (): void => {
    if (bindingsProcess) {
      console.log('[Info] kill existing backend process');
      log.info('[Info] kill existing backend process');
      bindingsProcess.kill();
    }
  }

  const startServerProcess = (): void => {
    const directory = getBinariesDirectory();
    if (directory === null) {
        return;
    }
    stopServerProcess();
    console.log('[Info] starting backend process');
    log.info('[Info] starting backend process');
    // The first argument is the socket path to connect to.
    const cmd = `cd ${directory} && ./backend-run`;
    console.log(`[Info] run backend process command: ${cmd}`);
    log.info(`[Info] run backend process command: ${cmd}`);
    bindingsProcess = exec(cmd);
    bindingsProcess.stdout?.on('data', (data: string) => {
      console.log(`[Info] backend: ${data}`);
      log.info(`[Info] backend: ${data}`);
    });

    bindingsProcess.stderr?.on('data', (data: string) => {
      console.log(`[Info] backend process error: ${data}`);
      log.info(`[Info] backend process error: ${data}`);
      const foundErrorMessage = data.match(/error:/);
      const isSwiftError =
        foundErrorMessage !== null && foundErrorMessage.length > 0;

      if (isSwiftError) {
        throw new Error(data);
      }
    });
  }

  export { 
    startServerProcess,
    stopServerProcess
  }