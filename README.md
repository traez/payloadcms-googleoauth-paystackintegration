# Payload CMS: Custom Google OAuth Strategy + Paystack Integration

A production-ready implementation showcasing a unified authentication architecture using **Payload CMS's native auth pipeline** with a custom Google OAuth strategy, now extended with **Paystack payment integration** for handling transactions on the frontend.

This project demonstrates how to combine authentication and payments cleanly within a single modern stack, without introducing external auth systems or fragmented payment logic.

---

## 🎯 Overview

This project extends Payload CMS's authentication system to support multiple authentication flows while integrating a seamless payment experience using Paystack.

### Architecture Highlights

- **Single User Collection**: All users (staff + customers) live in one Payload collection
- **Dual Authentication Flows**:
  - Staff: Username/password login via `/admin`
  - Customers: Google OAuth on the frontend
- **Unified Auth Pipeline**: Both flows leverage Payload's native authentication with custom strategies
- **Integrated Payments (Paystack)**: Customers can initiate and verify payments directly from the frontend
- **No External Auth Systems**: Zero dependency on Auth0, NextAuth, etc.
- **Production-Ready**: Clean, structured code following Payload best practices

---

## 💳 Paystack Integration

The project now includes a full Paystack integration designed for real-world commerce use cases.

### Features

- **Transaction Initialization**: Securely create Paystack payment sessions from the backend
- **Payment Verification**: Server-side verification of transactions to prevent tampering
- **User Linking**: Payments are associated with authenticated users (via Payload auth)
- **Extensible Order Flow**: Designed to plug into carts, orders, or subscription logic

### Flow

1. Authenticated user initiates a payment from the frontend
2. Backend endpoint creates a Paystack transaction
3. User completes payment via Paystack checkout
4. Backend verifies the transaction using Paystack API
5. Payment status is persisted (and can be tied to orders, products, etc.)

---

## 🧠 Authentication Strategy

### Google OAuth (Frontend)

- Custom OAuth strategy integrated directly into Payload
- Google acts strictly as an identity provider
- Users are created or retrieved inside the Payload User collection
- Session management handled entirely by Payload

### Traditional Auth (Admin Panel)

- Staff users authenticate via email/password
- Full access to Payload admin UI

---

## 🏗️ Tech Stack

- **Payload CMS** – Headless CMS + Auth system
- **Next.js** – Frontend application
- **PostgreSQL** – Database
- **Zustand** – Client-side state management
- **Paystack** – Payment processing
- **pnpm** – Package manager

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (or latest LTS)
- pnpm
- PostgreSQL
- Google OAuth credentials
- Paystack API keys

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/traez/payloadcms-googleoauth-paystackintegration.git
   cd payloadcms-googleoauth-paystackintegration
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file and include:

   ```env
   As stated in .env.example
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

---

## 📦 Project Goals

- Demonstrate extending Payload auth without breaking its internal pipeline
- Show how OAuth can coexist with traditional authentication cleanly
- Provide a real-world example of integrating payments (Paystack) into the same architecture
- Serve as a reference for building fullstack apps with minimal external dependencies

---

## 📌 Notes

- Paystack integration is backend-verified to ensure transaction integrity
- The architecture is flexible enough to support additional providers (Stripe, Flutterwave, etc.)
- Easily extendable for e-commerce, SaaS billing, or subscription systems

---

## 🧩 Future Improvements

- Webhook handling for Paystack events
- Order management system
- Subscription billing support
- Multi-provider OAuth (e.g., GitHub, Facebook)

---

## 📄 License

MIT

