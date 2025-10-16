from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime, timedelta
import re
import pandas as pd

app = Flask(__name__)
CORS(app)

# Enhanced Indian Courts Data (Top 10 Major States)
INDIAN_COURTS_DATA = {
    "states": [
        {
            "code": "DL",
            "name": "Delhi",
            "districts": [
                {
                    "code": "DL01",
                    "name": "New Delhi",
                    "taluks": ["Connaught Place", "Parliament Street", "Chanakyapuri"],
                    "court_complexes": ["Patiala House Court", "New Delhi District Court"]
                },
                {
                    "code": "DL02",
                    "name": "Central Delhi",
                    "taluks": ["Daryaganj", "Paharganj", "Karol Bagh"],
                    "court_complexes": ["Tis Hazari Court"]
                },
                {
                    "code": "DL03",
                    "name": "South Delhi",
                    "taluks": ["Saket", "Hauz Khas", "Mehrauli"],
                    "court_complexes": ["Saket District Court"]
                }
            ]
        },
        {
            "code": "MH",
            "name": "Maharashtra",
            "districts": [
                {
                    "code": "MH01",
                    "name": "Mumbai City",
                    "taluks": ["Fort", "Colaba", "Byculla"],
                    "court_complexes": ["City Civil Court Mumbai", "Small Causes Court"]
                },
                {
                    "code": "MH02",
                    "name": "Pune",
                    "taluks": ["Pune City", "Haveli"],
                    "court_complexes": ["Pune District Court"]
                },
                {
                    "code": "MH03",
                    "name": "Nagpur",
                    "taluks": ["Nagpur Urban", "Kamptee"],
                    "court_complexes": ["Nagpur District Court"]
                }
            ]
        },
        {
            "code": "KA",
            "name": "Karnataka",
            "districts": [
                {
                    "code": "KA01",
                    "name": "Bangalore Urban",
                    "taluks": ["Bangalore North", "Bangalore South", "Anekal"],
                    "court_complexes": ["City Civil Court Bangalore", "Family Court Bangalore"]
                },
                {
                    "code": "KA02",
                    "name": "Mysuru",
                    "taluks": ["Mysore", "Nanjangud"],
                    "court_complexes": ["Mysuru District Court"]
                },
                {
                    "code": "KA03",
                    "name": "Mangaluru",
                    "taluks": ["Mangalore", "Bantwal"],
                    "court_complexes": ["Dakshina Kannada District Court"]
                }
            ]
        },
        {
            "code": "TN",
            "name": "Tamil Nadu",
            "districts": [
                {
                    "code": "TN01",
                    "name": "Chennai",
                    "taluks": ["Egmore", "Saidapet"],
                    "court_complexes": ["Madras High Court", "City Civil Court Chennai"]
                },
                {
                    "code": "TN02",
                    "name": "Madurai",
                    "taluks": ["Madurai North", "Madurai South"],
                    "court_complexes": ["Madurai District Court"]
                },
                {
                    "code": "TN03",
                    "name": "Coimbatore",
                    "taluks": ["Coimbatore North", "Sulur"],
                    "court_complexes": ["Coimbatore District Court"]
                }
            ]
        },
        {
            "code": "UP",
            "name": "Uttar Pradesh",
            "districts": [
                {
                    "code": "UP01",
                    "name": "Lucknow",
                    "taluks": ["Lucknow City", "Mohanlalganj"],
                    "court_complexes": ["Lucknow District Court"]
                },
                {
                    "code": "UP02",
                    "name": "Varanasi",
                    "taluks": ["Varanasi Sadar", "Pindra"],
                    "court_complexes": ["Varanasi District Court"]
                },
                {
                    "code": "UP03",
                    "name": "Allahabad",
                    "taluks": ["Phaphamau", "Karchana"],
                    "court_complexes": ["Allahabad District Court"]
                }
            ]
        },
        {
            "code": "GJ",
            "name": "Gujarat",
            "districts": [
                {
                    "code": "GJ01",
                    "name": "Ahmedabad",
                    "taluks": ["Ahmedabad City", "Daskroi"],
                    "court_complexes": ["City Civil & Sessions Court Ahmedabad"]
                },
                {
                    "code": "GJ02",
                    "name": "Surat",
                    "taluks": ["Surat City", "Olpad"],
                    "court_complexes": ["Surat District Court"]
                },
                {
                    "code": "GJ03",
                    "name": "Vadodara",
                    "taluks": ["Vadodara", "Savli"],
                    "court_complexes": ["Vadodara District Court"]
                }
            ]
        },
        {
            "code": "WB",
            "name": "West Bengal",
            "districts": [
                {
                    "code": "WB01",
                    "name": "Kolkata",
                    "taluks": ["Alipore", "Ballygunge"],
                    "court_complexes": ["City Civil Court Kolkata", "Alipore Judges Court"]
                },
                {
                    "code": "WB02",
                    "name": "Howrah",
                    "taluks": ["Howrah Sadar"],
                    "court_complexes": ["Howrah District Court"]
                },
                {
                    "code": "WB03",
                    "name": "Darjeeling",
                    "taluks": ["Darjeeling", "Siliguri"],
                    "court_complexes": ["Darjeeling District Court"]
                }
            ]
        },
        {
            "code": "RJ",
            "name": "Rajasthan",
            "districts": [
                {
                    "code": "RJ01",
                    "name": "Jaipur",
                    "taluks": ["Jaipur City", "Amer"],
                    "court_complexes": ["Jaipur District Court"]
                },
                {
                    "code": "RJ02",
                    "name": "Jodhpur",
                    "taluks": ["Jodhpur City", "Luni"],
                    "court_complexes": ["Jodhpur District Court"]
                },
                {
                    "code": "RJ03",
                    "name": "Udaipur",
                    "taluks": ["Udaipur", "Girwa"],
                    "court_complexes": ["Udaipur District Court"]
                }
            ]
        },
        {
            "code": "MP",
            "name": "Madhya Pradesh",
            "districts": [
                {
                    "code": "MP01",
                    "name": "Bhopal",
                    "taluks": ["Bhopal Urban", "Huzur"],
                    "court_complexes": ["Bhopal District Court"]
                },
                {
                    "code": "MP02",
                    "name": "Indore",
                    "taluks": ["Indore City", "Mhow"],
                    "court_complexes": ["Indore District Court"]
                },
                {
                    "code": "MP03",
                    "name": "Gwalior",
                    "taluks": ["Gwalior City", "Bhitarwar"],
                    "court_complexes": ["Gwalior District Court"]
                }
            ]
        },
        {
            "code": "KL",
            "name": "Kerala",
            "districts": [
                {
                    "code": "KL01",
                    "name": "Thiruvananthapuram",
                    "taluks": ["Nedumangad", "Neyyattinkara"],
                    "court_complexes": ["Thiruvananthapuram District Court"]
                },
                {
                    "code": "KL02",
                    "name": "Ernakulam",
                    "taluks": ["Kochi", "Aluva"],
                    "court_complexes": ["Ernakulam District Court"]
                },
                {
                    "code": "KL03",
                    "name": "Kozhikode",
                    "taluks": ["Kozhikode", "Vadakara"],
                    "court_complexes": ["Kozhikode District Court"]
                }
            ]
        },
        {
            "code": "TS",
            "name": "Telangana",
            "districts": [
                {
                    "code": "TS01",
                    "name": "Hyderabad",
                    "taluks": ["Secunderabad", "Charminar"],
                    "court_complexes": ["City Civil Court Hyderabad"]
                },
                {
                    "code": "TS02",
                    "name": "Ranga Reddy",
                    "taluks": ["Shamshabad", "Ibrahimpatnam"],
                    "court_complexes": ["Ranga Reddy District Court"]
                },
                {
                    "code": "TS03",
                    "name": "Warangal",
                    "taluks": ["Warangal Urban", "Hanamkonda"],
                    "court_complexes": ["Warangal District Court"]
                }
            ]
        }
    ]
}

