import {debug, getMultilineInput, info, setFailed, error, getInput} from "@actions/core";
import { HttpClient } from "@actions/http-client";
import * as glob from "@actions/glob";
import { getParameters, Parameters } from "@utilities";
import { sign, upload } from "@requests";
import { getToken } from "./utilities/getToken";

export const run = async () => {
    const client = new HttpClient("Client/Github");

    try {
        const endpoint = getInput("endpoint", { trimWhitespace: true, required: false });
        const files = getMultilineInput("files", { trimWhitespace: true, required: true });
        const token = getToken();

        const parameters = await getParameters();

        debug(`Inferred parameters: ${JSON.stringify(parameters)}`);

        const globber = await glob.create(files.join("\n"));
        for await (const file of globber.globGenerator()) {
            info(`Found coverage file to upload: ${file}`);

            const uploaded = await handleUpload(client, file, parameters, endpoint, token);

            if (!uploaded) {
                error(`Failed to upload coverage file: ${file}`);
                continue;
            }

            info(`Successfully uploaded coverage file: ${file}`);
        }
    } catch (error) {
        if (error instanceof Error) setFailed(error.message);
    }
};

export const handleUpload = async (client: HttpClient, file: string, parameters: Parameters, endpoint: string, token: string) => {
    try {
        const { signedUrl, uploadId } = await sign(client, file, parameters, endpoint, token);
        info(`Coverage upload has been assigned ID: ${uploadId}`);

        return await upload(file, client, signedUrl);
    } catch (error) {
        if (error instanceof Error) {
            debug(`Error while signing and uploading coverage file: ${error.message}`);
        }

        return false;
    }
};
