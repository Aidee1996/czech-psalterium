# Deployment Instructions for Czech Psalter Visualization

## Quick Start - GitHub Pages Deployment

This web application is configured to deploy automatically to GitHub Pages.

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/Aidee1996/czech-psalterium`
2. Click on **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy when you push to `main`

### Step 2: Merge Your Branch to Main

Your work is currently on branch `claude/czech-psalter-analysis-014MwE7q4erePwK3QcJWr2sm`.

To deploy:

```bash
# Create a pull request or merge directly
git checkout main
git merge claude/czech-psalter-analysis-014MwE7q4erePwK3QcJWr2sm
git push origin main
```

### Step 3: Monitor Deployment

1. Go to **Actions** tab in your GitHub repository
2. Watch the "Deploy to GitHub Pages" workflow run
3. Once complete, your site will be live at:

   **`https://Aidee1996.github.io/czech-psalterium/`**

## Manual Local Testing

Before deploying, you can test the build locally:

```bash
cd czech-psalter-app/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

The preview will be available at `http://localhost:4173`

## Important Files for Deployment

- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- `czech-psalter-app/frontend/vite.config.ts` - Build configuration with base path
- `czech-psalter-app/frontend/public/.nojekyll` - Prevents Jekyll processing
- `czech-psalter-app/frontend/public/data/` - Data files for the application

## Troubleshooting

### Data Not Loading

If the visualization shows loading errors:
1. Check browser console for 404 errors
2. Verify data files exist in `public/data/`:
   - `psalter_data.json`
   - `similarity_analysis.json`
   - `manuscript_metadata.json`

### Build Fails

If the GitHub Actions build fails:
1. Check the Actions tab for error logs
2. Common issues:
   - Node.js version mismatch (should be 20)
   - Missing dependencies in package-lock.json
   - TypeScript errors

### Wrong Base URL

If CSS/JS files return 404:
1. Check `vite.config.ts` has correct `base: '/czech-psalterium/'`
2. This must match your GitHub repository name

## Alternative: Deploy to Netlify

If you prefer Netlify:

1. Connect your GitHub repo to Netlify
2. Build settings:
   - **Base directory**: `czech-psalter-app/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `czech-psalter-app/frontend/dist`

## Data Updates

To update the visualization data:

1. Replace Excel file: `Kolace Ps_autosemantika_synsemantika_final_zaloha.xlsx`
2. Run data processing:
   ```bash
   cd /home/user/czech-psalterium
   python3 process_data.py
   ```
3. Move new JSON files to `czech-psalter-app/frontend/public/data/`
4. Commit and push changes

---

**Live Site**: Once deployed, share this URL with colleagues and researchers!

`https://Aidee1996.github.io/czech-psalterium/`
