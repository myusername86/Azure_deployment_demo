# Step 1: Understanding Cosmos DB & Docker Setup

## 🎯 Learning Objectives

By the end of this step, you'll understand:
- What Cosmos DB is and why we're using it
- How Docker containers work
- How to run Cosmos DB locally without Azure
- How to verify your setup is working

---

## 📚 What is Azure Cosmos DB?

**Cosmos DB** is Microsoft's NoSQL database service. Think of it like this:

### Traditional SQL Database:
```
Users Table:
┌────┬────────┬──────────┬───────────────────┐
│ ID │ UserId │ Password │ Email             │
├────┼────────┼──────────┼───────────────────┤
│ 1  │ john   │ pass123  │ john@example.com  │
│ 2  │ sarah  │ pass456  │ sarah@example.com │
└────┴────────┴──────────┴───────────────────┘
```

### Cosmos DB (NoSQL):
```json
// Document 1
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "john",
  "password": "pass123",
  "email": "john@example.com",
  "createdAt": "2026-03-10T10:00:00Z"
}


// Document 2
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "sarah",
  "password": "pass456",
  "email": "sarah@example.com",
  "fullName": "Sarah Smith"
}
```

### Key Differences:
- **Flexible Schema**: Each document can have different fields
- **JSON Format**: Data stored as JSON (JavaScript Object Notation)
- **Partition Key**: Data distributed across servers for speed
- **Global Distribution**: Can replicate worldwide (not needed for us)

---

## 🐳 Why Docker?

Docker lets you run applications in **containers** - isolated environments with everything they need.

### Without Docker:
```
Your Computer
├── Install Cosmos DB ❌ (Complex)
├── Install .NET 8 ❌ (Version conflicts)
├── Install Node.js ❌ (Different versions)
└── Configure everything ❌ (Time-consuming)
```

### With Docker:
```
Your Computer (Only needs Docker Desktop)
├── Container 1: Cosmos DB ✅
├── Container 2: .NET API ✅
└── Container 3: React App ✅
```

**Benefits**:
- ✅ Clean installation (no conflicting software)
- ✅ Same environment everywhere
- ✅ Easy to start/stop/delete
- ✅ All configuration in one file

---

## 🔧 Step 1.1: Verify Docker Installation

Open PowerShell and run:

```powershell
docker --version
docker-compose --version
```

**Expected Output**:
```
Docker version 24.x.x, build xxxxx
Docker Compose version v2.x.x
```

**If you see errors**: 
- Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Make sure Docker Desktop is running (check system tray)

---

## 🗃️ Step 1.2: Understanding Cosmos DB Emulator

The **Cosmos DB Emulator** is a local version of Azure Cosmos DB that:
- Runs completely on your machine
- Doesn't require Azure account or internet
- Provides same API as real Cosmos DB
- Perfect for learning and development

### Important Details:

**Default Connection Settings**:
```json
{
  "Endpoint": "https://localhost:8081",
  "Key": "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
}
```

**Note**: This key is the **standard emulator key** - it's public and only works locally. Same key for everyone!

---

### 📍 Where Do These Settings Go in Your Program?

These connection settings will be configured in **3 places** depending on what you're running:

#### **1️⃣ .NET Backend API - appsettings.json**

When we create the .NET Web API (Step 2), you'll add these to your configuration file:

```json
// backend/LoginAPI/appsettings.json
{
  "CosmosDb": {
    "Endpoint": "https://localhost:8081",
    "Key": "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
    "DatabaseName": "LoginDB",
    "ContainerName": "Users"
  }
}
```

**How .NET uses it**:
```csharp
// Program.cs - reads from appsettings.json
var cosmosDbSettings = builder.Configuration.GetSection("CosmosDb");
var endpoint = cosmosDbSettings["Endpoint"];
var key = cosmosDbSettings["Key"];

// Create CosmosClient with these settings
var cosmosClient = new CosmosClient(endpoint, key);
```

---

#### **2️⃣ Docker Environment Variables - docker-compose.yml**

