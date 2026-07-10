const summaryItemsEl = document.getElementById('summaryItems');
const summaryTotalEl = document.getElementById('summaryTotal');
const qrImage = document.getElementById('qrImage');
const upiIdDisplay = document.getElementById('upiIdDisplay');
const orderForm = document.getElementById('orderForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');

const cartItems = Cart.get();
const total = Cart.total();

function renderSummary() {
  if (cartItems.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  summaryItemsEl.innerHTML = cartItems
    .map(
      (i) => `<div class="order-summary-row">
        <span>${i.name} × ${i.quantity}</span>
        <span>₹${(i.price * i.quantity).toFixed(0)}</span>
      </div>`
    )
    .join('');
  summaryTotalEl.textContent = `₹${total.toFixed(0)}`;
}

async function loadQrCode() {
  try {
    const res = await fetch(`${API_BASE_URL}/payment-info`);
    const json = await res.json();
    const { upi_id, payee_name } = json.data;

    upiIdDisplay.textContent = upi_id;

    // Standard UPI deep-link format, encoded into a QR code image via a free public QR API.
    const upiLink = `upi://pay?pa=${upi_id}&pn=${encodeURIComponent(payee_name)}&am=${total.toFixed(2)}&cu=INR&tn=DudhBazarOrder`;
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`;
  } catch (err) {
    upiIdDisplay.textContent = 'Could not load payment details.';
  }
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const customer_name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const transaction_id = document.getElementById('transactionId').value.trim();

  document.getElementById('phoneError').textContent = '';
  document.getElementById('txnError').textContent = '';

  let valid = true;
  if (!/^[6-9]\d{9}$/.test(phone)) {
    document.getElementById('phoneError').textContent = 'Please enter correct 10 digit mobile number';
    valid = false;
  }
  if (transaction_id.length < 4) {
    document.getElementById('txnError').textContent = 'Please enter your Transaction ID from your UPI APP';
    valid = false;
  }
  if (!valid) return;

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Order procedding...';

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name,
        phone,
        address,
        transaction_id,
        items: cartItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      }),
    });
    const json = await res.json();

    if (!json.success) {
      showToast(json.message || 'error in order');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Order';
      return;
    }

    Cart.clear();
    document.getElementById('checkoutView').style.display = 'none';
    document.getElementById('confirmationView').style.display = 'block';
    document.getElementById('confirmOrderNumber').textContent = json.data.order_number;
  } catch (err) {
    showToast('Network Issue. Please check your mobile Network ');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Do order';
  }
});

renderSummary();
loadQrCode();
