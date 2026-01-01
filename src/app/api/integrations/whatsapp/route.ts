import { ChatOrchestrator } from '@/lib/infrastructure/ai/chat-orchestrator';
import { IntegratedChatRepository } from '@/lib/infrastructure/database/repositories/integrated-chat-repository';
import { openai } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';

/**
 * Escape XML special characters to prevent injection in TwiML responses.
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const body = formData.get('Body') as string;
        const from = formData.get('From') as string; // e.g., whatsapp:+14155238886

        if (!body || !from) {
            return new Response('Missing Body or From', { status: 400 });
        }

        // 1. Get History
        const history = await IntegratedChatRepository.getHistory('whatsapp', from);

        // 2. Prepare Messages
        const incomingMessage: any = { role: 'user', content: body };
        const conversation = [...history, incomingMessage];

        // 3. Process with Orchestrator
        const {
            isValid,
            validationError,
            modelMessages,
            agentConfig
        } = await ChatOrchestrator.processMessage(conversation);

        if (!isValid) {
            const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(validationError || "Error processing message")}</Message></Response>`;
            return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
        }

        // 4. Generate Response (Non-streaming)
        const result = await generateText({
            model: openai('gpt-4o'),
            messages: modelMessages,
            system: agentConfig.systemPrompt,
            tools: agentConfig.tools,
            toolChoice: 'auto',
            stopWhen: stepCountIs(5),
        });

        const aiText = result.text;

        // 5. Update History
        const messagesToSave = [incomingMessage, ...result.response.messages];
        await IntegratedChatRepository.appendToHistory('whatsapp', from, messagesToSave);

        // 6. Send Response via TwiML
        const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(aiText)}</Message></Response>`;
        return new Response(xml, {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('WhatsApp Webhook Error:', error);
        const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, I encountered an error.</Message></Response>`;
        return new Response(xml, {
            status: 200, // Always return 200 to Twilio to avoid retries on logic error
            headers: { 'Content-Type': 'text/xml' }
        });
    }
}
