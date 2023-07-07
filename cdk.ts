import * as cdk from 'aws-cdk-lib';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'CartServiceStack', {
  env: {
    region: process.env.PRODUCT_AWS_REGION || 'eu-west-1',
  },
});
const cartService = new NodejsFunction(stack, 'cartServiceLambda', {
  runtime: Runtime.NODEJS_18_X,
  functionName: 'cartService',
  entry: 'dist/main.js',
  bundling: {
    externalModules: [
      '@grpc/grpc-js',
      '@grpc/proto-loader',
      'amqp-connection-manager',
      'amqplib',
      'mqtt',
      'nats',
    ],
  },
});
const api = new apiGateway.HttpApi(stack, 'CartApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  path: '/{api+}',
  methods: [apiGateway.HttpMethod.ANY],
  integration: new HttpLambdaIntegration('CartServiceProxyIntegration', cartService),
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}` ?? 'Something went wrong with the deployment.',
});