/**
 * FUNCTION: AI Orchestration (LangGraph)
 * 
 * This file defines the state machine (Graph) for the AI agents.
 * It routes user intent to specific sub-agents (Booking, FAQ, Customer Service).
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/langchain-tools.ts (Tools used by agents)
 * - src/lib/infrastructure/ai/agents/types.ts (State definitions)
 * 
 * RELATED DOMAIN LOGIC:
 * - Indirectly invokes Domain Services via Tools.
 */
// src/lib/infrastructure/ai/agents/agent-graph.ts
import { StateGraph, END, START } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { AgentState, IntentClassification } from './types';
import {
    bookingTools,
    knowledgeTools,
    escalationTools,
    allTools
} from '../tools/langchain-tools';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Initialize OpenAI model with function calling
const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
});

/**
 * INTENT CLASSIFIER NODE
 * Uses structured output to classify user intent
 */
async function classifyIntent(state: typeof AgentState.State) {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!(lastMessage instanceof HumanMessage)) {
        return { intent: null, confidence: 0 };
    }

    const systemPrompt = `You are an intent classifier for a hotel AI assistant.
Analyze the user's message and classify it into one of these categories:

- booking: User wants to search for rooms, make a reservation, modify or cancel a booking
- faq: User asking about policies, amenities, services, restaurants, or nearby attractions
- customer_service: Complaints, special requests, complex issues requiring human attention
- greeting: Simple greetings or small talk
- unknown: Cannot determine intent

Respond with JSON in this exact format:
{
  "intent": "booking" | "faq" | "customer_service" | "greeting" | "unknown",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`;

    try {
        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Classify this message: "${lastMessage.content}"`),
        ]);

        const content = response.content.toString();
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const classification: IntentClassification = JSON.parse(jsonMatch[0]);

        return {
            intent: classification.intent,
            confidence: classification.confidence,
        };
    } catch (error) {
        console.error('Intent classification error:', error);
        return { intent: 'unknown', confidence: 0 };
    }
}

/**
 * BOOKING AGENT NODE
 * Uses LangChain AgentExecutor with booking tools
 */
async function bookingAgent(state: typeof AgentState.State) {
    const systemPrompt = `You are a hotel booking specialist AI assistant.

ROLE: Help guests find and book hotel rooms efficiently and professionally.

CURRENT CONTEXT: ${JSON.stringify(state.bookingContext || {}, null, 2)}

BOOKING PROCESS:
1. Gather required information:
   - Check-in date (YYYY-MM-DD)
   - Check-out date (YYYY-MM-DD)
   - Number of guests
   - Preferences (bed size, view, budget)

2. Search for available rooms using search_available_rooms tool

3. Present 2-3 best options with:
   - Room name and features
   - Price breakdown (per night, total, taxes)
   - Availability confirmation

4. Collect guest details:
   - Full name
   - Email address
   - Phone number
   - Special requests (optional)

5. Confirm ALL details before booking

6. Use create_booking tool to finalize

7. Provide confirmation number and booking summary

IMPORTANT:
- Ask ONE question at a time
- Always confirm details before final booking
- Be conversational and friendly
- Never make up room availability or prices
- Use tools to get accurate, real-time information

Available tools: search_available_rooms, create_booking, get_booking_details`;

    try {
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', systemPrompt],
            ['placeholder', '{chat_history}'],
            ['human', '{input}'],
            ['placeholder', '{agent_scratchpad}'],
        ]);

        const agent = await createToolCallingAgent({
            llm: model,
            tools: bookingTools,
            prompt,
        });

        const agentExecutor = new AgentExecutor({
            agent,
            tools: bookingTools,
            maxIterations: 3,
            verbose: process.env.NODE_ENV === 'development',
        });

        const lastMessage = state.messages[state.messages.length - 1];
        const chatHistory = state.messages.slice(0, -1);

        const result = await agentExecutor.invoke({
            input: lastMessage.content.toString(),
            chat_history: chatHistory,
        });

        return {
            messages: [new AIMessage(result.output)],
            nextAction: 'continue' as const,
        };
    } catch (error) {
        console.error('Booking agent error:', error);
        return {
            messages: [new AIMessage('I apologize, but I encountered an error processing your booking request. Please try again or contact our front desk.')],
            error: error instanceof Error ? error.message : 'Unknown error',
            nextAction: 'end' as const,
        };
    }
}

/**
 * FAQ AGENT NODE
 * Uses LangChain AgentExecutor with knowledge tools
 */
async function faqAgent(state: typeof AgentState.State) {
    const systemPrompt = `You are a knowledgeable hotel information specialist.

ROLE: Answer questions about hotel policies, services, dining, and attractions using accurate information from the knowledge base.

APPROACH:
1. Use search_knowledge_base for general queries
2. Use specific tools for targeted information:
   - get_policy_info: Hotel policies
   - get_restaurant_info: Dining options and menus
   - get_nearby_attractions: Local attractions
   - get_hotel_services: Amenities and services

3. Provide accurate, helpful answers
4. Cite sources when possible
5. If information isn't in the knowledge base, say so clearly

GUIDELINES:
- Be informative but concise
- Use bullet points for lists
- Include relevant details (hours, prices, locations)
- Suggest related information when helpful
- Never make up information

Available tools: search_knowledge_base, get_policy_info, get_restaurant_info, get_nearby_attractions, get_hotel_services`;

    try {
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', systemPrompt],
            ['placeholder', '{chat_history}'],
            ['human', '{input}'],
            ['placeholder', '{agent_scratchpad}'],
        ]);

        const agent = await createToolCallingAgent({
            llm: model,
            tools: knowledgeTools,
            prompt,
        });

        const agentExecutor = new AgentExecutor({
            agent,
            tools: knowledgeTools,
            maxIterations: 2,
            verbose: process.env.NODE_ENV === 'development',
        });

        const lastMessage = state.messages[state.messages.length - 1];
        const chatHistory = state.messages.slice(0, -1);

        const result = await agentExecutor.invoke({
            input: lastMessage.content.toString(),
            chat_history: chatHistory,
        });

        return {
            messages: [new AIMessage(result.output)],
            nextAction: 'continue' as const,
        };
    } catch (error) {
        console.error('FAQ agent error:', error);
        return {
            messages: [new AIMessage('I had trouble finding that information. Please rephrase your question or contact our concierge.')],
            error: error instanceof Error ? error.message : 'Unknown error',
            nextAction: 'end' as const,
        };
    }
}

/**
 * CUSTOMER SERVICE AGENT NODE
 * Handles complaints, special requests, and escalations
 */
async function customerServiceAgent(state: typeof AgentState.State) {
    const systemPrompt = `You are an empathetic customer service specialist for a luxury hotel.

ROLE: Handle complaints, special requests, and complex guest issues with professionalism and care.

APPROACH:
1. LISTEN: Acknowledge the guest's concern
2. EMPATHIZE: Show understanding and care
3. APOLOGIZE: When appropriate, offer sincere apology
4. SOLVE: Provide concrete solutions
5. ESCALATE: When necessary, use escalate_to_human tool

ESCALATE FOR:
- Safety or security concerns
- Legal matters
- Medical emergencies
- Guest is very angry or distressed
- Request is beyond your capabilities
- Confidence level < 70%

GUIDELINES:
- Be warm, professional, and solution-oriented
- Take ownership of issues
- Offer alternatives when possible
- Document special requests
- Follow up on commitments

Remember: You represent a luxury hotel. Every interaction should reflect exceptional service.

Available tools: escalate_to_human`;

    try {
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', systemPrompt],
            ['placeholder', '{chat_history}'],
            ['human', '{input}'],
            ['placeholder', '{agent_scratchpad}'],
        ]);

        const agent = await createToolCallingAgent({
            llm: model,
            tools: escalationTools,
            prompt,
        });

        const agentExecutor = new AgentExecutor({
            agent,
            tools: escalationTools,
            maxIterations: 2,
            verbose: process.env.NODE_ENV === 'development',
        });

        const lastMessage = state.messages[state.messages.length - 1];
        const chatHistory = state.messages.slice(0, -1);

        const result = await agentExecutor.invoke({
            input: lastMessage.content.toString(),
            chat_history: chatHistory,
        });

        // Check if escalation occurred
        const shouldEscalate =
            state.confidence < 0.7 ||
            result.output.toLowerCase().includes('escalat') ||
            result.output.toLowerCase().includes('human agent');

        return {
            messages: [new AIMessage(result.output)],
            requiresHuman: shouldEscalate,
            nextAction: shouldEscalate ? 'escalate' : 'continue',
        };
    } catch (error) {
        console.error('Customer service agent error:', error);
        return {
            messages: [new AIMessage('I apologize for the inconvenience. Let me connect you with our management team who can better assist you.')],
            requiresHuman: true,
            nextAction: 'escalate' as const,
        };
    }
}

/**
 * GREETING NODE
 */
async function greetingAgent(state: typeof AgentState.State) {
    const greetingMessage = `Hello! Welcome to HotelAI. 👋

I'm your AI concierge, here to help you with:

🛏️ **Room Bookings** - Find and reserve the perfect room
📋 **Hotel Information** - Policies, services, and amenities
🍽️ **Dining** - Restaurant menus and reservations
🏖️ **Local Attractions** - Things to do and see nearby
🤝 **Special Requests** - Any unique needs or preferences

How can I assist you today?`;

    return {
        messages: [new AIMessage(greetingMessage)],
        nextAction: 'end' as const,
    };
}

/**
 * ROUTING LOGIC
 */
function routeByIntent(state: typeof AgentState.State): string {
    const { intent, requiresHuman } = state;

    if (requiresHuman) {
        return 'escalate';
    }

    switch (intent) {
        case 'booking':
            return 'booking_agent';
        case 'faq':
            return 'faq_agent';
        case 'customer_service':
            return 'customer_service_agent';
        case 'greeting':
            return 'greeting_agent';
        default:
            return 'faq_agent'; // Default to FAQ
    }
}

function shouldContinue(state: typeof AgentState.State): string {
    if (state.nextAction === 'escalate' || state.requiresHuman) {
        return END;
    }
    return state.nextAction === 'end' ? END : 'classifier';
}

/**
 * BUILD THE GRAPH
 */
export function createAgentGraph() {
    const workflow = new StateGraph(AgentState)
        .addNode('classifier', classifyIntent)
        .addNode('booking_agent', bookingAgent)
        .addNode('faq_agent', faqAgent)
        .addNode('customer_service_agent', customerServiceAgent)
        .addNode('greeting_agent', greetingAgent);

    // Set entry point
    workflow.addEdge(START, 'classifier');

    // Route from classifier to appropriate agent
    workflow.addConditionalEdges('classifier', routeByIntent, {
        booking_agent: 'booking_agent',
        faq_agent: 'faq_agent',
        customer_service_agent: 'customer_service_agent',
        greeting_agent: 'greeting_agent',
        escalate: END,
    });

    // Each agent can loop back or end
    const agentNodes = ['booking_agent', 'faq_agent', 'customer_service_agent', 'greeting_agent'];
    agentNodes.forEach((node) => {
        workflow.addConditionalEdges(node, shouldContinue, {
            classifier: 'classifier',
            [END]: END,
        });
    });

    return workflow.compile();
}