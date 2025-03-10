import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, Message } from "ai";
import { initialMessage } from "@/lib/data";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

export const runtime = "edge";

const generateId = () => Math.random().toString(36).substring(2, 15);

const buildGoogleGenAIPrompt = (message: Message[] = []): Message[] => {
  return [
    {
      id: generateId(),
      role: "user",
      content: initialMessage.content,
    },
    ...message.map((msg) => ({
      id: msg.id || generateId(),
      role: msg.role,
      content: msg.content,
    })),
  ];
};

export async function POST(request: Request) {
  const { message } = await request.json();
  console.log(message);
  const stream = await streamText({
    model: google("gemini-1.5-pro"),
    messages: buildGoogleGenAIPrompt(message),
    temperature: 0.7,
  });
  return stream?.toDataStreamResponse();
}
