import { getRequests, updateStatus } from "./api.js";
import { getToken } from "./auth.js";

const token = getToken();

async function loadRequests() {
    const data = await getRequests(token);

    const container = document.getElementById("requests");

    container.innerHTML = data.map(req => `
        <div class="card">
            <h3>${req.name}</h3>
            <p>${req.email}</p>
            <p>${req.service}</p>

            <select onchange="changeStatus(${req.id}, this.value)">
                <option value="pending" ${req.status === "pending" ? "selected" : ""}>Pending</option>
                <option value="in_progress" ${req.status === "in_progress" ? "selected" : ""}>In Progress</option>
                <option value="done" ${req.status === "done" ? "selected" : ""}>Done</option>
            </select>
        </div>
    `).join("");
}

window.changeStatus = async (id, status) => {
    await updateStatus(id, status, token);
    loadRequests();
};

loadRequests();