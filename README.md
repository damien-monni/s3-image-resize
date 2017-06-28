# S3 Image Resize

An AWS Lambda function to resize an image after it was uploaded to AWS S3.
It is design to work for a web application so the function is not so configurable
but it is a good starting point to be applied to another project.

Once the image is uploaded to S3, two new images are created into a new bucket.
The new bucket name has to be the same as the one the image was upoaded to, with
`-resized` at the end.

This function uses GraphicsMagick `gm` npm module to resize the image.

## Deployment

- Create two S3 buckets with the same name, the second has to be suffixed with `-resized`.
- Create a zip file containing `node_modules`, `index.js`, `package.json` and
`package-lock.json` and upload it to AWS Lambda.

## Built With

* [gm](http://aheckmann.github.io/gm/) - GraphicsMagick for node.js

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
