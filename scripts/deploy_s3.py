# Script used by CI to upload snippets to S3

import argparse
import os
import sys
from boto3 import Session
from botocore.exceptions import ClientError

unzipped_args = {
    'ContentType': 'application/javascript',
    'CacheControl': 'max-age=31536000',
    'ACL': 'public-read',
}
zipped_args = {
    'ContentType': 'application/javascript',
    'CacheControl': 'max-age=31536000',
    'ContentEncoding': 'gzip',
    'ACL': 'public-read',
}

def check_exists(key):
    try:
        key.load()
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
    else:
        return True

def upload(bucket, file, args):
    bucket.upload_file(
        os.path.join('dist', file),
        os.path.join('libs', file),
        ExtraArgs=args,
    )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', '-v', required=True,
                        help='Version to deploy')
    args = parser.parse_args()
    s3 = Session().resource('s3')
    bucket = s3.Bucket(os.environ.get('S3_BUCKET_NAME'))

    files = [
        f'amplitude-{args.version}.js',
        f'amplitude-{args.version}-min.js',
        f'amplitude-{args.version}.umd.js',
        f'amplitude-{args.version}-min.umd.js'
    ]
    for file in files:
        if check_exists(s3.Object(os.environ.get('S3_BUCKET_NAME'), os.path.join('libs', file))):
            sys.exit(f'ERROR: {file} already exists and shouldn\'t be republished. Consider releasing a new version')
        print(f'Uploading {file}')
        upload(bucket, file, unzipped_args)

    gz_files = [
        f'amplitude-{args.version}-min.gz.js',
        f'amplitude-{args.version}-min.umd.gz.js'
    ]
    for file in gz_files:
        if check_exists(s3.Object(os.environ.get('S3_BUCKET_NAME'), file)):
            sys.exit(f'{file} already exists!')
        print(f'Uploading {file}')
        upload(bucket, file, zipped_args)

    print(f'Success: S3 upload completed. Example: https://cdn.amplitude.com/libs/amplitude-{args.version}.js')
    return 0

if __name__ == '__main__':
    sys.exit(main())
