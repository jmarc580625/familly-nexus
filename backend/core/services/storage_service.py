import os
from typing import BinaryIO, Tuple
import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import uuid
from utils.config import config

class StorageService:
    def __init__(self):
        # S3-compatible storage configuration
        self.s3_client = boto3.client(
            's3',
            endpoint_url=f"http://{config.storage.endpoint}",
            aws_access_key_id=config.storage.access_key,
            aws_secret_access_key=config.storage.secret_key,
            region_name=config.storage.region,
            config=BotoConfig(
                signature_version='s3v4',
                retries={'max_attempts': 3}
            ),
            use_ssl=config.storage.use_ssl
        )
        self.bucket_name = config.storage.bucket_name

    def _ensure_bucket_exists(self) -> None:
        """
        Ensure the storage bucket exists, create it if it doesn't.
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

    def upload_file(self, file: BinaryIO, filename: str) -> Tuple[str, str]:
        """
        Upload a file to storage and return its key and public URL.
        """
        try:
            # Ensure bucket exists before upload
            self._ensure_bucket_exists()
            
            # Generate a unique filename to avoid collisions
            extension = os.path.splitext(filename)[1]
            s3_key = f"{uuid.uuid4()}{extension}"
            
            # Upload the file
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                s3_key,
                ExtraArgs={'ContentType': self._get_content_type(filename)}
            )
            
            # Generate the public URL
            url = f"http://{config.storage.endpoint}/{self.bucket_name}/{s3_key}"
            
            return s3_key, url
        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")

    def delete_file(self, s3_key: str) -> None:
        """
        Delete a file from storage.
        
        Args:
            s3_key: The key of the file to delete
        """
        try:
            # Ensure bucket exists before deletion
            self._ensure_bucket_exists()
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
        except Exception as e:
            raise Exception(f"Failed to delete file: {str(e)}")

    def _get_content_type(self, filename: str) -> str:
        """Get the content type based on file extension."""
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        }
        extension = os.path.splitext(filename)[1].split('.')[-1]
        return content_types.get(extension.lower(), 'application/octet-stream')
