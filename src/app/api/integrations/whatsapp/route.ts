import { ChatOrchestrator } from '@/lib/infrastructure/ai/chat-orchestrator';
import { IntegratedChatRepository } from '@/lib/infrastructure/database/repositories/integrated-chat-repository';
import { openai } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';

/**
 * Convert markdown to WhatsApp-compatible format.
 * WhatsApp uses: *bold*, _italic_, ~strikethrough~, ```code```
 * But doesn't support: links, headers, etc.
 */
function formatForWhatsApp(text: string): string {
    return text
        // Convert **bold** to *bold* (WhatsApp style)
        .replace(/\*\*(.+?)\*\*/g, '*$1*')
        // Convert headers to bold with newline
        .replace(/^#+\s*(.+)$/gm, '*$1*')
        // Convert markdown links [text](url) to just text (url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
        // Convert bullet points to emoji
        .replace(/^[-*]\s+/gm, '• ')
        // Convert numbered lists
        .replace(/^\d+\.\s+/gm, '• ')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

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
        const from = formData.get('From') as string;

        if (!body || !from) {
            return new Response('Missing Body or From', { status: 400 });
        }

        const history = await IntegratedChatRepository.getHistory('whatsapp', from);

        const incomingMessage: any = { role: 'user', content: body };
        const conversation = [...history, incomingMessage];

        const {
            isValid,
            validationError,
            modelMessages,
            agentConfig
        } = await ChatOrchestrator.processMessage(conversation);

        if (!isValid) {
            const errorText = formatForWhatsApp(validationError || "Error processing message");
            const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(errorText)}</Message></Response>`;
            return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
        }

        const result = await generateText({
            model: openai('gpt-4o'),
            messages: modelMessages,
            system: agentConfig.systemPrompt,
            tools: agentConfig.tools,
            toolChoice: 'auto',
            stopWhen: stepCountIs(5),
        });

        const aiText = formatForWhatsApp(result.text);

        const messagesToSave = [incomingMessage, ...result.response.messages];
        await IntegratedChatRepository.appendToHistory('whatsapp', from, messagesToSave);

        const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(aiText)}</Message></Response>`;
        return new Response(xml, {
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('WhatsApp Webhook Error:', error);
        const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, I encountered an error.</Message></Response>`;
        return new Response(xml, {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });
    }
}
