import { EventSchemas, Inngest, InngestMiddleware } from "inngest";
import { HonoType } from "..";
import { createCandidate, evaluateCandidate } from "./functions";
import { candidateSchema } from "./functions";
import { z } from "zod";

type evaluateCandidate = {
    data: {
        candidate: z.infer<typeof candidateSchema>;
    };
};
type Events = {
    "pipeline/evaluate-candidate": evaluateCandidate;
    "pipeline/create-candidate": {
        data: {};
    };
};

const bindings = new InngestMiddleware({
    name: "Cloudflare Workers bindings",
    init() {
        return {
            onFunctionRun({ reqArgs }) {
                return {
                    transformInput() {
                        const envArgs: any = reqArgs.filter(
                            (arg: any) => arg.env
                        );
                        const env = envArgs[0].env as HonoType["Bindings"];
                        return {
                            ctx: {
                                env,
                            },
                        };
                    },
                };
            },
        };
    },
});

export const inngest = new Inngest({
    id: "matchmaker-ai",
    middleware: [bindings],
    schemas: new EventSchemas().fromRecord<Events>(),
});

export const functions = [createCandidate, evaluateCandidate];
