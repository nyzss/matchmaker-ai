import { Inngest, InngestMiddleware } from "inngest";
import { HonoType } from "..";

const bindings = new InngestMiddleware({
    name: "Cloudflare Workers bindings",
    init({ client, fn }) {
        return {
            onFunctionRun({ ctx, fn, steps, reqArgs }) {
                return {
                    transformInput({ ctx, fn, steps }) {
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

const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    // { cron: "*/10 * * * *" },
    { event: "test/hello-world" },
    async ({ event, step, env }) => {
        const key = env.OPENAI_API_KEY;
        await step.sleep("wait-a-bit", 1000);
        console.log("Hello world from inngest at", new Date().toISOString());
        return { message: `Hello, world! ${new Date().toISOString()} ${key}` };
    }
);

export const functions = [helloWorld];
