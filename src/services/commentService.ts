import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  blog_id: string;
  author: string;
  content: string;
  created_at: string;
}

export const commentService = {
  async getComments(blogId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async addComment(blogId: string, author: string, content: string): Promise<Comment> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ blog_id: blogId, author, content }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};