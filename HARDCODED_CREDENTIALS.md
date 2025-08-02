# Hardcoded Credentials for Frontend Testing

## 🔐 Login Credentials

### Admin User
- **Username:** `admin`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Email:** admin@agristack.com

### Super Admin User
- **Username:** `superadmin`
- **Password:** `SuperAdmin@123`
- **Role:** SUPER_ADMIN
- **Email:** superadmin@agristack.com

### Employee User
- **Username:** `employee`
- **Password:** `Employee@123`
- **Role:** EMPLOYEE
- **Email:** employee@agristack.com

### Farmer User
- **Username:** `farmer`
- **Password:** `Farmer@123`
- **Role:** FARMER
- **Email:** farmer@agristack.com

### FPO User
- **Username:** `fpo`
- **Password:** `FPO@123`
- **Role:** FPO
- **Email:** fpo@agristack.com

### Additional Test Users
- **Username:** `testadmin` / **Password:** `Admin@123` / **Role:** ADMIN
- **Username:** `testemployee` / **Password:** `Employee@123` / **Role:** EMPLOYEE
- **Username:** `testfarmer` / **Password:** `Farmer@123` / **Role:** FARMER

## 🔄 Registration Form Testing

### OTP Verification
- **Mock OTP:** `123456`
- Use this OTP for email verification during registration

### Captcha Verification
- **Hardcoded Captcha:** `12345`
- Use this captcha for login verification in development mode

### Registration Process
1. Fill in all required fields
2. Enter a valid email address
3. Click "Send OTP"
4. Enter `123456` as the OTP
5. Click "Verify"
6. Complete the registration form
7. Submit the form

## 🎯 Dashboard Access

After successful login, users will be redirected to their respective dashboards:

- **ADMIN** → `/admin/dashboard`
- **SUPER_ADMIN** → `/super-admin/dashboard`
- **EMPLOYEE** → `/employee/dashboard`
- **FARMER** → Will be redirected to farmer-specific dashboard
- **FPO** → Will be redirected to FPO-specific dashboard

## 🧪 Testing Instructions

### Quick Test Scenarios

#### Test Admin Login:
1. Go to `/login`
2. Select "Official" login type
3. Enter username: `admin`
4. Enter password: `Admin@123`
5. Enter captcha: `12345`
6. Click "Login"
7. Should redirect to Admin Dashboard

#### Test SuperAdmin Login:
1. Go to `/login`
2. Select "Official" login type
3. Enter username: `superadmin`
4. Enter password: `SuperAdmin@123`
5. Enter captcha: `12345`
6. Click "Login"
7. Should redirect to SuperAdmin Dashboard

#### Test Employee Login:
1. Go to `/login`
2. Select "Employee" login type
3. Enter username: `employee`
4. Enter password: `Employee@123`
5. Enter captcha: `12345`
6. Click "Login"
7. Should redirect to Employee Dashboard

#### Test Registration:
1. Go to `/login`
2. Select "Employee", "Farmer", or "FPO" login type
3. Click "Create New User Account"
4. Fill registration form
5. Use email verification with OTP: `123456`
6. Submit form
7. Should show success message

## 🔧 Technical Details

### Mock API Implementation
- All API calls are fully mocked for frontend testing
- No real backend required
- Hardcoded responses for all endpoints
- Console logging for debugging

### Supported Endpoints
- `/auth/login` - Login authentication
- `/api/auth/users/profile` - User profile
- `/auth/me` - Alternative profile endpoint
- `/api/auth/register` - User registration
- `/api/auth/send-otp` - Send OTP
- `/api/auth/verify-otp` - Verify OTP
- `/api/auth/countries` - Get countries
- `/api/auth/states` - Get states

### Session Management
- Login tokens are stored in localStorage
- Mock tokens are generated with username and timestamp
- Automatic token extraction for profile requests

## ⚠️ Security Notes

**Important:** These are hardcoded credentials for development/testing only. In production:
- Use strong, unique passwords
- Implement proper authentication
- Use HTTPS
- Store credentials securely
- Implement proper session management
- Use real backend APIs

## 🐛 Troubleshooting

If login is not working:
1. Check browser console for API logs
2. Verify captcha is entered correctly: `12345`
3. Ensure username and password match exactly
4. Check that the development server is running
5. Clear browser cache and localStorage if needed

## 📝 Console Logs

The mock API provides detailed console logging:
- Login attempts and responses
- Profile requests
- Registration attempts
- OTP verification
- All API calls and responses

Check browser console for debugging information. 