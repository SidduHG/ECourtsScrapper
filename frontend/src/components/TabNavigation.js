import React from 'react';
import { Nav, Card, Badge } from 'react-bootstrap';

const TabNavigation = ({ activeTab, setActiveTab, stats }) => {
  return (
    <Card.Header className="bg-light border-bottom-0">
      <Nav variant="pills" className="justify-content-center">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'case-search'} 
            onClick={() => setActiveTab('case-search')}
            className="fw-semibold d-flex align-items-center gap-2"
          >
            📋 Case Search
            {stats?.cases && <Badge bg="primary" pill>{stats.cases}</Badge>}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'cause-list-download'} 
            onClick={() => setActiveTab('cause-list-download')}
            className="fw-semibold d-flex align-items-center gap-2"
          >
            🏛️ Court Data
            {stats?.courts && <Badge bg="info" pill>{stats.courts}</Badge>}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'cause-list'} 
            onClick={() => setActiveTab('cause-list')}
            className="fw-semibold d-flex align-items-center gap-2"
          >
            📥 Quick Downloads
            {stats?.downloads && <Badge bg="success" pill>{stats.downloads}</Badge>}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'geographical'} 
            onClick={() => setActiveTab('geographical')}
            className="fw-semibold d-flex align-items-center gap-2"
          >
            🗺️ Geographical Data
            {stats?.geographical && <Badge bg="warning" pill>{stats.geographical}</Badge>}
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Card.Header>
  );
};

export default TabNavigation;