
// LOAD FAQs
async function loadFAQs() {

    try {
        const res = await fetch("/faqs");
        const data = await res.json();

        const container = document.getElementById("faqList");

        if (!container) {
            console.error("faqList element not found");
            return;
        }

        container.innerHTML = "";

        data.forEach((item, index) => {

            container.innerHTML += `
                <div class="faq-item">
                    <p>
                        <b>Keywords:</b> 
                        ${item.keywords.map(k => `<span class="tag">${k}</span>`).join("")}
                    </p>

                    <p><b>Answer:</b> ${item.answer}</p>

                    <div class="faq-actions">
                        <button onclick="deleteFAQ(${index})">Delete</button>
                        <button onclick="editFAQ(${index})">Edit</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error loading FAQs:", err);
    }
}


// ADD FAQ
async function addFAQ() {

    const keywords = document
        .getElementById("keywords")
        .value
        .split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => k !== "");

    const answer = document.getElementById("answer").value;

    if (keywords.length === 0 || !answer.trim()) {
        alert("Please fill all fields");
        return;
    }

    await fetch("/faqs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ keywords, answer })
    });
    
    alert("FAQ added successfully!");

    document.getElementById("keywords").value = "";
    document.getElementById("answer").value = "";

    loadFAQs();
}


// DELETE FAQ
async function deleteFAQ(index) {

    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    await fetch(`/faqs/${index}`, {
        method: "DELETE"
    });

    loadFAQs();
}


// EDIT (OPEN MODAL)
let currentEditIndex = null;

async function editFAQ(index) {

    currentEditIndex = index;

    const res = await fetch("/faqs");
    const data = await res.json();

    const item = data[index];

    document.getElementById("editKeywords").value = item.keywords.join(", ");
    document.getElementById("editAnswer").value = item.answer;

    document.getElementById("editModal").style.display = "flex";
}


// UPDATE FAQ
async function updateFAQ() {

    const newKeywords = document
        .getElementById("editKeywords")
        .value
        .split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => k !== "");

    const newAnswer = document.getElementById("editAnswer").value;

    if (newKeywords.length === 0 || !newAnswer.trim()) {
        alert("Please fill all fields");
        return;
    }

    await fetch(`/faqs/${currentEditIndex}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            keywords: newKeywords,
            answer: newAnswer
        })
    });

    closeModal();
    loadFAQs();
}


// CLOSE MODAL
function closeModal() {
    document.getElementById("editModal").style.display = "none";
}


// SEARCH FAQ
function searchFAQ() {

    const input = document.getElementById("searchInput").value.toLowerCase();
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const text = item.innerText.toLowerCase();

        if (text.includes(input)) {
            item.style.display = "block";
            item.style.background = "#f1f2f6";
        } else {
            item.style.display = "none";
        }

        if (input === "") {
            item.style.display = "block";
            item.style.background = "";
        }
    });
}


// LOAD ON START (FIXED)
window.onload = function () {
    loadFAQs();
};