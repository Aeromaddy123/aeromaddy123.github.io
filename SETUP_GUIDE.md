# Portfolio Setup Guide — Kishan Chhari
Complete guide to convert your CAD files, add media, and deploy your portfolio to GitHub Pages.

---

## STEP 1: Convert SolidWorks (.sldprt) to .GLB for 3D Web Viewer

Your portfolio now supports interactive 3D models! Visitors can rotate and zoom your CAD models in the browser. Here's how to convert your SolidWorks files:

### Option A: Using SolidWorks + Blender (Free, Best Quality)

1. **Export from SolidWorks as .STL or .OBJ**
   - Open your `.sldprt` file in SolidWorks
   - Go to `File → Save As`
   - Choose format: **STL (.stl)** or **OBJ (.obj)**
   - In STL options: set Resolution to **Fine** and check **Binary**
   - Save the file

2. **Convert to .GLB using Blender (free)**
   - Download Blender from https://www.blender.org/download/ (it's free)
   - Open Blender → `File → Import → STL (.stl)` or `OBJ (.obj)`
   - Your model will appear in the viewport
   - Optional: Add materials/colors:
     - Select the model → go to **Material Properties** tab (sphere icon on right panel)
     - Click **New** → set **Base Color** to your preferred color
     - For metallic look: set **Metallic** to 0.8, **Roughness** to 0.3
   - Export: `File → Export → glTF 2.0 (.glb/.gltf)`
   - In export settings:
     - Format: **glTF Binary (.glb)** ← this is the one you want
     - Check **Apply Modifiers**
     - Click **Export glTF**

### Option B: Using Online Converter (Quickest, No Software Needed)

1. Go to https://imagetostl.com/convert/file/sldprt/to/glb
   - Or try https://www.creators3d.com/online-viewer (convert STL → GLB)
2. Upload your `.sldprt` or `.stl` file
3. Download the `.glb` output

### Option C: Using CAD Exchanger (Professional Quality)

1. Go to https://cadexchanger.com/ — free trial available
2. Import your `.sldprt` file
3. Export as `.glb` with materials preserved

### Tips for Best Results
- **File size**: Keep GLB files under **5MB** for fast loading. If too large, reduce mesh density in Blender: select model → Modifier Properties → Add Modifier → Decimate → set ratio to 0.5
- **Colors**: SolidWorks colors don't always transfer. Add materials in Blender for best results.
- **Orientation**: If the model appears sideways in the browser, rotate it in Blender before exporting (R → X → 90 → Enter)

---

## STEP 2: Prepare Your Media Files

Create this folder structure inside your `portfolio/` folder:

```
portfolio/
├── index.html          (your portfolio — already done!)
├── models/             ← put .glb files here
│   ├── robot.glb
│   ├── uav.glb
│   ├── robotic-arm.glb
│   ├── bionic-arm.glb
│   └── quadcopter.glb
├── videos/             ← put demo videos here
│   ├── robot-demo.mp4
│   └── surveillance-demo.mp4
├── images/             ← put photos/renders here
│   ├── uav-photo.jpg
│   ├── your-photo.jpg  (for About section)
│   └── ...
└── Kishan_Chhari_Resume.pdf  ← your resume for download
```

### For Videos
- **Format**: MP4 (H.264 codec) — works in all browsers
- **Resolution**: 1080p or 720p is ideal
- **Length**: Keep under 30 seconds for project demos
- **File size**: Under 10MB each for fast loading
- To compress: use HandBrake (free) — https://handbrake.fr/

