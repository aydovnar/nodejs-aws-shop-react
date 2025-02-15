import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';

export class CdkDeployAppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'XXXXXXXXXXXXXX', {
      bucketName: 'aydovnar-s3-bucket',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY, // Don't use in production
      autoDeleteObjects: true, // Don't use in production
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    
    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'ReactAppDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30),
        }
      ],
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      enableLogging: true,
    });
    
    // Deploy React app to S3
    new s3deploy.BucketDeployment(this, 'XXXXXXXXXXXXXXXXXX', {
      sources: [s3deploy.Source.asset('../dist')], // Adjust path to your build folder
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });
    
    // Stack outputs
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    });
    
    new cdk.CfnOutput(this, 'S3BucketURL', {
      value: `https://${bucket.bucketRegionalDomainName}`,
      description: 'S3 Bucket URL (not directly accessible)',
    });
    
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name',
    });
    
    new cdk.CfnOutput(this, 'S3BucketARN', {
      value: bucket.bucketArn,
      description: 'S3 Bucket ARN',
    });
  }
}
