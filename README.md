# Activity Management System - Client

This is the client-side of the Activity Management System, designed for future integration with your own backend server. This application includes:

- Activity management with hierarchical sub-activities
- Transaction types management
- Price list management with detailed views
- Customer management with customer-specific pricing
- CSV export/import functionality

## Getting Started

### Prerequisites
- Node.js (version 18+)
- npm or yarn

### Installation

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Building for Production

```bash
# Create a production build
npm run build

# Preview the production build
npm run start
```

## Backend Integration

This client is designed to work with any backend server that implements the required API endpoints. To connect to your own backend:

1. Update the API base URL in `src/lib/apiClient.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-backend-server.com';
   ```

2. Configure proxy settings in `vite.config.ts` for local development (uncomment and modify the proxy section):
   ```typescript
   proxy: {
     '/api': {
       target: 'http://your-backend-server.com',
       changeOrigin: true,
     }
   }
   ```

3. Ensure your backend implements the endpoints expected by this client:
   - `GET /api/activities` - Get all activities
   - `GET /api/activities/:id` - Get activity by ID
   - `POST /api/activities` - Create new activity
   - `PUT /api/activities/:id` - Update activity
   - `DELETE /api/activities/:id` - Delete activity
   - `GET /api/activities/:id/sub-activities` - Get activity with sub-activities
   - `GET /api/sub-activities` - Get all sub-activities
   - `GET /api/sub-activities/:id` - Get sub-activity by ID
   - `POST /api/sub-activities` - Create new sub-activity
   - `PUT /api/sub-activities/:id` - Update sub-activity
   - `DELETE /api/sub-activities/:id` - Delete sub-activity
   - `GET /api/transaction-types` - Get all transaction types
   - `GET /api/transaction-types/:id` - Get transaction type by ID
   - `POST /api/transaction-types` - Create new transaction type
   - `PUT /api/transaction-types/:id` - Update transaction type
   - `DELETE /api/transaction-types/:id` - Delete transaction type

## Features

- **Activity Management**
  - Create, update, and delete activities with hierarchical sub-activities
  - Filter and search functionality
  - Toggle activity status

- **Transaction Types**
  - Manage different transaction types for business operations
  - Card-based display with edit/delete functionality

- **Price Lists**
  - Create and manage price lists with detailed item pricing
  - View and edit price list details

- **Customer Management**
  - Customer list with search functionality
  - Customer-specific pricing
  - CSV import/export for customer data