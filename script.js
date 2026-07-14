// =============================
// Travel Bill Summary
// script.js
// =============================

// Attach calculation events
function attachEvents(row) {

    const rate = row.querySelector(".rate");
    const qty = row.querySelector(".qty");

    rate.addEventListener("input", calculateRow);
    qty.addEventListener("input", calculateRow);

}

document.querySelectorAll("#expenseTable tbody tr").forEach(attachEvents);

// Calculate one row
function calculateRow(e){

    const row = e.target.closest("tr");

    const rate = parseFloat(row.querySelector(".rate").value) || 0;
    const qty = parseFloat(row.querySelector(".qty").value) || 0;

    row.querySelector(".amount").value = (rate * qty).toFixed(2);

    calculateTotal();

}

// Calculate Total
function calculateTotal(){

    let total = 0;

    document.querySelectorAll(".amount").forEach(item=>{

        total += parseFloat(item.value) || 0;

    });

    document.getElementById("total").value = total.toFixed(2);

    calculateBalance();

}

// Balance Due
function calculateBalance(){

    const total = parseFloat(document.getElementById("total").value) || 0;

    const advance = parseFloat(document.getElementById("advance").value) || 0;

    document.getElementById("balance").value = (total - advance).toFixed(2);

}

document.getElementById("advance")
.addEventListener("input",calculateBalance);

// =====================
// Add Row
// =====================

document.getElementById("addRow")
.addEventListener("click",()=>{

    const tbody = document.querySelector("#expenseTable tbody");

    const tr = document.createElement("tr");

    tr.innerHTML = `

<td>
<input type="text" placeholder="Particular">
</td>

<td>
<input class="rate" type="number">
</td>

<td>
<input class="qty" type="number">
</td>

<td>
<input class="amount" readonly>
</td>

<td>
<button class="delete-btn">
❌
</button>
</td>

`;

    tbody.appendChild(tr);

    attachEvents(tr);

    tr.querySelector(".delete-btn")
    .addEventListener("click",()=>{

        tr.remove();

        calculateTotal();

    });

});

// =====================
// Download PDF
// =====================

document.getElementById("downloadPdf")
.addEventListener("click",downloadPDF);

async function downloadPDF(){

    const { jsPDF } = window.jspdf;

    const bill = document.getElementById("billArea");

    const canvas = await html2canvas(bill,{

        scale:2,

        useCORS:true,

        backgroundColor:"#ffffff"

    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({

        orientation:"portrait",

        unit:"mm",

        format:"letter"

    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 10;

    const imgHeight = canvas.height * imgWidth / canvas.width;

    let heightLeft = imgHeight;

    let position = 5;

    pdf.addImage(

        imgData,

        "PNG",

        5,

        position,

        imgWidth,

        imgHeight,

        "",

        "FAST"

    );

    heightLeft -= pageHeight;

    while(heightLeft > 0){

        position = heightLeft - imgHeight + 5;

        pdf.addPage();

        pdf.addImage(

            imgData,

            "PNG",

            5,

            position,

            imgWidth,

            imgHeight,

            "",

            "FAST"

        );

        heightLeft -= pageHeight;

    }

    let month = document.getElementById("month").value;

    if(month==""){

        month="Travel";

    }

    pdf.save("Travel_Bill_Summary_"+month+".pdf");

}

// Initial calculation
calculateTotal();
