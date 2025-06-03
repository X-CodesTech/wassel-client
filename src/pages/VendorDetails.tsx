import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Vendor } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  FileText,
  Clock,
} from "lucide-react";

// Sample vendor data - in a real app this would come from props or API
const sampleVendor: Vendor = {
  id: 1,
  name: "Abo Khalaf",
  contactPerson: "Mohammed Abo Khalaf",
  email: "Mohammed@AB.PS",
  phone: "059964001",
  address: "Palestine, Ramallah, Almasyoun",
  category: "Transportation",
  status: "active",
  contractStartDate: "2024-01-15",
  contractEndDate: "2025-01-15",
  rating: 4.5,
  totalOrders: 145,
  createdAt: "2024-01-10T10:00:00Z",
};

// Extended vendor details matching the image
const vendorDetails = {
  vendorStatus: "Activated",
  vendorAPI: "JsonA",
  location: "Ramallah",
  creationDate: "13/5/2025",
  vendorID: "VN.0044",
  contactPerson: "Mohammed Abo Khalaf",
  vatNumber: "PS.VAT.50",
  mobileNo: "059964001",
  phoneNo: "0000000000",
  financeEmail: "Mohammed@AB.PS",
  lastUpdate: "13/5/2025 11:56:56 AM",
};

// Sample order history
const orderHistory = [
  {
    id: 1,
    orderNumber: "ORD-2024-156",
    date: "2024-05-20",
    amount: 2850.0,
    status: "completed",
    service: "Express Delivery",
  },
  {
    id: 2,
    orderNumber: "ORD-2024-143",
    date: "2024-05-15",
    amount: 1920.0,
    status: "completed",
    service: "Standard Shipping",
  },
  {
    id: 3,
    orderNumber: "ORD-2024-128",
    date: "2024-05-10",
    amount: 3200.0,
    status: "in-progress",
    service: "Freight Transport",
  },
  {
    id: 4,
    orderNumber: "ORD-2024-102",
    date: "2024-05-05",
    amount: 1650.0,
    status: "completed",
    service: "Local Delivery",
  },
];

// Sample performance metrics
const performanceMetrics = {
  onTimeDelivery: 94.5,
  customerSatisfaction: 4.2,
  averageResponseTime: 2.3,
  totalRevenue: 45670.0,
  monthlyOrders: [
    { month: "Jan", orders: 12, revenue: 8450 },
    { month: "Feb", orders: 15, revenue: 9200 },
    { month: "Mar", orders: 18, revenue: 11300 },
    { month: "Apr", orders: 22, revenue: 13800 },
    { month: "May", orders: 25, revenue: 15650 },
  ],
};

interface VendorDetailsProps {
  params?: {
    id: string;
  };
}

export default function VendorDetails({ params }: VendorDetailsProps) {
  const [vendor, setVendor] = useState<Vendor>(sampleVendor);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch vendor data based on params?.id
    // For now, we're using sample data
  }, [params?.id]);

  const getStatusBadge = (status: Vendor["status"]) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      completed: "outline",
      "in-progress": "secondary",
      pending: "default",
      cancelled: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const contractDaysRemaining = Math.ceil(
    (new Date(vendor.contractEndDate).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/vendors")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-muted-foreground">
              Vendor Details & Performance
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Vendor
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Vendor Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${performanceMetrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Time Delivery
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.onTimeDelivery}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.rating}</div>
            <div className="flex items-center mt-1">
              {getRatingStars(vendor.rating)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Information Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Vendor Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor Status:
                </span>
                <span className="text-sm font-semibold">
                  {vendorDetails.vendorStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor API:
                </span>
                <span className="text-sm">{vendorDetails.vendorAPI}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Location:
                </span>
                <span className="text-sm">{vendorDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Creation date:
                </span>
                <span className="text-sm">{vendorDetails.creationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Vendor ID:
                </span>
                <span className="text-sm">{vendorDetails.vendorID}</span>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Contact person:
                </span>
                <span className="text-sm">{vendorDetails.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  VAT Number:
                </span>
                <span className="text-sm">{vendorDetails.vatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Mobile No:
                </span>
                <span className="text-sm">{vendorDetails.mobileNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Phone No:
                </span>
                <span className="text-sm">{vendorDetails.phoneNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Finance Email:
                </span>
                <span className="text-sm">{vendorDetails.financeEmail}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Last update:
                </span>
                <span className="text-sm">{vendorDetails.lastUpdate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost List Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cost list</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transportation</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Maximum</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Palestine</TableCell>
                <TableCell>Ramallah</TableCell>
                <TableCell>Mayson</TableCell>
                <TableCell>Mayson</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>1350</TableCell>
                <TableCell>8.5</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>15/5/2025</TableCell>
                <TableCell>15/5/2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Attachments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pink-600">Vendor attachments</CardTitle>
          <p className="text-sm text-gray-600">
            Upload, download, insert data and select type of attachment
          </p>
        </CardHeader>
        <CardContent className="min-h-[100px] border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No attachments uploaded</p>
        </CardContent>
      </Card>

      {/* Payment Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pink-600">
            Payment requests per vendor
          </CardTitle>
          <p className="text-sm text-gray-600">
            View and send shipment number and confirmation date and amount and
            currency with ability to confirm, update, and print list of PR, and
            generate a payment request to be sent to the vendor
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment voucher</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-800 text-white">
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Ref number</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Currency</TableHead>
                  <TableHead className="text-white">Payment date</TableHead>
                  <TableHead className="text-white">Confirmate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sub vendor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-pink-600">Sub vendor</CardTitle>
          <p className="text-sm text-gray-600">
            Define drivers, trucks, and the default one
          </p>
        </CardHeader>
        <CardContent className="min-h-[100px] border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No sub vendors defined</p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderHistory.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(order.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{order.service}</TableCell>
                          <TableCell>${order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {getOrderStatusBadge(order.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">
                          On-Time Delivery Rate
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {performanceMetrics.onTimeDelivery}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Customer Satisfaction
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {performanceMetrics.customerSatisfaction}/5
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Avg Response Time
                        </div>
                        <div className="text-2xl font-bold">
                          {performanceMetrics.averageResponseTime}h
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${performanceMetrics.totalRevenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceMetrics.monthlyOrders.map(
                          (month, index) => (
                            <TableRow key={index}>
                              <TableCell>{month.month}</TableCell>
                              <TableCell>{month.orders}</TableCell>
                              <TableCell>
                                ${month.revenue.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            Service Agreement 2024-2025
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Signed on{" "}
                            {new Date(
                              vendor.contractStartDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Insurance Certificate</p>
                          <p className="text-sm text-muted-foreground">
                            Valid until Dec 2024
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Compliance Certificate</p>
                          <p className="text-sm text-muted-foreground">
                            Updated monthly
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
