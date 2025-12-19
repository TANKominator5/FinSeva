import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserFinancialContext } from '@/lib/vectorStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, profile } = req.body;

    console.log('Received request to update vector store');
    console.log('User ID:', userId);
    console.log('Profile:', profile);

    if (!userId || !profile) {
      console.error('Missing userId or profile');
      return res.status(400).json({ error: 'Missing userId or profile' });
    }

    if (!profile.first_name || !profile.last_name) {
      console.error('Missing first_name or last_name in profile');
      return res.status(400).json({ error: 'Profile must include first_name and last_name' });
    }

    console.log('Updating vector store for user:', profile.first_name, profile.last_name);
    await updateUserFinancialContext(userId, profile);
    console.log('Vector store updated successfully');

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating vector store:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
