NestDemo

Backend application built with NestJS, TypeScript, PostgreSQL, Prisma, and Docker.

🚀 Tech Stack
NestJS 11
TypeScript
PostgreSQL 17
Prisma 7
JWT / Passport
Swagger
Docker & Docker Compose
📋 Requirements
Node.js 24+
npm
Docker
Docker Compose
📁 Setup

Install dependencies:

npm install

Create:

.env.development
.env.production

Example .env.development:

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ecom
JWT_SECRET=your-secret

Do not commit real .env files or secrets to Git.

🐳 Docker Development
First Time
docker compose --profile dev up -d --build

Start
docker compose --profile dev start

Stop
docker compose --profile dev stop

Remove Containers
docker compose --profile dev down

Rebuild

Use this when Dockerfile or dependencies change:

docker compose --profile dev up -d --build

Check Containers
docker ps

Expected:

nest-demo-app-dev
nest-postgres

🗄️ Database

PostgreSQL:

Host: localhost
Port: 5432
Database: ecom
Username: postgres

Inside Docker, use:

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ecom

🔷 Prisma

Generate Prisma Client:

npx prisma generate

Run migrations:

npx prisma migrate dev

Open Prisma Studio:

npx prisma studio

▶️ Run Without Docker
npm run start:dev

Production:

npm run build
npm run start:prod

📚 API

Application:

http://localhost:3000

Swagger:

http://localhost:3000/api

🔐 Security

Add these to .gitignore:

.env
.env.*
!.env.example

Never commit:

Database passwords
JWT secrets
API keys
Production credentials

Use strong credentials and secrets in production.

🧪 Testing
npm run test
npm run test:e2e
npm run test:cov

🧹 Code Quality
npm run lint
npm run format

🏭 Production Docker
docker compose --profile prod up -d --build

Stop:

docker compose --profile prod down

🔧 Ports
Service Port
NestJS 3000
PostgreSQL 5432
📄 License

UNLICENSED
