# HotelBot
**Revolutionizing Hospitality with Multi-Agent AI**

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-brightgreen?style=for-the-badge&logo=vercel)](https://hotelbot-seven.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/adatamage/)
[![Website](https://img.shields.io/badge/Portfolio-Visit-purple?style=for-the-badge)](https://adatamage.com/)
[![Email](https://img.shields.io/badge/Email-Contact_Me-red?style=for-the-badge&logo=gmail)](mailto:adejorieniola@adatamage.com)

---

## 🧐 The Problem

In the modern hospitality industry, **the guest experience begins long before check-in**. However, many hotels struggle with a critical gap in their digital presence:

1.  **Staffing Bottlenecks:** Front desk staff are overwhelmed by repetitive questions ("Is breakfast included?", "Can I bring my dog?"), leaving less time for high-value guest interactions.
2.  **Missed Revenue:** Booking inquiries that happen after hours or during peak times often go unanswered, resulting in lost direct bookings.
3.  **Static Interfaces:** Traditional booking engines are rigid forms that fail to capture the nuance of a guest's needs ("I need a room with a view for my anniversary"), leading to lower conversion rates.

**The Solution?** An intelligent, 24/7 digital concierge that doesn't just chat—it *acts*.

---

## 💡 The Solution: HotelBot

HotelBot is a sophisticated **Multi-Agent AI System** that transforms how guests interact with hotel services. Unlike simple chatbots that get stuck in loops, HotelBot understands context, retrieves accurate information, and executes complex tasks.

### Key Features & Business Impact

| Feature | Business Value |
| :--- | :--- |
| **🧠 Multi-Agent Orchestration** | **Specialized Competence:** A "Booking Agent" handles reservations while a "Concierge Agent" answers questions. This ensures 100% focus and accuracy for every request. |
| **📚 RAG (Retrieval-Augmented Generation)** | **Trust & Accuracy:** By retrieving answers directly from the hotel's specialized documentation, we eliminate AI hallucinations. Guests get accurate policy info, every time. |
| **🗣️ Natural Language Booking** | **Higher Conversion:** Guests can book simply by saying, *"I need a room for two nights next weekend."* The AI handles the availability, pricing, and confirmation naturally. |
| **🛡️ Clean Architecture** | **Scalability:** Built on enterprise-grade principles, ensuring the system is robust, testable, and ready to scale with the business. |

---

## 🏗️ Technical Architecture

This project demonstrates mastery of modern **Agentic AI** patterns and **Fullstack Engineering**.

### System Design
The system uses a **Router Agent** to classify user intent and delegate tasks to specialized sub-agents.

```mermaid
graph TD
    User[Guest User] --> UI[Next.js Interface]
    UI --> Router[Intent Classifier]
    
    subgraph "Agentic Layer"
        Router -->|Need a room| BookingAgent[Use Case: Booking Agent]
        Router -->|Have a question| KnowledgeAgent[Use Case: Knowledge Agent]
    end
    
    subgraph "Infrastructure Layer"
        BookingAgent --> DB[(Postgres Database)]
        KnowledgeAgent --> Vector[(Qdrant Vector DB)]
        KnowledgeAgent --> Search[RAG Search]
    end

    BookingAgent -->|Confirm| Response
    KnowledgeAgent -->|Answer| Response
    Response --> UI
```

### Technology Stack

*   **Frontend:** `Next.js 16` (App Router), `TypeScript`, `Tailwind CSS v4`, `Shadcn/ui`
*   **AI Engine:** `Vercel AI SDK 3.3`, `OpenAI GPT-4o`, `Google Gemini`
*   **Data Layer:** `PostgreSQL` (Neon Serverless), `Drizzle ORM`
*   **Vector Search:** `Qdrant` (for high-performance RAG)
*   **Architecture:** Clean Architecture (Domain / Use Cases / Infrastructure separation)

## 📬 Contact Me

I specialize in building high-impact, AI-driven applications that solve real business problems. Let's connect!

*   **LinkedIn:** [Adejori Eniola](https://www.linkedin.com/in/adatamage/)
*   **Portfolio:** [adatamage](https://adatamage.com/)
*   **Email:** [adejorieniola@adatamage.com](mailto:adejorieniola@adatamage.com)

---
*Built by adatamage.*
