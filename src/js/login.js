import { saveToken } from "./auth.js";

const API = "http://localhost:3000";

window.login = async function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        document.getElementById("error").innerText = "Login failed";
        return;
    }

    saveToken(data.token);

    window.location.href = "/dashboard.html";
};