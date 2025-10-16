import React from 'react';
import { Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';

const QuickDownload = ({ downloadCauseList, loading, downloadStats }) => {
  const today = new Date().toLocaleDateString('en-IN');
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-IN');

  return (
    <Row>
      <Col lg={8} className="mx-auto">
        <Card>
          <Card.Header className="bg-info text-white text-center">
            <h5 className="mb-0">📄 Quick Download Cause Lists</h5>
          </Card.Header>
          <Card.Body className="text-center">
            <div className="mb-4">
              <span style={{ fontSize: '3rem', color: '#0dcaf0' }}>⚡</span>
            </div>
            
            <Alert variant="info" className="mb-4">
              <strong>Quick Access:</strong> Download complete cause lists in JSON format without selecting specific courts.
            </Alert>

            {downloadStats && (
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <div className="border rounded p-3 mb-3">
                      <h6 className="text-muted">Today's Cases</h6>
                      <h4 className="text-primary">{downloadStats.today || 0}</h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="border rounded p-3 mb-3">
                      <h6 className="text-muted">Tomorrow's Cases</h6>
                      <h4 className="text-success">{downloadStats.tomorrow || 0}</h4>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
            
            <div className="d-flex flex-column gap-3">
              <div className="border rounded p-4">
                <h5 className="mb-3">📅 Today's Cause List</h5>
                <p className="text-muted mb-3">Date: {today}</p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => downloadCauseList('today')}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? '⏳ Downloading...' : '📥 Download Today\'s Cause List (JSON)'}
                </Button>
                <small className="text-muted mt-2 d-block">
                  Includes all cases listed for hearing today across all courts
                </small>
              </div>
              
              <div className="border rounded p-4">
                <h5 className="mb-3">📅 Tomorrow's Cause List</h5>
                <p className="text-muted mb-3">Date: {tomorrow}</p>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => downloadCauseList('tomorrow')}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? '⏳ Downloading...' : '📥 Download Tomorrow\'s Cause List (JSON)'}
                </Button>
                <small className="text-muted mt-2 d-block">
                  Includes all cases listed for hearing tomorrow across all courts
                </small>
              </div>

              <div className="border rounded p-4">
                <h5 className="mb-3">🗺️ Geographical Data</h5>
                <p className="text-muted mb-3">Complete states, districts & taluks data</p>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-dark" 
                    onClick={() => downloadCauseList('states')}
                    disabled={loading}
                    className="flex-fill"
                  >
                    📊 States Data
                  </Button>
                  <Button 
                    variant="outline-dark" 
                    onClick={() => downloadCauseList('districts')}
                    disabled={loading}
                    className="flex-fill"
                  >
                    📍 Districts Data
                  </Button>
                  <Button 
                    variant="outline-dark" 
                    onClick={() => downloadCauseList('taluks')}
                    disabled={loading}
                    className="flex-fill"
                  >
                    🏘️ Taluks Data
                  </Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default QuickDownload;