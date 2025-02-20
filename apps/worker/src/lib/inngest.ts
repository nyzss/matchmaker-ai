import { Inngest, InngestMiddleware } from "inngest";
import { HonoType } from "..";
import { createLLM } from "./llm";
import { createDb } from "@repo/database";
import { z } from "zod";

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
});

const candidateSchema = z.object({
    name: z.string().describe("The name of the candidate"),
    email: z.string().describe("The email of the candidate"),
    experience: z.string().describe("The experience of the candidate"),
    skills: z.string().describe("The skills of the candidate"),
});

const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    // { cron: "*/10 * * * *" },
    { event: "test/hello-world" },
    async ({ event, step, env }) => {
        const llm = createLLM(env.OPENAI_API_KEY).withStructuredOutput(
            candidateSchema,
            {
                name: "create_candidate",
                strict: true,
            }
        );
        // const db = createDb({ DATABASE_URL: env.DATABASE_URL });

        const candidate = await llm.invoke(
            "Create a candidate profile for a customer support role at Doctolib"
        );

        console.log("CANDIDATE", candidate);

        return { message: candidate };
    }
);

export const functions = [helloWorld];
