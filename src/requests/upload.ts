import { readFileSync, existsSync } from "fs";
import { UploadError } from "@errors";
import { HttpClient } from "@actions/http-client";

export const upload = async (file: string, client: HttpClient, signedUrl: string) => {
    if (!existsSync(file)) {
        throw UploadError.fileNotFound(file);
    }

    const fileContent = readFileSync(file, { encoding: "utf8", flag: "r" });

    const response = await client.put(signedUrl, fileContent);

    const {
        message: { statusCode },
    } = response;

    const body = await response.readBody();

    if (statusCode !== 200) {
        throw UploadError.uploadNotSuccessful(statusCode, body);
    }

    return true;
};
