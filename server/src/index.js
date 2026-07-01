const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const menu = {
  pizzas: [
    { id: 'margherita', name: 'Margherita', price: 35 },
    { id: 'vegetarian', name: 'Vegetarian', price: 39 },
    { id: 'pepperoni', name: 'Pepperoni', price: 42 }
  ],
  sizes: [
    { id: 'small', name: 'Small', price: 0 },
    { id: 'medium', name: 'Medium', price: 8 },
    { id: 'large', name: 'Large', price: 15 }
  ],
  toppings: [
    { id: 'olives', name: 'Olives', price: 4 },
    { id: 'mushrooms', name: 'Mushrooms', price: 4 },
    { id: 'corn', name: 'Corn', price: 4 },
    { id: 'onion', name: 'Onion', price: 4.5 },
    { id: 'extra-cheese', name: 'Extra Cheese', price: 3.5 }
  ]
};

const orderStatuses = ['new', 'preparing', 'ready', 'delivered'];
const orders = [];

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function calculatePizzaPrice(pizzaId, sizeId, toppings) {
  const pizza = menu.pizzas.find((item) => item.id === pizzaId);
  const size = menu.sizes.find((item) => item.id === sizeId);

  if (!pizza || !size) {
    return null;
  }

  const toppingPrice = (toppings || []).reduce((sum, toppingId) => {
    const topping = menu.toppings.find((item) => item.id === toppingId);
    return topping ? sum + topping.price : sum;
  }, 0);

  return pizza.price + size.price + toppingPrice;
}

function validateOrderPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Order payload must be an object.' };
  }

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const deliveryAddress = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';

  if (!customerName) {
    return { valid: false, message: 'customerName is required.' };
  }

  if (!phone) {
    return { valid: false, message: 'phone is required.' };
  }

  if (!deliveryAddress) {
    return { valid: false, message: 'deliveryAddress is required.' };
  }

  if (!Array.isArray(body.pizzas) || body.pizzas.length === 0) {
    return { valid: false, message: 'pizzas must be a non-empty array.' };
  }

  for (const pizza of body.pizzas) {
    if (!pizza || typeof pizza !== 'object') {
      return { valid: false, message: 'Each pizza must be an object.' };
    }

    if (typeof pizza.pizzaId !== 'string' || !menu.pizzas.some((item) => item.id === pizza.pizzaId)) {
      return { valid: false, message: 'pizzaId is invalid.' };
    }

    if (typeof pizza.size !== 'string' || !menu.sizes.some((item) => item.id === pizza.size)) {
      return { valid: false, message: 'size is invalid.' };
    }

    if (!Array.isArray(pizza.toppings)) {
      return { valid: false, message: 'toppings must be an array.' };
    }

    const seen = new Set();
    for (const toppingId of pizza.toppings) {
      if (typeof toppingId !== 'string' || !menu.toppings.some((item) => item.id === toppingId)) {
        return { valid: false, message: 'Each topping must be valid.' };
      }

      if (seen.has(toppingId)) {
        return { valid: false, message: 'You cannot choose the same topping twice for the same pizza.' };
      }

      seen.add(toppingId);
    }
  }

  return { valid: true };
}

app.get('/api/menu', (req, res) => {
  res.json(menu);
});

app.post('/api/orders', (req, res) => {
  const validation = validateOrderPayload(req.body);
  if (!validation.valid) {
    return sendError(res, 400, validation.message);
  }

  const items = req.body.pizzas.map((pizza) => {
    const itemPrice = calculatePizzaPrice(pizza.pizzaId, pizza.size, pizza.toppings);
    const pizzaInfo = menu.pizzas.find((item) => item.id === pizza.pizzaId);
    const sizeInfo = menu.sizes.find((item) => item.id === pizza.size);

    return {
      pizzaId: pizza.pizzaId,
      pizzaName: pizzaInfo.name,
      size: pizza.size,
      sizeName: sizeInfo.name,
      toppings: pizza.toppings,
      itemPrice
    };
  });

  const totalPrice = items.reduce((sum, item) => sum + item.itemPrice, 0);
  const order = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: req.body.customerName.trim(),
    phone: req.body.phone.trim(),
    deliveryAddress: req.body.deliveryAddress.trim(),
    pizzas: req.body.pizzas,
    items,
    totalPrice,
    status: 'new',
    paymentStatus: 'approved',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found.');
  }

  res.json(order);
});

app.get('/api/orders', (req, res) => {
  const status = req.query.status;

  if (status !== undefined) {
    if (!orderStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid order status.');
    }

    return res.json(orders.filter((order) => order.status === status));
  }

  res.json(orders);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return sendError(res, 404, 'Order not found.');
  }

  const newStatus = req.body && typeof req.body.status === 'string' ? req.body.status.trim() : '';
  if (!newStatus) {
    return sendError(res, 400, 'status is required.');
  }

  if (!orderStatuses.includes(newStatus)) {
    return sendError(res, 400, 'Invalid order status.');
  }

  const currentIndex = orderStatuses.indexOf(order.status);
  const nextIndex = orderStatuses.indexOf(newStatus);

  if (nextIndex !== currentIndex + 1) {
    return sendError(res, 409, 'Status transition is not allowed.');
  }

  order.status = newStatus;
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Pizza server running on port ${PORT}`);
});
