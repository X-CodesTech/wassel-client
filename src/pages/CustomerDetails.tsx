import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Upload, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interface for customer price items
interface CustomerPriceItem {
  id: number;
  subActivityId: number;
  subActivityName: string;
  price: number;
}

// Interface for customer
interface Customer {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  priceItems: CustomerPriceItem[];
  lastUpdated: Date;
}

export default function CustomerDetails() {
  const [match, params] = useRoute<{ id: string }>("/customers/:id");
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch customer data
  useEffect(() => {
    if (match && params.id) {
      const id = parseInt(params.id);
      const storedCustomers = localStorage.getItem("customers");
      let redirectToList = false;

      if (storedCustomers) {
        try {
          const customers: Customer[] = JSON.parse(storedCustomers);
          const found = customers.find((c) => c.id === id);

          if (found) {
            // Convert date strings back to Date objects if needed
            const customerWithDates = {
              ...found,
              lastUpdated: new Date(found.lastUpdated),
            };
            setCustomer(customerWithDates);
          } else {
            redirectToList = true;
          }
        } catch (e) {
          redirectToList = true;
        }
      } else {
        redirectToList = true;
      }

      if (redirectToList) {
        // Use a reference to avoid the infinite loop
        const timer = setTimeout(
          () => setLocation("/price-lists?tab=customers"),
          0
        );
        return () => clearTimeout(timer);
      }
    }
  }, [match, params && params.id, setLocation]);

  const handleBack = () => {
    // Navigate back with the customers tab active
    setLocation("/price-lists?tab=customers");
  };

  const handleExportCSV = () => {
    if (!customer) return;

    // Create CSV content
    const headers = "Sub Activity Name,Price\n";
    const rows = customer.priceItems
      .map((item) => `"${item.subActivityName}",${item.price}`)
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set up download
    link.href = url;
    link.setAttribute("download", `${customer.name}_prices.csv`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    // Here, you would normally process the file
    // For this demo, we'll just close the dialog
    setFileUploadDialogOpen(false);
    setSelectedFile(null);

    // Show success message
    alert("File successfully uploaded. The system will process it shortly.");
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <title>Customer Details | Wassel</title>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{customer.name}</h2>
          {customer.contactPerson && (
            <p className="text-gray-500 mt-1">
              Contact: {customer.contactPerson}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Price Details</h3>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(customer.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => setFileUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import Prices
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Prices</CardTitle>
          <CardDescription>
            This customer has {customer.priceItems.length} items with custom
            pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customer.priceItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium mb-1">No Custom Prices</h4>
              <p className="text-gray-500 max-w-md">
                This customer doesn't have any custom prices yet. You can import
                prices using the "Import Prices" button.
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>
                List of custom prices for {customer.name}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Activity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.priceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.subActivityName}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* File Upload Dialog */}
      <AlertDialog
        open={fileUploadDialogOpen}
        onOpenChange={setFileUploadDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Prices from CSV</AlertDialogTitle>
            <AlertDialogDescription>
              Upload a CSV file with custom prices for this customer. The file
              should have two columns: Sub-Activity Name and Price.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="file-upload" className="text-sm font-medium">
                  Select File
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">
                  Accepted formats: .csv, .xls, .xlsx
                </p>
              </div>

              {selectedFile && (
                <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024)?.toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selectedFile}
              onClick={handleFileUpload}
            >
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
