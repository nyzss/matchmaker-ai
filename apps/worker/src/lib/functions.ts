import { z } from "zod";
import { inngest } from "./inngest";
import { createLLM } from "./llm";
import { candidatesTable, createDb, jobTable } from "@repo/database";

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

const createCandidate = inngest.createFunction(
    { id: "create-candidate" },
    { event: "pipeline/create-candidate" },
    // { cron: "*/5 * * * *" },
    async ({ event, step, env }) => {
        const llm = createLLM(env.OPENAI_API_KEY).withStructuredOutput(
            candidateSchema,
            {
                name: "create_candidate",
                strict: true,
            }
        );
        const db = createDb({ DATABASE_URL: env.DATABASE_URL });

        const candidate = await llm.invoke(
            "Create a candidate profile for a customer support role at Doctolib"
        );

        await db.insert(candidatesTable).values(candidate);

        console.log("CANDIDATE", candidate);

        await inngest.send({
            name: "pipeline/evaluate-candidate",
            data: {
                candidate,
            },
        });

        return { message: "Candidate created" };
    }
);
const evaluateCandidate = inngest.createFunction(
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
                return await llm.invoke([
                    {
                        role: "system",
                        content: `You are a recruiter evaluating a candidate for the following job: ${jobs}`,
                    },
                    {
                        role: "user",
                        content: `Candidate: ${candidate}`,
                    },
                ]);
            })
        );

        console.log("EVALUATION", evaluationList);

        return { message: evaluationList };
    }
);

export { createCandidate, evaluateCandidate };
