# Step 2: Create .NET Web API Backend

## 🎯 Learning Objectives

By the end of this step, you'll understand:
- ASP.NET Core Web API structure
- How to create a REST API with C#
- Dependency injection and configuration
- How to connect to Cosmos DB from .NET
- Multi-stage Docker builds

---

## 📚 Understanding ASP.NET Core Web API

**ASP.NET Core** is Microsoft's modern framework for building:
- REST APIs
- Web applications
- Microservices
- Real-time applications

### Why ASP.NET Core?
- ✅ High performance (one of the fastest frameworks)
- ✅ Cross-platform (Windows, Linux, macOS)
- ✅ Built-in dependency injection
- ✅ Integrated logging and configuration
- ✅ Excellent Docker support

---

## 🏗️ Project Structure

```
backend/
└── LoginAPI/
    ├── Controllers/          # API endpoints
    │   └── AuthController.cs
    ├── Models/               # Data structures
    │   ├── User.cs
    │   ├── LoginRequest.cs
    │   └── LoginResponse.cs
    ├── Services/             # Business logic
    │   ├── ICosmosDbService.cs
    │   └── CosmosDbService.cs
    ├── Program.cs            # App configuration & startup
    ├── appsettings.json      # Configuration settings
    ├── LoginAPI.csproj       # Project file with dependencies
    ├── Dockerfile            # Docker configuration
    └── .dockerignore         # Files to exclude from Docker image
```

---

## 🐳 Understanding the Dockerfile

The Dockerfile we created uses a **multi-stage build** approach:

```dockerfile
# Stage 1: BUILD
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
├─ Large image (~2GB)
├─ Contains compiler and build tools
└─ Used to compile C# code to binary

# Stage 2: PUBLISH
FROM build AS publish
├─ Copies binaries from build stage
└─ Optimizes for production

# Stage 3: RUNTIME
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
├─ Small image (~200MB)
├─ Only contains runtime, no build tools
└─ Final image that runs your app
```

### Why Multi-Stage?
- **Single Stage**: Final image = 2GB (includes compiler)
- **Multi-Stage**: Final image = 200MB (only runtime)
- **Benefit**: 10x smaller image, faster deployment!

---

## 🔧 What Each Part Does

### Stage 1: Build
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["LoginAPI.csproj", "./"]
RUN dotnet restore "LoginAPI.csproj"
COPY . .
RUN dotnet build "LoginAPI.csproj" -c Release -o /app/build
```

**What happens**:
1. Use .NET 8 SDK image (includes compiler)
2. Set working directory
3. Copy project file
4. Download dependencies (`restore`)
5. Copy all source code
6. Compile to binary (`build`)

### Stage 2: Publish
```dockerfile
FROM build AS publish
RUN dotnet publish "LoginAPI.csproj" -c Release -o /app/publish
```

**What happens**:
1. Takes output from build stage
2. Optimizes for production (removes debug symbols, etc.)
3. Creates deployment package

### Stage 3: Runtime
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
EXPOSE 5001
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "LoginAPI.dll"]
```

**What happens**:
1. Use lightweight ASP.NET runtime image
2. Copy published binaries (only what's needed)
3. Expose ports for HTTP/HTTPS
4. Configure environment
5. Start your application

---

## 🚀 Building the Docker Image

### Step 1: Navigate to Backend Folder
```powershell
cd d:\lEARN\LOGIN\backend\LoginAPI
```

### Step 2: Build the Image
```powershell
docker build -t login-api:latest .
```

**What this does**:
- Reads Dockerfile in current directory
- Executes all stages
- Creates image named `login-api` with tag `latest`
- Takes 2-5 minutes first time (slower because downloading SDK)

**Expected Output**:
```
[+] Building 2.3s (13/13) FINISHED

=> naming to docker.io/library/login-api:latest
```

### Step 3: Verify the Image
```powershell
docker images
```

**Expected Output**:
```
REPOSITORY     TAG         SIZE
login-api      latest      200MB
mcr.microsoft.../aspnet    8.0    190MB
```

---

## ✅ Testing the Image

### Start the Container
```powershell
docker run -p 5000:5000 login-api:latest
```

**Expected Output**:
```
info: Microsoft.AspNetCore.Hosting.Diagnostics
      Now listening on: http://0.0.0.0:5000
```

### Test the API
Open another PowerShell:
```powershell
curl http://localhost:5000/api/auth/health
```

**Expected Output**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-24T10:30:00Z"
}
```

### Stop the Container
```powershell
# Press Ctrl+C in the running terminal
# Or run in new terminal:
docker stop $(docker ps -q)
```

---

## 📝 Important Dockerfile Concepts

### 1. .dockerignore
```
bin/
obj/
*.user
```

**Why?** Don't include unnecessary files in image (smaller size, faster build)

### 2. EXPOSE Ports
```dockerfile
EXPOSE 5000
EXPOSE 5001
```

**What?** Documents which ports the app uses. Doesn't actually open them - that's done with `-p` flag.

### 3. HEALTHCHECK
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl http://localhost:5000/api/auth/health
```

**Why?** Docker can automatically restart unhealthy containers

### 4. Environment Variables
```dockerfile
ENV ASPNETCORE_URLS=http://+:5000
```

**What?** Sets how ASP.NET listens for requests (`:5000` on all interfaces)

### 5. ENTRYPOINT vs CMD

- **ENTRYPOINT**: Command to always run
- **CMD**: Default arguments (can be overridden)

We use `ENTRYPOINT` so the application always starts correctly.

---

## 🎯 Common Docker Commands for Backend

| Command | Purpose |
|---------|---------|
| `docker build -t login-api:latest .` | Build image |
| `docker run -p 5000:5000 login-api:latest` | Run container |
| `docker ps` | See running containers |
| `docker logs <container-id>` | View container logs |
| `docker stop <container-id>` | Stop container |
| `docker rm <container-id>` | Delete container |
| `docker rmi login-api:latest` | Delete image |

---

## 🔍 Troubleshooting

### Build fails with "dotnet not found"
- **Cause**: Not using correct .NET SDK image
- **Solution**: Verify `FROM mcr.microsoft.com/dotnet/sdk:8.0`

### Container starts but exits immediately
- **Cause**: Application crash
- **Solution**: Check logs: `docker logs <container-id>`

### Port 5000 already in use
- **Cause**: Another container/app using port
- **Solution**: Use different port: `docker run -p 5001:5000 login-api:latest`

### Large image size (> 500MB)
- **Cause**: Single-stage build or including extra files
- **Solution**: Use multi-stage build, update .dockerignore

---

## 📋 Step 2 Summary

✅ You now understand:
- ASP.NET Core Web API structure
- Multi-stage Docker builds
- How to build and run Docker images
- Dockerfile best practices

✅ You can:
- Build the backend Docker image
- Run the container locally
- Test the health check endpoint

---

## 🎯 Next Steps

**Current**: ✅ Step 2 - Docker File for Backend Created

**Next**: Step 3 - Create .NET API Models and Services

In Step 3, we'll:
- Create User model for database
- Create Login/Register request and response models
- Set up Cosmos DB connection service
- Implement database operations

Ready? Let me know! 🚀

---

## 💡 Interview Tip

When asked about Docker:

> "Docker containerization allows us to package our ASP.NET Core API with all its dependencies into a single image. Using multi-stage builds, we reduce the final image from 2GB to just 200MB by excluding build tools from the runtime. This makes deployment faster and more efficient. In production, Docker enables consistent behavior across development, testing, and production environments."

