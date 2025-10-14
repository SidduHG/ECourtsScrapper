import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Badge
} from 'react-bootstrap';

// API base URL - adjust according to your setup
const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  const [activeTab, setActiveTab] = useState('case-search');
  const [searchType, setSearchType] = useState('cnr');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cnr: 'DLHI010001232024',
    case_type: 'CIVIL',
    case_number: '123',
    case_year: '2024'
  });

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors'
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
      setError(`Failed to fetch case data: ${err.message}. Make sure the Flask server is running on port 5000.`);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCauseList = async (dateType) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/cause-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date_type: dateType }),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cause_list_${dateType}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setError('');
      alert(`Cause list for ${dateType} downloaded successfully!`);
    } catch (err) {
      setError(`Failed to download cause list: ${err.message}`);
      console.error('Download error:', err);
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

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        alert('Connection to Flask server successful!');
      } else {
        alert('Connection failed!');
      }
    } catch (err) {
      alert('Cannot connect to Flask server. Make sure it is running on port 5000.');
    }
  };

  return (
    <Container fluid className="py-4" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          {/* Header */}
          <Card className="shadow-lg border-0 mb-4">
            <Card.Body className="text-white text-center" style={{ 
              background: 'linear-gradient(45deg, #2c3e50, #34495e)'
            }}>
              <h1 className="display-4 fw-bold mb-3">eCourts Scraper</h1>
              <p className="lead mb-0 opacity-75">
                Check case status and download cause lists from eCourts portal
              </p>
              <Button 
                variant="outline-light" 
                size="sm" 
                className="mt-3"
                onClick={testConnection}
              >
                Test Server Connection
              </Button>
            </Card.Body>
          </Card>

          {/* Main Content */}
          <Card className="shadow-lg border-0">
            <Card.Body className="p-0">
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Card.Header className="bg-light border-bottom-0">
                  <Nav variant="pills" className="justify-content-center">
                    <Nav.Item>
                      <Nav.Link eventKey="case-search" className="fw-semibold">
                        📋 Case Search
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="cause-list" className="fw-semibold">
                        📄 Cause List
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>

                <Card.Body className="p-4">
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      ⚠️ {error}
                    </Alert>
                  )}

                  {loading && (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" className="mb-3" />
                      <p className="text-muted">Fetching data from eCourts...</p>
                    </div>
                  )}

                  <Tab.Content>
                    {/* Case Search Tab */}
                    <Tab.Pane eventKey="case-search">
                      <Row>
                        <Col lg={8} className="mx-auto">
                          <Card className="mb-4">
                            <Card.Header className="bg-transparent border-bottom-0">
                              <Nav variant="pills" className="justify-content-center">
                                <Nav.Item>
                                  <Nav.Link 
                                    active={searchType === 'cnr'}
                                    onClick={() => setSearchType('cnr')}
                                    className="fw-semibold"
                                  >
                                    🔍 Search by CNR
                                  </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link 
                                    active={searchType === 'details'}
                                    onClick={() => setSearchType('details')}
                                    className="fw-semibold"
                                  >
                                    📝 Search by Case Details
                                  </Nav.Link>
                                </Nav.Item>
                              </Nav>
                            </Card.Header>
                          </Card>

                          <Card>
                            <Card.Body>
                              {searchType === 'cnr' ? (
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">CNR Number</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="cnr"
                                    value={formData.cnr}
                                    onChange={handleInputChange}
                                    placeholder="Enter CNR number"
                                    className="py-2"
                                  />
                                </Form.Group>
                              ) : (
                                <>
                                  <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Case Type</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="case_type"
                                      value={formData.case_type}
                                      onChange={handleInputChange}
                                      placeholder="e.g., CIVIL, CRIMINAL"
                                      className="py-2"
                                    />
                                  </Form.Group>
                                  <Row>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Case Number</Form.Label>
                                        <Form.Control
                                          type="text"
                                          name="case_number"
                                          value={formData.case_number}
                                          onChange={handleInputChange}
                                          placeholder="Enter case number"
                                          className="py-2"
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">Case Year</Form.Label>
                                        <Form.Control
                                          type="text"
                                          name="case_year"
                                          value={formData.case_year}
                                          onChange={handleInputChange}
                                          placeholder="e.g., 2024"
                                          className="py-2"
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                </>
                              )}

                              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <Button 
                                  variant="outline-secondary" 
                                  onClick={resetForm}
                                  className="me-md-2"
                                >
                                  🔄 Reset
                                </Button>
                                <Button 
                                  variant="primary" 
                                  onClick={searchCase}
                                  disabled={loading}
                                >
                                  🔍 Search Case
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>

                          {result && !loading && (
                            <Card className="mt-4 border-primary">
                              <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">📋 Case Information</h5>
                              </Card.Header>
                              <Card.Body>
                                <Table borderless className="mb-0">
                                  <tbody>
                                    {result.case_number && (
                                      <tr>
                                        <td className="fw-semibold text-muted" style={{ width: '40%' }}>
                                          Case Number:
                                        </td>
                                        <td className="fw-bold">{result.case_number}</td>
                                      </tr>
                                    )}
                                    {result.cnr && (
                                      <tr>
                                        <td className="fw-semibold text-muted">CNR:</td>
                                        <td>{result.cnr}</td>
                                      </tr>
                                    )}
                                    {result.court && (
                                      <tr>
                                        <td className="fw-semibold text-muted">Court:</td>
                                        <td>{result.court}</td>
                                      </tr>
                                    )}
                                    {result.parties && (
                                      <tr>
                                        <td className="fw-semibold text-muted">Parties:</td>
                                        <td>{result.parties}</td>
                                      </tr>
                                    )}
                                    {result.status && (
                                      <tr>
                                        <td className="fw-semibold text-muted">Status:</td>
                                        <td>{result.status}</td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td className="fw-semibold text-muted">Listing Status:</td>
                                      <td>
                                        {result.listed_today ? (
                                          <Badge bg="success" className="fs-6">
                                            ✅ Listed Today
                                          </Badge>
                                        ) : result.listed_tomorrow ? (
                                          <Badge bg="warning" text="dark" className="fs-6">
                                            ⏰ Listed Tomorrow
                                          </Badge>
                                        ) : (
                                          <Badge bg="secondary" className="fs-6">
                                            ❌ Not Listed
                                          </Badge>
                                        )}
                                      </td>
                                    </tr>
                                    {result.serial_number && (
                                      <tr>
                                        <td className="fw-semibold text-muted">Serial Number:</td>
                                        <td>
                                          <Badge bg="info" className="fs-6">
                                            {result.serial_number}
                                          </Badge>
                                        </td>
                                      </tr>
                                    )}
                                    {result.hearing_date && (
                                      <tr>
                                        <td className="fw-semibold text-muted">Hearing Date:</td>
                                        <td>
                                          <Badge bg="light" text="dark" className="fs-6">
                                            {result.hearing_date}
                                          </Badge>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </Table>
                              </Card.Body>
                            </Card>
                          )}
                        </Col>
                      </Row>
                    </Tab.Pane>

                    {/* Cause List Tab */}
                    <Tab.Pane eventKey="cause-list">
                      <Row>
                        <Col lg={6} className="mx-auto">
                          <Card>
                            <Card.Body className="text-center">
                              <div className="mb-4">
                                <span style={{ fontSize: '3rem', color: '#6c757d' }}>📄</span>
                              </div>
                              <h4 className="mb-3">Download Cause List</h4>
                              <p className="text-muted mb-4">
                                Download the complete cause list for today or tomorrow.
                              </p>
                              
                              <div className="d-grid gap-3">
                                <Button 
                                  variant="primary" 
                                  size="lg"
                                  onClick={() => downloadCauseList('today')}
                                  disabled={loading}
                                >
                                  📥 Download Today's Cause List
                                </Button>
                                
                                <Button 
                                  variant="outline-primary" 
                                  size="lg"
                                  onClick={() => downloadCauseList('tomorrow')}
                                  disabled={loading}
                                >
                                  📥 Download Tomorrow's Cause List
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;