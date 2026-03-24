# 🔄 Your Current Pipeline Architecture

## 📊 Complete Pipeline Overview

Your code currently uses a **GitHub Actions CI/CD Pipeline** that deploys to **Azure App Service** with **Azure Container Registry**.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You write code locally:                                         │
│  ├── React Frontend                                              │
│  ├── .NET Backend                                                │
│  └── Test with Docker Compose                                    │
│       ├── Cosmos DB (Port 8081)                                  │
│       ├── Backend API (Port 5000)                                │
│       └── Frontend (Port 3000)                                   │
│                                                                  │
│  When ready → Git Push to GitHub                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        (GitHub detects push to main branch)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS CI/CD PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Checkout                                                │
│  └─ Download your code from GitHub                               │
│                                                                  │
│  Step 2: Login to Azure                                          │
│  └─ Authenticate using AZURE_CREDENTIALS secret                  │
│                                                                  │
│  Step 3: Login to Container Registry                             │
│  └─ Login to: uvaraniregistry.azurecr.io                         │
│                                                                  │
│  Step 4: Build Docker Image                                      │
│  └─ Run: docker build -t uvaraniregistry.azurecr.io/login-app    │
│                                                                  │
│  Step 5: Push to Registry                                        │
│  └─ Upload image to Azure Container Registry                     │
│                                                                  │
│  Step 6: Deploy to App Service                                   │
│  └─ Start container on: uvarani-webapp                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AZURE PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  App Service: uvarani-webapp                                     │
│  ├─ Running Docker container                                     │
│  ├─ Public URL: https://uvarani-webapp.azurewebsites.net         │
│  └─ Accessible from anywhere                                     │
│                                                                  │
│  Container Registry: uvaraniregistry                             │
│  └─ Stores Docker images (backup of every deployment)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Pipeline Components Breakdown

### 1️⃣ **GitHub Repository**
- **Location**: Your code on GitHub
- **Main Branch**: Where production code lives
- **Trigger**: Any push to `main` branch triggers pipeline

```yaml
on:
  push:
    branches:
      - main
```

### 2️⃣ **GitHub Actions (CI/CD Runner)**
- **What**: Automated workflow triggered on push
- **Where**: Runs on Ubuntu machine in GitHub cloud
- **Job**: `build-and-deploy` with 6 steps

### 3️⃣ **Azure Login**
- **Credential**: `AZURE_CREDENTIALS` (secret stored in GitHub)
- **Purpose**: Authenticate to your Azure account
- **Sensitive**: Never shown in logs

```yaml
- name: Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

### 4️⃣ **Azure Container Registry (ACR)**
- **Name**: `uvaraniregistry`
- **Role**: Stores Docker images
- **URL**: `uvaraniregistry.azurecr.io`
- **Why**: Private image storage, faster deployment

### 5️⃣ **Docker Build & Push**
- **Step 4**: Builds Docker image from your Dockerfile
- **Step 5**: Pushes to ACR
- **Result**: Image tagged as `latest`

```
Local Docker Build → Docker Image → Push to ACR
                                       ↓
                          uvaraniregistry.azurecr.io/login-app:latest
```

### 6️⃣ **Azure App Service**
- **Name**: `uvarani-webapp`
- **Type**: Container-based web app
- **Public URL**: `https://uvarani-webapp.azurewebsites.net`
- **Deployment**: Pulls latest image from ACR and runs it

---

## 📋 Complete Pipeline Flow Step-by-Step

### **Local: Make Changes**
```
1. Edit code in VS Code
   └─ frontend/src/components/LoginForm.js
   └─ backend/LoginAPI/Controllers/AuthController.cs

2. Test locally
   └─ Run: docker-compose up
   └─ Test on http://localhost:3000

3. Commit and push
   └─ git add .
   └─ git commit -m "Add new feature"
   └─ git push origin main
```

### **Automated: GitHub Actions**

```
1. GitHub detects push to main
   └─ Trigger: on.push.branches: [main]

2. Checkout code
   └─ Run: git clone your-repo

3. Authenticate
   └─ Login to Azure using AZURE_CREDENTIALS

4. Build Docker image
   └─ Read: Dockerfile in root
   └─ Build all layers
   └─ Create image: login-app:latest

5. Login to Container Registry
   └─ Connect to: uvaraniregistry.azurecr.io

6. Push image
   └─ Upload to: uvaraniregistry.azurecr.io/login-app:latest
   └─ Versioned by: timestamp (backup of every deployment)

7. Deploy to App Service
   └─ Tell Azure App Service: Use this new image
   └─ Azure pulls image and starts container
   └─ Your app goes live!
```

### **Production: Live**
```
Your App is Live
├─ URL: https://uvarani-webapp.azurewebsites.net
├─ Running in: Azure App Service container
├─ Database: Connected to Cosmos DB
└─ Accessible from: Anywhere on internet
```

---

## 🔑 Key Files in Your Pipeline

| File | Location | Purpose |
|------|----------|---------|
| `azure-deploy.yml` | `.github/workflows/` | CI/CD workflow definition |
| `Dockerfile` | Root of project | Build instructions for Docker |
| `Program.cs` | `backend/LoginAPI/` | .NET app configuration |
| `package.json` | `frontend/` | React dependencies |
| `appsettings.json` | `backend/LoginAPI/` | Backend config |

