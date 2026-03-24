# Step 3: Backend Deployment Pipeline

## 🎯 Learning Objectives

By the end of this step, you'll understand:
- GitHub Actions workflow creation
- Separate CI/CD pipelines for microservices
- Environment variables and secrets management
- Azure Container Instances deployment
- Health checks and monitoring

---

## 📚 What is backend-deploy.yml?

A **GitHub Actions workflow file** that automatically:
1. Detects changes to backend code
2. Builds Docker image for .NET API
3. Pushes to Azure Container Registry
4. Deploys to Azure Container Instances
5. Verifies health of the deployment

---

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────┐
│  Frontend Deployment (azure-deploy.yml) │
│  Deploys React app to App Service       │
│  Triggers on: changes in frontend/      │
└─────────────────────────────────────────┘
         (Separate pipeline)

┌─────────────────────────────────────────┐
│  Backend Deployment (backend-deploy.yml)│
│  Deploys .NET API to Container Instance │
│  Triggers on: changes in backend/       │
└─────────────────────────────────────────┘
```

### Why Separate Pipelines?

✅ **Independent Deployments**: Deploy backend without touching frontend  
✅ **Parallel Builds**: Both can build simultaneously  
✅ **Faster Feedback**: Smaller builds are quicker  
✅ **Cleaner Logs**: Easy to find which pipeline failed  
✅ **Scalability**: Different resources for different services  

---

## 🔄 Workflow Triggers

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'
  workflow_dispatch:
```

### Trigger Rules:

**Automatic (On Push)**:
- When you push to `main` branch
- AND changes include files in `backend/` directory
- OR changes to this workflow file itself

**Manual (workflow_dispatch)**:
- Click "Run workflow" in GitHub UI
- Manually trigger builds on-demand

---

## 📊 10-Step Deployment Process

### **Step 1: Checkout Code**
```yaml
- name: Checkout code
  uses: actions/checkout@v3
```
**What**: Clone your repository onto GitHub Actions runner  
**Why**: Need your source code to build

---

### **Step 2: Setup Docker Buildx**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v2
```
**What**: Enhanced Docker build tool with caching  
**Why**: Faster builds through layer caching

---

### **Step 3: Login to Azure**
```yaml
- name: Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```
**What**: Authenticate using Service Principal  
**Where**: Stored in GitHub → Settings → Secrets  
**Security**: Never exposed in logs

---

### **Step 4: Login to Container Registry**
```yaml
- name: Login to Container Registry
  run: |
    az acr login --name uvaraniregistry
```
**What**: Authenticate to Azure Container Registry (ACR)  
**Why**: Permission to push Docker images

---

### **Step 5: Build Docker Image**
```yaml
- name: Build Docker image
  working-directory: ./backend/LoginAPI
  run: |
    docker build \
      -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
      -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
      .
```

**Tags Created**:
```
uvaraniregistry.azurecr.io/login-api:latest     ← Latest version
uvaraniregistry.azurecr.io/login-api:abc1234    ← Commit hash (immutable)
```

**Why Two Tags?**
- `:latest` → Always points to newest build
- `:commit-sha` → Immutable reference (for rollbacks)

---

### **Step 6: Push to Container Registry**
```yaml
- name: Push Docker image to ACR
  run: |
    docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

**What**: Upload image to Azure  
**Size**: ~200MB (multi-stage build benefit!)  
**Time**: 1-2 minutes depending on internet

---

### **Step 7: Deploy to Azure Container Instances**
```yaml
- name: Deploy to Azure Container Instances
  run: |
    az container create \
      --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
      --name ${{ env.CONTAINER_INSTANCE_NAME }} \
      --image ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
      --ports 5000 \
      --environment-variables \
        ASPNETCORE_ENVIRONMENT=Production \
        CosmosDb__Endpoint=${{ secrets.COSMOSDB_ENDPOINT }} \
        CosmosDb__Key=${{ secrets.COSMOSDB_KEY }} \
      --cpu 1 \
      --memory 1 \
      --no-wait
```

**What**: Create/update container in Azure  
**Configuration**:
- Resource Group: Container organization
- Container name: `login-api-container`
- Port: 5000 (API listening port)
- Environment: Production
- Cosmos DB credentials passed as environment variables

**--no-wait**: Returns immediately (deployment continues in background)

---

### **Step 8: Get Container Details**
```yaml
- name: Get Container Instance details
  run: |
    az container show \
      --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
      --name ${{ env.CONTAINER_INSTANCE_NAME }} \
      --query "{FQDN:ipAddress.fqdn, Ports:ipAddress.ports}" \
      --output table
```

**What**: Display where your API is deployed  
**Output**: FQDN (URL) and ports

---

### **Step 9: Health Check**
```yaml
- name: Health check
  run: |
    sleep 30
    curl -f http://${{ env.CONTAINER_INSTANCE_NAME }}...../api/auth/health
  continue-on-error: true
```

**What**: Call `/api/auth/health` endpoint  
**Why**: Verify API responded correctly  
**sleep 30**: Wait for container to start  
**continue-on-error**: Don't fail if check fails initially

---

### **Step 10: Deployment Summary**
```yaml
- name: Deployment Summary
  run: |
    echo "=== Backend Deployment Complete ==="
    echo "Image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest"
    echo "Tag: ${{ github.sha }}"
    echo "Container: ${{ env.CONTAINER_INSTANCE_NAME }}"
```

**What**: Print deployment details for reference

---

## 🔐 Required Secrets

Add these to GitHub → Settings → Secrets and variables → Actions:

