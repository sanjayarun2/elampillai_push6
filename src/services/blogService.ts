import { turso } from '../lib/turso';
import type { BlogPost } from '../types';

export const blogService = {
  async getAll() {
    try {
      // SQLite query to get all blogs ordered by date
      const result = await turso.execute("SELECT * FROM blogs ORDER BY date DESC");
      // Map rows to ensure they match our BlogPost interface
      const posts = result.rows as unknown as BlogPost[];
      // Always return an array, even if empty
      return Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error('Error in getAll:', error);
      // Return empty array instead of throwing to prevent page from breaking
      return [];
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
        // FIX: Ensure no 'undefined' values are passed to Turso
        args: [
          id, 
          post.title ?? "", 
          post.content ?? "", 
          post.date ?? new Date().toISOString().split('T')[0], 
          post.author ?? "Admin", 
          post.image ?? ""
        ]
      });
      
      return { id, ...post } as BlogPost;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  async update(id: string, post: Partial<BlogPost>) {
    try {
      const keys = Object.keys(post).filter(k => k !== 'id' && (post as any)[k] !== undefined);
      if (keys.length === 0) return { id, ...post } as BlogPost;

      const setClause = keys.map(k => `${k} = ?`).join(', ');
      // FIX: Ensure no 'undefined' values in the mapping
      const args = keys.map(k => (post as any)[k] ?? null);

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

  // Batch Editor logic
  async syncAllPosts(posts: BlogPost[]): Promise<boolean> {
    try {
      await turso.batch([
        "DELETE FROM blogs",
        ...posts.map(p => ({
          sql: "INSERT INTO blogs (id, title, content, date, author, image) VALUES (?, ?, ?, ?, ?, ?)",
          // FIX: Standardize values for batch insertion
          args: [
            p.id, 
            p.title ?? "", 
            p.content ?? "", 
            p.date ?? "", 
            p.author ?? "Admin", 
            p.image ?? ""
          ]
        }))
      ], "write");
      return true;
    } catch (e) {
      console.error("Sync error:", e);
      return false;
    }
  }
};