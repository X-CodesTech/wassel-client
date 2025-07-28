# AttachmentModule Component

## Overview

The `AttachmentModule` component is a context-aware file management interface that dynamically uses different API endpoints based on the context type (Customer, Vendor, Order). It provides advanced filtering, file type indicators, and bulk operations with full TypeScript support.

## Context-Aware Features

- **Dynamic Endpoints**: Automatically uses the correct API endpoints based on context type
- **Context-Specific Data**: Loads and displays data relevant to the selected context
- **Visual Indicators**: Color-coded badges and headers for each context type
- **Context-Specific Operations**: Upload, download, and delete operations work with the correct context
- **Real-time Updates**: Data refreshes when context changes
- **Error Handling**: Context-specific error messages and loading states

## Props Interface

```typescript
interface AttachmentModuleProps {
  contextType: "Vendor" | "Customer" | "Order";
  contextId: string; // custAccount, vendAccount, or orderId
  title?: string; // Optional custom title
}
```

## Usage Examples

### Customer Attachments

```tsx
<AttachmentModule
  contextType="Customer"
  contextId="CUST001"
  title="Customer File Management"
/>
```

### Vendor Attachments

```tsx
<AttachmentModule
  contextType="Vendor"
  contextId="VEND001"
  title="Vendor File Management"
/>
```

### Order Attachments

```tsx
<AttachmentModule
  contextType="Order"
  contextId="65e1c2a4f1b2c3d4e5f6a7b8"
  title="Order File Management"
/>
```

## API Endpoints by Context

### Customer Context

- `GET /uploads/customers/{custAccount}/files` - Get customer files
- `POST /uploads/customers/{custAccount}/upload` - Upload customer file
- `DELETE /uploads/customers/{custAccount}/files/{fileName}` - Delete customer file

### Vendor Context

- `GET /uploads/vendors/{vendAccount}/files` - Get vendor files
- `POST /uploads/vendors/{vendAccount}/upload` - Upload vendor file
- `DELETE /uploads/vendors/{vendAccount}/files/{fileName}` - Delete vendor file

### Order Context

- `GET /uploads/orders/{orderId}/files` - Get order files
- `POST /uploads/orders/{orderId}/upload` - Upload order file
- `DELETE /uploads/orders/{orderId}/files/{fileName}` - Delete order file

## Features

- **File Management**: Upload, download, view, and delete operations
- **Advanced Filtering**: Filter by file name, type, category, status, and metadata
- **File Type Indicators**: Color-coded badges for PDF, Excel, Word, and Image files
- **Category Organization**: Support for Customer, Vendor, Order, and Price List attachments
- **Bulk Operations**: Select multiple files for batch operations
- **Real-time Search**: Instant filtering across all columns
- **File Size Formatting**: Human-readable file size display
- **Upload Progress**: Support for real-time upload progress tracking

## Supported File Types

### Document Types

- **PDF**: `application/pdf`
- **Excel**: `.xlsx`, `.xls` files
- **Word**: `.docx`, `.doc` files
- **Images**: JPEG, PNG, GIF, WebP

### Categories

- **Customer**: Files attached to customer accounts
- **Vendor**: Files attached to vendor accounts
- **Order**: Files attached to specific orders
- **Price List**: Excel files for price list uploads

## Data Interface

```typescript
interface AttachmentData {
  id: string;
  fileName: string; // System-generated filename
  originalName: string; // User-uploaded filename
  fileSize: number; // File size in bytes
  mimeType: SupportedMimeType;
  fileType: SupportedFileType;
  uploadedBy: string; // User who uploaded the file
  uploadedAt: Date; // Upload timestamp
  custAccount?: string; // Customer account (if applicable)
  vendAccount?: string; // Vendor account (if applicable)
  orderId?: string; // Order ID (if applicable)
  status: "active" | "inactive" | "deleted";
  category: "customer" | "vendor" | "order" | "price-list";
}
```

## Context-Specific Behavior

### Customer Context

- Uses customer-specific API endpoints
- Displays customer account ID in header
- Blue color scheme for visual indicators
- Loads customer attachment data