COURT_TYPES = {
    "patiala_house": ["Civil Judge", "Metropolitan Magistrate"],
    "tis_hazari": ["Metropolitan Magistrate", "Sessions Court", "CBI Court"],
    "mumbai_civil": ["Civil Judge Senior Division", "Small Causes Court"],
    "bangalore_city": ["District Judge", "Family Court"],
    "madras_high": ["Civil Appellate", "Criminal Appellate"],
    "default": ["District Judge", "Additional District Judge", "Civil Judge"]
}

DEFAULT_COURTS = ["District Judge", "Additional District Judge", "Civil Judge"]

class ECourtsScraper:
    def __init__(self):
        self.base_url = "https://services.ecourts.gov.in/ecourtindia_v6/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        # Government data sources
        self.data_sources = {
            'census': 'https://censusindia.gov.in/',
            'education': 'https://www.education.gov.in/',
            'districts': 'https://lgdirectory.gov.in/'
        }

    def get_all_states(self):
        """Get all states with codes"""
        try:
            states = []
            for state in INDIAN_COURTS_DATA["states"]:
                states.append({
                    "code": state["code"],
                    "name": state["name"],
                    "total_districts": len(state["districts"])
                })
            return states
        except Exception as e:
            return {"error": f"Error fetching states: {str(e)}"}

    def get_all_districts(self, state_code=None):
        """Get all districts or filtered by state"""
        try:
            districts = []
            for state in INDIAN_COURTS_DATA["states"]:
                if state_code and state["code"] != state_code:
                    continue
                for district in state["districts"]:
                    districts.append({
                        "state_code": state["code"],
                        "state_name": state["name"],
                        "district_code": district["code"],
                        "district_name": district["name"],
                        "total_taluks": len(district.get("taluks", [])),
                        "court_complexes": district.get("court_complexes", [])
                    })
            return districts
        except Exception as e:
            return {"error": f"Error fetching districts: {str(e)}"}

    def get_all_taluks(self, state_code=None, district_code=None):
        """Get all taluks with filtering options"""
        try:
            taluks = []
            for state in INDIAN_COURTS_DATA["states"]:
                if state_code and state["code"] != state_code:
                    continue
                for district in state["districts"]:
                    if district_code and district["code"] != district_code:
                        continue
                    for taluk in district.get("taluks", []):
                        taluks.append({
                            "state_code": state["code"],
                            "state_name": state["name"],
                            "district_code": district["code"],
                            "district_name": district["name"],
                            "taluk_name": taluk
                        })
            return taluks
        except Exception as e:
            return {"error": f"Error fetching taluks: {str(e)}"}

    def fetch_live_district_data(self, state_name):
        """Fetch live district data from government sources"""
        try:
            # Mock implementation - replace with actual API calls
            if state_name.lower() == "maharashtra":
                return [
                    {"name": "Mumbai City", "taluks": ["Fort", "Colaba"]},
                    {"name": "Pune", "taluks": ["Pune City", "Haveli"]}
                ]
            elif state_name.lower() == "karnataka":
                return [
                    {"name": "Bangalore Urban", "taluks": ["Bangalore North", "Bangalore South"]}
                ]
            else:
                return []
        except Exception as e:
            print(f"Error fetching live data: {e}")
            return []

    def scrape_government_data(self):
        """Scrape data from government portals"""
        try:
            # Example: Scrape district information
            govt_url = "https://lgdirectory.gov.in/"
            response = self.session.get(govt_url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                # Parse the data based on website structure
                # This is a placeholder - actual parsing would depend on the site structure
                return {"message": "Government data scraping placeholder"}
            else:
                return {"error": "Failed to fetch government data"}
                
        except Exception as e:
            return {"error": f"Scraping error: {str(e)}"}

    def get_case_status(self, case_details):
        """Fetch case status using CNR or Case Type, Number, Year"""
        try:
            return self.get_mock_case_data(case_details)
        except Exception as e:
            return {"error": f"Error fetching case: {str(e)}"}

    def get_mock_case_data(self, case_details):
        """Return mock data for demonstration"""
        import random
        
        cnr = case_details.get('cnr', '')
        if cnr and len(cnr) >= 4:
            state_code = cnr[:2]
            state_name = self.get_state_name(state_code)
            court = f"{state_name} District Court"
        else:
            courts = ["District Court Delhi", "High Court Mumbai", "Supreme Court"]
            court = random.choice(courts)
            
        statuses = ["Pending", "Hearing", "Disposed", "Adjourned"]
        
        return {
            "case_number": f"{case_details.get('case_type', 'CIVIL')}/{case_details.get('case_number', '123')}/{case_details.get('case_year', '2024')}",
            "parties": "John Doe vs. State of Example",
            "court": court,
            "status": random.choice(statuses),
            "listed_today": random.choice([True, False]),
            "listed_tomorrow": random.choice([True, False]),
            "serial_number": f"SR-{random.randint(100, 999)}",
            "hearing_date": (datetime.now() + timedelta(days=random.randint(0, 7))).strftime('%d/%m/%Y'),
            "cnr": case_details.get('cnr', 'DLHI010001232024')
        }

    def get_state_name(self, state_code):
        """Get state name from state code"""
        for state in INDIAN_COURTS_DATA["states"]:
            if state["code"] == state_code:
                return state["name"]
        return "Unknown State"

    def get_states(self):
        """Get list of states"""
        return [{"code": state["code"], "name": state["name"]} for state in INDIAN_COURTS_DATA["states"]]

    def get_districts(self, state_code):
        """Get districts for a state"""
        for state in INDIAN_COURTS_DATA["states"]:
            if state["code"] == state_code:
                return [{"code": district["code"], "name": district["name"]} for district in state["districts"]]
        return []

    def get_court_complexes(self, state_code, district_code):
        """Get court complexes for a district"""
        for state in INDIAN_COURTS_DATA["states"]:
            if state["code"] == state_code:
                for district in state["districts"]:
                    if district["code"] == district_code:
                        return district["court_complexes"]
        return []

    def get_courts(self, state_code, district_code, court_complex_code):
        """Get courts for a court complex"""
        return COURT_TYPES.get(court_complex_code, DEFAULT_COURTS)

    def download_cause_list(self, date_type="today"):
        """Download cause list for today or tomorrow"""
        try:
            if date_type == "today":
                date_str = datetime.now().strftime('%d/%m/%Y')
            else:
                date_str = (datetime.now() + timedelta(days=1)).strftime('%d/%m/%Y')
            
            cause_list = self.generate_mock_cause_list()
            filename = f"cause_list_{date_type}_{datetime.now().strftime('%Y%m%d')}.json"
                
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cause_list, f, indent=2, ensure_ascii=False)
            
            return {"success": True, "filename": filename, "data": cause_list}
        except Exception as e:
            return {"error": f"Error downloading cause list: {str(e)}"}

    def generate_mock_cause_list(self):
        """Generate mock cause list data"""
        import random
        courts = ["Court Room 1 - Justice Sharma", "Court Room 2 - Justice Verma"]
        case_types = ["CIVIL", "CRIMINAL", "FAMILY", "LABOR"]
        
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

