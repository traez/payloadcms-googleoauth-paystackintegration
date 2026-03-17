# Payload CMS: Custom Google OAuth Strategy for Frontend Authentication

A production-ready implementation showcasing a unified authentication architecture using **Payload CMS's native auth pipeline** with a custom Google OAuth strategy. This enables customer authentication via Google on the frontend while maintaining traditional username/password authentication for staff in the admin panel—all within a single User collection.

## 🎯 Overview

This project demonstrates how to extend Payload CMS's authentication system to support multiple authentication flows without introducing a separate auth system. The architecture keeps everything inside Payload's auth pipeline, using OAuth as an identity provider rather than a parallel authentication layer.

### Architecture Highlights

- **Single User Collection**: All users (staff + customers) live in one Payload collection
- **Dual Authentication Flows**: 
  - Staff: Username/password login via `/admin`
  - Customers: Google OAuth on the frontend
- **Unified Auth Pipeline**: Both flows leverage Payload's native authentication with custom strategies
- **No External Auth Systems**: Zero dependency on external auth providers (Auth0, NextAuth, etc.)
- **Production-Ready**: Clean, linted code following Payload best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (or latest LTS)
- pnpm
- PostgreSQL
- Google OAuth credentials

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/traez/payloadcms-custom-google-oauth-strategy-frontend.git
   cd payloadcms-custom-google-oauth-strategy-frontend