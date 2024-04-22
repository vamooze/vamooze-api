import AWS from 'aws-sdk';
import { constants } from '../../config/constants'
const ID = constants.amazonAccessKeyId;
const SECRET = constants.amazonSecretAccessKey;

let s3: any;

class AmazonS3 {
  constructor() {
    s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET
    });
  }


   /**
   * Upload a file to a bucket in S3
   * @author Loystar Dev
   * @version 1.0
   * @param key @param image @param bucketName
   * @returns {Promise<void>}
   */
   async uploadFile(key: any, image: any, bucketName: any) {
    try {

      const params = {
        Bucket: bucketName ? bucketName : 'renda-logistics',
        Key: key,
        Body: image
      };

      return await new Promise((resolve, reject) => {
        s3.upload(params, function (err: any, data: { Location: unknown; }) {
          if (err) {
            reject(err)
          } else {
            resolve(data.Location);
          }
        });
      })
    } catch (err) {
        console.log('====================================');
        console.log(err);
        console.log('====================================');
      Promise.reject(err)
    }
  }

}

module.exports = new AmazonS3();
