import { ChatOrchestrator } from '@/lib/infrastructure/ai/chat-orchestrator';
import { IntegratedChatRepository } from '@/lib/infrastructure/database/repositories/integrated-chat-repository';
import { openai } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Convert markdown to Telegram-compatible format.
 * Telegram supports: *bold*, _italic_, `code`, [link](url)
 * But doesn't support: headers, bullet points, etc.
 */
function formatForTelegram(text: string): string {
    return text
        // Convert **bold** to *bold* (Telegram style)
        .replace(/\*\*(.+?)\*\*/g, '*$1*')
        // Convert headers to bold
        .replace(/^#+\s*(.+)$/gm, '*$1*')
        // Convert bullet points to emoji
        .replace(/^[-*]\s+/gm, '• ')
        // Convert numbered lists
        .replace(/^\d+\.\s+/gm, '• ')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

async function sendTelegramMessage(chatId: string | number, text: string) {
    if (!TELEGRAM_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN not set');
        return;
    }

    const formattedText = formatForTelegram(text);
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: formattedText,
                parse_mode: 'Markdown'
            })
        });

        // If Markdown parsing fails, retry without it
        if (!response.ok) {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text.replace(/[*_`\[\]]/g, '') // Strip markdown
                })
            });
        }
    } catch (e) {
        console.error('Failed to send Telegram message', e);
    }
}

export async function POST(req: Request) {
    try {
        const update = await req.json();

        if (!update.message || !update.message.text) {
            return Response.json({ ok: true });
        }

        const chatId = String(update.message.chat.id);
        const userText = update.message.text;

        const history = await IntegratedChatRepository.getHistory('telegram', chatId);

        const incomingMessage: any = { role: 'user', content: userText };
        const conversation = [...history, incomingMessage];

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

        const result = await generateText({
            model: openai('gpt-4o'),
            messages: modelMessages,
            system: agentConfig.systemPrompt,
            tools: agentConfig.tools,
            toolChoice: 'auto',
            stopWhen: stepCountIs(5),
        });

        const aiText = result.text;

        const messagesToSave = [incomingMessage, ...result.response.messages];
        await IntegratedChatRepository.appendToHistory('telegram', chatId, messagesToSave);

        await sendTelegramMessage(chatId, aiText);

        return Response.json({ ok: true });

    } catch (error) {
        console.error('Telegram Webhook Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
