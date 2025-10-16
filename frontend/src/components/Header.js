import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const Header = ({ onTestConnection, serverStatus, geographicalStats }) => {
  return (
    <Card className="shadow-lg border-0 mb-4">
      <Card.Body className="text-white text-center" style={{ 
        background: 'linear-gradient(45deg, #2c3e50, #34495e)'
      }}>
        <h1 className="display-4 fw-bold mb-3">eCourts Scraper Pro</h1>
        <p className="lead mb-0 opacity-75">
          Real-time court data fetching and cause list downloads with geographical data
        </p>
        
        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
          <Button 
            variant={serverStatus === 'online' ? 'outline-success' : 'outline-warning'} 
            size="sm" 
            onClick={onTestConnection}
          >
            {serverStatus === 'online' ? '✅ Server Online' : 
             serverStatus === 'checking' ? '⏳ Checking...' : '🔌 Test Connection'}
          </Button>
          
          {geographicalStats && (
            <>
              <Badge bg="light" text="dark" className="px-3 py-2">
                🗺️ {geographicalStats.states} States
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                📍 {geographicalStats.districts} Districts
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                🏛️ {geographicalStats.courts} Courts
              </Badge>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Header;