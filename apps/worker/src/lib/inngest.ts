import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "matchmaker-ai" });

const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello-world" },
    async ({ event, step }) => {
        // await step.run("hello-world")
        await step.sleep("wait-a-bit", 1000);
        console.log("Hello world from inngest");
        return { message: `Hello, world! ${event.data.email}` };
    }
);

export const functions = [helloWorld];
