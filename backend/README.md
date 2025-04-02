# Gig Website Backend

A backend service for a gig-based website where task providers can post tasks and workers can complete them for payment.

## Features

- User Authentication (Task Providers & Workers)
- Task Management
- Balance Management
- File Upload for Proof Submission
- Email Verification & Password Reset
- Role-based Access Control

## Technology Stack

- Node.js
- Express.js
- Prisma ORM
- MongoDB
- JWT Authentication
- Multer for File Uploads
- Nodemailer for Email Services

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gig-website-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
DATABASE_URL="mongodb://localhost:27017/gig_website"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
FRONTEND_URL="http://localhost:3000"
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Task Provider
- POST /api/auth/task-provider/register - Register a new task provider
- POST /api/auth/task-provider/login - Login as a task provider
- POST /api/auth/task-provider/verify-otp - Verify email with OTP
- POST /api/auth/task-provider/forgot-password - Request password reset
- POST /api/auth/task-provider/reset-password - Reset password

#### Worker
- POST /api/auth/worker/register - Register a new worker
- POST /api/auth/worker/login - Login as a worker
- POST /api/auth/worker/verify-otp - Verify email with OTP
- POST /api/auth/worker/forgot-password - Request password reset
- POST /api/auth/worker/reset-password - Reset password

### Tasks

#### Task Provider
- POST /api/tasks - Create a new task
- GET /api/tasks/provider - Get all tasks created by the provider
- PUT /api/tasks/:taskId - Update a task
- POST /api/tasks/:taskId/publish - Publish a task
- POST /api/tasks/:taskId/unpublish - Unpublish a task

#### Worker
- GET /api/tasks - Get all published tasks
- GET /api/tasks/:taskId - Get task details
- POST /api/tasks/:taskId/accept - Accept a task
- PUT /api/tasks/:taskId/status - Update task status
- POST /api/tasks/:taskId/proof - Submit proof for task completion

### Balance

- POST /api/balance/add - Add money to balance
- POST /api/balance/withdraw - Withdraw money from balance
- GET /api/balance/history - Get balance transaction history

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Email verification
- Secure password reset

## Error Handling

The application includes comprehensive error handling for:
- Invalid requests
- Authentication failures
- Database errors
- File upload errors
- Email service errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 