### Vendor Context

- Uses vendor-specific API endpoints
- Displays vendor account ID in header
- Green color scheme for visual indicators
- Loads vendor attachment data

### Order Context

- Uses order-specific API endpoints
- Displays order ID in header
- Purple color scheme for visual indicators
- Loads order attachment data

## Table Structure

### Columns

- **Checkbox**: Row selection for bulk operations
- **File Name**: System-generated filename (monospace font)
- **Original Name**: User-uploaded filename
- **Type**: File type with icon and color-coded badge
- **Category**: Attachment category with color coding
- **Status**: File status (Active/Inactive/Deleted)
- **Uploaded By**: User who uploaded the file
- **Upload Date**: Formatted timestamp
- **File Size**: Human-readable file size
- **Actions**: View, Download, Delete buttons

### File Type Colors

- **PDF**: Red (text-red-500, bg-red-100)
- **Excel**: Green (text-green-500, bg-green-100)
- **Word**: Blue (text-blue-500, bg-blue-100)
- **Image**: Purple (text-purple-500, bg-purple-100)

### Category Colors

- **Customer**: Blue (bg-blue-100 text-blue-800)
- **Vendor**: Green (bg-green-100 text-green-800)
- **Order**: Purple (bg-purple-100 text-purple-800)
- **Price List**: Orange (bg-orange-100 text-orange-800)

## State Management

The component manages several pieces of state:

- **Selected Items**: Set of selected row IDs for bulk operations
- **Filters**: Object containing filter values for each column
- **Filtered Data**: Computed filtered data based on user input
- **Context Data**: Dynamically loaded data based on context type

## Key Functions

- `handleSelectAll()`: Toggle selection of all items
- `handleSelectItem(id)`: Toggle selection of individual items
- `handleFilterChange(field, value)`: Update filter values
- `handleUpload(file)`: Context-aware file upload
- `handleDelete(fileName)`: Context-aware file deletion
- `getFileTypeIcon(fileType)`: Get appropriate icon for file type
- `getFileTypeBadge(fileType)`: Get color-coded badge for file type
- `formatFileSize(bytes)`: Convert bytes to human-readable format
- `formatDate(date)`: Format date for display
- `getContextData()`: Get context-specific data
- `filteredData`: Computed property for filtered results

## Error Handling

The component supports comprehensive error handling:

- **File Type Validation**: Ensures only supported file types are uploaded
- **File Size Limits**: Validates file size constraints
- **Network Errors**: Handles upload/download failures
- **Permission Errors**: Manages access control issues
- **Context-Specific Errors**: Different error messages for each context

## Loading States

- **Loading Indicator**: Shows spinner while fetching data
- **Error Display**: Shows error message if API call fails
- **Empty State**: Shows message when no attachments found
- **Context-Specific Loading**: Different loading states per context

## Related Files

### Services

- `src/services/attachmentServices.ts` - Comprehensive API service functions
- `src/services/apiUrlConstants.ts` - API endpoint constants

### Store

- `src/store/attachments/attachmentsSlice.ts` - Redux slice for attachment state
- `src/store/attachments/act/` - Async thunk actions for API calls

### Hooks

- `src/hooks/useAttachments.ts` - Custom hook for attachment operations

### Types

- `SupportedFileType` - Valid file type enumeration
- `SupportedMimeType` - Valid MIME type enumeration
- `AttachmentFile` - File metadata interface
- `PriceListUploadResponse` - Price list upload response
- `ErrorResponse` - Error response interface

## Styling

The component uses Tailwind CSS classes and follows the project's design system:

- Clean white background with subtle borders and shadows
- Color-coded badges for file types and categories
- Context-specific color schemes
- Hover effects for better user experience
- Responsive grid layout for filter inputs
- Proper spacing and typography
- Monospace fonts for technical data (filenames, IDs)

## Demo

See `src/pages/AttachmentDemo.tsx` for a complete demonstration with context selector, detailed feature descriptions, API endpoint documentation, and usage examples.
