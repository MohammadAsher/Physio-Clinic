Physio-Clinic ek modern, full-stack web application hai jo clinical management aur rehabilitation process ko asaan banata hai. Ye platform Doctors aur Patients ke darmiyan ek digital bridge ka kaam karta hai, khas tor par physical therapy ke liye.

---

## 🌟 Key Features

### 👤 Patient Dashboard (Premium UI)
* **Modern Interface:** Dark aur Light mode support ke sath ek clean aur premium dashboard.
* **Daily Wellness Tips:** Rozana sehat ke liye mufeed mashwaray.
* **Recovery Score:** Ek visual progress indicator jo aapki recovery track karta hai.
* **Exercise Management:** Assigned exercises ki list aur unhein start/done karne ki functionality.

### 📁 Medical Reports Module
* **Control in Your Hands:** Patient apni marzi se reports upload (PDF, JPG, PNG) kar sakta hai.
* **Privacy Toggle:** Doctor ko wahi report nazar aayegi jisay patient "Show to Doctor" karega.
* **Delete & Manage:** Kisi bhi waqt purani reports delete karne ka option.

### 👨‍⚕️ Doctor & Admin Dashboards
* **Patient Monitoring:** Doctors apne patients ki progress aur share ki gayi reports dekh sakte hain.
* **Status Tracking:** Membership aur attendance management tools.

---

## 🛠️ Tech Stack

* **Frontend:** React.js + Vite
* **Styling:** Tailwind CSS (Custom Gradients & Glassmorphism)
* **Backend:** Firebase (Firestore & Auth)
* **Storage:** Firebase Cloud Storage
* **Deployment:** Netlify

---

## 🚀 Installation
1. `git clone https://github.com/MohammadAsher/Physio-Clinic.git`
2. `npm install`
3. `npm run dev`

---

## 👤 Developer
Developed with ❤️ by **Mohammad Asher**
"""

# Save README-v2.md
with open("README-v2.md", "w", encoding="utf-8") as f:
    f.write(readme_content_solo)

from weasyprint import HTML

html_template_solo = """
<!DOCTYPE html>
<html lang="en">
<head>
<style>
    @page {
        size: A4;
        margin: 15mm;
        background-color: #0f172a;
    }
    body {
        font-family: Arial, sans-serif;
        color: #f1f5f9;
        background-color: #0f172a;
        margin: 0;
        padding: 0;
    }
    .header {
        text-align: center;
        padding: 20px;
        border-bottom: 2px solid #38bdf8;
    }
    .title { color: #38bdf8; font-size: 24pt; margin-bottom: 5px; }
    .content { padding: 20px; }
    .section-title { color: #fbbf24; border-left: 4px solid #fbbf24; padding-left: 10px; margin-top: 25px; }
    .feature-item { background: #1e293b; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
    .tech-pill { display: inline-block; background: #334155; padding: 5px 12px; border-radius: 20px; margin: 4px; font-size: 10pt; }
    .footer { text-align: center; margin-top: 50px; font-size: 10pt; color: #94a3b8; }
</style>
</head>
<body>
    <div class="header">
        <div class="title">🏥 Physio-Clinic</div>
        <div>Personal Portfolio Project</div>
    </div>
    <div class="content">
        <p>Physio-Clinic ek modern, full-stack web application hai jo clinical management aur rehabilitation process ko asaan banata hai. Isay Mohammad Asher ne individually develop kiya hai.</p>
        
        <h2 class="section-title">🌟 Key Features</h2>
        <div class="feature-item"><strong>👤 Patient Dashboard:</strong> Premium UI with Light/Dark mode transitions, Recovery scores, and exercise tracking.</div>
        <div class="feature-item"><strong>📁 Reports Control:</strong> Patient-led report management with custom privacy toggles for Doctor visibility.</div>
        <div class="feature-item"><strong>👨‍⚕️ Management Suite:</strong> Centralized dashboard for monitoring patient progress and shared documents.</div>
        
        <h2 class="section-title">🛠️ Tech Stack</h2>
        <span class="tech-pill">React.js</span> <span class="tech-pill">Vite</span> 
        <span class="tech-pill">Tailwind CSS</span> <span class="tech-pill">Firebase Firestore</span> 
        <span class="tech-pill">Firebase Auth</span> <span class="tech-pill">Firebase Storage</span>

        <div class="footer">
            Developed with ❤️ by Mohammad Asher
        </div>
    </div>
</body>
</html>
"""
