import { ChildProcess, exec } from 'node:child_process';
const process = require('electron');


let bindingsProcess: ChildProcess;

 const getBinariesDirectory = (): string | null => {
    let directory = process.app.getAppPath();
    if (directory === undefined) {
        console.log('Failed to get a directory');
        return null;
    }
    const components = directory.match(/([^/]*)\/*$/);
    if (components === null || components?.length == 0) {
        console.log('Failed to get a directory 2');
        return null;
    }
    const lastPathComponent = components[1];
    console.log(
      `[Info] getBinariesDirectory: process dir: ${directory}, last component: ${lastPathComponent}`
    );
    if (lastPathComponent === 'server') {
      directory = directory.slice(0, directory.lastIndexOf('/'));
    }
    return directory;
  };

  const stopAgentProcess = (): void => {
    if (bindingsProcess) {
      console.log('[Info] kill existing agent process');
      bindingsProcess.kill();
    }
  }

  const startAgentProcess = (socketPath: string): void => {
    const directory = getBinariesDirectory();
    if (directory === null) {
        return;
    }
    stopAgentProcess();
    console.log('[Info] starting agent process');
    // The first argument is the socket path to connect to.
    const cmd = `cd ${directory} && ./agent-macos-run ${socketPath}`;
    console.log(`[Info] run agent process command: ${cmd}`);
    bindingsProcess = exec(cmd);

    bindingsProcess.stdout?.on('data', (data: string) => {
      console.log(`[Info] agent: ${data}`);
    });

    bindingsProcess.stderr?.on('data', (data: string) => {
      console.log(`[Info] agent process error: ${data}`);
      const foundErrorMessage = data.match(/error:/);
      const isSwiftError =
        foundErrorMessage !== null && foundErrorMessage.length > 0;

      if (isSwiftError) {
        throw new Error(data);
      }
    });
  }

  export { 
    startAgentProcess,
    stopAgentProcess
  }