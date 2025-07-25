import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { FileData, FileStorage } from '../types/storage';
import config from 'config';

// This is the SOLID : Single Responsibility Principle (SRP) and Open/Closed Principle (OCP) in action.
// The S3Storage class implements the FileStorage interface, adhering to the contract defined by FileData.
// This allows for easy extension in the future if we want to add more storage solutions without modifying existing code.
export class S3Storage implements FileStorage {
    // s3 client
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.get('s3.region'),
            credentials: {
                accessKeyId: config.get('s3.accessKeyId'),
                secretAccessKey: config.get('s3.secretAccessKey'),
            },
        });
    }
    async upload(data: FileData): Promise<void> {
        // Implementation for uploading a file to S3
        const objParams = {
            Bucket: config.get('s3.bucket') as string,
            Key: data.filename,
            Body: Buffer.isBuffer(data.fileData)
                ? data.fileData
                : Buffer.from(data.fileData),
        };

        try {
            await this.client.send(new PutObjectCommand(objParams));
        } catch (error) {
            throw new Error('File upload failed');
        }
    }

    async delete(filename: string): Promise<void> {
        // Implementation for deleting a file from S3
        const deleteParams = {
            Bucket: config.get('s3.bucket') as string,
            Key: filename,
        };

        try {
            await this.client.send(new DeleteObjectCommand(deleteParams));
        } catch (error) {
            throw new Error('File deletion failed');
        }
    }

    getObjectUri(filename: string): string {
        // Implementation for getting the URI of a file from S3
        return `https://${config.get('s3.bucket')}.s3.${config.get(
            's3.region',
        )}.amazonaws.com/${filename}`;
    }
}
