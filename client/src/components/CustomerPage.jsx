import { useEffect, useMemo, useState } from 'react';
import { createOrder, getMenu, getOrderById } from '../api';

function formatPrice(value) {
  return `${Number(value).toFixed(2)} ₪`;
}

export default function CustomerPage() {
  const [menu, setMenu] = useState({ pizzas: [], sizes: [], toppings: [] });
  const [selectedPizzaId, setSelectedPizzaId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await getMenu();
        setMenu(data);
        setSelectedPizzaId(data.pizzas[0]?.id || '');
        setSelectedSize(data.sizes[0]?.id || '');
      } catch (err) {
        setErrorMessage(err.message);
      }
    }

    loadMenu();
  }, []);

  const previewPrice = useMemo(() => {
    if (!selectedPizzaId || !selectedSize) return 0;

    const pizza = menu.pizzas.find((item) => item.id === selectedPizzaId);
    const size = menu.sizes.find((item) => item.id === selectedSize);
    const toppingPrice = menu.toppings
      .filter((item) => selectedToppings.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);

    return (pizza?.price || 0) + (size?.price || 0) + toppingPrice;
  }, [menu, selectedPizzaId, selectedSize, selectedToppings]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.previewPrice, 0), [cart]);

  function toggleTopping(toppingId) {
    setSelectedToppings((current) => {
      if (current.includes(toppingId)) {
        return current.filter((item) => item !== toppingId);
      }
      return [...current, toppingId];
    });
  }

  function addToCart() {
    if (!selectedPizzaId || !selectedSize) return;

    setCart((current) => [
      ...current,
      {
        pizzaId: selectedPizzaId,
        pizzaName: menu.pizzas.find((item) => item.id === selectedPizzaId)?.name || selectedPizzaId,
        size: selectedSize,
        sizeName: menu.sizes.find((item) => item.id === selectedSize)?.name || selectedSize,
        toppings: [...selectedToppings],
        previewPrice
      }
    ]);

    setSelectedToppings([]);
  }

  async function handleCheckout() {
    try {
      const order = await createOrder({
        customerName,
        phone,
        deliveryAddress,
        pizzas: cart.map((item) => ({
          pizzaId: item.pizzaId,
          size: item.size,
          toppings: item.toppings
        }))
      });

      setOrderConfirmation(order);
      setCart([]);
      setCustomerName('');
      setPhone('');
      setDeliveryAddress('');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message);
      setOrderConfirmation(null);
    }
  }

  async function handleTrackOrder() {
    try {
      const result = await getOrderById(orderIdInput.trim());
      setTrackedOrder(result);
      setErrorMessage('');
    } catch (err) {
      setTrackedOrder(null);
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>Customer Order</h2>
        <p className="muted">Build your pizza and place an order.</p>

        <div className="menu-section" data-testid="menu-list">
          <h3>Menu</h3>
          <div className="field">
            <label>Pizza</label>
            <select value={selectedPizzaId} onChange={(e) => setSelectedPizzaId(e.target.value)}>
              {menu.pizzas.map((pizza) => (
                <option key={pizza.id} value={pizza.id}>
                  {pizza.name} - {formatPrice(pizza.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Size</label>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              {menu.sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name} - {formatPrice(size.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Toppings</label>
            <div className="chip-list">
              {menu.toppings.map((topping) => (
                <button
                  key={topping.id}
                  type="button"
                  className={selectedToppings.includes(topping.id) ? 'chip active' : 'chip'}
                  onClick={() => toggleTopping(topping.id)}
                >
                  {topping.name} - {formatPrice(topping.price)}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-box">
            <strong>Preview:</strong> {formatPrice(previewPrice)}
          </div>

          <button type="button" onClick={addToCart}>
            Add Pizza to Cart
          </button>
        </div>

        <div className="cart-section" data-testid="cart">
          <h3>Cart</h3>
          {cart.length === 0 ? <p className="muted">Your cart is empty.</p> : (
            <ul>
              {cart.map((item, index) => (
                <li key={`${item.pizzaId}-${index}`}>
                  <strong>{item.pizzaName}</strong> ({item.sizeName})<br />
                  Toppings: {item.toppings.length ? item.toppings.join(', ') : 'None'}<br />
                  Price: {formatPrice(item.previewPrice)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-summary-panel" data-testid="order-summary-panel">
          <h3>Order Summary</h3>
          <p>Total: {formatPrice(cartTotal)}</p>
          <div className="field">
            <label>Customer Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Delivery Address</label>
            <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
          </div>
          <button type="button" data-testid="checkout-button" onClick={handleCheckout} disabled={cart.length === 0}>
            Checkout
          </button>
        </div>

        {errorMessage && <div className="error">{errorMessage}</div>}

        {orderConfirmation && (
          <div className="success" data-testid="order-confirmation">
            <h3>Order confirmed</h3>
            <p>Order ID: {orderConfirmation.id}</p>
            <p>Status: {orderConfirmation.status}</p>
          </div>
        )}

        <div className="track-box">
          <h3>Track Order</h3>
          <input value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} placeholder="Order ID" />
          <button type="button" onClick={handleTrackOrder}>Track</button>
          {trackedOrder && (
            <div className="success">
              <p>Status: {trackedOrder.status}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
