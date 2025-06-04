import { useState } from "react";
import { Vendor, InsertVendor, vendorSchema } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLocation } from "wouter";

const sampleVendors: Vendor[] = [
  {
    id: 1,
    name: "Global Logistics Corp",
    contactPerson: "John Martinez",
    email: "john@globallogistics.com",
    phone: "+1 555-100-2000",
    address: "123 Industrial Way, Business District, NY 10001",
    category: "Transportation",
    status: "active",
    contractStartDate: "2024-01-15",
    contractEndDate: "2025-01-15",
    rating: 4.5,
    totalOrders: 145,
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: 2,
    name: "Quick Ship Solutions",
    contactPerson: "Sarah Chen",
    email: "sarah@quickship.com",
    phone: "+1 555-200-3000",
    address: "456 Commerce Blvd, Trade Center, CA 90210",
    category: "Express Delivery",
    status: "active",
    contractStartDate: "2024-02-01",
    contractEndDate: "2025-02-01",
    rating: 4.8,
    totalOrders: 89,
    createdAt: "2024-01-25T14:30:00Z",
  },
  {
    id: 3,
    name: "Warehouse Masters",
    contactPerson: "Mike Johnson",
    email: "mike@warehousemasters.com",
    phone: "+1 555-300-4000",
    address: "789 Storage Lane, Industrial Park, TX 75001",
    category: "Warehousing",
    status: "inactive",
    contractStartDate: "2023-06-01",
    contractEndDate: "2024-06-01",
    rating: 3.9,
    totalOrders: 67,
    createdAt: "2023-05-20T09:15:00Z",
  },
  {
    id: 4,
    name: "Premium Freight Services",
    contactPerson: "Lisa Wang",
    email: "lisa@premiumfreight.com",
    phone: "+1 555-400-5000",
    address: "321 Freight Avenue, Port District, FL 33101",
    category: "Freight",
    status: "active",
    contractStartDate: "2024-03-01",
    contractEndDate: "2025-03-01",
    rating: 4.2,
    totalOrders: 112,
    createdAt: "2024-02-15T11:45:00Z",
  },
];

export default function VendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>(sampleVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertVendor>({
    resolver: zodResolver(vendorSchema.omit({ id: true, createdAt: true })),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      status: "active",
      contractStartDate: "",
      contractEndDate: "",
      rating: 0,
      totalOrders: 0,
    },
  });

  const editForm = useForm<Vendor>({
    resolver: zodResolver(vendorSchema),
    defaultValues: editingVendor || {},
  });

  // Filter vendors based on search, status, and category
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || vendor.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddVendor = (data: InsertVendor) => {
    const newVendor: Vendor = {
      ...data,
      id: Math.max(...vendors.map((v) => v.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };

    setVendors([...vendors, newVendor]);
    setIsAddDialogOpen(false);
    form.reset();

    toast({
      title: "Vendor Created",
      description: `Vendor ${newVendor.name} has been created successfully.`,
    });
  };

  const handleEditVendor = (data: Vendor) => {
    setVendors(
      vendors.map((vendor) =>
        vendor.id === editingVendor?.id
          ? { ...data, id: editingVendor.id }
          : vendor
      )
    );
    setIsEditDialogOpen(false);
    setEditingVendor(null);
    editForm.reset();

    toast({
      title: "Vendor Updated",
      description: `Vendor ${data.name} has been updated successfully.`,
    });
  };

  const handleDeleteVendor = (vendorId: number) => {
    const vendorToDelete = vendors.find((vendor) => vendor.id === vendorId);
    setVendors(vendors.filter((vendor) => vendor.id !== vendorId));

    toast({
      title: "Vendor Deleted",
      description: `Vendor ${vendorToDelete?.name} has been deleted successfully.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    editForm.reset(vendor);
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: Vendor["status"]) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
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

  const categories = Array.from(new Set(vendors.map((v) => v.category)));

  return (
    <div className="space-y-6">
      <title>Vendors List | Wassel</title>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your vendor partnerships and contracts
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddVendor)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Global Logistics Corp"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="John Martinez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@vendor.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555-100-2000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Business Street, City, State, ZIP"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Transportation">
                              Transportation
                            </SelectItem>
                            <SelectItem value="Express Delivery">
                              Express Delivery
                            </SelectItem>
                            <SelectItem value="Warehousing">
                              Warehousing
                            </SelectItem>
                            <SelectItem value="Freight">Freight</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                            <SelectItem value="Logistics">Logistics</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contractEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Vendor</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.filter((v) => v.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.length > 0
                ? (
                    vendors.reduce((sum, v) => sum + v.rating, 0) /
                    vendors.length
                  ).toFixed(1)
                : "0.0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No vendors found.{" "}
                  {searchTerm && "Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-gray-500">
                        {vendor.contactPerson}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {vendor.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getRatingStars(vendor.rating)}
                      <span className="text-sm ml-2">{vendor.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.totalOrders}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(vendor.contractEndDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(vendor);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVendor(vendor.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog - Similar to Add Dialog but for editing */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditVendor)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Vendor</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
