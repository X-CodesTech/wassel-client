# UI Components

This directory contains reusable UI components that follow the design system patterns.

## VendorDropdown

A dropdown component for selecting vendors with cost information.

### Usage

```tsx
import { VendorDropdown } from "@/components/ui/vendor-dropdown";

<VendorDropdown
  vendorData={vendorData}
  selectedVendor={selectedVendor}
  onVendorChange={(vendorId, cost) => {
    // Handle vendor selection
  }}
  loading={isLoading}
  disabled={isDisabled}
  placeholder="Select a vendor"
  size="md"
/>;
```

### Props

- `vendorData`: Array of vendor cost data
- `selectedVendor`: Currently selected vendor ID
- `onVendorChange`: Callback when vendor selection changes
- `loading`: Show loading state
- `disabled`: Disable the dropdown
- `placeholder`: Placeholder text
- `className`: Additional CSS classes
- `size`: Size variant ("sm", "md", "lg")

### VendorCostData Interface

```tsx
interface VendorCostData {
  vendor: string;
  vendorName: string;
  vendAccount: string;
  priceListId: string;
  priceListName: string;
  cost: number;
}
```

### Features

- Uses Radix UI Select component for accessibility
- Shows vendor name and cost in dropdown options
- Loading state with spinner
- Responsive design with size variants
- Follows design system color scheme and spacing
