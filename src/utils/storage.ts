// Enhanced localStorage wrapper with chunking for large datasets
export const storage = {
  // Maximum size for each chunk (in bytes)
  CHUNK_SIZE: 500000, // 500KB per chunk

  // Save data in chunks if needed
  set: <T>(key: string, value: T): void => {
    try {
      const stringified = JSON.stringify(value);
      
      // If data is small enough, store directly
      if (stringified.length < storage.CHUNK_SIZE) {
        localStorage.setItem(key, stringified);
        return;
      }

      // Split data into chunks
      const chunks = Math.ceil(stringified.length / storage.CHUNK_SIZE);
      for (let i = 0; i < chunks; i++) {
        const chunk = stringified.slice(i * storage.CHUNK_SIZE, (i + 1) * storage.CHUNK_SIZE);
        localStorage.setItem(`${key}_chunk_${i}`, chunk);
      }
      localStorage.setItem(`${key}_chunks`, chunks.toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get data, combining chunks if necessary
  get: <T>(key: string, defaultValue: T): T => {
    try {
      // Check if data is chunked
      const chunks = localStorage.getItem(`${key}_chunks`);
      
      if (!chunks) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }

      // Combine chunks
      let data = '';
      for (let i = 0; i < parseInt(chunks); i++) {
        const chunk = localStorage.getItem(`${key}_chunk_${i}`);
        if (chunk) data += chunk;
      }
      
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  // Clear all chunks for a key
  remove: (key: string): void => {
    try {
      const chunks = localStorage.getItem(`${key}_chunks`);
      if (chunks) {
        for (let i = 0; i < parseInt(chunks); i++) {
          localStorage.removeItem(`${key}_chunk_${i}`);
        }
        localStorage.removeItem(`${key}_chunks`);
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};