const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds')

    return Promise.resolve({
        appDirectory: path.join(outPath, 'Reada-win32-ia32/'),
        authors: 'Hubert Formin',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'Reada.exe',
        setupExe: 'Reada.exe',
        setupIcon: path.join(rootPath, 'res', 'img', 'icon.ico')
    })
}