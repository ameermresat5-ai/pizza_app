const API_BASE_URL = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function getMenu() {
  return request('/menu');
}

export async function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function getOrderById(orderId) {
  return request(`/orders/${orderId}`);
}

export async function getOrders(status) {
  const query = status ? `?status=${status}` : '';
  return request(`/orders${query}`);
}

export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
