export interface FileData {
    filename: string;
    fileData: ArrayBuffer;
}

export interface FileStorage {
    // Method to upload a file
    upload(data: FileData): Promise<void>;
    // Method to delete a file
    delete(filename: string): Promise<void>;
    // Method to get the URI of a file
    getObjectUri(filename: string): string;
}
