import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
  Button
} from 'react-bootstrap';

// Import components
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import CaseSearch from './components/CaseSearch';
import CauseListDownload from './components/CauseListDownload';
import QuickDownload from './components/QuickDownload';

const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  const [activeTab, setActiveTab] = useState('case-search');
  const [searchType, setSearchType] = useState('cnr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // State for cascading dropdowns
  const [states, setStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [courtComplexes, setCourtComplexes] = useState([]);
  const [courts, setCourts] = useState([]);
  const [allTaluks, setAllTaluks] = useState([]);
  const [taluks, setTaluks] = useState([]);
  
  // Selected values
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCourtComplex, setSelectedCourtComplex] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [causeListDate, setCauseListDate] = useState('');
  
  // Geographical data
  const [geographicalData, setGeographicalData] = useState(null);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    cnr: 'DLHI010001232024',
    case_type: 'CIVIL',
    case_number: '123',
    case_year: '2024'
  });

  // Fetch ALL initial data on component mount
  useEffect(() => {
    fetchInitialData();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setCauseListDate(today);
  }, []);

  // Update stats when data changes
  useEffect(() => {
    updateStats();
  }, [states, allDistricts, allTaluks, courtComplexes, courts, result]);

  const updateStats = () => {
    setStats({
      cases: result ? 1 : 0,
      courts: courts.length,
      downloads: 0,
      geographical: states.length + allDistricts.length + allTaluks.length
    });
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllStates(),
        fetchAllDistricts(),
        fetchAllTaluks(),
        fetchGeographicalData(),
        testConnection()
      ]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      setServerStatus('offline');
    }
  };

  // Fetch ALL states with complete data
  const fetchAllStates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/all-states`);
      const data = await response.json();
      if (data.states) {
        setStates(data.states);
      }
    } catch (err) {
      console.error('Error fetching all states:', err);
    }
  };

  // Fetch ALL districts
  const fetchAllDistricts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/all-districts`);
      const data = await response.json();
      if (data.districts) {
        setAllDistricts(data.districts);
      }
    } catch (err) {
      console.error('Error fetching all districts:', err);
    }
  };

  // Fetch ALL taluks
  const fetchAllTaluks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/all-taluks`);
      const data = await response.json();
      if (data.taluks) {
        setAllTaluks(data.taluks);
      }
    } catch (err) {
      console.error('Error fetching all taluks:', err);
    }
  };

  // Fetch districts for specific state
  const fetchDistricts = async (stateCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/districts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_code: stateCode })
      });
      const data = await response.json();
      if (data.districts) {
        setDistricts(data.districts);
        setCourtComplexes([]);
        setCourts([]);
        setTaluks([]);
      }
    } catch (err) {
      setError('Failed to fetch districts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourtComplexes = async (stateCode, districtCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/court-complexes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          state_code: stateCode,
          district_code: districtCode 
        })
      });
      const data = await response.json();
      if (data.court_complexes) {
        setCourtComplexes(data.court_complexes);
        setCourts([]);
      }
    } catch (err) {
      setError('Failed to fetch court complexes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourts = async (stateCode, districtCode, courtComplexCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          state_code: stateCode,
          district_code: districtCode,
          court_complex_code: courtComplexCode
        })
      });
      const data = await response.json();
      if (data.courts) {
        setCourts(data.courts);
      }
    } catch (err) {
      setError('Failed to fetch courts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch complete geographical hierarchy
  const fetchGeographicalData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/geographical-data`);
      const data = await response.json();
      if (data.geographical_data) {
        setGeographicalData(data);
      }
    } catch (err) {
      console.error('Error fetching geographical data:', err);
    }
  };

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedDistrict('');
    setSelectedCourtComplex('');
    setSelectedCourt('');
    setSelectedTaluk('');
    setDistricts([]);
    setCourtComplexes([]);
    setCourts([]);
    setTaluks([]);
    
    if (stateCode) {
      fetchDistricts(stateCode);
      // Show taluks for this state
      const stateTaluks = allTaluks.filter(taluk => taluk.state_code === stateCode);
      setTaluks(stateTaluks);
    }
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedCourtComplex('');
    setSelectedCourt('');
    setSelectedTaluk('');
    setCourtComplexes([]);
    setCourts([]);
    
    if (districtCode && selectedState) {
      fetchCourtComplexes(selectedState, districtCode);
      // Show taluks for this district
      const districtTaluks = allTaluks.filter(
        taluk => taluk.state_code === selectedState && taluk.district_code === districtCode
      );
      setTaluks(districtTaluks);
    }
  };

  const handleCourtComplexChange = (e) => {
    const courtComplexCode = e.target.value;
    setSelectedCourtComplex(courtComplexCode);
    setSelectedCourt('');
    setCourts([]);
    
    if (courtComplexCode && selectedState && selectedDistrict) {
      fetchCourts(selectedState, selectedDistrict, courtComplexCode);
    }
  };

  // JSON Download Function
  const downloadCauseListJSON = async (type = 'single') => {
    if (type === 'single' && !selectedCourt) {
      setError('Please select a court');
      return;
    }
    
    if ((type === 'all' || type === 'complex') && !selectedCourtComplex) {
      setError('Please select a court complex');
      return;
    }
    
    if (!causeListDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        state_code: selectedState,
        district_code: selectedDistrict,
        court_complex_code: selectedCourtComplex,
        date: causeListDate,
        download_type: type
      };

      if (type === 'single') {
        payload.court_code = selectedCourt;
      }

      // Use the cause-list endpoint which returns JSON
      const response = await fetch(`${API_BASE_URL}/api/cause-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download cause list');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cause_list_${type}_${causeListDate}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Cause list downloaded successfully in JSON format!');
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const searchCase = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    let payload = {};
    
    try {
      if (searchType === 'cnr') {
        if (!formData.cnr.trim()) {
          setError('Please enter CNR number');
          setLoading(false);
          return;
        }
        payload = { search_type: 'cnr', cnr: formData.cnr };
      } else {
        if (!formData.case_type.trim() || !formData.case_number.trim() || !formData.case_year.trim()) {
          setError('Please fill all case details');
          setLoading(false);
          return;
        }
        payload = {
          search_type: 'details',
          case_type: formData.case_type,
          case_number: formData.case_number,
          case_year: formData.case_year
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Failed to fetch: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCauseList = async (dateType) => {
    setLoading(true);
    setError('');

    try {
      let endpoint = '/api/cause-list';
      let body = { date_type: dateType };

      // Handle geographical data downloads
      if (['states', 'districts', 'taluks'].includes(dateType)) {
        endpoint = '/api/export-data';
        body = {
          format: 'json',
          data_type: dateType
        };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      if (['states', 'districts', 'taluks'].includes(dateType)) {
        a.download = `${dateType}_data_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        a.download = `cause_list_${dateType}_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      a.href = url;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (['states', 'districts', 'taluks'].includes(dateType)) {
        alert(`${dateType.charAt(0).toUpperCase() + dateType.slice(1)} data downloaded successfully!`);
      } else {
        alert(`Cause list for ${dateType} downloaded successfully!`);
      }
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cnr: '',
      case_type: '',
      case_number: '',
      case_year: ''
    });
    setResult(null);
    setError('');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'case-search':
        return (
          <CaseSearch
            searchType={searchType}
            setSearchType={setSearchType}
            formData={formData}
            handleInputChange={handleInputChange}
            searchCase={searchCase}
            resetForm={resetForm}
            loading={loading}
            result={result}
            error={error}
          />
        );
      case 'cause-list-download':
        return (
          <CauseListDownload
            states={states}
            districts={districts}
            courtComplexes={courtComplexes}
            courts={courts}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedCourtComplex={selectedCourtComplex}
            selectedCourt={selectedCourt}
            causeListDate={causeListDate}
            loading={loading}
            handleStateChange={handleStateChange}
            handleDistrictChange={handleDistrictChange}
            handleCourtComplexChange={handleCourtComplexChange}
            setSelectedCourt={setSelectedCourt}
            setCauseListDate={setCauseListDate}
            downloadCauseListJSON={downloadCauseListJSON}
            error={error}
            geographicalData={geographicalData}
          />
        );
      case 'cause-list':
        return (
          <QuickDownload
            downloadCauseList={downloadCauseList}
            loading={loading}
            downloadStats={{
              today: 20,
              tomorrow: 15
            }}
          />
        );
      case 'geographical':
        return (
          <Row>
            <Col lg={10} className="mx-auto">
              <Card>
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">🗺️ Geographical Data Explorer</h5>
                  <small>Total Data: {states.length} States • {allDistricts.length} Districts • {allTaluks.length} Taluks</small>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-4">
                    <Col md={4} className="text-center">
                      <div className="border rounded p-3">
                        <h2 className="text-primary">{states.length}</h2>
                        <p className="mb-0 text-muted">States/UTs</p>
                        <small className="text-muted">Fetched: {states.length > 0 ? '✅' : '❌'}</small>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="border rounded p-3">
                        <h2 className="text-info">{allDistricts.length}</h2>
                        <p className="mb-0 text-muted">Districts</p>
                        <small className="text-muted">Fetched: {allDistricts.length > 0 ? '✅' : '❌'}</small>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="border rounded p-3">
                        <h2 className="text-success">{allTaluks.length}</h2>
                        <p className="mb-0 text-muted">Taluks</p>
                        <small className="text-muted">Fetched: {allTaluks.length > 0 ? '✅' : '❌'}</small>
                      </div>
                    </Col>
                  </Row>

                  <Alert variant="info" className="mb-4">
                    <strong>📊 Data Status:</strong> 
                    {states.length > 0 && allDistricts.length > 0 && allTaluks.length > 0 
                      ? ' ✅ All geographical data loaded successfully!' 
                      : ' ⚠️ Some data may still be loading...'}
                  </Alert>

                  <div className="d-flex flex-column gap-3">
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={() => downloadCauseList('states')}
                      disabled={loading || states.length === 0}
                    >
                      📊 Download All States Data (JSON)
                    </Button>
                    
                    <Button 
                      variant="outline-info" 
                      size="lg"
                      onClick={() => downloadCauseList('districts')}
                      disabled={loading || allDistricts.length === 0}
                    >
                      📍 Download All Districts Data (JSON)
                    </Button>
                    
                    <Button 
                      variant="outline-success" 
                      size="lg"
                      onClick={() => downloadCauseList('taluks')}
                      disabled={loading || allTaluks.length === 0}
                    >
                      🏘️ Download All Taluks Data (JSON)
                    </Button>

                    <Button 
                      variant="warning" 
                      size="lg"
                      onClick={fetchInitialData}
                      disabled={loading}
                    >
                      🔄 Refresh All Geographical Data
                    </Button>
                  </div>

                  {geographicalData && (
                    <div className="mt-4">
                      <h6>Complete Geographical Hierarchy (Sample):</h6>
                      <pre className="bg-light p-3 rounded" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                        {JSON.stringify(geographicalData, null, 2)}
                      </pre>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      default:
        return null;
    }
  };

  const geographicalStats = {
    states: states.length,
    districts: allDistricts.length,
    taluks: allTaluks.length,
    courts: courts.length
  };

  return (
    <Container fluid className="py-4" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Row className="justify-content-center">
        <Col md={10} lg={10}>
          <Header 
            onTestConnection={testConnection} 
            serverStatus={serverStatus}
            geographicalStats={geographicalStats}
          />
          
          <Card className="shadow-lg border-0">
            <Card.Body className="p-0">
              <TabNavigation 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                stats={stats}
              />

              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    ⚠️ {error}
                  </Alert>
                )}

                {loading && (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted">Loading geographical data...</p>
                  </div>
                )}

                {renderActiveTab()}
              </Card.Body>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;