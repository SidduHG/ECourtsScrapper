import React from 'react';
import { Row, Col, Card, Nav, Form, Button, Alert, Badge, Table } from 'react-bootstrap';

const CaseSearch = ({
  searchType,
  setSearchType,
  formData,
  handleInputChange,
  searchCase,
  resetForm,
  loading,
  result,
  error
}) => {
  return (
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

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={resetForm}
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
              <Table responsive borderless className="mb-0">
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
  );
};

export default CaseSearch;