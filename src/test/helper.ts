import * as chai from 'chai';
import * as sinonOrig from 'sinon';
import * as td from 'testdouble';
import * as assert from 'assert';

chai.use(require('sinon-chai'));

export const expect = chai.expect;
export const sinon = sinonOrig;

export const throwError = () => {
    throw new Error('Should not have been called');
};

// stubWithArgs([arg11, arg12, ...], return1, [arg21, ...], return2)
export const stubWithArgs = function (...args: any[]) {
    const stub = sinon.stub();
    for (let i = 0; i + 1 < args.length; i += 2) {
        stub.withArgs.apply(stub, args[i]).returns(args[i + 1]);
    }
    return stub;
};

// stubReturns(return1, return2, ...)
export const stubReturns = function () {
    const args = Array.prototype.slice.call(arguments);
    return args.reduce((stub: any, arg: any, index: number) => {
        stub.onCall(index).returns(arg);
        return stub;
    }, sinon.stub());
};

export function mock<T>(c: new (...args: any[]) => T): T {
    return new (td.constructor(c));
}

export function mockType<T>(params?: any): T {
    return Object.assign({} as T, params);
}

export function mockMethods<T>(methods: string[], params?: any): T {
    return Object.assign(td.object(methods) as T, params);
}

export function mockFunction() {
    return td.function();
}

export const verify = td.verify;
export const when = td.when;
export const contains = td.matchers.contains;
export const any = td.matchers.anything;

export function wrapVerify(invokeCallback: (...args: any[]) => void, expectedCalls: any[][] | { [key: string]: any[] }) {
    const captors = [td.matchers.captor(), td.matchers.captor(), td.matchers.captor()];

    invokeCallback(...captors.map(captor => captor.capture));

    const toIndex = (key: string) => parseInt(key.replace('call', ''), 10);

    Object.entries(expectedCalls).forEach(([key, value]) => {
        const callIndex = toIndex(key);
        (value as any[]).forEach((expectedArg, argIndex) => {
            const failureMessage = `Check argument ${argIndex} of call ${callIndex}`;
            assert.deepEqual(captors[argIndex].values![callIndex], expectedArg, failureMessage);
        });
    });
}
