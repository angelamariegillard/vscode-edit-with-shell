import ErrorMessageFormatter from '../error-message-formatter';
import {EXTENSION_NAME} from '../const';
import {Logger} from '../logger';
import ShellCommandService from '../shell-command-service';
import CommandReader from '../command-reader';
import HistoryStore from '../history-store';
import Workspace from '../adapters/workspace';
import Editor, {LocationFactory} from '../adapters/editor';
import {TextEditor as VsTextEditor} from 'vscode';

export default class RunCommand {
    private _logger: Logger;
    private _shellCommandService: ShellCommandService;
    private _commandReader: CommandReader;
    private _historyStore: HistoryStore;
    private _showErrorMessage: (message: string) => Promise<void>;
    private _wrapEditor: (editor: VsTextEditor, lf?: LocationFactory) => Editor;
    private _workspaceAdapter: Workspace;
    private _errorMessageFormatter: ErrorMessageFormatter;

    constructor(params) {
        this._logger = params.logger;
        this._shellCommandService = params.shellCommandService;
        this._commandReader = params.commandReader;
        this._historyStore = params.historyStore;
        this._showErrorMessage = params.showErrorMessage;
        this._wrapEditor = params.wrapEditor;
        this._workspaceAdapter = params.workspaceAdapter;
        this._errorMessageFormatter = new ErrorMessageFormatter();
    }

    async execute(editor?) {
        const wrappedEditor = this._wrapEditor(editor);
        try {
            const command = await this._commandReader.read();
            if (!command) return;

            this._historyStore.add(command);
            const processEntireText = this._workspaceAdapter
                .getConfig(`${EXTENSION_NAME}.processEntireTextIfNoneSelected`);
            if (processEntireText) {
                const commandOutput = await this._shellCommandService.runCommand({
                    command,
                    input: wrappedEditor.entireText,
                    filePath: wrappedEditor.filePath
                });
                await wrappedEditor.replaceEntireTextWith(commandOutput);
            } else {
                const commandOutput = await this._shellCommandService.runCommand({
                    command,
                    input: wrappedEditor.selectedText,
                    filePath: wrappedEditor.filePath
                });
                await wrappedEditor.replaceSelectedTextWith(commandOutput);
            }
        } catch (e) {
            await this._handleError(e);
        }
    }

    async _handleError(e) {
        this._logger.error(e.stack);

        const errorMessage = this._errorMessageFormatter.format(e.errorOutput || e.message);
        await this._showErrorMessage(errorMessage);
    }

}
