const extract = require('extract-zip');
const https = require('https');
const fs = require('fs');
const fs_promises = require('fs/promises');
const path = require('path');
const childProcess = require('child_process');
const { readdir, stat } = require('fs/promises');

async function downloadAttachment(url, filePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (error) => {
            fs.unlinkSync(filePath);
            reject(error);
        });
    });
}

async function extractZip(zipPath, outputPath, commit) {
    await extract(zipPath, { dir: outputPath, overwrite: true });
}

async function moveFolderContents(startFolder, toFolder) {
    const contents = await fs_promises.readdir(startFolder, { withFileTypes: true });

    for (const item of contents) {
        const itemPath = path.join(startFolder, item.name);
        const toPath = path.join(toFolder, item.name);

        if (item.isDirectory()) {
            await moveFolderContents(itemPath, toPath);
            await fs_promises.rmdir(itemPath);
        } else {
            await fs_promises.rename(itemPath, toPath);
        }
    }

    fs.unlink(startFolder, async (err) => {
        if (err) {
            return;
        }

        await fs.rmdir(startFolder);
    });
}

async function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            return;
        }
    });
}

async function verifyFiles(outputPath) {
    try {
        // Verifica se existem arquivos .js na pasta outputPath
        const files = await fs.promises.readdir(outputPath);
        const jsFiles = files.filter(file => path.extname(file) === '.js');
        if (jsFiles.length === 0) {
            throw new Error('Não foi encontrado nenhum arquivo ".js" em sua aplicação!');
        }

        // Verifica se a pasta node_modules não existe
        const nodeModulesPath = path.join(outputPath, 'node_modules');
        const exists = await fs.promises.access(nodeModulesPath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (exists) {
            throw new Error('A pasta "node_modules" já existe na pasta especificada.');
        }

    } catch (err) {
        throw new Error(err.message);
    }
}

async function runCommand(command, args, options) {
    const result = await new Promise((resolve, reject) => {
        const child = childProcess.spawn(command, args, options);

        let output = '';

        child.stdout.on('data', (data) => {
            output += data;
        });

        child.stderr.on('data', (data) => {
            output += data;
        });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('close', () => {
            resolve(output);
        });
    });

    return result.trim();
}

async function getFolderSize(folderPath) {
    const files = await readdir(folderPath);
    const stats = files.map(file => stat(path.join(folderPath, file)));

    return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}

module.exports = { downloadAttachment, extractZip, deleteFile, verifyFiles, runCommand, getFolderSize, moveFolderContents }