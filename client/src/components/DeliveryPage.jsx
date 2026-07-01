import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../api';

function formatPrice(value) {
  return `${Number(value).toFixed(2)} ₪`;
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadOrders() {
    try {
      const data = await getOrders('ready');
      setOrders(data);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleDeliver(orderId) {
    try {
      await updateOrderStatus(orderId, 'delivered');
      await loadOrders();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Delivery Person</h2>
        <div className="orders-list" data-testid="delivery-orders">
          {orders.length === 0 ? (
            <p className="muted">No orders ready for delivery.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <p><strong>ID:</strong> {order.id}</p>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Address:</strong> {order.deliveryAddress}</p>
                <p><strong>Total:</strong> {formatPrice(order.totalPrice)}</p>
                <button onClick={() => handleDeliver(order.id)}>Mark as Delivered</button>
              </div>
            ))
          )}
        </div>
        {errorMessage && <div className="error">{errorMessage}</div>}
      </section>
    </div>
  );
}
