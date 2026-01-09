# Project Replication Guide: Multi-Agent AI System

This guide provides a complete template for replicating the **HotelBot** architecture for any industry (e.g., Real Estate, Healthcare, E-commerce). It covers the technology stack, project structure, and improved "Clean Architecture" implementation steps.

## 1. Technology Stack

This project uses a modern, production-ready stack focused on type safety and AI capabilities.

### Core Framework
- **Frontend/Fullstack**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### AI & Data
- **AI Orchestration**: [Vercel AI SDK Core 6.0+](https://sdk.vercel.ai/docs) (Latest Core)
- **Agent Logic**: [LangChain](https://js.langchain.com/docs/) (Graph/Chains - optional, but good for complex flows)
- **LLM Providers**: OpenAI (GPT-4o) & Google (Gemini 1.5 Pro)
- **Database**: [PostgreSQL](https://neon.tech/) (Serverless via Neon)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Vector Database**: [Qdrant](https://qdrant.tech/) (for RAG/Knowledge Base)
- **Validation**: [Zod](https://zod.dev/)

### Integrations
- **Messaging**: Telegram Bot API, Twilio (WhatsApp)
- **Auth**: Better Auth

---

## 2. Project Structure (Clean Architecture)

This project strictly follows **Clean Architecture** principles. Below is the complete directory structure you should replicate.

```text
/
├── .env.local                  # Environment variables (API keys, DB URLs)
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── scripts/                    # Utility scripts (Seeding, setup)
│   ├── seed-knowledge-base.ts  # Script to ingest FAQs/Docs into Qdrant
│   ├── seed-qdrant.ts          # Core vector DB setup script
│   └── seed.ts                 # Database seeding script
└── src/
    ├── app/                    # Next.js App Router (Presentation Layer)
    │   ├── api/                # Backend API Routes
    │   │   ├── admin/          # Admin-only endpoints
    │   │   ├── auth/           # Authentication endpoints (better-auth)
    │   │   ├── bookings/       # Booking management endpoints
    │   │   ├── chat/           # Main Chatbot API endpoint
    │   │   ├── integrations/   # Webhooks for external channels
    │   │   │   ├── telegram/   # Telegram Bot webhook
    │   │   │   └── whatsapp/   # WhatsApp (Twilio) webhook
    │   │   └── rooms/          # Room data endpoints
    │   ├── (dashboard)/        # Admin Dashboard Pages
    │   ├── (marketing)/        # Public Landing Pages
    │   └── layout.tsx          # Root layout
    ├── components/             # React Components
    │   ├── ui/                 # Reusable UI elements (Buttons, Inputs - from shadcn)
    │   ├── features/           # Feature-specific components (ChatWindow, BookingForm)
    │   └── layout/             # Layout components (Header, Sidebar)
    ├── lib/                    # Core Application Logic
    │   ├── config/             # Configuration constants
    │   ├── domain/             # (CRITICAL) Pure Business Logic & Types
    │   │   ├── errors/         # Custom domain errors
    │   │   ├── models/         # Entity definitions (Room, Booking)
    │   │   ├── repositories/   # Interfaces for data access
    │   │   ├── services/       # Domain services (Pricing, Availability logic)
    │   │   ├── types/          # Shared domain types
    │   │   └── value-objects/  # Immutable domain objects (DateRange, Money)
    │   ├── infrastructure/     # Implementation of External Services
    │   │   ├── ai/             # AI Integration Layer
    │   │   │   ├── agents/     # Agent definitions (Router, Booker)
    │   │   │   ├── tools/      # Function tools (checkAvailability)
    │   │   │   └── prompts/    # System prompts for LLMs
    │   │   ├── database/       # Database implementation
    │   │   │   ├── models.ts   # Drizzle schema definitions
    │   │   │   └── db.ts       # DB connection client
    │   │   └── vector/         # Vector DB (Qdrant) client implementation
    │   ├── use-cases/          # Application Busines Rules
    │   └── utils/              # Shared helper functions
    ├── tests/                  # Test suite
    └── types/                  # Global TypeScript types
```

---

## 3. Step-by-Step Implementation Template

Follow these steps to initialize your new project (e.g., "RealEstateBot").

### Phase 1: Foundation
1.  **Initialize Next.js**:
    ```bash
    npx create-next-app@latest my-bot --typescript --tailwind --eslint
    ```
2.  **Install Dependencies**:
    ```bash
    # Core & UI
    npm install lucide-react framer-motion clsx tailwind-merge zod date-fns

    # AI
    npm install ai @ai-sdk/openai @ai-sdk/google @langchain/core @qdrant/qdrant-js

    # Database
    npm install drizzle-orm @neondatabase/serverless postgres
    npm install -D drizzle-kit
    ```
3.  **Configure Environment**:
    Create `.env.local` with keys for OpenAI, Neon DB, and Qdrant.

### Phase 2: Domain Layer (The "Business" Logic)
*This is where you define your industry.*
Create `src/lib/domain/models.ts`.
- **Hotel**: Room, Booking, Guest.
- **Real Estate**: Property, Viewing, Client.
- **Medical**: Patient, Appointment, Doctor.

Example (Generic):
```typescript
// src/lib/domain/models.ts
export type Entity = {
  id: string;
  name: string;
  status: 'available' | 'booked';
  // Add industry-specific fields
};
```

### Phase 3: Infrastructure Layer
Set up your database connection and Schema.
1.  **schema.ts**: Define tables using Drizzle.
2.  **db.ts**: Export the database connection.

### Phase 4: The AI Core (Router & Agents)
This is the heart of the system.
1.  **Router Agent**: A lightweight LLM call that decides *intent*.
    - Input: "I want to see a house."
    - Output: `VIEWING_INTENT` -> Routes to `ViewingAgent`.
2.  **Specialized Agents**:
    - **Knowledge Agent**: Uses RAG (Qdrant) to answer FAQs (Policy, Hours, Specs).
    - **transaction Agent**: Handles writes (Bookings, Purchases).
    - **Human Handoff**: Detects frustration and pings a human.

### Phase 5: Interface
- Build a chat interface using `useChat` from Vercel AI SDK.
- Create a dashboard for Admins to view chats and manage "Entities" (Rooms/Houses).

---

## 4. Adapting to Your Industry

To fork this for a new industry, focus on these files:

### 1. The Knowledge Base (RAG)
**Hotel**: PDFs of Room Service Menu, Spa Policy.
**New Industry**:
- *Real Estate*: Property Listings (Price, Location), Market Reports.
- *Legal*: Standard Contracts, Case Law summaries.

**Action**: Replace the seed script (`scripts/seed-qdrant.ts`) to ingest your specific documents into Qdrant.

### 2. The Tools (Function Calling)
**Hotel**: `checkAvailability(dates)`, `bookRoom(type)`.
**New Industry**:
- *Real Estate*: `searchProperties(location, price)`, `scheduleViewing(propertyId)`.
- *E-commerce*: `checkStock(sku)`, `placeOrder(cart)`.

**Action**: Define new Zod schemas for these tools and implement the logic in `src/lib/use-cases`.

### 3. The System Prompts
**Hotel**: "You are a helpful hotel concierge..."
**New Industry**: "You are a knowledgeable real estate broker..."

**Action**: Update the system prompt strings in your Agent files.

---

## 5. Key Code Patterns & Snippets

These are the reusable core mechanisms you can copy directly.

### A. Intent Classification (The Router)
`src/lib/infrastructure/ai/agents/intent-classifier.ts`
```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

export async function classifyIntent(message: string) {
    return await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
            intent: z.enum(['booking', 'knowledge', 'service', 'general']),
            confidence: z.number(),
        }),
        prompt: `Classify this message: "${message}"...`
    });
}
```

### B. AI Orchestration (LangGraph)
`src/lib/infrastructure/ai/agents/agent-graph.ts`
```typescript
import { StateGraph, END } from '@langchain/langgraph';

// Define the State Machine
const workflow = new StateGraph(AgentState)
    .addNode('classifier', classifyIntent)
    .addNode('booking_agent', bookingAgent)
    .addNode('faq_agent', faqAgent);

// Define Routing Logic
workflow.addEdge(START, 'classifier');
workflow.addConditionalEdges('classifier', (state) => state.intent, {
    booking: 'booking_agent',
    knowledge: 'faq_agent',
});

export const graph = workflow.compile();
```

### C. RAG Implementation (Knowledge Search)
`src/lib/infrastructure/ai/tools/knowledge-tools.ts`
```typescript
import { QdrantClient } from '@qdrant/qdrant-js';

export async function searchKnowledgeBase(query: string) {
    const embedding = await generateEmbedding(query);
    
    const results = await qdrant.search('hotel_knowledge', {
        vector: embedding,
        limit: 5,
        score_threshold: 0.7
    });

    return results.map(r => r.payload?.content);
}
```

### D. Clean Schema Definition (Drizzle)
`src/lib/infrastructure/database/schema.ts`
```typescript
import { pgTable, varchar, decimal } from 'drizzle-orm/pg-core';

// Easy to swap 'rooms' for 'properties' or 'products'
export const rooms = pgTable('rooms', {
    id: varchar('id').primaryKey(),
    name: varchar('name').notNull(),
    price: decimal('price').notNull(),
    features: jsonb('features'), // Flexible JSON for varied attributes
});
```

### E. Chat Interface (Frontend)
`src/app/chat/page.tsx`
```typescript
import { useChat } from "@ai-sdk/react";

export default function ChatInterface() {
    const { messages, sendMessage, status } = useChat({
        api: '/api/chat',
        initialMessages: [{ role: 'assistant', content: 'Welcome! How can I help?' }],
    });

    return (
        <div>
            {messages.map(m => (
                <div key={m.id} className={m.role === 'user' ? 'user-msg' : 'ai-msg'}>
                    {m.content}
                </div>
            ))}
            
            <input 
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        sendMessage({ text: e.currentTarget.value });
                        e.currentTarget.value = '';
                    }
                }} 
            />
        </div>
    );
}
```

---

## 6. Deployment Checklist
1.  **Database**: Spin up a [Neon](https://neon.tech) project. Apply migrations (`npx drizzle-kit push`).
2.  **Vector DB**: Create a [Qdrant](https://qdrant.tech) cluster. Run your seed script.
3.  **Hosting**: Deploy to [Vercel](https://vercel.com). Add environment variables.
4.  **Integrations**: Set up webhooks for WhatsApp/Telegram if text-based interaction is needed.
