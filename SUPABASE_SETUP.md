# Supabase setup for Archie's Portfolio

## 1. Configure the frontend
Edit `supabase-config.js` and replace the placeholders with your Supabase **Project URL** and **Publishable key**. Do not use a Secret key or service-role key in frontend code.

## 2. Create the projects table
In Supabase SQL Editor, run the SQL in `supabase-projects.sql`. This creates the `public.projects` table and enables Row Level Security with public read-only access.

## 3. Add projects and images
Upload each image to the public `project-images` Storage bucket. Copy its public URL. In Table Editor, add a row to `projects` with `title`, `category`, `description`, `image_url`, and `technologies` (technologies can be an array of strings). The portfolio reads public rows and displays them automatically.

## 4. Publish
Keep `supabase-config.js` in the site folder with the public Project URL and Publishable key. Upload the updated files to your existing hosting/GitHub Pages deployment.

The public website is read-only. Do not add public INSERT/UPDATE/DELETE policies for projects or public upload policies unless you intentionally want anyone on the internet to modify your portfolio.
