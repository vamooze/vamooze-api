"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const constants_1 = require("./constants");
const ID = constants_1.constants.amazonAccessKeyId;
const SECRET = constants_1.constants.amazonSecretAccessKey;
let s3;
class AmazonS3 {
    constructor() {
        s3 = new aws_sdk_1.default.S3({
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
    async uploadFile(key, image, bucketName) {
        try {
            const params = {
                Bucket: bucketName ? bucketName : 'renda-logistics',
                Key: key,
                Body: image
            };
            return await new Promise((resolve, reject) => {
                s3.upload(params, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data.Location);
                    }
                });
            });
        }
        catch (err) {
            console.log('====================================');
            console.log(err);
            console.log('====================================');
            Promise.reject(err);
        }
    }
}
module.exports = new AmazonS3();
//# sourceMappingURL=S3.js.map