// ============================================================
//  INVOICE STUDIO — script.js
//  Calculation order:
//    1. Subtotal (sum of line items)
//    2. Tax     (% of Subtotal)
//    3. Amount After Tax = Subtotal + Tax
//    4. Discount (flat, applied ON the after-tax amount)
//    5. Total Due = Amount After Tax − Discount
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    document.getElementById('invoice-date').valueAsDate = today;

    const due = new Date();
    due.setDate(today.getDate() + 30);
    document.getElementById('due-date').valueAsDate = due;

    updateCurrency();
    calculateTotal();
});

/* ---------- Logo ---------- */
function loadLogo(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const data = e.target.result;
        const preview = document.getElementById('logo-preview');
        preview.src = data;
        preview.style.display = 'block';
        document.getElementById('logo-label').style.display = 'none';

        // Watermark image
        const wm = document.getElementById('watermark-img');
        wm.src = data;
        wm.style.display = 'block';
        document.getElementById('watermark-text').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/* ---------- QR Code ---------- */
function loadQR(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('qr-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('qr-label').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/* ---------- Signature ---------- */
function loadSignature(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('sig-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('sig-label').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/* ---------- Watermark ---------- */
function updateWatermark() {
    const name = document.getElementById('company-name').value;
    document.getElementById('watermark-text').innerText = name;
}

/* ---------- Currency ---------- */
function updateCurrency() {
    const sym = document.getElementById('currency-selector').value;
    document.querySelectorAll('.curr-sym').forEach(el => el.innerText = sym);
}

/* ---------- Format number with commas ---------- */
function fmt(n) {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- Add / Remove items ---------- */
function addItem() {
    const tbody = document.getElementById('invoice-items');
    const sym = document.getElementById('currency-selector').value;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <input type="text" class="item-name" placeholder="Service / Product Name" oninput="calculateTotal()">
            <textarea class="item-desc" rows="2" placeholder="Brief description…"></textarea>
        </td>
        <td>
            <select class="frequency">
                <option value="One-Time">One-Time</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
            </select>
        </td>
        <td><input type="number" class="qty" value="1" min="0" oninput="calculateTotal()"></td>
        <td><input type="number" class="rate" value="0" min="0" oninput="calculateTotal()"></td>
        <td class="amount-cell"><span class="curr-sym">${sym}</span><span class="amount">0.00</span></td>
        <td class="no-print"><button class="del-btn" onclick="removeItem(this)">✕</button></td>
    `;
    tbody.appendChild(tr);
    calculateTotal();
}

function removeItem(btn) {
    btn.closest('tr').remove();
    calculateTotal();
}

/* ---------- Master calculation ----------
   ORDER:
     subtotal → tax → amountAfterTax → discount → grandTotal
---------------------------------------------------------- */
function calculateTotal() {
    // 1. Line-item subtotal
    let subtotal = 0;
    document.querySelectorAll('#invoice-items tr').forEach(row => {
        const qty  = parseFloat(row.querySelector('.qty')?.value)  || 0;
        const rate = parseFloat(row.querySelector('.rate')?.value) || 0;
        const amt  = qty * rate;
        row.querySelector('.amount').innerText = fmt(amt);
        subtotal += amt;
    });

    // 2. Tax on subtotal
    const taxRate   = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);

    // 3. Amount after tax
    const afterTax = subtotal + taxAmount;

    // 4. Discount applied ON the after-tax amount (flat)
    const discountInput = parseFloat(document.getElementById('discount-amount').value) || 0;
    const discount      = Math.min(discountInput, afterTax); // can't exceed total

    // 5. Grand total
    const grandTotal = Math.max(0, afterTax - discount);

    // ---- Update DOM ----
    document.getElementById('subtotal').innerText    = fmt(subtotal);
    document.getElementById('tax-amount').innerText  = fmt(taxAmount);
    document.getElementById('after-tax-amount').innerText = fmt(afterTax);
    document.getElementById('grand-total').innerText = fmt(grandTotal);

    // Show "Amount After Tax" row only when tax > 0
    const afterTaxRow = document.getElementById('after-tax-row');
    afterTaxRow.style.display = taxAmount > 0 ? 'flex' : 'none';

    // Discount display
    const discountRow = document.getElementById('display-discount-row');
    if (discount > 0) {
        document.getElementById('display-discount').innerText = fmt(discount);
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }

    // Re-sync currency symbols (in case new rows were added)
    updateCurrency();
}