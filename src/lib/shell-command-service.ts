import ProcessRunner from './process-runner';
import ShellCommandExecContext from './shell-command-exec-context';
import ShellProgrammeResolver from './shell-programme-resolver';
import ShellArgsRetriever from './shell-args-retriever';
import {ChildProcess, SpawnOptions} from 'child_process';

export interface SpawnWrapper {
    spawn: (command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) => ChildProcess;
}

export interface CommandParams {
    command: string;
    input: string;
    filePath?: string;
}

export default class ShellCommandService {
    private _childProcess: SpawnWrapper;
    private _processRunner: ProcessRunner;
    private _shellCommandExecContext: ShellCommandExecContext;
    private _shellProgrammeResolver: ShellProgrammeResolver;
    private _shellArgsRetriever: ShellArgsRetriever;

    constructor(params: any) {
        this._childProcess = params.childProcess;
        this._processRunner = params.processRunner;
        this._shellCommandExecContext = params.shellCommandExecContext;
        this._shellProgrammeResolver = params.shellProgrammeResolver;
        this._shellArgsRetriever = params.shellArgsRetriever;
    }

    runCommand(params: CommandParams): Promise<string> {
        const options = this._getOptions(params.filePath);
        const shell = this._shellProgrammeResolver.resolve();
        const shellArgs = this._shellArgsRetriever.retrieve();
        const command = this._childProcess.spawn(shell, [...shellArgs, params.command], options);
        return this._processRunner.run(command, params.input);
    }

    _getOptions(filePath?: string) {
        return {
            cwd: this._shellCommandExecContext.getCwd(filePath),
            env: this._shellCommandExecContext.env
        };
    }

}
