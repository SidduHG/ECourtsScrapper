# 🏛️ eCourts Scraper — Real-Time Case & Cause List Fetcher
📌 Overview
<ul>
<h2>eCourts Scraper is a full-stack web application that allows users to:</h2>
<li>Search for court cases by CNR or Case Details (Type, Number, Year).</li>
<li>Check if the case is listed today or tomorrow and view its serial number & court name.</li>
<li>Download Cause Lists (for today or tomorrow) as PDF or JSON in real time.</li>
<li>Dynamically select State → District → Court Complex → Court Name directly from the UI.</li>
<li>All data is fetched live from the official eCourts Services Portal.</li>
 
<p><b>This project demonstrates Python web scraping, Flask REST APIs, and React-based dynamic UIs, all working together to provide real-time access to court information.</b></p>
</ul>

# ⚙️ Features

1. Search Case by CNR or Details
2.  Check Today/Tomorrow Listing Status
3.  Download Cause List PDFs
4.  Fetch Real Court Data (No Hardcoding)
5.  Sta-+te → District → Court Complex → Court Name cascading dropdowns
6.  Backend Validation, JSON Responses, and PDF Export
7.  Responsive, Modern UI built with React + Bootstrap
8.  Optional CLI commands for batch fetches

# Demo Vedio 


https://github.com/user-attachments/assets/e3ba4fda-3701-43e4-8854-b697dc011f72


# 🏗️ Tech Stack
Layer	Technology
Frontend	React.js, React-Bootstrap
Backend	Flask (Python)
Scraping	requests, BeautifulSoup, pdfminer / PyPDF2
PDF Parsing	PyPDF2 / pytesseract (OCR optional)
Data Handling	JSON, REST API
Deployment	Localhost 
 # 📂 Project Structure
 ```
eCourts-Scraper/
│
├── backend/
│   ├── app.py                  # Main Flask server
│   ├── ecourts_scraper.py      # Scraping & parsing logic
│   ├── court_data.py           # State/District/Court mapping
│   ├── requirements.txt        # Backend dependencies
│   ├── static/                 # PDF/JSON outputs
│   └── templates/              # (optional) For debug views
│
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── components/         # UI components
│   │   └── styles/             # Optional CSS
│   ├── package.json
│   └── public/
│
└── README.md
```

# 🧩 Installation & Setup
🔹 1. Clone the Repository
git clone https://github.com/<your-username>/eCourts-Scraper.git
cd eCourts-Scraper

🔹 2. Backend Setup (Flask)
```
cd backend
python -m venv venv
venv\Scripts\activate   # (Windows)
# OR
source venv/bin/activate  # (Linux/Mac)

pip install -r requirements.txt
```
# requirements.txt
```
Flask
requests
beautifulsoup4
PyPDF2
pdfminer.six
pytesseract
regex
```
▶️ Run Backend
```
python app.py
```

By default, it runs on http://127.0.0.1:5000

🔹 3. Frontend Setup (React)
```
cd ../frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

Make sure your Flask backend is running on port 5000.
