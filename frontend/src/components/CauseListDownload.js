import React from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';

const CauseListDownload = ({
  states,
  districts,
  courtComplexes,
  courts,
  selectedState,
  selectedDistrict,
  selectedCourtComplex,
  selectedCourt,
  causeListDate,
  loading,
  handleStateChange,
  handleDistrictChange,
  handleCourtComplexChange,
  setSelectedCourt,
  setCauseListDate,
  downloadCauseListJSON, // Changed from PDF to JSON
  error,
  geographicalData
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Function to download current selection as JSON
  const downloadSelectionData = () => {
    const selectionData = {
      state: states.find(s => s.code === selectedState),
      district: districts.find(d => d.code === selectedDistrict),
      court_complex: courtComplexes.find(c => c.code === selectedCourtComplex),
      court: courts.find(c => c.code === selectedCourt),
      date: causeListDate,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(selectionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `court_selection_${selectedState}_${selectedDistrict}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Row>
      <Col lg={10} className="mx-auto">
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">🏛️ Court Data Selection (JSON Download)</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    State {selectedState && <Badge bg="success" className="ms-2">{states.find(s => s.code === selectedState)?.name}</Badge>}
                  </Form.Label>
                  <Form.Select 
                    value={selectedState}
                    onChange={handleStateChange}
                    disabled={loading}
                    className="py-2"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name} ({state.total_districts || state.districts?.length || 0} districts)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    District {selectedDistrict && <Badge bg="info" className="ms-2">{districts.find(d => d.code === selectedDistrict)?.name}</Badge>}
                  </Form.Label>
                  <Form.Select 
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedState || loading}
                    className="py-2"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name} ({district.total_taluks || district.taluks?.length || 0} taluks)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Court Complex {selectedCourtComplex && <Badge bg="warning" className="ms-2">{courtComplexes.find(c => c.code === selectedCourtComplex)?.name}</Badge>}
                  </Form.Label>
                  <Form.Select 
                    value={selectedCourtComplex}
                    onChange={handleCourtComplexChange}
                    disabled={!selectedDistrict || loading}
                    className="py-2"
                  >
                    <option value="">Select Court Complex</option>
                    {courtComplexes.map((complex, index) => (
                      <option key={complex.code || index} value={complex.code || complex}>
                        {complex.name || complex}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Court Name</Form.Label>
                  <Form.Select 
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    disabled={!selectedCourtComplex || loading}
                    className="py-2"
                  >
                    <option value="">Select Court</option>
                    {courts.map((court, index) => (
                      <option key={court.code || index} value={court.code || court}>
                        {court.name || court}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={causeListDate}
                    onChange={(e) => setCauseListDate(e.target.value)}
                    min={today}
                    className="py-2"
                  />
                  <Form.Text className="text-muted">
                    Select date for cause list (today or future dates)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <div className="d-flex gap-2 mt-4 pt-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setCauseListDate(today)}
                    disabled={loading}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline-success" 
                    onClick={() => setCauseListDate(tomorrow)}
                    disabled={loading}
                  >
                    Tomorrow
                  </Button>
                </div>
              </Col>
            </Row>

            {error && (
              <Alert variant="danger" className="mb-3">
                ❌ {error}
              </Alert>
            )}

            <Alert variant="info" className="mb-4">
              <strong>💡 Information:</strong> Select state, district, court complex and date to download cause lists in JSON format. 
              You can download for a single court or all courts in the complex.
            </Alert>

            <div className="d-flex flex-column gap-3">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => downloadCauseListJSON('single')}
                disabled={loading || !selectedCourt || !causeListDate}
              >
                {loading ? '⏳ Downloading...' : '📥 Download Single Court Cause List (JSON)'}
              </Button>
              
              <Button 
                variant="success" 
                size="lg"
                onClick={() => downloadCauseListJSON('all')}
                disabled={loading || !selectedCourtComplex || !causeListDate}
              >
                {loading ? '⏳ Downloading...' : '📥 Download All Courts Cause List (JSON)'}
              </Button>

              <Button 
                variant="info" 
                size="lg"
                onClick={() => downloadCauseListJSON('complex')}
                disabled={loading || !selectedCourtComplex || !causeListDate}
              >
                {loading ? '⏳ Downloading...' : '🏛️ Download Court Complex Data (JSON)'}
              </Button>

              {/* Download current selection as JSON */}
              <Button 
                variant="outline-dark" 
                size="lg"
                onClick={downloadSelectionData}
                disabled={!selectedState || !selectedDistrict}
              >
                💾 Download Selection Data (JSON)
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Geographical Data Summary */}
        {geographicalData && (
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">🗺️ Geographical Data Summary</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <div className="border rounded p-3">
                    <h4 className="text-primary">{geographicalData.total_states || states.length}</h4>
                    <p className="mb-0 text-muted">Total States</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="border rounded p-3">
                    <h4 className="text-info">{geographicalData.total_districts || districts.length}</h4>
                    <p className="mb-0 text-muted">Total Districts</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="border rounded p-3">
                    <h4 className="text-warning">{courtComplexes.length}</h4>
                    <p className="mb-0 text-muted">Court Complexes</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="border rounded p-3">
                    <h4 className="text-success">{courts.length}</h4>
                    <p className="mb-0 text-muted">Courts Available</p>
                  </div>
                </Col>
              </Row>
              
              {/* Download geographical data */}
              <div className="text-center mt-3">
                <Button 
                  variant="warning"
                  onClick={() => {
                    const dataStr = JSON.stringify(geographicalData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `geographical_data_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  📊 Download Complete Geographical Data (JSON)
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default CauseListDownload;