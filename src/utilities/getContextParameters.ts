import { context } from "@actions/github";
import { info } from "@actions/core";
import { ContextParametersError } from "@errors";

export type ContextParameters = Awaited<ReturnType<typeof getContextParameters>>;

export const getContextParameters = () => {
    const { owner, repo: repository } = context.repo;

    const pullRequest = context.payload.pull_request?.number;

    if (!owner) {
        throw ContextParametersError.missingParameter("owner");
    }

    if (!repository) {
        throw ContextParametersError.missingParameter("repository");
    }

    info(`Inferred owner as ${owner}, in the repository ${repository}`);

    return { owner, repository, pullRequest };
};
