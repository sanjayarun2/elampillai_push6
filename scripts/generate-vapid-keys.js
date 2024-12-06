import webpush from 'web-push';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function generateVapidKeys() {
  try {
    const vapidKeys = webpush.generateVAPIDKeys();
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (err) {
      // File doesn't exist, create new
      envContent = `VITE_SUPABASE_URL=https://seoxweqqaqnmmfbrjsys.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlb3h3ZXFxYXFubW1mYnJqc3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTI1MTksImV4cCI6MjA0ODM4ODUxOX0.spXyYzop4LG_AHbltW6S60gynx2YHOTyqaKSIRjfRlU\n`;
    }

    // Remove existing VAPID keys if they exist
    envContent = envContent.replace(/VITE_VAPID_PUBLIC_KEY=.*\n?/g, '');
    envContent = envContent.replace(/VITE_VAPID_PRIVATE_KEY=.*\n?/g, '');

    // Add new VAPID keys
    envContent += `\nVITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`;
    envContent += `\nVITE_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`;

    await fs.writeFile(envPath, envContent.trim() + '\n');
    console.log('VAPID Keys generated and saved successfully');
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
    process.exit(1);
  }
}

generateVapidKeys();