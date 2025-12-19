import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface Document {
  id?: string;
  user_id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

/**
 * Add a document to the vector store
 */
export async function addDocument(document: Document): Promise<string> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(document.content);

    // Insert document with embedding
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: document.user_id,
        content: document.content,
        metadata: document.metadata || {},
        embedding,
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

/**
 * Add multiple documents to the vector store
 */
export async function addDocuments(documents: Document[]): Promise<string[]> {
  try {
    const documentsWithEmbeddings = await Promise.all(
      documents.map(async (doc) => ({
        user_id: doc.user_id,
        content: doc.content,
        metadata: doc.metadata || {},
        embedding: await generateEmbedding(doc.content),
      }))
    );

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert(documentsWithEmbeddings)
      .select('id');

    if (error) throw error;

    return data.map((d) => d.id);
  } catch (error) {
    console.error('Error adding documents:', error);
    throw error;
  }
}

/**
 * Search for similar documents using vector similarity
 */
export async function searchDocuments(
  query: string,
  userId: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
  } = {}
): Promise<SearchResult[]> {
  try {
    const { matchThreshold = 0.5, matchCount = 5 } = options;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const { data, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_user_id: userId,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

/**
 * Delete all documents for a user
 */
export async function deleteUserDocuments(userId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user documents:', error);
    throw error;
  }
}

/**
 * Update user financial documents in the vector store
 */
export async function updateUserFinancialContext(
  userId: string,
  profile: {
    first_name: string;
    last_name: string;
    gross_salary?: number;
    income_from_fd?: number;
    investments?: number;
    health_insurance?: number;
    education_loan?: number;
    home_loan_interest?: number;
    hra_lta?: number;
    tds?: number;
  }
): Promise<void> {
  try {
    console.log('=== Starting updateUserFinancialContext ===');
    console.log('User ID:', userId);
    console.log('Profile:', JSON.stringify(profile, null, 2));

    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Delete existing documents for this user
    console.log('Deleting existing documents...');
    await deleteUserDocuments(userId);
    console.log('Existing documents deleted');

    // Create documents with financial information
    const documents: Document[] = [];

    // Personal information document
    documents.push({
      user_id: userId,
      content: `User's name is ${profile.first_name} ${profile.last_name}.`,
      metadata: {
        type: 'personal_info',
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    });

    // Salary information
    if (profile.gross_salary) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has a gross salary of ₹${profile.gross_salary.toLocaleString('en-IN')} annually.`,
        metadata: {
          type: 'salary',
          gross_salary: profile.gross_salary,
        },
      });
    }

    // Income from FD (Other Sources)
    if (profile.income_from_fd) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has income from Fixed Deposits (FD) amounting to ₹${profile.income_from_fd.toLocaleString('en-IN')} annually.`,
        metadata: {
          type: 'other_income',
          subtype: 'fd',
          amount: profile.income_from_fd,
        },
      });
    }

    // Investments (80C etc)
    if (profile.investments) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has declared investments of ₹${profile.investments.toLocaleString('en-IN')} annually (likely under section 80C).`,
        metadata: {
          type: 'deductions',
          subtype: 'investments',
          amount: profile.investments,
        },
      });
    }

    // Health Insurance (80D)
    if (profile.health_insurance) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} pays ₹${profile.health_insurance.toLocaleString('en-IN')} annually for health insurance premiums (Section 80D).`,
        metadata: {
          type: 'deductions',
          subtype: 'health_insurance',
          amount: profile.health_insurance,
        },
      });
    }

    // Education Loan (80E)
    if (profile.education_loan) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has an education loan interest payment of ₹${profile.education_loan.toLocaleString('en-IN')} annually (Section 80E).`,
        metadata: {
          type: 'deductions',
          subtype: 'education_loan',
          amount: profile.education_loan,
        },
      });
    }

    // Home Loan Interest (24b)
    if (profile.home_loan_interest) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} pays ₹${profile.home_loan_interest.toLocaleString('en-IN')} annually in home loan interest (Section 24b).`,
        metadata: {
          type: 'deductions',
          subtype: 'home_loan_interest',
          amount: profile.home_loan_interest,
        },
      });
    }

    // HRA/LTA
    if (profile.hra_lta) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has HRA/LTA exemptions totaling ₹${profile.hra_lta.toLocaleString('en-IN')} annually.`,
        metadata: {
          type: 'exemptions',
          subtype: 'hra_lta',
          amount: profile.hra_lta,
        },
      });
    }

    // TDS
    if (profile.tds) {
      documents.push({
        user_id: userId,
        content: `${profile.first_name} ${profile.last_name} has already paid ₹${profile.tds.toLocaleString('en-IN')} in TDS (Tax Deducted at Source).`,
        metadata: {
          type: 'tax_paid',
          subtype: 'tds',
          amount: profile.tds,
        },
      });
    }

    // Calculate total income (Gross + FD)
    const totalIncome =
      (profile.gross_salary || 0) +
      (profile.income_from_fd || 0);

    documents.push({
      user_id: userId,
      content: `${profile.first_name} ${profile.last_name}'s total gross income (Salary + FD) is approximately ₹${totalIncome.toLocaleString('en-IN')}.`,
      metadata: {
        type: 'total_income',
        total: totalIncome,
      },
    });

    console.log(`Prepared ${documents.length} documents to add`);
    documents.forEach((doc, idx) => {
      console.log(`Document ${idx + 1}: ${doc.content.substring(0, 50)}...`);
    });

    // Add all documents to vector store
    if (documents.length > 0) {
      console.log('Adding documents to vector store...');
      const ids = await addDocuments(documents);
      console.log(`Successfully added ${ids.length} documents with IDs:`, ids);
    }

    console.log('=== Completed updateUserFinancialContext ===');
  } catch (error) {
    console.error('=== ERROR in updateUserFinancialContext ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
