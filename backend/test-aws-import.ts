console.log('Starting AWS SDK import test...');

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { fromEnv } from '@aws-sdk/credential-providers';

console.log('AWS SDK imports successful');

const client = new BedrockRuntimeClient({
  region: 'us-gov-west-1',
  credentials: fromEnv()
});

console.log('Client created successfully');
