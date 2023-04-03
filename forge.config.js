const packager = require('electron-packager')
const { serialHooks } = require('electron-packager/src/hooks')
const fs = require('fs');
const path = require('path');
const filesToCopy = ['agent-macos-run', 'backend-run'];

module.exports = {
    packagerConfig: {
        // https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html#usagedescription
        // icon: '/path/to/icon',
        // osxSign: {},
        // osxNotarize: {
        //     tool: 'notarytool',
        //     appleId: process.env.APPLE_ID,
        //     appleIdPassword: process.env.APPLE_PASSWORD,
        //     teamId: process.env.APPLE_TEAM_ID,
        // }
        usageDescription: {
            BluetoothAlways: 'App needs bluetooth to simulate the Peripheral'
        },
        appVersion: '1.0.0',
        // appBundleId: ''
        afterCopy: [serialHooks([
            (buildPath, electronVersion, platform, arch) => {
                return new Promise((resolve, reject) => {
                    const macOSDirectoryPath = path.join(buildPath, '..', '..', 'MacOS');
                    const projectDirectoryPath = path.join(__dirname);
                    var count = 0;
                    filesToCopy.forEach((fileName) => {
                        fs.copyFile(
                            path.join(projectDirectoryPath, fileName),
                            path.join(macOSDirectoryPath, fileName),
                            (error) => {
                                count += 1;
                                if (error) {
                                    reject(error);
                                }
                                if (count == filesToCopy.length) {
                                    resolve();
                                }
                            }
                        );
                    });
                });
            }
        ])],
    },
    rebuildConfig: {},
    makers: [
        // {
        //     name: '@electron-forge/maker-squirrel',
        //     config: {
        //         name: 'ble-simulator'
        //     }
        // },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin']
        }
    ],
    publishers: [],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                devContentSecurityPolicy: 'connect-src \'self\' http://localhost:4000 ws://localhost:4000',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/index.html',
                            js: './src/renderer.ts',
                            name: 'main_window',
                            preload: {
                                "js": "./src/preload.ts"
                            }
                        }
                    ]
                }
            }
        }
    ],
    hooks: {},
    buildIdentifier: 'my-build'
};

