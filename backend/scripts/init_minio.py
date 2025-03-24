import os
import time
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

def wait_for_minio():
    """Wait for MinIO to be ready"""
    print("Waiting for MinIO to be ready...")
    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv('S3_ENDPOINT', 'http://127.0.0.1:9000'),
        aws_access_key_id=os.getenv('S3_ACCESS_KEY', 'minioadmin'),
        aws_secret_access_key=os.getenv('S3_SECRET_KEY', 'minioadmin'),
        region_name=os.getenv('S3_REGION', 'us-east-1'),
        config=Config(
            signature_version='s3v4',
            retries={'max_attempts': 3},
            connect_timeout=1,
            read_timeout=1
        ),
        use_ssl=False
    )

    max_retries = 30
    retry_interval = 2

    for i in range(max_retries):
        try:
            s3_client.list_buckets()
            print("MinIO is ready!")
            return True
        except Exception as e:
            if i < max_retries - 1:
                print(f"Waiting for MinIO... (attempt {i + 1}/{max_retries})")
                time.sleep(retry_interval)
            else:
                print(f"Failed to connect to MinIO: {str(e)}")
                return False

def create_bucket():
    """Create and configure the bucket"""
    s3_client = boto3.client(
        's3',
        endpoint_url=os.getenv('S3_ENDPOINT', 'http://127.0.0.1:9000'),
        aws_access_key_id=os.getenv('S3_ACCESS_KEY', 'minioadmin'),
        aws_secret_access_key=os.getenv('S3_SECRET_KEY', 'minioadmin'),
        region_name=os.getenv('S3_REGION', 'us-east-1'),
        use_ssl=False
    )
    
    bucket_name = os.getenv('S3_BUCKET', 'family-nexus-photos')
    
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"Bucket {bucket_name} already exists")
    except:
        print(f"Creating bucket {bucket_name}")
        s3_client.create_bucket(Bucket=bucket_name)
        
        # Make bucket public-read for development
        print("Setting bucket policy")
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=f'''{{
                "Version": "2012-10-17",
                "Statement": [
                    {{
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": "arn:aws:s3:::{bucket_name}/*"
                    }}
                ]
            }}'''
        )
        print("Bucket created and configured successfully")

if __name__ == '__main__':
    if wait_for_minio():
        create_bucket()
