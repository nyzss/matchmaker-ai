import { ChatOpenAI } from "@langchain/openai";

const createLLM = (apiKey: string) => {
    return new ChatOpenAI({
        apiKey,
        modelName: "gpt-4o-mini",
        temperature: 0.7,
    });
};

export { createLLM };
