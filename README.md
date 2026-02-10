# 🗳️ Electoral Roll Tracker  
### “Git for Democracy”  
### Forensic Auditing of Electoral Roll Changes at National Scale  

<img width="3839" height="1756" alt="image" src="https://github.com/user-attachments/assets/16384161-2c96-4713-82d3-b414910dda49" />
<img width="3784" height="1762" alt="image" src="https://github.com/user-attachments/assets/33d25f65-f6c4-4842-b53b-2be32e2905ef" />
<img width="3778" height="1755" alt="image" src="https://github.com/user-attachments/assets/008fe783-ca48-425d-92b4-dd7fc642be3d" />
<img width="3790" height="1747" alt="image" src="https://github.com/user-attachments/assets/5b10f10e-f621-4d27-b6fe-0de5e8dc568a" />

---

## 👨‍💻 Team: *caffiene.exe*  
Built for **Hackavensis Hackathon 2026**

| Name | Role | LinkedIn | GitHub |
|------|------|----------|--------|
| **Krishna** | Leader & Full Stack Developer | [LinkedIn](https://www.linkedin.com/in/krishna-verma-2177b3394/) | [GitHub](https://github.com/krix2112) |
| **Aarushi Sachdeva** | UI/UX Developer | [LinkedIn](https://www.linkedin.com/in/aarushi-sachdeva-aa7609378/) | [GitHub](https://github.com/sachdeva-aarushi) |
| **Suhani** | Frontend Developer | [LinkedIn](https://www.linkedin.com/in/suhani-s-3aa9a21aa/) | [GitHub](https://github.com/Suhani1954) |
| **Hitendra** | Frontend Developer | [LinkedIn](https://www.linkedin.com/in/hitendra-dhapola-952854368/) | [GitHub](https://github.com/j25aiml192-hash/) |
| **Vansh Bhatia** | Full Stack Developer | [LinkedIn](https://www.linkedin.com/in/vansh-bhatia-9aa017269/) | [GitHub](https://github.com/vanssh012) |

🔗 **Project Repository:**  
https://github.com/krix2112/electoral-roll-tracker
🔗 **Deployed Link:**  
https://electoral-roll-tracker-one.vercel.app/
<img width="3791" height="1750" alt="image" src="https://github.com/user-attachments/assets/afc6abc3-448b-4558-acf0-8abf0015638f" />

---

# 🧠 The Core Concept

> Electoral manipulation doesn’t happen loudly.  
> It hides inside silent data changes.

Electoral Roll Tracker is a civic-tech platform that tracks, audits, and visualizes **every change** in electoral rolls.

It works like **Git Diff — but for Democracy.**

Instead of staring at static voter lists, we compare *versions* and detect:

- ➕ Additions  
- ➖ Deletions  
- ✏️ Modifications  
- 🚨 Suspicious patterns  

---

# 🚨 Problem Statement

Electoral roll manipulation hides in silent data changes — not in static voter lists.

With frequent roll updates across regions, it becomes extremely difficult to detect:

- Mass voter deletions  
- Artificial voter insertions  
- Suspicious same-day registrations  
- Duplicate or synthetic voter records  
- Pattern-based demographic anomalies  

Manual auditing is slow.  
National-scale auditing is nearly impossible.

---

# 💡 Our Solution

A version-controlled forensic auditing system for electoral rolls.

Upload two CSV versions.  
Click compare.  
Instantly visualize changes.

Think:

> `git diff electoral_roll_jan.csv electoral_roll_feb.csv`

But with red/green highlighting and automated anomaly detection.

---

# ⚙️ Key Features

### 📤 Upload Electoral Roll CSV Files
Secure upload and parsing of large datasets.

### 🔍 Version Comparison Engine
Detects:
- Added voters
- Deleted voters
- Modified records

### 🚨 Suspicious Pattern Detection
Automatically flags:
- 500+ bulk deletions
- Same-day mass registrations
- Duplicate entries
- Abnormal data clusters

### 🎨 Visual Diff Viewer
- Red = Deleted voters
- Green = Added voters
- Yellow = Modified entries
- GitHub-style comparison UI

### 📢 Alert System
Real-time alerts for suspicious roll activity.

---

# ⚡ The "Wow" Moments

### 🧮 Hash-Based Diff Algorithm
- O(n) complexity
- Uses Pandas + MD5 hashing
- Extremely fast comparison even at 10,000+ rows

### 📊 Pattern Detection Intelligence
- Bulk deletion threshold alerts
- Same-day suspicious registrations
- Statistical anomaly detection

### 🌍 Real Civic Impact
Addresses real electoral integrity concerns at scale.

---

# 🎬 2-Minute Demo Script

1. Upload **January Roll** (10,000 voters)
2. Upload **February Roll** (9,500 voters)
3. Click **Compare**
4. 💥 Visual diff appears
5. 🔴 500 voters highlighted in red
6. 🚨 Alert: *"Bulk deletion detected"*

Instant forensic insight.

---

# 🛠️ Tech Stack

## 🔹 Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway)

## 🔹 Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?style=for-the-badge)

## 🔹 Deployment

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway)

---

# 🏗️ System Architecture

User Upload
↓
CSV Parser (Pandas)
↓
Hash Generator (MD5)
↓
Diff Engine (O(n))
↓
Pattern Detection Module
↓
Alert Engine
↓
React Diff Viewer UI


---

# 📂 Project Structure

electoral-roll-tracker/
│
├── backend/
│ ├── app.py
│ ├── diff_engine.py
│ ├── pattern_detection.py
│ ├── database.py
│
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── diffViewer/
│
├── README.md


---

# 🚀 How to Run Locally

## Backend

```bash
cd backend
pip install -r requirements.txt
flask run
Frontend
cd frontend
npm install
npm run dev
🌍 Impact
Enables transparent electoral audits

Scales to national voter databases

Reduces manual verification

Strengthens democratic trust

Introduces version control to public governance

🔮 Future Improvements
Role-based access control

Geographic heatmap visualization

Blockchain audit logging

AI-powered anomaly prediction

Public transparency dashboard

🏆 Built for Hackavensis 2026
Team: caffiene.exe

Because democracy deserves version control.
