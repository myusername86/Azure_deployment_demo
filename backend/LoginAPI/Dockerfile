# Multi-stage build for ASP.NET Core Web API
# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file
COPY ["LoginAPI.csproj", "./"]

# Restore dependencies
RUN dotnet restore "LoginAPI.csproj"

# Copy source code
COPY . .

# Build the application
RUN dotnet build "LoginAPI.csproj" -c Release -o /app/build

# Stage 2: Publish stage
FROM build AS publish
RUN dotnet publish "LoginAPI.csproj" -c Release -o /app/publish

# Stage 3: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published files from publish stage
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 5000
EXPOSE 5001

# Set environment variable
ENV ASPNETCORE_URLS=http://+:5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD dotnet /app/LoginAPI.dll --version || exit 1

# Run the application
ENTRYPOINT ["dotnet", "LoginAPI.dll"]
