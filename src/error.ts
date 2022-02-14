import { State, UpdateState } from './types';

export class StateError extends Error {
    constructor(message: string, public state: { expectedState: State | UpdateState, lastCheckState: State | UpdateState }) {
        super(message);
        Object.setPrototypeOf(this, StateError.prototype);
    }
}