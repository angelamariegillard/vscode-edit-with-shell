import {expect, mockType} from '../../helper';

import WorkspaceAdapter from '../../../lib/adapters/workspace';
import * as vscode from 'vscode';

describe('WorkspaceAdapter', () => {

    const workspaceAdapter = new WorkspaceAdapter({vsWorkspace: fakeVscodeWorkspace()});

    it('gets config value of specified 2 level path', () => {
        expect(workspaceAdapter.getConfig('A.B')).to.eql('VALUE1');
    });

    it('gets config value of specified 4 level path', () => {
        expect(workspaceAdapter.getConfig('C.D.E.F')).to.eql('VALUE2');
    });

    it('returns the project root path', () => {
        expect(workspaceAdapter.rootPath).to.eql('PROJECT_ROOT_PATH');
    });

    function fakeVscodeWorkspace() {
        const config = {
            'A.B': 'VALUE1',
            'C.D.E.F': 'VALUE2'
        } as {[key: string]: string | undefined};
        return mockType<typeof vscode.workspace>({
            getConfiguration: (oneAbove: any) => {
                switch (oneAbove) {
                case 'A':
                    return {get: (name: string) => config[`A.${name}`]};
                case 'C.D.E':
                    return {get: (name: string) => config[`C.D.E.${name}`]};
                default:
                    return {get: () => {}};
                }
            },
            rootPath: 'PROJECT_ROOT_PATH'
        });
    }

});
