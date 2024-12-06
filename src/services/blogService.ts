import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types';

export const blogService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }

      return data as BlogPost[];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Blog post not found');
      }

      return data as BlogPost;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  async create(post: Omit<BlogPost, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert([post])
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        throw error;
      }

      return data as BlogPost;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  async update(id: string, post: Partial<BlogPost>) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        throw error;
      }

      return data as BlogPost;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
};