# FinSeva RAG Chatbot Setup Guide

This guide explains how to set up the RAG (Retrieval Augmented Generation) chatbot with Supabase vector database, CopilotKit, and Llama 3.3 70B via Groq.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Groq API Key**: Get your API key from [groq.com](https://groq.com)
3. **OpenAI API Key**: Required for embeddings generation from [openai.com](https://openai.com)

## Setup Steps

### 1. Enable pgvector in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Search for `vector` and enable the **pgvector** extension

### 2. Run Database Migration

Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Option B: Manual SQL Execution
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the contents of `supabase/migrations/20231218_create_documents_table.sql`
3. Paste and execute the SQL

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq API Configuration
GROQ_API_KEY=your-groq-api-key

# OpenAI API Configuration (for embeddings)
OPENAI_API_KEY=your-openai-api-key
```

**Where to find these values:**
- **Supabase URL & Keys**: Supabase Dashboard → Settings → API
- **Groq API Key**: [console.groq.com](https://console.groq.com)
- **OpenAI API Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Run the Application

```bash
pnpm dev
```

## How It Works

### RAG Architecture

1. **User Financial Data Storage**:
   - When a user logs in, their financial data (name, salary, income sources) is automatically embedded and stored in Supabase vector database
   - Each piece of information is stored as a separate document with embeddings

2. **Query Processing**:
   - When a user asks a question, it's converted to an embedding
   - Vector similarity search finds the most relevant financial information
   - Retrieved context is injected into the Llama 3.3 prompt

3. **Response Generation**:
   - Groq's Llama 3.3 70B model receives:
     - User's question
     - Retrieved financial context (RAG)
     - Current user profile data
   - Model generates personalized, context-aware responses

### Key Components

- **`lib/embeddings.ts`**: Generates embeddings using OpenAI's text-embedding-3-small
- **`lib/vectorStore.ts`**: Manages vector database operations (add, search, update documents)
- **`pages/api/copilotkit.ts`**: API endpoint that performs RAG search and integrates with Groq
- **`components/ChatSideBar.tsx`**: UI component that updates vector store when user data changes

## Features

✅ **Personalized Responses**: AI knows user's name and financial details  
✅ **Context-Aware**: Uses RAG to retrieve relevant financial information  
✅ **No Data Masking**: All sensitive fields are shown to provide accurate advice  
✅ **Automatic Updates**: Vector store updates when user profile changes  
✅ **Privacy**: Each user can only access their own financial documents  

## Troubleshooting

### Vector Search Not Working
- Ensure pgvector extension is enabled in Supabase
- Check that the migration ran successfully
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly

### Embedding Errors
- Confirm OPENAI_API_KEY is valid and has credits
- Check API rate limits

### Groq API Errors
- Verify GROQ_API_KEY is correct
- Check Groq API status and rate limits

### User Context Not Loading
- Ensure user profile has first_name and last_name filled
- Check browser console for errors
- Verify Supabase RLS policies are configured correctly

## API Usage & Costs

- **OpenAI Embeddings**: ~$0.00002 per 1K tokens (very affordable)
- **Groq API**: Currently free tier available, very fast inference
- **Supabase**: Free tier includes vector storage

## Security Notes

- Service role key is used server-side only (never exposed to client)
- RLS policies ensure users can only access their own documents
- All API calls are authenticated through Supabase Auth

## Next Steps

Consider adding:
- Historical tax filing data to vector store
- Tax deduction recommendations based on spending patterns
- Multi-year financial comparison
- Document upload and analysis (ITR forms, Form 16, etc.)
