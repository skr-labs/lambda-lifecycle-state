import { LambdaClient, GetFunctionCommand } from '@aws-sdk/client-lambda';
import { LambdaFunction, Options, State, UpdateState } from './types';
import { StateError } from './error';

export class LambdaState {

    private defaultTimeout = 30000;
    private defaultIncrement = 1000;
    private client: LambdaClient;

    constructor(options?: Options) {
        if (options) {
            this.client = options.client || new LambdaClient({ region: options.region, credentials: options.credentials });
        } else {
            this.client = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });
        }

    }

    public async Check(params: { lambdaFunction: LambdaFunction }): Promise<State> {
        return <State>(await this.SendRequest({ lambdaFunction: params.lambdaFunction })).State;
    }

    public async LastUpdateStatus(params: { lambdaFunction: LambdaFunction }): Promise<UpdateState> {
        return <UpdateState>(await this.SendRequest({ lambdaFunction: params.lambdaFunction })).LastUpdateStatus;
    }

    public async WaitForState(params: { lambdaFunction: LambdaFunction, state: State, timeout?: number }): Promise<State> {
        const wait = params.timeout || this.defaultTimeout;
        let totalWait = 0;
        let lastCheckState: State = 'Unknown';
        while (totalWait <= wait) {
            lastCheckState = (await this.SendRequest({ lambdaFunction: params.lambdaFunction })).State as State;
            if (lastCheckState !== params.state) {
                await this.Sleep(this.defaultIncrement);
                totalWait = totalWait + this.defaultIncrement;
            } else {
                return lastCheckState;
            }
        }
        throw new StateError(`${params.lambdaFunction} never entered the desired state`, { expectedState: params.state, lastCheckState: lastCheckState });
    }

    public async WaitForUpdateState(params: { lambdaFunction: LambdaFunction, state: UpdateState, timeout?: number }): Promise<UpdateState> {
        const wait = params.timeout || this.defaultTimeout;
        let totalWait = 0;
        let lastCheckState: UpdateState = 'Unknown';
        while (totalWait <= wait) {
            lastCheckState = (await this.SendRequest({ lambdaFunction: params.lambdaFunction })).LastUpdateStatus as UpdateState;
            if (lastCheckState !== params.state) {
                await this.Sleep(this.defaultIncrement);
                totalWait = totalWait + this.defaultIncrement;
            } else {
                return lastCheckState;
            }
        }
        throw new StateError(`${params.lambdaFunction} never entered the desired state`, { expectedState: params.state, lastCheckState: lastCheckState });
    }

    public async SendRequest(params: { lambdaFunction: LambdaFunction }) {
        const response = await this.client.send(new GetFunctionCommand({ FunctionName: params.lambdaFunction }));
        if (!response.Configuration) {
            throw new Error('Unable to retrieve lambda function state');
        }
        return response.Configuration;
    }

    private async Sleep(ms: number): Promise<NodeJS.Timeout> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}