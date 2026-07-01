import { useState } from 'react';
import CustomerPage from './components/CustomerPage';
import EmployeePage from './components/EmployeePage';
import DeliveryPage from './components/DeliveryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('customer');

  return (
    <div className="app-shell">
      <header>
        <h1>Pizza Ordering System</h1>
        <div className="tabs">
          <button className={activeTab === 'customer' ? 'tab active' : 'tab'} onClick={() => setActiveTab('customer')}>
            Customer
          </button>
          <button className={activeTab === 'employee' ? 'tab active' : 'tab'} onClick={() => setActiveTab('employee')}>
            Restaurant Employee
          </button>
          <button className={activeTab === 'delivery' ? 'tab active' : 'tab'} onClick={() => setActiveTab('delivery')}>
            Delivery Person
          </button>
        </div>
      </header>

      {activeTab === 'customer' && <CustomerPage />}
      {activeTab === 'employee' && <EmployeePage />}
      {activeTab === 'delivery' && <DeliveryPage />}
    </div>
  );
}
