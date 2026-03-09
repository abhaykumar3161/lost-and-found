# Lost & Found Backend API

Backend server for Lost and Found Management System.

## Environment Variables

Create `.env` file with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

## Seed Database

```bash
npm run seed
```

## API Endpoints

- `POST /api/register` - Register user
- `POST /api/login` - Login user
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `GET /api/profile` - Get profile
- `POST /api/send-otp` - Send OTP
- `POST /api/verify-otp` - Verify OTP

## Deployment

See DEPLOYMENT_GUIDE.md for deployment instructions.
