import { betterAuth } from "better-auth";
import type { Bindings } from "../types";

export const createAuth = (env: Bindings) => {
    return betterAuth({
        database: env.DB,
        secret: env.BETTER_AUTH_SECRET,
        baseURL: env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
        },
    });
};

export type AuthType = {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
}

// need a temporary instance just for type inference
const auth = createAuth({} as Bindings)