from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime, timedelta
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class ECourtsScraper:
    def __init__(self):
        self.base_url = "https://services.ecourts.gov.in/ecourtindia_v6/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        })

    def get_case_status(self, case_details):
        """Fetch case status using CNR or Case Type, Number, Year"""
        try:
            # For demo purposes - return mock data
            # In production, you would implement the actual scraping logic here
            return self.get_mock_case_data(case_details)
                
        except Exception as e:
            return {"error": f"Error fetching case: {str(e)}"}

    def get_mock_case_data(self, case_details):
        """Return mock data for demonstration"""
        # This is sample data - replace with actual scraping logic
        import random
        courts = ["District Court Delhi", "High Court Mumbai", "Supreme Court", "Session Court Bangalore"]
        statuses = ["Pending", "Hearing", "Disposed", "Adjourned"]
        
        return {
            "case_number": f"{case_details.get('case_type', 'CIVIL')}/{case_details.get('case_number', '123')}/{case_details.get('case_year', '2024')}",
            "parties": "John Doe vs. State of Example",
            "court": random.choice(courts),
            "status": random.choice(statuses),
            "listed_today": random.choice([True, False]),
            "listed_tomorrow": random.choice([True, False]),
            "serial_number": f"SR-{random.randint(100, 999)}",
            "hearing_date": (datetime.now() + timedelta(days=random.randint(0, 7))).strftime('%d/%m/%Y'),
            "cnr": case_details.get('cnr', 'DLHI010001232024')
        }

    def download_cause_list(self, date_type="today"):
        """Download cause list for today or tomorrow"""
        try:
            if date_type == "today":
                date_str = datetime.now().strftime('%d/%m/%Y')
            else:
                date_str = (datetime.now() + timedelta(days=1)).strftime('%d/%m/%Y')
            
            # Generate mock cause list data
            cause_list = self.generate_mock_cause_list()
            filename = f"cause_list_{date_type}_{datetime.now().strftime('%Y%m%d')}.json"
                
            # Save cause list to file
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cause_list, f, indent=2, ensure_ascii=False)
            
            return {"success": True, "filename": filename, "data": cause_list}
                
        except Exception as e:
            return {"error": f"Error downloading cause list: {str(e)}"}

    def generate_mock_cause_list(self):
        """Generate mock cause list data for demonstration"""
        import random
        courts = ["Court Room 1 - Justice Sharma", "Court Room 2 - Justice Verma", 
                 "Court Room 3 - Justice Singh", "Court Room 4 - Justice Patel"]
        case_types = ["CIVIL", "CRIMINAL", "FAMILY", "LABOR", "COMPANY"]
        
        cause_list = []
        for i in range(20):
            case_entry = {
                "serial_no": i + 1,
                "case_number": f"{random.choice(case_types)}/{random.randint(100, 999)}/{random.randint(2018, 2024)}",
                "parties": f"Party {random.randint(1, 100)} vs. Party {random.randint(1, 100)}",
                "court": random.choice(courts),
                "hearing_time": f"{random.randint(10, 16)}:{random.choice(['00', '15', '30', '45'])}",
                "purpose": random.choice(["Hearing", "Arguments", "Evidence", "Judgment"])
            }
            cause_list.append(case_entry)
        
        return cause_list

    def parse_cause_list(self, html_content):
        """Parse cause list HTML - to be implemented with actual scraping"""
        # This would contain the actual scraping logic for the eCourts website
        return self.generate_mock_cause_list()

# Initialize scraper
scraper = ECourtsScraper()

# Routes
@app.route('/')
def index():
    return jsonify({"message": "eCourts Scraper API is running"})

@app.route('/api/case-status', methods=['POST'])
def case_status():
    data = request.json
    result = scraper.get_case_status(data)
    return jsonify(result)

@app.route('/api/cause-list', methods=['POST'])
def cause_list():
    try:
        data = request.json
        date_type = data.get('date_type', 'today')
        result = scraper.download_cause_list(date_type)
        
        if 'filename' in result:
            return send_file(
                result['filename'],
                as_attachment=True,
                download_name=result['filename'],
                mimetype='application/json'
            )
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search_case():
    try:
        data = request.json
        search_type = data.get('search_type')
        
        if search_type == 'cnr':
            result = scraper.get_case_status({'cnr': data.get('cnr')})
        else:
            result = scraper.get_case_status({
                'case_type': data.get('case_type'),
                'case_number': data.get('case_number'),
                'case_year': data.get('case_year')
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    # Install required packages: pip install flask flask-cors requests beautifulsoup4
    app.run(debug=True, port=5000, host='0.0.0.0')