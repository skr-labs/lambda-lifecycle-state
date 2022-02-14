import { StateError } from '../src/error';
import { expect } from 'chai';

describe('StateError', () => {
    describe('ctor', () => {
        it('it should construct', () => {
            const testError = new StateError('some message', { expectedState: 'Active', lastCheckState: 'Pending' });
            expect(testError).to.not.be.undefined;
        });
    });
});