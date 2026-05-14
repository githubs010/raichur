# HomeServe — Full Stack Web App
## Google Sheets + Apps Script + HTML

This is a complete home services platform with:
- User Panel    (book.html)
- Provider Panel (provider.html)
- Admin Panel   (admin.html)
- Issue Raise & Resolve (issues.html)
- All data stored in Google Sheets via Apps Script

---

## FILES IN THIS ZIP

| File | Purpose |
|------|---------|
| Code.gs | Google Apps Script backend (paste into Apps Script editor) |
| index.html | Home page |
| user.html | User panel — view bookings, track status |
| book.html | Booking form — saves to Google Sheets |
| provider.html | Provider panel — accept/complete assigned jobs |
| admin.html | Admin dashboard — assign, resolve, manage everything |
| issues.html | Raise issues + resolve complaints |
| style.css | Full responsive design |
| api.js | API connector (update URL here) |

---

## SETUP IN 5 STEPS

### STEP 1 — Create Google Sheet
1. Go to sheets.google.com
2. Create a new blank spreadsheet
3. Copy the ID from the URL:
   https://docs.google.com/spreadsheets/d/  >>>YOUR_ID_HERE<<<  /edit

### STEP 2 — Open Apps Script
1. Inside the Google Sheet click:
   Extensions → Apps Script
2. Delete the default code
3. Paste the ENTIRE content of Code.gs
4. Find this line at the top:
   var SS_ID = "YOUR_SPREADSHEET_ID";
5. Replace YOUR_SPREADSHEET_ID with your actual Sheet ID

### STEP 3 — Run Setup
1. In Apps Script select function: setupSheets
2. Click Run (▶)
3. Allow permissions when asked
4. This creates all sheets with headers and sample data

### STEP 4 — Deploy as Web App
1. Click Deploy → New deployment
2. Type: Web App
3. Execute as: Me
4. Who has access: Anyone
5. Click Deploy
6. COPY the Web App URL shown (looks like):
   https://script.google.com/macros/s/AKfy.../exec

### STEP 5 — Update api.js
1. Open api.js in any text editor (Notepad is fine)
2. Find this line:
   var API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
3. Replace with your actual Web App URL from Step 4
4. Save the file

---

## UPLOAD TO GITHUB PAGES (FREE HOSTING)

1. Go to github.com → create new repository
2. Click Add file → Upload files
3. Drag and drop ALL files EXCEPT Code.gs
   (Code.gs goes into Apps Script only)
4. Click Commit changes
5. Go to Settings → Pages → Select main branch → Save
6. Your live site: https://YOUR_USERNAME.github.io/REPO_NAME/

---

## HOW THE SYSTEM WORKS

Customer visits book.html
  → Fills form → Clicks Submit
  → Data goes to Apps Script → Saved in Google Sheets (Bookings tab)

Admin visits admin.html
  → Sees all pending bookings
  → Goes to Assign Jobs tab
  → Picks provider → Clicks Assign
  → Google Sheets updated instantly

Provider visits provider.html
  → Enters name → Sees assigned jobs
  → Clicks Start Work → Status = In Progress (saved to Sheets)
  → Clicks Mark Done → Status = Completed (saved to Sheets)

Customer visits issues.html
  → Fills issue form → Submitted to Sheets (Issues tab)

Admin visits admin.html → Issues tab
  → Types resolution → Clicks Resolve
  → Google Sheets updated → Status = Resolved

---

## PAGES & URLS (after GitHub Pages)

Page               URL
Home               /index.html
Book Service       /book.html
My Bookings        /user.html
Track & History    /user.html
Provider Panel     /provider.html
Admin Panel        /admin.html
Raise Issue        /issues.html

---

Built with: Pure HTML + CSS + JavaScript + Google Apps Script
No paid hosting needed. Works 100% free on GitHub Pages + Google Sheets.
