const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'sanjayarun2';
const REPO_NAME = 'elampillai_push6';

export const githubService = {
  async updateJsonFile(filePath: string, newData: any) {
    if (!GITHUB_TOKEN) return false;

    try {
      // THE FIX: Always fetch the latest version of the file first.
      // This prevents the "Try running Pull first" error by getting the current SHA.
      const getUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
      const getRes = await fetch(getUrl, {
        headers: { 
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Cache-Control': 'no-cache' // Ensures we don't get an old cached version
        }
      });
      
      if (!getRes.ok) throw new Error('Failed to sync with GitHub before saving');
      const fileData = await getRes.json();

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))));

      // Now push using the fresh SHA we just retrieved
      const putRes = await fetch(getUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Admin Update: ${filePath}`,
          content: content,
          sha: fileData.sha // This is the critical fix
        }),
      });

      return putRes.ok;
    } catch (error) {
      console.error('GitHub Sync Error:', error);
      return false;
    }
  }
};