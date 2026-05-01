// Set default dates on load
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    document.getElementById('invoice-date').valueAsDate = today;
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);
    document.getElementById('due-date').valueAsDate = dueDate;
    
    // Default currency to INR for the template
    updateCurrency();
});

// Logo Upload Logic
function loadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            const preview = document.getElementById('logo-preview');
            preview.src = imgData;
            preview.style.display = 'block';
            document.getElementById('logo-upload').style.display = 'none'; 
            
            const wmImg = document.getElementById('watermark-img');
            wmImg.src = imgData;
            wmImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// QR Code Upload Logic
function loadQR(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            const preview = document.getElementById('qr-preview');
            preview.src = imgData;
            preview.style.display = 'block';
            document.getElementById('qr-upload').style.display = 'none'; 
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
        <td>
            <input type="text" placeholder="Service / Software Name" style="font-weight: bold;" oninput="calculateTotal()">
            <textarea class="item-desc" rows="2" placeholder="Detailed technical description..."></textarea>
        </td>
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

    // Handle Discount
    const discountAmount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const displayDiscountRow = document.getElementById('display-discount-row');
    
    // Prevent negative subtotal if discount is too high
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // Show discount visually on print only if a discount exists
    if(discountAmount > 0) {
        document.getElementById('display-discount').innerText = discountAmount.toFixed(2);
        displayDiscountRow.style.display = 'flex';
    } else {
        displayDiscountRow.style.display = 'none';
    }

    // Calculate Tax on the DISCOUNTED subtotal
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxAmount = discountedSubtotal * (taxRate / 100);
    const grandTotal = discountedSubtotal + taxAmount;

    // Update UI
    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('tax-amount').innerText = taxAmount.toFixed(2);
    document.getElementById('grand-total').innerText = grandTotal.toFixed(2);
}

//signature upload
// Digital Signature Upload Logic
function loadSignature(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            const preview = document.getElementById('sig-preview');
            preview.src = imgData;
            preview.style.display = 'block';
            
            // Hide the upload button and helper text after successful upload
            document.getElementById('sig-upload').style.display = 'none'; 
            event.target.nextElementSibling.style.display = 'none'; 
        };
        reader.readAsDataURL(file);
    }
}