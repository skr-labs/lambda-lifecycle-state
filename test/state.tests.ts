import { LambdaState } from '../src/state';
import { LambdaClient, GetFunctionCommand } from '@aws-sdk/client-lambda';
import { expect, assert } from 'chai';
import * as td from 'testdouble';


describe('LambdaState', () => {

    beforeEach(() => {
        td.reset();
    });

    const mockLambdaClient = td.object(new LambdaClient({}));
    const service = new LambdaState({ client: mockLambdaClient });

    const mockFunctionName = 'myFunc';
    const getFunctionResponse = {
        Configuration: {
            FunctionName: 'myFunc',
            FunctionArn: 'arn:aws:lambda:us-east-1:0123456789012:myFunc',
            RunTime: 'nodejs14.x',
            Role: 'arn:aws:iam::0123456789012:role/MyRole',
            Handler: 'index.handler',
            CodeSize: 123,
            Description: 'MyFunc does all the things',
            Timeout: 5,
            MemorySize: 1024,
            LastMOdified: '2022-01-01T01:00:00+00Z',
            State: 'Active',
            LastUpdateStatus: 'Successful'
        }
    };

    describe('ctor', () => {
        it('it should construct without options', () => {
            const service = new LambdaState();
            expect(service).to.not.be.undefined;
        });
        it('it should construct with custom client', () => {
            const client = new LambdaClient({});
            const service = new LambdaState({ client: client });
            expect(service).to.not.be.undefined;
        });
        it('it should construct with credentials', () => {
            const service = new LambdaState({
                credentials: {
                    accessKeyId: 'someAccessKey',
                    secretAccessKey: 'someSecretKey',
                    sessionToken: 'someSessionToken'
                }
            });
            expect(service).to.not.be.undefined;
        });
    });

    describe('Check()', () => {
        it('should return valid state', async () => {
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(getFunctionResponse);
            const response = await service.Check({ lambdaFunction: 'myFunc' });
            expect(response).to.be.equal('Active');
        });
    });

    describe('LastUpdateStatus()', () => {
        it('should return valid lastUpdateState', async () => {
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(getFunctionResponse);
            const response = await service.LastUpdateStatus({ lambdaFunction: 'myFunc' });
            expect(response).to.be.equal('Successful');
        });
    });

    describe('WaitForState()', () => {
        it('should wait for specific state', async () => {
            const firstGetFunctionResponse = {
                Configuration: {
                    FunctionName: 'myFunc',
                    FunctionArn: 'arn:aws:lambda:us-east-1:0123456789012:myFunc',
                    RunTime: 'nodejs14.x',
                    Role: 'arn:aws:iam::0123456789012:role/MyRole',
                    Handler: 'index.handler',
                    CodeSize: 123,
                    Description: 'MyFunc does all the things',
                    Timeout: 5,
                    MemorySize: 1024,
                    LastMOdified: '2022-01-01T01:00:00+00Z',
                    State: 'Inactive',
                    LastUpdateStatus: 'Successful'
                }
            };
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(firstGetFunctionResponse, getFunctionResponse);
            const response = await service.WaitForState({ lambdaFunction: 'myFunc', state: 'Active' });
            expect(response).to.be.equal('Active');
        });
        it('should error if timeout exceeded', async () => {
            const firstGetFunctionResponse = {
                Configuration: {
                    FunctionName: 'myFunc',
                    FunctionArn: 'arn:aws:lambda:us-east-1:0123456789012:myFunc',
                    RunTime: 'nodejs14.x',
                    Role: 'arn:aws:iam::0123456789012:role/MyRole',
                    Handler: 'index.handler',
                    CodeSize: 123,
                    Description: 'MyFunc does all the things',
                    Timeout: 5,
                    MemorySize: 1024,
                    LastMOdified: '2022-01-01T01:00:00+00Z',
                    State: 'Inactive',
                    LastUpdateStatus: 'Successful'
                }
            };
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(firstGetFunctionResponse, getFunctionResponse);
            try {
                await service.WaitForState({ lambdaFunction: 'myFunc', state: 'Active', timeout: 1 });
            } catch (error: any) {
                expect(error).to.be.a('error');
                expect(error.message).to.be.equal(`${mockFunctionName} never entered the desired state`);
                return;
            }
            assert.fail(null, null, 'expected function to throw');
        });
    });

    describe('WaitForUpdateState()', () => {
        it('should wait for specific update state', async () => {
            const firstGetFunctionResponse = {
                Configuration: {
                    FunctionName: 'myFunc',
                    FunctionArn: 'arn:aws:lambda:us-east-1:0123456789012:myFunc',
                    RunTime: 'nodejs14.x',
                    Role: 'arn:aws:iam::0123456789012:role/MyRole',
                    Handler: 'index.handler',
                    CodeSize: 123,
                    Description: 'MyFunc does all the things',
                    Timeout: 5,
                    MemorySize: 1024,
                    LastMOdified: '2022-01-01T01:00:00+00Z',
                    State: 'Inactive',
                    LastUpdateStatus: 'InProgress'
                }
            };
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(firstGetFunctionResponse, getFunctionResponse);
            const response = await service.WaitForUpdateState({ lambdaFunction: 'myFunc', state: 'Successful' });
            expect(response).to.be.equal('Successful');
        });
        it('should error if timeout exceeded', async () => {
            const firstGetFunctionResponse = {
                Configuration: {
                    FunctionName: 'myFunc',
                    FunctionArn: 'arn:aws:lambda:us-east-1:0123456789012:myFunc',
                    RunTime: 'nodejs14.x',
                    Role: 'arn:aws:iam::0123456789012:role/MyRole',
                    Handler: 'index.handler',
                    CodeSize: 123,
                    Description: 'MyFunc does all the things',
                    Timeout: 5,
                    MemorySize: 1024,
                    LastMOdified: '2022-01-01T01:00:00+00Z',
                    State: 'Inactive',
                    LastUpdateStatus: 'InProgress'
                }
            };
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(firstGetFunctionResponse, getFunctionResponse);
            try {
                await service.WaitForUpdateState({ lambdaFunction: 'myFunc', state: 'Successful', timeout: 1 });
            } catch (error: any) {
                expect(error).to.be.a('error');
                expect(error.message).to.be.equal(`${mockFunctionName} never entered the desired state`);
                return;
            }
            assert.fail(null, null, 'expected function to throw');
        });
    });

    describe('SendRequest()', () => {
        it('should send requests', async () => {
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve(getFunctionResponse);
            const response = await service.SendRequest({ lambdaFunction: mockFunctionName });
            expect(response).to.not.be.undefined;
        });
        it('should error if configuration missing', async () => {
            td.when(mockLambdaClient.send(td.matchers.isA(GetFunctionCommand))).thenResolve({});
            try {
                await service.SendRequest({ lambdaFunction: mockFunctionName });
            } catch (error) {
                expect(error).to.not.be.undefined;
                expect(error).to.be.an('error');
                expect(error.message).to.be.equal('Unable to retrieve lambda function state');
                return;
            }
            assert.fail(null, null, 'expected function to throw');
        });
    });
});