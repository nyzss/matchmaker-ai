import { EventSchemas, Inngest, InngestMiddleware } from "inngest";
import { HonoType } from "..";

import { z } from "zod";
import { createLLM } from "./llm";
import {
    applicationsTable,
    candidatesTable,
    createDb,
    jobTable,
} from "@repo/database";
import { and, eq, InferSelectModel, lt, sql } from "drizzle-orm";
import { WebClient } from "@slack/web-api";

type evaluateCandidate = {
    data: {
        candidate: InferSelectModel<typeof candidatesTable>;
    };
};
type Events = {
    "pipeline/evaluate-candidate": evaluateCandidate;
    "pipeline/create-candidate": {
        data: {};
    };
    "pipeline/send-slack-message": {
        data: {
            message: string;
        };
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

export const candidateSchema = z.object({
    name: z.string().describe("The name of the candidate"),
    email: z.string().describe("The email of the candidate"),
    experience: z.string().describe("The experience of the candidate"),
    skills: z.string().describe("The skills of the candidate"),
});

export const evaluationSchema = z.object({
    matchScore: z.number().describe("The match score of the candidate"),
    aiAnalysis: z.string().describe("The ai analysis of the candidate"),
});

export const createCandidate = inngest.createFunction(
    { id: "create-candidate" },
    // { event: "pipeline/create-candidate" },
    { cron: "*/5 * * * *" },
    async ({ event, step, env }) => {
        const llm = createLLM(env.OPENAI_API_KEY).withStructuredOutput(
            candidateSchema,
            {
                name: "create_candidate",
                strict: true,
            }
        );
        const db = createDb({ DATABASE_URL: env.DATABASE_URL });

        const createdCandidate = await llm.invoke(
            "Create a candidate profile for a customer support role at Doctolib"
        );

        const candidate = await db
            .insert(candidatesTable)
            .values(createdCandidate)
            .returning();

        if (!candidate[0]) {
            throw new Error("Candidate not created");
        }

        await inngest.send({
            name: "pipeline/evaluate-candidate",
            data: {
                candidate: candidate[0],
            },
        });

        return { message: "Candidate created", candidate };
    }
);
export const evaluateCandidate = inngest.createFunction(
    { id: "evaluate-candidate" },
    { event: "pipeline/evaluate-candidate" },
    async ({ event, step, env }) => {
        const db = createDb({ DATABASE_URL: env.DATABASE_URL });

        const jobs = await db.select().from(jobTable);

        const llm = createLLM(env.OPENAI_API_KEY).withStructuredOutput(
            evaluationSchema,
            {
                name: "evaluate_candidate",
                strict: true,
            }
        );

        const candidate = event.data.candidate;

        const evaluationList = await Promise.all(
            jobs.map(async (job) => {
                const evaluation = await llm.invoke([
                    {
                        role: "system",
                        content: `You are a recruiter evaluating a candidate for the following job: ${job}`,
                    },
                    {
                        role: "user",
                        content: `Candidate: ${candidate}`,
                    },
                ]);
                return {
                    ...evaluation,
                    jobId: job.id,
                    candidateId: candidate.id,
                };
            })
        );

        const applications = await Promise.all(
            evaluationList.map(
                async (evaluation) =>
                    await db
                        .insert(applicationsTable)
                        .values(evaluation)
                        .returning()
            )
        );

        if (env.SLACK_BOT_TOKEN) {
            const slack = new WebClient(env.SLACK_BOT_TOKEN);

            for (const application of applications) {
                if (!application[0]) {
                    continue;
                }
                await slack.chat.postMessage({
                    channel: "C08E9RZARB5",
                    text: "New Candidate Evaluation",
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `*New Candidate Evaluation*\n\nCandidate: ${candidate.name}\nMatch Score: ${application[0].matchScore}\nAI Analysis: ${application[0].aiAnalysis}`,
                            },
                        },
                        {
                            dispatch_action: true,
                            type: "input",
                            element: {
                                type: "plain_text_input",
                                action_id: application[0].id,
                                placeholder: {
                                    type: "plain_text",
                                    text: "Enter your feedback here",
                                },
                            },
                            label: {
                                type: "plain_text",
                                text: "Feedback",
                                emoji: true,
                            },
                        },
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "plain_text",
                                    text: application[0].id,
                                },
                            ],
                        },
                    ],
                });
            }
        }

        return { message: "Candidate evaluated", applications };
    }
);

export const checkApplications = inngest.createFunction(
    { id: "check-applications" },
    { cron: "* * * * *" },
    async ({ event, step, env }) => {
        const db = createDb({ DATABASE_URL: env.DATABASE_URL });

        const applications = await db
            .select()
            .from(applicationsTable)
            .where(
                and(
                    eq(applicationsTable.status, "in_review"),
                    lt(
                        applicationsTable.createdAt,
                        sql`NOW() - INTERVAL '2 minutes'`
                    )
                )
            );

        applications.forEach(async (application) => {
            await db
                .update(applicationsTable)
                .set({ status: "canceled" })
                .where(eq(applicationsTable.id, application.id));
        });

        return { message: "Applications checked", applications };
    }
);

export const sendSlackMessage = inngest.createFunction(
    { id: "send-slack-message" },
    { event: "pipeline/send-slack-message" },
    async ({ event, step, env }) => {
        const message = event.data.message;

        console.log(env.SLACK_BOT_TOKEN);
        if (!env.SLACK_BOT_TOKEN) {
            throw new Error("SLACK_BOT_TOKEN is not set");
        }

        const slack = new WebClient(env.SLACK_BOT_TOKEN);

        const result = await slack.chat.postMessage({
            channel: "C08E9RZARB5",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: message,
                    },
                },
            ],
        });

        return { message: "Slack message sent", result };
    }
);
export const functions = [
    createCandidate,
    evaluateCandidate,
    checkApplications,
    sendSlackMessage,
];
