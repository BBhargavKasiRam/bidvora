const fs = require("fs");
const path = require("path");

async function test() {
  try {
    // 1. Login
    const loginRes = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "seller1@example.com", password: "password" })
    });
    const loginData = await loginRes.json();
    console.log("Login user:", loginData.user);
    if (!loginData.token) {
      console.error("Login failed!", loginData);
      return;
    }
    const token = loginData.token;

    // 2. Create FormData
    const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    
    // We'll use the native Node fetch with FormData
    const formData = new FormData();
    formData.append("name", "Test Seller");
    formData.append("email", "seller1@example.com");
    // Append file
    const file = new File([buffer], "test.png", { type: "image/png" });
    formData.append("profile_image", file);

    console.log("Sending PUT request to /api/auth/profile...");
    const putRes = await fetch("http://127.0.0.1:5000/api/auth/profile", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const putData = await putRes.json();
    console.log("PUT Response:", putRes.status, putData);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
