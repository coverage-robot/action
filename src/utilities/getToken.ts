import { getInput } from "@actions/core";

export const getToken = () => getInput("token", { trimWhitespace: true, required: true });
