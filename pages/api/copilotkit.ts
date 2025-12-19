import { NextApiRequest, NextApiResponse } from 'next';
import {
  CopilotRuntime,
  GroqAdapter,
  copilotRuntimeNextJSPagesRouterEndpoint,
} from '@copilotkit/runtime';
import Groq from 'groq-sdk';
import { searchDocuments } from '@/lib/vectorStore';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const serviceAdapter = new GroqAdapter({ 
  model: "llama-3.3-70b-versatile",
  groq,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Extract properties from the request body
    const { messages, properties } = req.body;
    
    // Get userId and userProfile from properties
    const userId = properties?.userId;
    const userProfile = properties?.userProfile;
    
    let enhancedContext = '';
    
    // If we have a user query and userId, perform RAG search
    if (userId && messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        try {
          console.log('Performing RAG search for user:', userId);
          // Search for relevant documents in vector store
          const relevantDocs = await searchDocuments(
            lastMessage.content,
            userId,
            {
              matchThreshold: 0.5,
              matchCount: 5,
            }
          );

          // Build context from retrieved documents
          if (relevantDocs.length > 0) {
            console.log('Found relevant documents:', relevantDocs.length);
            enhancedContext = '\n\n**User Financial Context (Retrieved from Knowledge Base):**\n';
            relevantDocs.forEach((doc, idx) => {
              enhancedContext += `${idx + 1}. ${doc.content}\n`;
            });
          } else {
            console.log('No relevant documents found');
          }
        } catch (error) {
          console.error('Error searching documents:', error);
        }
      }
    }

    // Add user profile context if available
    if (userProfile) {
      const { first_name, last_name, gross_salary, net_salary, income_from_other_sources, income_from_house_property } = userProfile;
      
      enhancedContext += '\n\n**Current User Profile:**\n';
      enhancedContext += `- Name: ${first_name} ${last_name}\n`;
      if (gross_salary) enhancedContext += `- Gross Salary: ₹${gross_salary.toLocaleString('en-IN')}\n`;
      if (net_salary) enhancedContext += `- Net Salary: ₹${net_salary.toLocaleString('en-IN')}\n`;
      if (income_from_other_sources) enhancedContext += `- Income from Other Sources: ₹${income_from_other_sources.toLocaleString('en-IN')}\n`;
      if (income_from_house_property) enhancedContext += `- Income from House Property: ₹${income_from_house_property.toLocaleString('en-IN')}\n`;
      
      console.log('User profile context added');
    }

    // Create runtime with enhanced context
    const runtime = new CopilotRuntime();

    // Inject the RAG context into the request
    if (enhancedContext) {
      console.log('Injecting enhanced context into messages');
      req.body.messages = messages.map((msg: any, idx: number) => {
        if (idx === messages.length - 1 && msg.role === 'user') {
          return {
            ...msg,
            content: msg.content + enhancedContext,
          };
        }
        return msg;
      });
    }

    const handleRequest = copilotRuntimeNextJSPagesRouterEndpoint({
      endpoint: '/api/copilotkit',
      runtime,
      serviceAdapter,
    });

    return await handleRequest(req, res);
  } catch (error) {
    console.error('Error in copilotkit handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;