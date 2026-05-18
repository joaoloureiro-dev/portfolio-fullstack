# 🚀 João Loureiro | Professional Portfolio & Admin Dashboard

<div align="center">
  <img src="./frontend/public/favicon.ico" alt="Logo" width="80" height="80" />
  
  <h3>Fullstack Developer Portfolio with Secure Admin Analytics</h3>
  
  <p align="center">
    <a href="https://vercel.com" target="_blank"><img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
    <a href="https://railway.app" target="_blank"><img src="https://img.shields.io/badge/Backend-Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" /></a>
    <a href="https://github.com/o-teu-utilizador/o-teu-repositorio/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/badge/License-MIT-05b174?style=for-the-badge" alt="MIT License" /></a>
  </p>
</div>

---

## 📷 Project Preview

<div align="center">
  <img src="./frontend/src/assets/images/og-image.jpg" alt="Portfolio Preview" width="100%" style="border-radius: 10px; border: 1px solid #1f1f1f;" />
</div>

---

## 📝 About the Project

This project features a high-performance **Custom Portfolio Website** coupled with a secure **Private Administration Panel (Dashboard)** containing real-time analytical metrics.

The entire application was designed with a strong focus on **speed, security, and exceptional User Experience (UX)**. The ecosystem is split into a trilingual public Landing Page (PT, EN, ES) shielded against automatic engine translation breaks, and a restricted administrative area where the owner can manage leads, analyze traffic data using Google Analytics 4, and audit security logs.

---

## 🛠️ Tech Stack

The architecture follows a decoupled structure using modern and reliable technologies:

### **Frontend**
* **React 19 & TypeScript:** Build-time safety, rigid type definitions, and reactive component lifecycles.
* **Tailwind CSS v4:** Global advanced styling utilizing the new `@theme` directive mapping and the **Inter** typeface for a corporate *Clean Tech* look.
* **React Router DOM v6:** Client-side dynamic routing, deep-linking, and role-based route guard restrictions (`ProtectedRoute`).
* **Cloudflare Turnstile (`@marsidev/react-turnstile`):** Non-intrusive, smart bot challenge protection directly integrated into the contact form.
* **React GA4:** Native Google Analytics 4 integration tracking dynamic route transitions.
* **Sonner:** Clean, elegant, non-obtrusive notification toast system.

### **Backend & Database**
* **Fastify:** Ultra-low latency, blazing-fast HTTP framework built for quick response times and secure route parsing.
* **PostgreSQL:** Reliable relational database storing structural user inquiries and project requests.

---

## 🚀 Key Features

<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN6cmRtc2I4NzN0d3VkaWZyeWtzYm9qdnd6M3k4ZnM0NWhid3B3MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE1YN7aBOFPRw8E/giphy.gif" alt="Features Slideshow" width="100%" style="border-radius: 10px;" />
  <p><i>Live feature simulation: Multilingual switching, Turnstile validation, and the Analytics Dashboard.</i></p>
</div>

1. **Integrated Real-Time Analytics:** Fully configured with Google Analytics 4 (`react-ga4`) to capture user insights, route transitions, and conversion rates seamlessly.
2. **Break-Proof Layout Translation:** Native integration with the Google Translate Widget assisted by static code markers (`notranslate` / `translate="no"`) preventing layout shifting or technical word mistranslation (*Stacks*, *Legal Text*).
3. **GDPR Compliance:** Fully compliant trilingual Cookie Consent Banner with state handling and an elegant, modern Privacy Policy Modal linked straight to the footer.
4. **Military-Grade Form Security:** Submissions are validated through a strict two-step verification layer (Cloudflare Turnstile token validation on the client-side + secure server-side verification hook on Fastify).
5. **Role-Based Admin Access:** Restricted dashboards (`allowedRoles: ['admin']`) managing user requests, tracking logs, and analytical metrics.

---

## 🌐 Deploy and Infrastructure

The production pipelines are designed to maintain **Zero Downtime** and low operational overhead:

* **Frontend (Vercel):** Hosted on Vercel's global Edge Network. Engineered with custom cache invalidation layers and full compression on static assets (`src/assets/images`).
* **Backend & Database (Railway):** The Fastify environment and the PostgreSQL database cluster run on isolated cloud containers on Railway, safely handling secure environment variables (`TURNSTILE_SECRET_KEY`, `JWT_SECRET`, etc.).

---

## 💻 Local Development Setup

### **Prerequisites**
* Node.js (v18 or higher)
* NPM / PNPM
* A running instance of PostgreSQL (local or cloud-hosted)

### **1. Clone the Repository**
```bash
git clone [https://github.com/o-teu-utilizador/o-teu-repositorio.git](https://github.com/o-teu-utilizador/o-teu-repositorio.git)
cd o-teu-repositorio