### For Images
- **Format**: JPG or PNG
- **Resolution**: 1200x800px is ideal for project cards
- **File size**: Under 500KB each (use https://tinypng.com/ to compress)

---

## STEP 3: Configure Media in Your Portfolio

Open `index.html` and find the `projectMedia` configuration near the top of the `<script>` section:

```javascript
const projectMedia = [
  { type: '3d', src: 'models/robot.glb' },           // Project 1: Self-Balancing Robot
  { type: 'video', src: 'videos/surveillance.mp4' },  // Project 2: AI Surveillance
  { type: '3d', src: 'models/uav.glb' },              // Project 3: UAV
  { type: '3d', src: 'models/robotic-arm.glb' },      // Project 4: Robotic Arm
  { type: '3d', src: 'models/bionic-arm.glb' },       // Project 5: Bionic Arm
  { type: 'image', src: 'images/quadcopter.jpg' },    // Project 6: Medical Quadcopter
];
```

**Media types you can use:**
- `{ type: '3d', src: 'models/filename.glb' }` → Interactive 3D model (auto-rotates, drag to spin)
- `{ type: 'video', src: 'videos/filename.mp4' }` → Video player
- `{ type: 'image', src: 'images/filename.jpg' }` → Static image
- `{ type: 'placeholder' }` → Shows placeholder (use while waiting for media)

### Add Your Photo (About Section)
Find this line in the HTML:
```html
<div class="about-img-placeholder">Replace with your photo</div>
```
Replace it with:
```html
<img src="images/your-photo.jpg" alt="Kishan Chhari">
```

---

## STEP 4: Replace YOUR-USERNAME with Your GitHub Username

In `index.html`, find and replace `YOUR-USERNAME` with your actual GitHub username:
- In the contact section GitHub link
- In the resume `.tex` file too (if you haven't already)

---

## STEP 5: Deploy to GitHub Pages (Free Hosting!)

### First Time Setup (One-time, ~10 minutes)

1. **Create a GitHub account** (if you don't have one)
   - Go to https://github.com/signup

2. **Create a new repository**
   - Go to https://github.com/new
   - Repository name: **`your-username.github.io`** (replace with your actual username!)
     - Example: if your username is `kishanchhari`, name it `kishanchhari.github.io`
   - Set to **Public**
   - Check **"Add a README file"**
   - Click **Create repository**

3. **Upload your portfolio files**

   **Option A: Using GitHub Web Interface (Easiest — no Git needed)**
   - Go to your new repo on GitHub
   - Click **"Add file"** → **"Upload files"**
   - Drag your entire `portfolio/` folder contents (index.html, models/, videos/, images/, resume PDF)
   - **IMPORTANT**: Upload the contents OF the folder, not the folder itself. The `index.html` must be at the root of the repo.
   - Write commit message: "Initial portfolio deployment"
   - Click **"Commit changes"**

   **Option B: Using Git Command Line**
   ```bash
   # Navigate to your portfolio folder
   cd path/to/portfolio

   # Initialize git
   git init
   git branch -M main

   # Add your remote
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git

   # Add all files and commit
   git add .
   git commit -m "Initial portfolio deployment"

   # Push to GitHub
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repo → **Settings** → **Pages** (left sidebar)
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)**
   - Click **Save**

5. **Wait 2-3 minutes**, then visit: `https://your-username.github.io`

   Your portfolio is now live!

### Updating Your Portfolio Later

**Via Web:**
- Go to your repo → click on `index.html` → pencil icon → edit → commit

**Via Git:**
```bash
cd path/to/portfolio
git add .
git commit -m "Update portfolio content"
git push
```

Changes go live within 1-2 minutes.

---

## STEP 6: Add Your Resume PDF for Download

1. Place your compiled resume PDF in the portfolio folder as `Kishan_Chhari_Resume.pdf`
2. The download button in the Contact section already links to this filename
3. Upload it alongside your other files to GitHub

---

## Troubleshooting

**3D model not showing?**
- Check browser console (F12 → Console tab) for errors
- Make sure the file path in `projectMedia` matches exactly (case-sensitive!)
- GLB file might be too large — try to keep under 5MB

**Video not playing?**
- Must be MP4 format with H.264 codec
- GitHub Pages has a 100MB file size limit per file
- Videos auto-play muted (browser policy) — this is normal

**Site not loading after deploy?**
- Make sure `index.html` is at the ROOT of the repo (not inside a subfolder)
- Check that repo name is exactly `your-username.github.io`
- Wait 5 minutes — first deploy can be slow

**Horizontal scroll not working on mobile?**
- This is expected — on mobile, project cards stack vertically for better UX

---

## Quick Checklist

- [ ] Convert SolidWorks files to .GLB (via Blender or online converter)
- [ ] Prepare video demos (MP4, under 10MB each)
- [ ] Prepare project photos/renders
- [ ] Add your personal photo for About section
- [ ] Update `projectMedia` array in index.html
- [ ] Replace `YOUR-USERNAME` everywhere
- [ ] Add resume PDF to portfolio folder
- [ ] Create GitHub repo: `your-username.github.io`
- [ ] Upload all files to GitHub
- [ ] Enable GitHub Pages in repo Settings
- [ ] Test live site: `https://your-username.github.io`

---

That's it! Your portfolio will be live at `https://your-username.github.io` with interactive 3D models, smooth animations, and all the Mantis-style effects. 🚀
