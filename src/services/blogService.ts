import { turso } from '../lib/turso';
import type { BlogPost } from '../types';

export const blogService = {
  async getAll() {
    try {
      // SQLite query to get all blogs ordered by date
      const result = await turso.execute("SELECT * FROM blogs ORDER BY date DESC");
      return result.rows as unknown as BlogPost[];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const result = await turso.execute({
        sql: "SELECT * FROM blogs WHERE id = ?",
        args: [id]
      });

      if (result.rows.length === 0) {
        throw new Error('Blog post not found');
      }

      return result.rows[0] as unknown as BlogPost;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  async create(post: Omit<BlogPost, 'id'>) {
    try {
      const id = crypto.randomUUID();
      await turso.execute({
        sql: "INSERT INTO blogs (id, title, content, date, author, image) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, post.title, post.content, post.date, post.author, post.image]
      });
      
      return { id, ...post } as BlogPost;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  async update(id: string, post: Partial<BlogPost>) {
    try {
      // Build dynamic SQL for update
      const keys = Object.keys(post).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const args = keys.map(k => (post as any)[k]);

      await turso.execute({
        sql: `UPDATE blogs SET ${setClause} WHERE id = ?`,
        args: [...args, id]
      });

      return { id, ...post } as BlogPost;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await turso.execute({
        sql: "DELETE FROM blogs WHERE id = ?",
        args: [id]
      });
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  // Added for your Batch Editor logic
  async syncAllPosts(posts: BlogPost[]): Promise<boolean> {
    try {
      const transaction = await turso.batch([
        "DELETE FROM blogs",
        ...posts.map(p => ({
          sql: "INSERT INTO blogs (id, title, content, date, author, image) VALUES (?, ?, ?, ?, ?, ?)",
          args: [p.id, p.title, p.content, p.date, p.author, p.image]
        }))
      ], "write");
      return true;
    } catch (e) {
      console.error("Sync error:", e);
      return false;
    }
  }
};