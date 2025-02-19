#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkDeployAppStack } from "../lib/cdk-deploy-app-stack";

const app = new cdk.App();
new CdkDeployAppStack(app, 'ReactDeployStack', {
  env: {
    account: '390844776443',
    region: 'eu-central-1'  // Changed from us-east-1 to eu-central-1
  },
});