# Initialize scraper
scraper = ECourtsScraper()

@app.route('/')
def index():
    return jsonify({"message": "eCourts Scraper API is running"})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Enhanced API endpoints for geographical data
@app.route('/api/all-states', methods=['GET'])
def get_all_states():
    """Get all states with complete information"""
    states = scraper.get_all_states()
    return jsonify({"states": states, "total": len(states)})

@app.route('/api/all-districts', methods=['GET', 'POST'])
def get_all_districts():
    """Get all districts or filter by state"""
    if request.method == 'POST':
        data = request.json
        state_code = data.get('state_code')
    else:
        state_code = request.args.get('state_code')
    
    districts = scraper.get_all_districts(state_code)
    return jsonify({"districts": districts, "total": len(districts)})

@app.route('/api/all-taluks', methods=['GET', 'POST'])
def get_all_taluks():
    """Get all taluks with filtering options"""
    if request.method == 'POST':
        data = request.json
        state_code = data.get('state_code')
        district_code = data.get('district_code')
    else:
        state_code = request.args.get('state_code')
        district_code = request.args.get('district_code')
    
    taluks = scraper.get_all_taluks(state_code, district_code)
    return jsonify({"taluks": taluks, "total": len(taluks)})

@app.route('/api/geographical-data', methods=['GET'])
def get_complete_geographical_data():
    """Get complete geographical hierarchy"""
    complete_data = []
    
    for state in INDIAN_COURTS_DATA["states"]:
        state_data = {
            "state_code": state["code"],
            "state_name": state["name"],
            "districts": []
        }
        
        for district in state["districts"]:
            district_data = {
                "district_code": district["code"],
                "district_name": district["name"],
                "taluks": district.get("taluks", []),
                "court_complexes": district.get("court_complexes", [])
            }
            state_data["districts"].append(district_data)
        
        complete_data.append(state_data)
    
    return jsonify({
        "geographical_data": complete_data,
        "total_states": len(complete_data),
        "total_districts": sum(len(state["districts"]) for state in complete_data)
    })

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

