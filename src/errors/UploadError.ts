class UploadError extends Error {
    static fileNotFound(file: string): UploadError {
        return new UploadError(`File not found: ${file}`);
    }

    static uploadNotSuccessful(statusCode?: number, body?: string): UploadError {
        return new UploadError(`Upload not successful. Status code: ${statusCode ?? "unknown"}, body: ${body}`);
    }
}

export { UploadError };
