'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const util = require('util');
const gm = require('gm').subClass({ imageMagick: true });

// prettier-ignore
exports.handler = function(event, context, callback) {
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  const dstBucket = srcBucket + '-resized';

  // Sanity check: validate that source and destination are different buckets.
  if (srcBucket == dstBucket) {
    callback('Source and destination buckets are the same.');
    return;
  }

  // Infer the image type.
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    callback('Could not determine the image type.');
    return;
  }
  var imageType = typeMatch[1];

  const putObject = (buffer, prefix, cb) => {
    S3.putObject({
        Body: buffer,
        Bucket: dstBucket,
        ContentType: `image/${imageType}`,
        Key: `size-${prefix}-${srcKey}`,
        ACL: 'public-read',
      }, () => {
        cb();
      });
  }

  S3.getObject({ Bucket: srcBucket, Key: srcKey })
    .promise()
    .then(data => {
      gm(data.Body).size((err, value) => {
        const image = value.width > 1920 ? gm(data.Body).resize(1920).setFormat(imageType) : gm(data.Body).setFormat(imageType);
        const image800 = value.width > 800 ? gm(data.Body).resize(800).setFormat(imageType) : gm(data.Body).setFormat(imageType);
        image.toBuffer((error, buffer) => {
            if (error) {
                callback(error);
            } else {
                putObject(buffer, 'ori', () => {
                  image800.toBuffer((error, buffer) => {
                      if (error) {
                          callback(error);
                      } else {
                        putObject(buffer, '800', () => {
                          callback(null, {
                            statusCode: '200',
                            body: '',
                          })
                        });
                      }
                  });
                });
            }
        });
      });
    })
    .catch(err => callback(err));
};
