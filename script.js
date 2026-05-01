// Set default dates on load
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    document.getElementById('invoice-date').valueAsDate = today;
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);
    document.getElementById('due-date').valueAsDate = dueDate;

    // Initialize listener for live typing on foreign currency target
    document.getElementById('target-curr-name').addEventListener('input', calculateTotal);
});

// Logo Upload Logic
function loadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            // Show logo in header
            const preview = document.getElementById('logo-preview');
            preview.src = imgData;
            preview.style.display = 'block';
            document.getElementById('logo-upload').style.display = 'none'; // Hide upload button after
            
            // Set watermark logo
            const wmImg = document.getElementById('watermark-img');
            wmImg.src = imgData;
            wmImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Watermark Text Logic
function updateWatermark() {
    const companyName = document.getElementById('company-name').value;
    document.getElementById('watermark-text').innerText = companyName;
}

// Currency Symbol Logic
function updateCurrency() {
    const sym = document.getElementById('currency-selector').value;
    const symbols = document.querySelectorAll('.curr-sym');
    symbols.forEach(el => el.innerText = sym);
}

// Add / Remove Line Items
function addItem() {
    const tbody = document.getElementById('invoice-items');
    const row = document.createElement('tr');
    const sym = document.getElementById('currency-selector').value;
    row.innerHTML = `
        <td><input type="text" placeholder="Service description..." oninput="calculateTotal()"></td>
        <td>
            <select class="frequency">
                <option value="One-Time">One-Time</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
            </select>
        </td>
        <td><input type="number" class="qty" value="1" oninput="calculateTotal()"></td>
        <td><input type="number" class="rate" value="0" oninput="calculateTotal()"></td>
        <td><span class="curr-sym">${sym}</span><span class="amount">0.00</span></td>
        <td class="no-print"><button class="btn btn-danger" onclick="removeItem(this)">Remove</button></td>
    `;
    tbody.appendChild(row);
    calculateTotal();
}

function removeItem(button) {
    button.closest('tr').remove();
    calculateTotal();
}

// Master Calculation Function
function calculateTotal() {
    const rows = document.querySelectorAll('#invoice-items tr');
    let subtotal = 0;

    // Calculate line items
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const rate = parseFloat(row.querySelector('.rate').value) || 0;
        const amount = qty * rate;
        row.querySelector('.amount').innerText = amount.toFixed(2);
        subtotal += amount;
    });

    // Calculate Subtotal, Tax, and Grand Total
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('tax-amount').innerText = taxAmount.toFixed(2);
    document.getElementById('grand-total').innerText = grandTotal.toFixed(2);

    // Foreign Currency Conversion Logic
    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value) || 1;
    const targetCurr = document.getElementById('target-curr-name').value;
    const convertedTotal = grandTotal * exchangeRate;
    
    document.getElementById('converted-total').innerText = convertedTotal.toFixed(2);
    document.getElementById('display-target-curr').innerText = targetCurr;
}