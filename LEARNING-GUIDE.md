# Complete Login System with React, .NET, and Cosmos DB - Learning Guide

## 📚 What You'll Learn

This guide will teach you how to build a **full-stack login application** from scratch using:
- **Frontend**: React with Material-UI
- **Backend**: .NET 8 Web API with REST endpoints
- **Database**: Azure Cosmos DB (running locally in Docker)
- **Containerization**: Docker and Docker Compose

---

## 🏗️ Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │────────▶│  .NET Web API   │────────▶│   Cosmos DB     │
│  (Port 3000)    │  HTTP   │  (Port 5000)    │  SDK    │  (Port 8081)    │
│                 │◀────────│                 │◀────────│                 │
└─────────────────┘  JSON   └─────────────────┘  JSON   └─────────────────┘
```

### How It Works:

1. **User Interface (React)**:
   - User enters credentials in a login form
   - Form validates input (client-side)
   - Sends HTTP POST request to backend API

2. **API Layer (.NET Web API)**:
   - Receives login request
   - Validates credentials against database
   - Returns success/error response

3. **Database (Cosmos DB)**:
   - Stores user accounts
   - Uses NoSQL document structure
   - Provides fast querying by userId

---

## 📦 Project Structure

```
LOGIN/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API communication
│   │   └── pages/              # Application pages
│   ├── Dockerfile              # Frontend container
│   └── package.json
│
├── backend/                     # .NET Web API
│   └── LoginAPI/
│       ├── Controllers/        # API endpoints
│       ├── Models/             # Data structures
│       ├── Services/           # Business logic
│       ├── Program.cs          # App configuration
│       ├── Dockerfile          # Backend container
│       └── LoginAPI.csproj     # Project dependencies
│
├── docker-compose.yml           # Orchestrates all containers
└── LEARNING-GUIDE.md           # This file
```

---

## 🎯 Learning Path

We'll build this in **7 manageable steps**:

### **Step 1: Understanding Cosmos DB & Docker Setup** ✓ (You are here)
- Learn what Cosmos DB is
- Understand Docker containers
- Set up Cosmos DB Emulator locally

### **Step 2: Create .NET Web API Project**
- Initialize a new .NET 8 Web API
- Understand project structure
- Add necessary NuGet packages

### **Step 3: Define Data Models**
- Create User model for database
- Create request/response models
- Understand JSON serialization

### **Step 4: Implement Cosmos DB Service**
- Connect to Cosmos DB
- Create database and container
- Write CRUD operations

### **Step 5: Build Authentication API**
- Create login endpoint
- Create registration endpoint
- Handle errors properly

### **Step 6: Update React Frontend**
- Create API service layer
- Connect login form to backend
- Handle loading states and errors

### **Step 7: Docker Orchestration**
- Create docker-compose configuration
- Connect all services together
- Test the complete application

---

## 🔑 Key Concepts You'll Learn

### 1. **Cosmos DB Concepts**
- **NoSQL Database**: Document-based (like MongoDB)
- **Partition Key**: How data is distributed (`/userId`)
- **Container**: Like a table in SQL, but holds JSON documents
- **Emulator**: Local version for development (no Azure account needed)

### 2. **REST API Concepts**
- **HTTP Methods**: POST for login, GET for health checks
- **Status Codes**: 200 (OK), 401 (Unauthorized), 500 (Error)
- **CORS**: Allowing frontend to call backend from different port
- **JSON**: Data format for requests and responses

### 3. **Docker Concepts**
- **Container**: Isolated environment for your app
- **Image**: Blueprint for a container
- **Docker Compose**: Tool to run multiple containers together
- **Network**: How containers communicate with each other

### 4. **Security Concepts** ⚠️
- **Password Storage**: We'll use plain text for learning (NEVER in production!)
- **HTTPS**: Cosmos DB Emulator uses self-signed certificates
- **CORS**: Security feature browsers enforce

---

## 📝 Prerequisites

Before we start, make sure you have:

1. **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop
   - Must be running before starting containers

2. **.NET 8 SDK** (for local development/testing)
   - Download: https://dotnet.microsoft.com/download
   - Check: `dotnet --version`

3. **Node.js** (for local frontend development)
   - Download: https://nodejs.org/
   - Check: `node --version`

4. **Code Editor** (VS Code recommended)
   - Download: https://code.visualstudio.com/

---

## 🚀 Quick Start (After Setup)

Once everything is configured:

```bash
# Start all services
docker-compose up

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
Cosmos DB: https://localhost:8081/_explorer/index.html
```

---

## 📖 Next Steps

Now let's begin! 

**Current Step**: Step 1 - Understanding Cosmos DB & Docker Setup

Read [STEP-1-COSMOSDB-SETUP.md](STEP-1-COSMOSDB-SETUP.md) to continue.

---

## 🆘 Common Issues & Solutions

### Issue: Docker Desktop not running
- **Error**: "Cannot connect to Docker daemon"
- **Solution**: Start Docker Desktop application

### Issue: Port already in use
- **Error**: "Port 3000/5000/8081 is already allocated"
- **Solution**: Stop other applications using those ports

### Issue: Cosmos DB connection fails
- **Error**: "SSL certificate error"
- **Solution**: This is expected with the emulator; we handle it in code

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [.NET Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Cosmos DB Documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/)
- [Docker Documentation](https://docs.docker.com/)

---

**Ready to start? Let's begin with Step 1!** 🎉
