import { API_URL } from "../config";
import { debug } from "@actions/core";
import { HttpClient } from "@actions/http-client";
import { SigningError } from "@errors";
import { Parameters } from "@utilities";

export type SignedUrl = {
    signedUrl: string;
    expiration: string;
    uploadId: string;
};

export const sign = async (
    client: HttpClient,
    file: string,
    parameters: Parameters,
    token: string
): Promise<SignedUrl> => {
    const response = await client.postJson<SignedUrl>(
        `${API_URL}/upload`,
        {
            data: {
                ...parameters,
                fileName: file,
            },
        },
        {
            Authorization: `Basic ${btoa(token)}`,
        }
    );

    const { statusCode } = response;

    debug(`Response while signing URL: ${JSON.stringify(response)}`);

    if (statusCode !== 200) {
        throw SigningError.invalidResponseCode(statusCode);
    }

    if (!response.result) {
        throw SigningError.invalidResponseBody(statusCode, response.result);
    }

    const {
        result: { signedUrl, uploadId },
    } = response;

    if (!signedUrl || !uploadId) {
        throw SigningError.invalidResponseBody(statusCode, JSON.stringify(response.result));
    }

    return response.result;
};
