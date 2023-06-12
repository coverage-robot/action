import { getGitParameters } from "./getGitParameters";
import { getContextParameters } from "./getContextParameters";
import { getInput } from "@actions/core";

export type Parameters = Awaited<ReturnType<typeof getParameters>>;

export const getParameters = async () => {
    const contextParameters = getContextParameters();
    const gitParameters = await getGitParameters(contextParameters);
    const tag = getInput("tag", { trimWhitespace: true, required: true });

    return { provider: "github", tag, ...gitParameters, ...contextParameters };
};
