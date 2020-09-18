import argparse
import os
import sys

from boto.s3 import connect_to_region
from boto.s3.connection import OrdinaryCallingFormat
from boto.s3.key import Key


def upload(key, from_file):
    key.set_contents_from_filename(from_file)
    key.make_public()
    return key


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', '-p', required=True, help='Path to amplitude-javascript repo')
    parser.add_argument('--version', '-v', required=True, help='Version to deploy')
    args = parser.parse_args()

    s3conn = connect_to_region(
        os.environ.get('AWS_REGION'),
        host=f's3-{os.environ.get('AWS_SECRET_ACCESS_KEY')}.amazonaws.com',
        calling_format=OrdinaryCallingFormat(),
    )
    bucket = s3conn.get_bucket('com.amplitude.public')

    files = [
        'amplitude-%s.js' % args.version,
        'amplitude-%s-min.js' % args.version,
        'amplitude-%s.umd.js' % args.version,
        'amplitude-%s-min.umd.js' % args.version,
    ]
    for file in files:
        print(file)
        key = Key(bucket, os.path.join('libs', file))
        key.set_metadata('Cache-Control', 'max-age=31536000')
        upload(key, os.path.join(args.path, 'dist', file))

    gz_files = [
        'amplitude-%s-min.gz.js' % args.version,
        'amplitude-%s-min.umd.gz.js' % args.version,
    ]
    for file in gz_files:
        print(file)
        key = Key(bucket, os.path.join('libs', file))
        key.set_metadata('Cache-Control', 'max-age=31536000')
        key.set_metadata('Content-Encoding', 'gzip')
        upload(key, os.path.join(args.path, 'dist', file))

    return 0

if __name__ == '__main__':
    result = main()
    sys.exit(result)