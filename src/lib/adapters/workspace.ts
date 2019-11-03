import * as vscode from 'vscode';

const CONFIG_PATH_DELIMITER = '.';

export class Workspace {
    constructor(private readonly vsWorkspace: typeof vscode.workspace) {}

    getConfig<T>(configPath: string): T {
        const {basePath, leafName} = this.parseConfigPath(configPath);
        return this.vsWorkspace.getConfiguration(basePath).get(leafName) as T;
    }

    private parseConfigPath(configPath: string) {
        const configPathParts = configPath.split(CONFIG_PATH_DELIMITER);
        return {
            basePath: configPathParts.slice(0, -1).join(CONFIG_PATH_DELIMITER),
            leafName: configPathParts.slice(-1)[0]
        };
    }

    get rootPath() {
        return this.vsWorkspace.rootPath;
    }

}
