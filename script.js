// ==============================
// Management Information System
// script.js - Enhanced with Pie Chart
// ==============================

let expenseChart;

// Attach events to existing rows
document.querySelectorAll("#expenseTable tbody tr").forEach(addEvents);

function addEvents(row) {
    const rateInput = row.querySelector(".rate");
    const qtyInput = row.querySelector(".qty");
    
    if (rateInput) rateInput.addEventListener("input", calculateRow);
    if (qtyInput) qtyInput.addEventListener("input", calculateRow);
    
    // Add delete button for new rows
    if (!row.querySelector('.delete-btn')) {
        const actionCell = row.cells[row.cells.length - 1];
        if (actionCell) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.addEventListener('click', () => {
                row.remove();
                calculateTotal();
                updateChart();
            });
            actionCell.appendChild(delBtn);
        }
    }
}

// Calculate single row
function calculateRow(e) {
    const row = e.target.closest("tr");
    if (!row) return;

    let rate = parseFloat(row.querySelector(".rate").value) || 0;
    let qtyInput = row.querySelector(".qty").value;
    
    let qty = (qtyInput === "" || isNaN(parseFloat(qtyInput))) ? 1 : parseFloat(qtyInput);
    
    let amount = rate * qty;
    row.querySelector(".amount").value = amount.toFixed(2);

    calculateTotal();
    updateChart();
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

document.getElementById("advance").addEventListener("input", () => {
    calculateBalance();
});

// =====================
// Add Row
// =====================

document.getElementById("addRow").addEventListener("click", function () {
    const tbody = document.querySelector("#expenseTable tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><input type="text" placeholder="Particular"></td>
        <td><input type="number" class="rate" min="0"></td>
        <td><input type="number" class="qty" min="0"></td>
        <td><input type="text" class="amount" readonly></td>
        <td></td>
    `;

    tbody.appendChild(tr);
    addEvents(tr);
    updateChart();
});

// =====================
// Pie Chart
// =====================

function getCategoryAmounts() {
    const categories = {
        "Kilometer Run": 0,
        "Package": 0,
        "Toll": 0
    };

    const rows = document.querySelectorAll("#expenseTable tbody tr");
    
    rows.forEach(row => {
        const particularInput = row.querySelector('td:first-child input');
        if (!particularInput) return;
        
        const particular = particularInput.value.trim();
        const amountEl = row.querySelector('.amount');
        if (!amountEl) return;
        
        const amount = parseFloat(amountEl.value) || 0;
        
        if (categories.hasOwnProperty(particular)) {
            categories[particular] += amount;
        }
    });

    return {
        labels: Object.keys(categories),
        data: Object.values(categories)
    };
}

function initChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    const chartData = getCategoryAmounts();

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    '#22d3ee',
                    '#c026d3',
                    '#eab308'
                ],
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 15,
                            weight: '500'
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let total = context.dataset.data.reduce((a, b) => a + b, 0);
                            let percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
                            return ` ₹${context.raw.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateChart() {
    if (!expenseChart) {
        initChart();
        return;
    }
    
    const chartData = getCategoryAmounts();
    expenseChart.data.labels = chartData.labels;
    expenseChart.data.datasets[0].data = chartData.data;
    expenseChart.update();
}

// =====================
// PDF Download - Improved fit
// =====================

document.getElementById("downloadPdf").addEventListener("click", async function () {
    const { jsPDF } = window.jspdf;
    const bill = document.getElementById("billArea");

    // Temporarily adjust styles for better PDF capture
    const originalWidth = bill.style.width;
    bill.style.width = '1100px'; // Fixed width for better rendering

    const canvas = await html2canvas(bill, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true
    });

    // Restore style
    bill.style.width = originalWidth;

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    // Simple multi-page if needed
    while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
    }

    let month = document.getElementById("month").value || "Expense";
    pdf.save(`Management_Information_System_${month}.pdf`);
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Initial calculations
    calculateTotal();
    // Initialize Chart
    initChart();
    
    // Set default date
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});
