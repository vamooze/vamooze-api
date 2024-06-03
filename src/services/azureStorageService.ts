import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import * as dotenv from "dotenv";
import {logger} from "../logger";

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error("Azure Storage Connection string not found");
}

class AzureStorageService {
    private blobServiceClient: BlobServiceClient;

    constructor() {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    }

    public async uploadBuffer(containerName: string, buffer: Buffer, blobName: string): Promise<string> {
        const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
        logger.info({requestId: uploadBlobResponse.requestId, message: `Upload block blob ${blobName} successfully`});

        return blockBlobClient.url;
    }
}

export default AzureStorageService;