```
AZURE_CREDENTIALS         # Service Principal JSON (from Azure)
REGISTRY_USERNAME         # ACR login username
REGISTRY_PASSWORD         # ACR login password
COSMOSDB_ENDPOINT         # Cosmos DB endpoint URL
COSMOSDB_KEY              # Cosmos DB primary key
AZURE_REGION              # Azure region (e.g., eastus)
```

### How to Set Secrets:

1. Go to: https://github.com/myusername86/Azure_deployment_demo/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with exact names above

---

## 📈 Complete Pipeline Flow

```
┌──────────────────────────────────────┐
│  You push backend code to main        │
│  git push origin main                 │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  GitHub detects push to backend/      │
│  Checks: Are there backend changes?   │
└──────────────────────────────────────┘
                ↓ (Yes)
┌──────────────────────────────────────┐
│  STEP 1-2: Prepare                    │
│  Checkout code, setup Docker          │
│  Time: ~10 seconds                    │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 3-4: Authenticate               │
│  Login to Azure & Container Registry  │
│  Time: ~5 seconds                     │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 5: Build                        │
│  docker build (multi-stage)           │
│  Output: 200MB Docker image           │
│  Time: ~2-5 minutes                   │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 6: Push to ACR                  │
│  Upload to Azure Container Registry   │
│  Time: ~1-2 minutes                   │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 7: Deploy                       │
│  Create/update Container Instance     │
│  Pass Cosmos DB credentials           │
│  Time: ~2-3 minutes                   │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 8: Get Details                  │
│  Display container URL & ports        │
│  Time: ~1 second                      │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 9: Health Check                 │
│  Call /api/auth/health endpoint       │
│  Verify API is responding             │
│  Time: ~30 seconds                    │
└──────────────────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  STEP 10: Summary                     │
│  Print deployment details             │
│  Pipeline Complete! ✨                │
│  Total Time: ~6-10 minutes            │
└──────────────────────────────────────┘
```

---

## 🎯 Environment Variables Used

```yaml
env:
  REGISTRY: uvaraniregistry.azurecr.io        # Your container registry
  IMAGE_NAME: login-api                       # Image name
  AZURE_RESOURCE_GROUP: myResourceGroup       # Azure resource group
  CONTAINER_INSTANCE_NAME: login-api-container # Container name
```

These are referenced using: `${{ env.REGISTRY }}`

---

## 🚀 Deploying Cosmos DB Credentials

**Important**: Never hardcode secrets in code!

```yaml
--environment-variables \
  CosmosDb__Endpoint=${{ secrets.COSMOSDB_ENDPOINT }} \
  CosmosDb__Key=${{ secrets.COSMOSDB_KEY }} \
```

**How .NET Reads These**:
```csharp
// Program.cs
var endpoint = configuration["CosmosDb:Endpoint"];
var key = configuration["CosmosDb:Key"];
```

Note: `__` (double underscore) in environment variables maps to `:` (colon) in configuration!

---

## 📊 Multiple Deployments Strategy

```
PUSH TO MAIN
     ↓
┌─ Frontend Check: Changed in frontend/?
│  ↓
│  YES → Run: azure-deploy.yml
│         Deploy React App
│         Target: Azure App Service
│         URL: uvarani-webapp.azurewebsites.net
│
└─ Backend Check: Changed in backend/?
   ↓
   YES → Run: backend-deploy.yml
         Deploy .NET API
         Target: Azure Container Instances
         URL: login-api-container.<region>.azurecontainer.io:5000
```

**Result**: Independent, parallel deployments!

---

## 🔍 Monitoring & Troubleshooting

### View Pipeline Logs:
1. GitHub → Actions → backend-deploy.yml
2. Click latest run
3. Expand each step to see logs

### Common Issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Missing .csproj | Check backend/LoginAPI/ path |
| Push fails | Invalid ACR credentials | Update GitHub secrets |
| Deploy fails | Missing Cosmos DB secrets | Add to GitHub secrets |
| Health check fails | Container not ready | Wait longer (30 sec might not be enough) |
| API unreachable | Firewall rules | Check Azure network settings |

---

## 📋 Step 3 Summary

✅ You now understand:
- GitHub Actions workflow structure
- Separate CI/CD for microservices
- Environment variables and secrets
- Azure Container Instances deployment
- Health checks and rollback strategy

✅ You can:
- Create new workflow files
- Configure deployment pipelines
- Manage secrets securely
- Monitor deployments

---

## 🎯 Next Steps

**Current**: ✅ Step 3 - Backend Deployment Pipeline Created

**Next Considerations**:
- Add frontend-only pipeline (similar to backend)
- Implement database migrations on deploy
- Add notifications (Slack, email)
- Set up monitoring & alerts
- Implement automated rollbacks

---

## 🎤 Interview Answer

**When asked: "Explain your CI/CD pipeline"**

> "We have separate GitHub Actions workflows for frontend and backend. When we push to main, GitHub detects which services changed and triggers the appropriate workflow. For the backend, it builds a multi-stage Docker image, pushes to Azure Container Registry, and deploys to Azure Container Instances with environment variables for configuration. We use secrets management for sensitive data like database credentials, and include health checks to verify deployments succeeded."

---

## 🔗 Related Files

- [azure-deploy.yml](.github/workflows/azure-deploy.yml) - Frontend deployment
- [backend-deploy.yml](.github/workflows/backend-deploy.yml) - Backend deployment (this file)
- [Dockerfile](backend/LoginAPI/Dockerfile) - Docker configuration
- [CURRENT-PIPELINE.md](CURRENT-PIPELINE.md) - Pipeline overview

