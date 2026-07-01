import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../api';

function formatPrice(value) {
  return `${Number(value).toFixed(2)} ₪`;
}

export default function EmployeePage() {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadOrders() {
    try {
      const data = await getOrders('new');
      const preparing = await getOrders('preparing');
      setOrders([...data, ...preparing]);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, nextStatus) {
    try {
      await updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Restaurant Employee</h2>
        <div className="orders-list" data-testid="employee-orders">
          {orders.length === 0 ? (
            <p className="muted">No orders to process.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <p><strong>ID:</strong> {order.id}</p>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Address:</strong> {order.deliveryAddress}</p>
                <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <ul>
                  {order.items?.map((item, index) => (
                    <li key={`${order.id}-${index}`}>
                      {item.pizzaName} ({item.sizeName}) - {formatPrice(item.itemPrice)}
                    </li>
                  ))}
                </ul>
                {order.status === 'new' && (
                  <button onClick={() => handleStatusChange(order.id, 'preparing')}>Mark as Preparing</button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => handleStatusChange(order.id, 'ready')}>Mark as Ready</button>
                )}
              </div>
            ))
          )}
        </div>
        {errorMessage && <div className="error">{errorMessage}</div>}
      </section>
    </div>
  );
}
