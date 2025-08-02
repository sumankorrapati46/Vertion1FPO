# AgriStack Backend API

This is a Node.js/Express.js backend API for the Agricultural Farmer Management System.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, password management, profile management
- **Farmer Management**: CRUD operations for farmer profiles with KYC status tracking
- **Employee Management**: CRUD operations for employee profiles with assignment tracking
- **Registration Approval**: Admin/SuperAdmin approval workflow for new registrations
- **KYC Document Management**: File upload and review system for farmer KYC documents
- **Dashboard Analytics**: Statistics and data aggregation for different user roles
- **File Upload**: Secure document upload with validation and storage

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. **Clone or create the backend directory:**
   ```bash
   mkdir agristack-backend
   cd agristack-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-otp` - Send OTP for email verification
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/forgot-user-id` - Forgot user ID
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/change-user-id` - Change user ID

### Farmers
- `GET /api/farmers` - Get all farmers (with filters)
- `GET /api/farmers/:id` - Get farmer by ID
- `POST /api/farmers` - Create new farmer
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer
- `POST /api/farmers/:id/assign` - Assign farmer to employee
- `GET /api/farmers/stats` - Get farmer statistics

### Employees
- `GET /api/employees` - Get all employees (with filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id/assigned-farmers` - Get assigned farmers for employee
- `GET /api/employees/stats` - Get employee statistics

### Registrations
- `GET /api/registrations` - Get all registrations (with filters)
- `GET /api/registrations/:id` - Get registration by ID
- `POST /api/registrations/:id/approve` - Approve registration
- `POST /api/registrations/:id/reject` - Reject registration
- `GET /api/registrations/stats` - Get registration statistics

### KYC Management
- `POST /api/kyc/:farmerId/upload` - Upload KYC documents
- `POST /api/kyc/:farmerId/approve` - Approve KYC
- `POST /api/kyc/:farmerId/reject` - Reject KYC
- `POST /api/kyc/:farmerId/refer-back` - Refer back KYC
- `GET /api/kyc/:farmerId/status` - Get KYC status
- `GET /api/kyc/:farmerId/documents` - Get KYC documents

### Dashboard
- `GET /api/dashboard/stats` - Get general statistics
- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/dashboard/super-admin` - Get super admin dashboard data
- `GET /api/dashboard/employee/:employeeId` - Get employee dashboard data

## Default Users

The backend comes with pre-configured users for testing:

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | ADMIN |
| superadmin | SuperAdmin@123 | SUPER_ADMIN |
| employee | Employee@123 | EMPLOYEE |
| farmer | Farmer@123 | FARMER |
| fpo | FPO@123 | FPO |

## File Upload

The API supports file uploads for KYC documents:

- **Supported formats**: JPEG, JPG, PNG, PDF, DOC, DOCX
- **Maximum file size**: 10MB per file
- **Upload directory**: `./uploads/`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **CORS**: Cross-origin resource sharing configuration
- **File Validation**: File type and size validation
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Request data validation

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### API Testing with Postman

1. Import the API collection into Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:8080/api`
   - `token`: (will be set after login)

3. Test the login endpoint first to get a token
4. Use the token in subsequent requests

## Production Deployment

### Environment Variables
```env
PORT=8080
NODE_ENV=production
JWT_SECRET=your-production-secret-key
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=agristack_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=agristack_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Database Integration

This example uses in-memory storage. For production, integrate with a database:

### PostgreSQL Integration
```bash
npm install pg
```

### MongoDB Integration
```bash
npm install mongoose
```

### MySQL Integration
```bash
npm install mysql2
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

## Monitoring and Logging

### Logging
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
```

## API Documentation

For detailed API documentation, refer to the `BACKEND_SETUP.md` file in the main project directory.

## Support

For issues and questions:
1. Check the API documentation
2. Review the error logs
3. Test with Postman collection
4. Verify environment variables

## License

MIT License - see LICENSE file for details. 