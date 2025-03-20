import os
from typing import BinaryIO, Tuple
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import uuid

class StorageService:
    def __init__(self):
        # MinIO configuration
        self.s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv('S3_ENDPOINT', 'http://minio:9000'),
            aws_access_key_id=os.getenv('S3_ACCESS_KEY', 'minioadmin'),
            aws_secret_access_key=os.getenv('S3_SECRET_KEY', 'minioadmin'),
            region_name=os.getenv('S3_REGION', 'us-east-1'),
            config=Config(
                signature_version='s3v4',
                retries={'max_attempts': 3}
            ),
            use_ssl=os.getenv('S3_USE_SSL', 'false').lower() == 'true'
        )
        self.bucket_name = os.getenv('S3_BUCKET', 'family-nexus-photos')

    def _ensure_bucket_exists(self) -> None:
        """
        Ensure the MinIO bucket exists, create it if it doesn't.
        """
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return  # Bucket exists, we can return early
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
                # Set bucket policy for public read access (development only)
                self.s3_client.put_bucket_policy(
                    Bucket=self.bucket_name,
                    Policy=f'''{{
                        "Version": "2012-10-17",
                        "Statement": [
                            {{
                                "Sid": "PublicReadGetObject",
                                "Effect": "Allow",
                                "Principal": "*",
                                "Action": "s3:GetObject",
                                "Resource": "arn:aws:s3:::{self.bucket_name}/*"
                            }}
                        ]
                    }}'''
                )
            except ClientError as e:
                if e.response['Error']['Code'] != 'BucketAlreadyOwnedByYou':
                    raise

    def upload_file(self, file: BinaryIO, original_filename: str) -> Tuple[str, str]:
        """
        Upload a file to MinIO.
        
        Args:
            file: File object to upload
            original_filename: Original filename
            
        Returns:
            Tuple of (s3_key, public_url)
        """
        try:
            # Ensure bucket exists before upload
            self._ensure_bucket_exists()
            
            # Generate a unique filename to avoid collisions
            extension = os.path.splitext(original_filename)[1]
            filename = secure_filename(f"{uuid.uuid4()}{extension}")
            
            # Generate the S3 key (path in the bucket)
            s3_key = f"photos/{filename}"
            
            # Upload the file
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                s3_key,
                ExtraArgs={
                    'ContentType': self._get_content_type(extension.split('.')[-1]),
                    'ACL': 'public-read'
                }
            )
            
            # Generate the public URL
            url = f"{os.getenv('S3_ENDPOINT', 'http://localhost:9000')}/{self.bucket_name}/{s3_key}"
            
            return s3_key, url
        except Exception as e:
            raise Exception(f"Failed to upload file to MinIO: {str(e)}")

    def delete_file(self, s3_key: str) -> None:
        """
        Delete a file from MinIO.
        
        Args:
            s3_key: The S3 key of the file to delete
        """
        try:
            # Ensure bucket exists before deletion
            self._ensure_bucket_exists()
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
        except Exception as e:
            raise Exception(f"Failed to delete file from MinIO: {str(e)}")

    def _get_content_type(self, extension: str) -> str:
        """Get the content type based on file extension."""
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        }
        return content_types.get(extension.lower(), 'application/octet-stream')
