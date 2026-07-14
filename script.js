// ==============================
// Travel Bill Summary
// script.js
// ==============================

// Attach events to existing rows
document.querySelectorAll("#expenseTable tbody tr").forEach(addEvents);

function addEvents(row) {

    row.querySelector(".rate").addEventListener("input", calculateRow);
    row.querySelector(".qty").addEventListener("input", calculateRow);

}

// Calculate row
function calculateRow(e) {

    const row = e.target.closest("tr");

    let rate = parseFloat(row.querySelector(".rate").value) || 0;

    let qty = row.querySelector(".qty").value;

    // Qty blank => 1
    if (qty === "") {
        qty = 1;
    } else {
        qty = parseFloat(qty) || 1;
    }

    let amount = rate * qty;

    row.querySelector(".amount").value = amount.toFixed(2);

    calculateTotal();

}

// Calculate Total
function calculateTotal() {

    let total = 0;

    document.querySelectorAll(".amount").forEach(item => {

        total += parseFloat(item.value) || 0;

    });

    document.getElementById("total").value = total.toFixed(2);

    calculateBalance();

}

// Balance Due
function calculateBalance() {

    let total = parseFloat(document.getElementById("total").value) || 0;

    let advance = parseFloat(document.getElementById("advance").value) || 0;

    document.getElementById("balance").value = (total - advance).toFixed(2);

}

document.getElementById("advance")
.addEventListener("input", calculateBalance);

// =====================
// Add Row
// =====================

document.getElementById("addRow")
.addEventListener("click", function () {

    const tbody = document.querySelector("#expenseTable tbody");

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="text" placeholder="Particular"></td>
        <td><input type="number" class="rate"></td>
        <td><input type="number" class="qty"></td>
        <td><input type="text" class="amount" readonly></td>
    `;

    tbody.appendChild(tr);

    addEvents(tr);

});

// =====================
// PDF Download
// =====================

document.getElementById("downloadPdf")
.addEventListener("click", async function () {

    const { jsPDF } = window.jspdf;

    const bill = document.getElementById("billArea");

    const canvas = await html2canvas(bill, {

        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"

    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({

        orientation: "portrait",
        unit: "mm",
        format: "letter"

    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 8;

    const imgWidth = pageWidth - (margin * 2);

    const imgHeight = canvas.height * imgWidth / canvas.width;

    // Fit to page
    let finalHeight = imgHeight;

    if (finalHeight > (pageHeight - 15)) {

        finalHeight = pageHeight - 15;

    }

    pdf.addImage(
        imgData,
        "PNG",
        margin,
        5,
        imgWidth,
        finalHeight,
        "",
        "FAST"
    );

    let month = document.getElementById("month").value;

    if (month === "") {

        month = "Travel";

    }

    pdf.save("Travel_Bill_Summary_" + month + ".pdf");

});

// Initial Calculation
calculateTotal();