---

## 🔒 Secrets & Security

### AZURE_CREDENTIALS
- **Purpose**: Authenticate to Azure account
- **Storage**: GitHub > Settings > Secrets
- **Format**: Service Principal JSON
- **Never**: Commit to GitHub or share

```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx"
}
```

---

## 📊 Current Pipeline Structure

```
PULL REQUEST                COMMIT + PUSH                PRODUCTION
   ↓                            ↓                         ↓
DevBranch        ─────→  Main Branch   ─────→  GitHub Actions
                           (main)                     ↓
                                              Build Docker Image
                                                     ↓
                                            Push to Container Registry
                                                     ↓
                                          Deploy to Azure App Service
                                                     ↓
                                        LIVE: uvarani-webapp.azurewebsites.net
```

---

## 🚀 How Code Flows Through Pipeline

### Frontend Code Example:
```
1. You modify: frontend/src/components/LoginForm.js
2. Push: git push origin main
3. GitHub Actions detects change
4. Docker build includes changes
5. Image pushed with new code
6. App Service pulls new image
7. Container restarts with new code
8. Users see changes on https://uvarani-webapp.azurewebsites.net
```

### Backend Code Example:
```
1. You modify: backend/LoginAPI/Controllers/AuthController.cs
2. Push: git push origin main
3. GitHub Actions rebuilds with C# changes
4. Dockerfile compiles C# code (dotnet build)
5. New binary in Docker image
6. Deployed to Azure
7. API endpoints updated
8. Frontend calls new endpoints
```

---

## 📈 Pipeline Stages Visualized

```
┌────────────────────────────────────────────────────────────┐
│ STAGE 1: TRIGGER                                           │
│ Condition: Push to main branch                             │
├────────────────────────────────────────────────────────────┤
│ Time: Immediate (GitHub detects within seconds)            │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ STAGE 2: PREPARE (Checkout + Auth)                         │
│ - Clone repository                                         │
│ - Authenticate to Azure                                    │
├────────────────────────────────────────────────────────────┤
│ Time: ~30 seconds                                          │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ STAGE 3: BUILD                                             │
│ - Build Docker image (multi-stage build)                   │
│ - Compile code                                             │
├────────────────────────────────────────────────────────────┤
│ Time: ~2-5 minutes (depends on code size)                  │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ STAGE 4: PUSH                                              │
│ - Upload image to Container Registry                       │
├────────────────────────────────────────────────────────────┤
│ Time: ~1-2 minutes (depends on image size)                 │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ STAGE 5: DEPLOY                                            │
│ - Azure App Service pulls image                            │
│ - Stops old container                                      │
│ - Starts new container                                     │
├────────────────────────────────────────────────────────────┤
│ Time: ~1-2 minutes (cold start for first container)        │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│ TOTAL PIPELINE TIME: 5-10 minutes                          │
│ Result: Your changes are LIVE! 🎉                          │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pipeline Benefits

✅ **Automated**: No manual deployment needed  
✅ **Consistent**: Same steps every time  
✅ **Reliable**: Code tested before deployment  
✅ **Traceable**: Every deploy is logged  
✅ **Fast**: Changes go live in minutes  
✅ **Reversible**: Old images kept in registry  

---

## 🔄 Your Development Workflow

```
1. Feature Branch (if working on big feature)
   git checkout -b feature/new-feature

2. Code locally
   Make changes, test with docker-compose

3. Commit
   git add .
   git commit -m "Implement feature"

4. Merge to main
   git checkout main
   git merge feature/new-feature
   git push origin main

5. Pipeline runs automatically ✨
   GitHub Actions builds → Pushes → Deploys

6. Check deployment
   Visit: https://uvarani-webapp.azurewebsites.net
```

---

## 📊 Interview Answer: Your Pipeline

**When asked: "Explain your deployment pipeline"**

> "Our project uses **GitHub Actions for CI/CD** that automatically deploys to **Azure App Service**. When we push code to the main branch, GitHub Actions triggers a workflow that builds a Docker image, pushes it to **Azure Container Registry**, and deploys it to our App Service. The pipeline handles all steps automatically: checkout code, authenticate with Azure, build the Docker image, push to ACR, and deploy. This ensures consistent deployments and keeps our live app always synchronized with the latest code on the main branch."

---

## 🚀 What You Should Know

| Concept | Your Setup |
|---------|-----------|
| **VCS** | GitHub (version control) |
| **CI/CD Tool** | GitHub Actions |
| **Container Registry** | Azure Container Registry (ACR) |
| **Target Environment** | Azure App Service |
| **Deployment Frequency** | On every push to main |
| **Rollback** | Redeploy previous image from ACR |
| **Monitoring** | Azure App Service built-in |

---

## 🛠️ Current Limitations & Next Steps

### Current:
- ✅ Automatic deployment on push
- ✅ Docker containerization
- ✅ Azure cloud hosting

### Could Add:
- ⚠️ Automated tests before deployment
- ⚠️ Multiple environments (dev/staging/prod)
- ⚠️ Slack notifications on deploy
- ⚠️ Load balancing for high traffic
- ⚠️ Separate backend API deployment

---

**Ready to understand any specific part of the pipeline in detail?** 🚀
