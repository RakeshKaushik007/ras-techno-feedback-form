import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Admin authentication
app.post('/make-server-4e760034/admin/login', async (c) => {
  try {
    const { password } = await c.req.json();
    
    // Get admin password from KV store (you can set this via the admin panel first time)
    const storedPassword = await kv.get('admin_password');
    
    // Default password if not set (CHANGE THIS!)
    const adminPassword = storedPassword || 'RaSTechno@2024';
    
    if (password === adminPassword) {
      // Generate a simple token (in production, use JWT)
      const token = crypto.randomUUID();
      await kv.set(`admin_session_${token}`, 'valid', { ttl: 86400 }); // 24 hour session
      
      return c.json({ success: true, token });
    }
    
    return c.json({ success: false, message: 'Invalid password' }, 401);
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ success: false, message: 'Login failed' }, 500);
  }
});

// Verify admin token
const verifyAdmin = async (c: any, next: any) => {
  const token = c.req.header('X-Admin-Token');
  
  if (!token) {
    return c.json({ success: false, message: 'No token provided' }, 401);
  }
  
  const session = await kv.get(`admin_session_${token}`);
  
  if (!session) {
    return c.json({ success: false, message: 'Invalid or expired session' }, 401);
  }
  
  await next();
};

// Submit feedback (public endpoint)
app.post('/make-server-4e760034/feedback', async (c) => {
  try {
    const feedback = await c.req.json();
    const feedbackId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const feedbackData = {
      id: feedbackId,
      ...feedback,
      timestamp,
    };
    
    await kv.set(`feedback_${feedbackId}`, feedbackData);
    
    // Also add to list for easy retrieval
    const allIds = await kv.get('feedback_all_ids') || [];
    allIds.push(feedbackId);
    await kv.set('feedback_all_ids', allIds);
    
    return c.json({ success: true, id: feedbackId });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return c.json({ success: false, message: 'Failed to submit feedback' }, 500);
  }
});

// Get all feedback (admin only)
app.get('/make-server-4e760034/admin/feedback', verifyAdmin, async (c) => {
  try {
    const allIds = await kv.get('feedback_all_ids') || [];
    const feedbackPromises = allIds.map((id: string) => kv.get(`feedback_${id}`));
    const allFeedback = await Promise.all(feedbackPromises);
    
    // Filter out any null values and sort by timestamp
    const validFeedback = allFeedback
      .filter(f => f !== null)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json({ success: true, feedback: validFeedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    return c.json({ success: false, message: 'Failed to retrieve feedback' }, 500);
  }
});

// Get feature flags (public endpoint)
app.get('/make-server-4e760034/features', async (c) => {
  try {
    const features = await kv.get('feature_flags') || {};
    return c.json({ success: true, features });
  } catch (error) {
    console.error('Get features error:', error);
    return c.json({ success: false, message: 'Failed to retrieve features' }, 500);
  }
});

// Update feature flags (admin only)
app.post('/make-server-4e760034/admin/features', verifyAdmin, async (c) => {
  try {
    const { features } = await c.req.json();
    await kv.set('feature_flags', features);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update features error:', error);
    return c.json({ success: false, message: 'Failed to update features' }, 500);
  }
});

// Change admin password (admin only)
app.post('/make-server-4e760034/admin/change-password', verifyAdmin, async (c) => {
  try {
    const { newPassword } = await c.req.json();
    await kv.set('admin_password', newPassword);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ success: false, message: 'Failed to change password' }, 500);
  }
});

// Delete feedback (admin only)
app.delete('/make-server-4e760034/admin/feedback/:id', verifyAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`feedback_${id}`);
    
    // Remove from all IDs list
    const allIds = await kv.get('feedback_all_ids') || [];
    const updatedIds = allIds.filter((fid: string) => fid !== id);
    await kv.set('feedback_all_ids', updatedIds);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return c.json({ success: false, message: 'Failed to delete feedback' }, 500);
  }
});

Deno.serve(app.fetch);