When running in Docker containers (Step 7), these settings are passed as environment variables:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CosmosDb__Endpoint=https://cosmosdb:8081      # Note: 'cosmosdb' instead of 'localhost'
      - CosmosDb__Key=C2y6yDjf5...                     # Same key
      - CosmosDb__DatabaseName=LoginDB
      - CosmosDb__ContainerName=Users
```

**Why different Endpoint?**
- When running **locally** (without Docker): Use `https://localhost:8081`
- When running **in Docker**: Use `https://cosmosdb:8081` (container name)
- Docker containers talk to each other by container name, not localhost!

---

#### **3️⃣ React Frontend - NO Direct Connection! ✋**

**Important**: Your React app does **NOT** connect directly to Cosmos DB!

```
❌ React → Cosmos DB (Security risk! Exposes database key)
✅ React → .NET API → Cosmos DB (Secure!)
```

**Frontend only needs**:
```javascript
// frontend/src/services/authService.js
const API_BASE_URL = 'http://localhost:5000';  // Backend API URL

// Call backend API, which then talks to Cosmos DB
fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ userId, password })
});
```

---

### 🔒 Security Note

**For Learning (Emulator)**:
- ✅ Hardcode the well-known emulator key (it's public anyway)
- ✅ Store in appsettings.json
- ✅ No security risk (only works on localhost)

**For Production (Real Azure Cosmos DB)**:
- ❌ Never hardcode keys in source code
- ❌ Never commit keys to GitHub
- ✅ Use Azure Key Vault
- ✅ Use Managed Identity (keyless authentication)
- ✅ Use environment variables or secrets management

---

### 📊 Connection Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Local Development (No Docker)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  .NET API (localhost:5000)                              │
│       │                                                  │
│       │ Reads: appsettings.json                         │
│       │ Endpoint: https://localhost:8081                │
│       │                                                  │
│       └────────────> Cosmos Emulator (localhost:8081)   │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Docker Deployment (All Containers)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Backend Container                                       │
│       │                                                  │
│       │ Reads: Environment Variables                    │
│       │ Endpoint: https://cosmosdb:8081                 │
│       │                                                  │
│       └────────────> Cosmos Container (cosmosdb:8081)   │
│                                                          │
│  Frontend Container                                      │
│       │                                                  │
│       │ API_URL: http://localhost:5000                  │
│       │                                                  │
│       └────────────> Backend Container                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 💡 Quick Reference: When You'll Use What

| Step | What You're Doing | Where Settings Go |
|------|------------------|-------------------|
| **Step 1** | Running Cosmos DB only | No settings needed yet - just Docker |
| **Step 2** | Creating .NET API | `appsettings.json` with `localhost:8081` |
| **Step 3-5** | Developing API locally | Using `appsettings.json` |
| **Step 6** | Connecting React to API | Frontend uses API URL only |
| **Step 7** | Running everything in Docker | `docker-compose.yml` with `cosmosdb:8081` |

**You'll configure these settings in Step 2** when we create the .NET backend API!

---

**Ports Used**:
- `8081`: Main HTTPS endpoint
- `10251-10254`: Internal services

---

## 📦 Step 1.3: Create Cosmos DB Docker Configuration

Let's create a simple docker-compose file to start just Cosmos DB first.

Create a file: `docker-compose-cosmosdb.yml`

**What this file does**:
- Downloads Cosmos DB Docker image from Microsoft
- Starts the emulator on port 8081
- Configures it with 10 partitions (for better performance)
- Creates a volume to save data between restarts

---

## 🚀 Step 1.4: Start Cosmos DB

In PowerShell, navigate to your project folder and run:

```powershell
cd D:\lEARN\LOGIN
docker-compose -f docker-compose-cosmosdb.yml up
```

**What happens**:
1. Docker downloads Cosmos DB image (first time only - ~1-2 GB)
2. Creates and starts container
3. Cosmos DB initializes (takes 1-2 minutes)

**Wait for this message**:
```
Started
```

**Note**: The emulator takes time to start. You may see warnings about certificates - this is normal!

---

## ✅ Step 1.5: Verify Cosmos DB is Running

### Option 1: Check Docker Desktop
1. Open Docker Desktop
2. Go to "Containers" tab
3. You should see `cosmosdb-emulator` running

### Option 2: Access Data Explorer
1. Open browser: https://localhost:8081/_explorer/index.html
2. You'll see a certificate warning - click "Advanced" → "Proceed" (safe for local dev)
3. You should see the Cosmos DB Data Explorer interface

### Option 3: Check with PowerShell
```powershell
docker ps
```

**Expected Output**:
```
CONTAINER ID   IMAGE                                              STATUS      PORTS
abc123...      mcr.microsoft.com/cosmosdb/linux/azure-cosmos...  Up 2 min    0.0.0.0:8081->8081/tcp
```

---

## 🎓 Understanding the Components

### Database Structure in Cosmos DB:
```
Cosmos DB Account (localhost:8081)
└── Database: "LoginDB"
    └── Container: "Users"
        ├── Partition Key: /userId
        └── Documents:
            ├── User 1 (JSON)
            ├── User 2 (JSON)
            └── User 3 (JSON)
```

**Analogies**:
- **Account** = Server
- **Database** = Database (like "Customers" database)
- **Container** = Table (like "Users" table)
- **Document** = Row (but in JSON format)
- **Partition Key** = How data is organized for speed

### Why `/userId` as Partition Key?
- Every query we do will search by userId
- Cosmos DB can quickly find the right partition
- Better performance for our login system

---

## 🔍 Exploring Cosmos DB (Optional)

Try creating a database manually:

1. Open Data Explorer: https://localhost:8081/_explorer/index.html
2. Click "New Container"
3. Database id: `TestDB`
4. Container id: `TestContainer`
5. Partition key: `/id`
6. Click OK

**Congratulations!** You just created your first Cosmos DB container!

You can delete it afterwards (we'll create the real one programmatically).

---

## 🛑 Stopping Cosmos DB

When done testing:

```powershell
# Press Ctrl+C in the terminal running docker-compose
# Or run:
docker-compose -f docker-compose-cosmosdb.yml down
```

**Note**: Your data is saved in a Docker volume named `cosmosdb-data`

---

## 📝 Step 1 Summary

✅ You now understand:
- What Cosmos DB is (NoSQL, JSON-based database)
- Why we use Docker (isolated, clean environments)
- How to run Cosmos DB locally
- The basic structure (Account → Database → Container → Documents)

✅ You can:
- Start/stop Cosmos DB emulator
- Access the Data Explorer
- Verify containers are running

---

## � Interview Preparation: How to Explain Cosmos DB

### For Technical Interviews

**"Can you explain what Azure Cosmos DB is?"**

**Good Answer (Simple Version)**:
> "Azure Cosmos DB is Microsoft's globally distributed, multi-model NoSQL database service. It's designed for applications that need high availability, low latency, and global scale. Unlike traditional relational databases, it stores data as JSON documents with flexible schemas, making it ideal for modern web and mobile applications."

**Good Answer (Detailed Version)**:
> "Cosmos DB is a fully managed NoSQL database service from Microsoft Azure. What makes it unique is its guaranteed single-digit millisecond latency for reads and writes, 99.999% availability SLA, and ability to replicate data across multiple Azure regions globally. It supports multiple data models - document, key-value, graph, and column-family - and provides multiple APIs including SQL, MongoDB, Cassandra, Gremlin, and Table API. This means you can use familiar query languages and migrate existing applications easily."

---

### 🔑 Key Features to Mention

**1. Global Distribution**
- **What**: Replicate data across any Azure region worldwide
- **Why**: Users get fast access regardless of location
- **Interview Example**: "If you have users in US and India, Cosmos DB can replicate data to both regions, giving both 10ms response times instead of 200ms+"

**2. Multi-Model Support**
- **Document**: JSON documents (like MongoDB)
- **Key-Value**: Simple lookups (like Redis)
- **Graph**: Relationships (like Neo4j)
- **Column-Family**: Wide tables (like Cassandra)
- **Interview Tip**: "This flexibility means you can choose the right model for your use case without switching databases"

**3. Automatic Indexing**
- **What**: All properties are indexed by default
- **Why**: Fast queries without manual index creation
- **Trade-off**: More storage space used

**4. Partitioning**
- **What**: Data automatically distributed across servers using partition key
- **Why**: Horizontal scaling for massive datasets
- **Our Example**: We use `/userId` so each user's data is co-located

**5. Consistency Levels (Important!)**
```
Strong ──────────────────────── Eventual
  │         │         │         │
  │         │         │         │
Strong  Bounded   Session   Consistent   Eventual
         Staleness           Prefix
```

- **Strong**: Read always returns latest write (slowest, highest cost)
- **Session**: Reads consistent within user's session (default, good balance)
- **Eventual**: Fastest, but might read old data briefly

**Interview Question**: "Which would you choose?"
**Answer**: "For a login system, Session consistency is perfect - users see their own updates immediately, which is what matters for authentication."

---

### 📊 Cosmos DB vs Other Databases

**When interviewer asks: "Why Cosmos DB over [X]?"**

| Feature | Cosmos DB | MongoDB | SQL Server | DynamoDB |
|---------|-----------|---------|------------|----------|
| **Schema** | Flexible | Flexible | Fixed | Flexible |
| **Scale** | Global, automatic | Manual sharding | Vertical mostly | AWS only |
| **Latency** | <10ms guaranteed | Varies | Varies | <10ms |
| **Query** | SQL-like | MongoDB query | SQL | Key-value primary |
| **Cost** | Pay per RU/s | Server cost | Server/license | Pay per request |
| **Best For** | Global apps | Document storage | Enterprise CRUD | AWS ecosystem |

**Good Interview Response**:
> "I chose Cosmos DB for this project because it provides automatic scaling, guaranteed low latency, and doesn't require managing servers. For a production login system, the 99.999% availability SLA and built-in disaster recovery are important. While MongoDB is similar, Cosmos DB's serverless option and automatic indexing reduce operational overhead."

---

### 💡 Real-World Use Cases

**Be ready to discuss these**:

1. **IoT Applications**
   - Example: "Smart home devices sending sensor data - millions of writes per second"
   - Why Cosmos: High write throughput, time-series data

2. **E-Commerce**
   - Example: "Product catalog with varying attributes"
   - Why Cosmos: Flexible schema, global distribution, low latency

3. **Gaming**
   - Example: "Player profiles, leaderboards, game state"
   - Why Cosmos: Fast reads/writes, global distribution, session consistency

4. **User Profiles** (Our Use Case!)
   - Example: "Login system with user authentication"
   - Why Cosmos: Fast lookups by userId, flexible user attributes

---

### 🎯 Common Interview Questions & Answers

**Q1: "What is a Request Unit (RU) in Cosmos DB?"**
**A**: 
> "A Request Unit is Cosmos DB's currency for measuring resource consumption. 1 RU = the cost to read 1KB document by its ID. Writes cost more (~5 RUs), complex queries cost even more. You provision RUs/second for your container - think of it like bandwidth. This model lets you predict costs and scale precisely based on your application's needs."

**Q2: "How does Cosmos DB partition data?"**
**A**:
> "Cosmos DB uses a partition key that you specify when creating a container. All documents with the same partition key value are stored together in a logical partition, which can be up to 20GB. Cosmos automatically distributes logical partitions across physical servers. Choosing the right partition key is critical - it should have high cardinality (many possible values) and even distribution to avoid hot partitions."

**Example**: 
```json
// Good: userId (many unique values)
{ "userId": "user123", ...}
{ "userId": "user456", ...}

// Bad: country (few values, uneven)
{ "country": "US", ...} // 80% of data
{ "country": "India", ...} // 15% of data
```

**Q3: "What are the trade-offs of NoSQL vs SQL?"**
**A**:
> "NoSQL databases like Cosmos DB trade ACID transactions across multiple tables for scalability and flexibility. You gain schema flexibility, horizontal scaling, and high performance, but lose complex joins and multi-document transactions. For our login system, we don't need joins - each user is a self-contained document - so NoSQL is ideal. However, for a banking system with transfers between accounts, traditional SQL might be better due to strong ACID guarantees."

**Q4: "How would you model a one-to-many relationship in Cosmos DB?"**
**A**:
> "There are two approaches: embedding or referencing. Embedding means storing related data in the same document - like storing user's addresses in an array within the user document. This is fast (one read operation) but can lead to large documents. Referencing means storing related items separately with foreign keys, like SQL. You'd use embedding for data that's always accessed together and has bounded size, and referencing for data that's queried independently or can grow unbounded."

**Q5: "How do you handle database initialization in your application?"**
**A**: 
> "In our .NET application, during startup, we check if the database and container exist using CreateDatabaseIfNotExistsAsync() and CreateContainerIfNotExistsAsync(). This ensures the schema is ready before the application serves requests. We specify the partition key (/userId) and throughput (400 RUs) at this stage. This approach is infrastructure-as-code - the application manages its own schema."

**Q6: "What security considerations exist with Cosmos DB?"**
**A**:
> "Cosmos DB uses primary/secondary keys for authentication. In the emulator, there's a well-known key for testing. In production, you'd use Azure Key Vault to store keys securely or use Managed Identity for keyless authentication. Data is encrypted at rest by default, and you can configure IP firewall rules and virtual network service endpoints. For our login system, we're also storing passwords in plain text for learning, but production would use bcrypt or similar hashing."

**Q7: "How does Cosmos DB pricing work?"**
**A**:
> "Cosmos DB pricing has three main components: provisioned throughput (RUs/second), storage (per GB), and data transfer (egress). You can choose between provisioned mode (reserve RUs upfront) or serverless mode (pay per request). For predictable workloads, provisioned is cheaper. For sporadic use, serverless is better. There's also autoscale which adjusts RUs based on load. Our emulator is free for development."

**Q8: "What's the difference between partition key and id?"**
**A**:
> "The 'id' is unique within a partition and combined with the partition key forms the primary key. Two documents can have the same id if they have different partition keys. For point reads (fastest operation), you need both id and partition key. In our case, userId is the partition key and id is a GUID. We could technically make userId the id as well, but separating them gives flexibility for versioning or soft deletes."

---

### 🌟 Advanced Topics (Senior-Level Interviews)

**Change Feed**
- Real-time stream of changes to your container
- Use case: Triggering Azure Functions when data changes
- Example: "When a user logs in, update their 'last active' timestamp and trigger notification service"

**Time-to-Live (TTL)**
- Automatic document deletion after specified seconds
- Use case: Session tokens, temporary data
- Example: "Auto-delete password reset tokens after 1 hour"

**Stored Procedures**
- Server-side JavaScript execution
- Transactional across multiple documents (same partition)
- Use case: Complex atomic operations

**Analytical Store**
- Column-oriented store alongside transactional data
- Use case: Running complex analytics without impacting transactional workload
- Example: "Analyze login patterns over time without slowing down authentication"

---

### 📝 Interview Tips

**DO:**
- ✅ Start with a clear, concise definition
- ✅ Mention specific numbers (99.999% SLA, <10ms latency)
- ✅ Give real-world examples from your project
- ✅ Show understanding of trade-offs
- ✅ Discuss cost considerations

**DON'T:**
- ❌ Just say "it's a NoSQL database" and stop
- ❌ Compare as "better than" other databases universally
- ❌ Ignore cost/complexity trade-offs
- ❌ Pretend you've used features you haven't

**Great Closing Statement**:
> "In my login system project, I used Cosmos DB primarily to learn modern cloud databases and understand NoSQL principles. For a production login system at scale, Cosmos DB would provide the reliability and performance needed, though for a simple application, a managed PostgreSQL might be more cost-effective. The key is choosing the right tool for your specific requirements - data model, scale, consistency needs, and budget."

---

## �🎯 Next Step

**Step 2**: Create the .NET Web API Backend

In the next step, we'll:
- Create a new .NET 8 Web API project
- Add Cosmos DB SDK
- Configure connection settings
- Test that API can start

**Ready?** Let me know and I'll create the Step 2 guide!

---

---

## 📋 Quick Interview Cheat Sheet

**Print or save this for quick review before interviews!**

### ⚡ 30-Second Elevator Pitch
> "Azure Cosmos DB is Microsoft's globally distributed NoSQL database with guaranteed single-digit millisecond response times and 99.999% availability. It supports multiple data models—documents, key-value, graph, and column-family—with automatic indexing and global replication across Azure regions."

### 🔢 Key Numbers to Remember
- **Latency**: <10ms read/write (99th percentile)
- **Availability**: 99.999% (five 9s) SLA
- **Partition Size**: 20GB max per logical partition
- **1 RU**: Cost to read 1KB document by ID
- **Default Throughput**: 400 RU/s minimum

### 🎯 Five Key Features
1. **Global distribution** - Multi-region replication
2. **Multi-model** - SQL, MongoDB, Cassandra, Gremlin, Table APIs
3. **Elastic scale** - Automatic throughput & storage scaling
4. **Consistency choices** - 5 levels from strong to eventual
5. **Automatic indexing** - All properties indexed by default

### 🔑 Critical Concepts

**Partition Key**:
- Determines data distribution
- Choose high cardinality values
- Cannot change after creation
- Our choice: `/userId` (unique per user)

**Request Units (RUs)**:
- Currency for database operations
- 1 RU = read 1KB item by ID
- Writes cost ~5 RUs
- Queries cost varies by complexity

**Consistency Levels** (Strongest → Weakest):
1. **Strong** - Reads always current, highest latency/cost
2. **Bounded Staleness** - Max lag guaranteed
3. **Session** - Consistent in user session (DEFAULT, best for most apps)
4. **Consistent Prefix** - Reads never out of order
5. **Eventual** - Lowest latency, eventual consistency

### ✅ When to Use Cosmos DB
- ✅ Global application with users worldwide
- ✅ Need guaranteed low latency
- ✅ Flexible/evolving schema
- ✅ High write throughput (IoT, events)
- ✅ 24/7 availability critical

### ❌ When NOT to Use Cosmos DB
- ❌ Complex multi-table joins needed
- ❌ On-premises only deployment
- ❌ Budget constrained (small app)
- ❌ Data warehouse/analytics primary use
- ❌ Strong ACID across entities required

### 💰 Cost Factors
- **Provisioned throughput** (RU/s)
- **Storage** (per GB)
- **Backup** (continuous or periodic)
- **Data transfer** (egress charges)
- **Multi-region** (multiplies cost)

**Cost Tip**: Start with serverless for unpredictable workloads!

### 🔒 Security Highlights
- Primary/secondary keys for authentication
- Managed Identity support (keyless)
- Encryption at rest (automatic)
- IP firewall & VNet integration
- Private endpoints available

### 📊 Our Project Specifics

**Why Cosmos DB for Login System?**
> "I chose Cosmos DB to learn modern cloud-native databases and understand NoSQL concepts. For this use case—user authentication—the flexible schema allows storing different user attributes, and the fast key-based lookups by userId provide sub-10ms login validation. The partition key strategy (/userId) ensures each user's data is co-located for optimal performance."

**Our Architecture**:
```
Database: LoginDB
└── Container: Users
    ├── Partition Key: /userId
    ├── Throughput: 400 RU/s
    └── Documents: User objects with id, userId, password, email
```

**Local Development**:
- Using Cosmos DB Emulator (free, local)
- Endpoint: https://localhost:8081
- Well-known key for emulator (public, safe)
- No Azure subscription needed

### 🎤 Strong Interview Closer
> "While Cosmos DB might be over-engineered for a simple login system, it demonstrates cloud-native thinking and NoSQL understanding. In production, I'd evaluate cost vs. requirements—for <10K users, managed PostgreSQL might be more economical. But for a global application with millions of users requiring <10ms response times worldwide, Cosmos DB's global distribution and guaranteed SLAs would justify the investment."

---

## 🆘 Troubleshooting

### Cosmos DB won't start
- **Check**: Is Docker Desktop running?
- **Check**: Is port 8081 free? `netstat -ano | findstr :8081`
- **Solution**: Close any apps on port 8081

### Certificate errors in browser
- **This is normal** for the emulator
- Click "Advanced" → "Proceed to localhost"
- In production, you'd use proper certificates

### Container exits immediately
- Check logs: `docker logs cosmosdb-emulator`
- May need more RAM: Docker Desktop → Settings → Resources → Memory (set 4GB+)

---

**Current Status**: ✅ Step 1 Complete!

Ready for Step 2? Just let me know!
