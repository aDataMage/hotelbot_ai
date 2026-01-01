import { ChatOrchestrator } from '@/lib/infrastructure/ai/chat-orchestrator';
import { IntegratedChatRepository } from '@/lib/infrastructure/database/repositories/integrated-chat-repository';
import { openai } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string | number, text: string) {
    if (!TELEGRAM_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN not set');
        return;
    }
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (e) {
        console.error('Failed to send Telegram message', e);
    }
}

export async function POST(req: Request) {
    try {
        const update = await req.json();

        // Basic validation of update structure
        if (!update.message || !update.message.text) {
            return Response.json({ ok: true }); // Acknowledge to stop retries
        }

        const chatId = String(update.message.chat.id);
        const userText = update.message.text;

        // 1. Get History
        const history = await IntegratedChatRepository.getHistory('telegram', chatId);

        // 2. Prepare Messages
        const incomingMessage: any = { role: 'user', content: userText };
        const conversation = [...history, incomingMessage];

        // 3. Process with Orchestrator
        const {
            isValid,
            validationError,
            modelMessages,
            agentConfig
        } = await ChatOrchestrator.processMessage(conversation);

        if (!isValid) {
            await sendTelegramMessage(chatId, validationError || "I couldn't process your message.");
            return Response.json({ ok: true });
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
        await IntegratedChatRepository.appendToHistory('telegram', chatId, messagesToSave);

        // 6. Send Response
        await sendTelegramMessage(chatId, aiText);

        return Response.json({ ok: true });

    } catch (error) {
        console.error('Telegram Webhook Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
