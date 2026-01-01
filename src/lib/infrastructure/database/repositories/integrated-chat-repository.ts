import { db } from '..';
import { integratedChats, IntegratedChat } from '../schema';
import { eq, and } from 'drizzle-orm';

export class IntegratedChatRepository {

    /**
     * Get chat history for a specific platform and user.
     * Returns empty array if no history exists.
     */
    static async getHistory(platform: 'telegram' | 'whatsapp', externalUserId: string): Promise<any[]> {
        const chat = await db.query.integratedChats.findFirst({
            where: and(
                eq(integratedChats.platform, platform),
                eq(integratedChats.externalUserId, externalUserId)
            )
        });

        if (!chat) return [];
        return chat.history as any[];
    }

    /**
     * Save/Update chat history.
     * Creates new record if it doesn't exist.
     */
    static async updateHistory(
        platform: 'telegram' | 'whatsapp',
        externalUserId: string,
        newMessages: any[]
    ): Promise<void> {

        // Fetch existing to append or create
        const existing = await db.query.integratedChats.findFirst({
            where: and(
                eq(integratedChats.platform, platform),
                eq(integratedChats.externalUserId, externalUserId)
            )
        });

        if (existing) {
            // Append new messages to existing history
            // We expect newMessages to be the *new* ones, but if the caller passes full history, we should handle that.
            // For now, let's assume the caller passes the FULL updated history to keep it simple and idempotent-ish
            // OR caller passes just new ones.
            // Let's decide: Caller passes FULL history.

            await db.update(integratedChats)
                .set({
                    history: newMessages,
                    updatedAt: new Date()
                })
                .where(eq(integratedChats.id, existing.id));
        } else {
            await db.insert(integratedChats).values({
                platform,
                externalUserId,
                history: newMessages
            });
        }
    }

    /**
     * Append specific messages to history (Helper)
     */
    static async appendToHistory(
        platform: 'telegram' | 'whatsapp',
        externalUserId: string,
        messagesToAppend: any[]
    ): Promise<void> {
        const currentHistory = await this.getHistory(platform, externalUserId);
        const updatedHistory = [...currentHistory, ...messagesToAppend];
        await this.updateHistory(platform, externalUserId, updatedHistory);
    }
}
