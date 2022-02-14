import { LambdaClient } from '@aws-sdk/client-lambda';

export interface Options {
    /**
     * AWS region 
     */
    region?: string,

    /**
     * An instance of LambdaClient
     */
    client?: LambdaClient,

    /**
     * AWS credentials
     */
    credentials?: {
        accessKeyId: string,
        secretAccessKey: string,
        sessionToken: string
    }
}

/**
 * Function name, name with qualifier, or fully qualified arn
 * @example myFunc
 * @example myFunc:12
 * @example myFunc:myAlias
 * @example arn:aws:lambda:us-east-1:0123456789012:myFunc
 * @example arn:aws:lambda:us-east-1:0123456789012:myFunc:12
 * @example arn:aws:lambda:us-east-1:0123456789012:myFunc:myAlias
 */
export type LambdaFunction = string;

export type State = 'Pending' | 'Active' | 'Failed' | 'Inactive' | 'Unknown';

export type UpdateState = 'InProgress' | 'Successful' | 'Failed' | 'Unknown';