@app.route('/api/states', methods=['GET'])
def get_states():
    states = scraper.get_states()
    return jsonify({"states": states})

@app.route('/api/districts', methods=['POST'])
def get_districts():
    data = request.json
    districts = scraper.get_districts(data.get('state_code'))
    return jsonify({"districts": districts})

@app.route('/api/court-complexes', methods=['POST'])
def get_court_complexes():
    data = request.json
    complexes = scraper.get_court_complexes(
        data.get('state_code'),
        data.get('district_code')
    )
    return jsonify({"court_complexes": complexes})

@app.route('/api/courts', methods=['POST'])
def get_courts():
    data = request.json
    courts = scraper.get_courts(
        data.get('state_code'),
        data.get('district_code'),
        data.get('court_complex_code')
    )
    return jsonify({"courts": courts})

@app.route('/api/download-cause-list', methods=['POST'])
def download_cause_list_pdf():
    try:
        data = request.json
        filename = f"cause_list_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        with open(filename, 'w') as f:
            f.write("Mock PDF content - Cause List")
        
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export-data', methods=['POST'])
def export_geographical_data():
    """Export geographical data to CSV/JSON"""
    try:
        data = request.json
        export_format = data.get('format', 'json')
        data_type = data.get('data_type', 'all')  # states, districts, taluks, all
        
        if data_type == 'states':
            export_data = scraper.get_all_states()
        elif data_type == 'districts':
            export_data = scraper.get_all_districts()
        elif data_type == 'taluks':
            export_data = scraper.get_all_taluks()
        else:
            export_data = scraper.get_complete_geographical_data()
        
        filename = f"india_geographical_data_{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_format}"
        
        if export_format == 'csv':
            df = pd.DataFrame(export_data)
            df.to_csv(filename, index=False)
            mimetype = 'text/csv'
        else:
            with open(filename, 'w') as f:
                json.dump(export_data, f, indent=2)
            mimetype = 'application/json'
        
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype=mimetype
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')