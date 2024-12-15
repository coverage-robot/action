import { getInput } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { GitParametersError } from "@errors";
import { info } from "@actions/core";
import { ContextParameters } from "./getContextParameters";
import { getEnvironmentVariable } from "./getEnvironmentVariable";

export type GitParameters = Awaited<ReturnType<typeof getGitParameters>>;

export const getGitParameters = async ({ owner, repository }: Pick<ContextParameters, "owner" | "repository">) => {
    const head = {
        commit: (context.payload.pull_request?.head.sha || getEnvironmentVariable("GITHUB_SHA")) as string|undefined,
        ref: (getEnvironmentVariable("GITHUB_HEAD_REF") || getEnvironmentVariable("GITHUB_REF_NAME"))
    }

    const base = {
        commit: (context.payload.pull_request?.base.sha || undefined) as string|undefined,
        ref: (context.payload.pull_request?.base.ref || undefined) as string|undefined
    };

    if (!head.commit) {
        throw GitParametersError.missingCommit();
    }

    if (!head.ref) {
        throw GitParametersError.missingRef();
    }

    info(`Inferred reference as ${head.ref}`);

    if (base.commit || base.ref) {
        info(`Inferred PRs base reference as ${base.ref}`);
        info(`Inferred PRs base commit as ${base.commit}`);
    }

    const octokit = getOctokit(getInput("github-token"));

    try {
        const {
            data: { parents },
        } = await octokit.rest.git.getCommit({
            owner,
            repo: repository,
            commit_sha: head.commit,
        });

        const parentCommits = parents.map((parent) => parent.sha);

        info(`Inferred commit as ${head.commit}, and its parent as ${parentCommits.join(",")}`);

        return { parent: parentCommits, head, base };
    } catch {
        throw GitParametersError.missingParentCommit();
    }
};
