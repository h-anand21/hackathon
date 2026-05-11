import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from '../models/user.model';

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkId = req.auth.userId;
    
    if (!clerkId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!email) {
         res.status(400).json({ success: false, error: 'User must have an email address' });
         return;
      }

      user = await User.create({
        clerkId: clerkId,
        email: email,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
