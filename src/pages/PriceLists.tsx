import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DollarSign, Users, Plus, Edit, Trash, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Interface for PriceList items
interface PriceListItem {
  id: number;
  subActivityId: number;
  subActivityName: string;
  price: number;
}

// Interface for PriceList
interface PriceList {
  id: number;
  name: string;
  description: string;
  items: PriceListItem[];
  createdAt: Date;
}

// Interface for SubActivity
interface SubActivity {
  id: number;
  itemName: string;
  itemSrl: string;
  parentId: number;
}

// Form schema for price list
const priceListFormSchema = z.object({
  name: z.string().min(1, "Price list name is required"),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        subActivityId: z.number(),
        price: z.number().min(0, "Price must be positive"),
      })
    )
    .optional(),
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

export default function PriceLists() {
  // Get location to check for URL parameters
  const [location] = useLocation();
  const { toast } = useToast();

  // Check if we have a tab parameter in the URL
  const getInitialTab = () => {
    if (location.includes("?")) {
      const params = new URLSearchParams(location.split("?")[1]);
      const tabParam = params.get("tab");
      return tabParam === "customers" ? "customers" : "price-lists";
    }
    return "price-lists";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update the active tab when URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location]);

  const [modalOpen, setModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedSubActivities, setSelectedSubActivities] = useState<
    {
      id: number;
      name: string;
      price: string;
      selected: boolean;
    }[]
  >([]);

  // Sample sub-activities data
  const [subActivities, setSubActivities] = useState<SubActivity[]>([
    {
      id: 1,
      itemName: "Box Packaging (Standard)",
      itemSrl: "X01-B01",
      parentId: 1,
    },
    {
      id: 2,
      itemName: "Wrap Packaging (Premium)",
      itemSrl: "X01-W01",
      parentId: 1,
    },
    { id: 3, itemName: "Label Printing", itemSrl: "X01-L01", parentId: 1 },
    { id: 4, itemName: "Basic Insurance", itemSrl: "I01-B01", parentId: 2 },
    { id: 5, itemName: "Premium Insurance", itemSrl: "I01-P01", parentId: 2 },
    { id: 6, itemName: "Express Processing", itemSrl: "F01-E01", parentId: 5 },
    { id: 7, itemName: "Local Delivery", itemSrl: "T01-L01", parentId: 4 },
    {
      id: 8,
      itemName: "International Shipping",
      itemSrl: "T01-I01",
      parentId: 4,
    },
    { id: 9, itemName: "Same-Day Delivery", itemSrl: "T01-S01", parentId: 4 },
    { id: 10, itemName: "Next-Day Delivery", itemSrl: "T01-N01", parentId: 4 },
  ]);

  // Sample price lists data
  const [priceLists, setPriceLists] = useState<PriceList[]>([
    {
      id: 1,
      name: "Standard Prices 2025",
      description: "Default pricing for all standard services",
      items: [
        {
          id: 1,
          subActivityId: 1,
          subActivityName: "Box Packaging (Standard)",
          price: 19.99,
        },
        {
          id: 2,
          subActivityId: 3,
          subActivityName: "Label Printing",
          price: 2.5,
        },
        {
          id: 3,
          subActivityId: 7,
          subActivityName: "Local Delivery",
          price: 9.99,
        },
      ],
      createdAt: new Date("2025-01-15"),
    },
    {
      id: 2,
      name: "Premium Services",
      description: "Premium pricing for high-end services",
      items: [
        {
          id: 1,
          subActivityId: 2,
          subActivityName: "Wrap Packaging (Premium)",
          price: 39.99,
        },
        {
          id: 2,
          subActivityId: 5,
          subActivityName: "Premium Insurance",
          price: 59.99,
        },
        {
          id: 3,
          subActivityId: 9,
          subActivityName: "Same-Day Delivery",
          price: 29.99,
        },
      ],
      createdAt: new Date("2025-02-01"),
    },
    {
      id: 3,
      name: "Corporate Package 2025",
      description: "Discounted rates for corporate clients",
      items: [
        {
          id: 1,
          subActivityId: 1,
          subActivityName: "Box Packaging (Standard)",
          price: 15.99,
        },
        {
          id: 2,
          subActivityId: 4,
          subActivityName: "Basic Insurance",
          price: 14.99,
        },
        {
          id: 3,
          subActivityId: 8,
          subActivityName: "International Shipping",
          price: 69.99,
        },
        {
          id: 4,
          subActivityId: 10,
          subActivityName: "Next-Day Delivery",
          price: 15.99,
        },
      ],
      createdAt: new Date("2025-02-15"),
    },
  ]);

  // Initialize form
  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      name: "",
      description: "",
      items: [],
    },
  });

  // Simulated customer data
  const [customers, setCustomers] = useState<
    {
      id: number;
      name: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      priceItems: {
        id: number;
        subActivityId: number;
        subActivityName: string;
        price: number;
      }[];
      lastUpdated: Date;
    }[]
  >([
    {
      id: 1,
      name: "ABC Logistics",
      contactPerson: "John Smith",
      email: "john@abclogistics.com",
      phone: "+1 555-123-4567",
      priceItems: [
        {
          id: 1,
          subActivityId: 1,
          subActivityName: "Box Packaging (Standard)",
          price: 25.99,
        },
        {
          id: 2,
          subActivityId: 2,
          subActivityName: "Wrap Packaging (Premium)",
          price: 45.5,
        },
        {
          id: 3,
          subActivityId: 3,
          subActivityName: "Label Printing",
          price: 3.25,
        },
      ],
      lastUpdated: new Date("2025-05-01"),
    },
    {
      id: 2,
      name: "XYZ Shipping",
      contactPerson: "Jane Doe",
      email: "jane@xyzshipping.com",
      phone: "+1 555-987-6543",
      priceItems: [
        {
          id: 1,
          subActivityId: 4,
          subActivityName: "Basic Insurance",
          price: 19.99,
        },
        {
          id: 2,
          subActivityId: 5,
          subActivityName: "Premium Insurance",
          price: 49.99,
        },
        {
          id: 3,
          subActivityId: 6,
          subActivityName: "Express Processing",
          price: 15.0,
        },
      ],
      lastUpdated: new Date("2025-04-28"),
    },
    {
      id: 3,
      name: "Global Transport Ltd",
      contactPerson: "Robert Johnson",
      email: "robert@globaltransport.com",
      phone: "+1 555-555-5555",
      priceItems: [
        {
          id: 1,
          subActivityId: 7,
          subActivityName: "Local Delivery",
          price: 12.99,
        },
        {
          id: 2,
          subActivityId: 8,
          subActivityName: "International Shipping",
          price: 89.99,
        },
      ],
      lastUpdated: new Date("2025-05-05"),
    },
    {
      id: 4,
      name: "City Couriers",
      contactPerson: "Maria Garcia",
      email: "maria@citycouriers.com",
      phone: "+1 555-222-3333",
      priceItems: [],
      lastUpdated: new Date("2025-05-02"),
    },
    {
      id: 5,
      name: "Fast Track Delivery",
      contactPerson: "David Wong",
      email: "david@fasttrack.com",
      phone: "+1 555-111-9999",
      priceItems: [
        {
          id: 1,
          subActivityId: 9,
          subActivityName: "Same-Day Delivery",
          price: 35.99,
        },
        {
          id: 2,
          subActivityId: 10,
          subActivityName: "Next-Day Delivery",
          price: 18.99,
        },
      ],
      lastUpdated: new Date("2025-04-30"),
    },
    {
      id: 6,
      name: "Elite Freight Services",
      contactPerson: "Sarah Johnson",
      email: "sarah@elitefreight.com",
      phone: "+1 555-444-7777",
      priceItems: [],
      lastUpdated: new Date("2025-05-03"),
    },
  ]);

  // Initialize selected sub-activities when sub-activities data loads
  useEffect(() => {
    if (subActivities && subActivities.length > 0) {
      const subActivityOptions = subActivities.map((item) => ({
        id: item.id,
        name: item.itemName,
        price: "0.00",
        selected: false,
      }));
      setSelectedSubActivities(subActivityOptions);
    }
  }, [subActivities]);

  // Handle form submission
  const onSubmit = (data: PriceListFormValues) => {
    // Create a new price list
    const newPriceList: PriceList = {
      id: Math.max(0, ...priceLists.map((p) => p.id)) + 1,
      name: data.name,
      description: data.description || "",
      items: data.items
        ? data.items.map((item, index) => ({
            id: index + 1,
            subActivityId: item.subActivityId,
            subActivityName:
              subActivities.find((sa) => sa.id === item.subActivityId)
                ?.itemName || "Custom Item",
            price: item.price,
          }))
        : [],
      createdAt: new Date(),
    };

    // Add it to the list
    setPriceLists([...priceLists, newPriceList]);

    // Reset form and close modal
    form.reset();
    setModalOpen(false);

    // Show success toast
    toast({
      title: "Success",
      description: "Price list created successfully",
    });
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: checked } : item
      )
    );
  };

  const handlePriceChange = (id: number, price: string) => {
    setSelectedSubActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  };

  // Update form values before submission
  const handleFormSubmit = form.handleSubmit(() => {
    const selectedItems = selectedSubActivities
      .filter((item) => item.selected)
      .map((item) => ({
        subActivityId: item.id,
        price: parseFloat(item.price) || 0,
      }));

    // Update the form items - even if empty
    form.setValue("items", selectedItems);

    // Submit the form
    onSubmit(form.getValues());
  });

  return (
    <div className="space-y-6">
      <title>Price Lists | Wassel</title>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Pricing Management
        </h2>
        <p className="text-gray-500 mt-2">
          Manage your pricing information, rate cards, and customer data
        </p>
      </div>

      <Tabs
        defaultValue="price-lists"
        className="w-full"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          // Update URL to reflect tab change without navigation
          window.history.replaceState(null, "", `/price-lists?tab=${value}`);
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="price-lists" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Price Lists</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
        </TabsList>

        {/* Price Lists Tab */}
        <TabsContent value="price-lists" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Your Price Lists</h3>
            <Button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2"
              style={{
                backgroundColor: "#1e88e5",
                color: "white",
                border: "none",
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Price List</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {/* Price list cards */}
            {priceLists.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
                  <div className="rounded-full bg-blue-100 p-4 mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Price Lists</h3>
                  <p className="text-gray-500 max-w-md">
                    You haven't created any price lists yet. Click the "Add
                    Price List" button to create your first one.
                  </p>
                </CardContent>
              </Card>
            ) : (
              priceLists.map((priceList) => (
                <Card
                  key={priceList.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex flex-col h-[320px] sm:h-[300px] lg:h-[280px]"
                  onClick={() => setLocation(`/price-lists/${priceList.id}`)}
                >
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg line-clamp-1">
                      {priceList.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 h-10 text-xs sm:text-sm">
                      {priceList.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-hidden px-4 sm:px-6">
                    <div className="space-y-2">
                      <div className="text-xs sm:text-sm font-medium text-gray-500">
                        {priceList.items.length} items
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="font-medium">Sample Items:</span>
                        </div>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          {priceList.items.slice(0, 2).map((item) => (
                            <li
                              key={item.id}
                              className="flex justify-between items-center gap-2"
                            >
                              <span className="truncate flex-1 min-w-0">
                                {item.subActivityName}
                              </span>
                              <span className="font-medium text-green-600 whitespace-nowrap">
                                ${item.price.toFixed(2)}
                              </span>
                            </li>
                          ))}
                          {priceList.items.length > 2 && (
                            <li className="text-blue-600 text-xs">
                              + {priceList.items.length - 2} more items
                            </li>
                          )}
                          {priceList.items.length === 0 && (
                            <li className="text-gray-400 italic text-xs">
                              No items added yet
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2 pb-4 mt-auto border-t px-4 sm:px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setLocation(`/price-lists/edit/${priceList.id}`);
                      }}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm text-red-500 hover:text-red-600 hover:border-red-300"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        const confirmed = window.confirm(
                          `Are you sure you want to delete "${priceList.name}"?`
                        );
                        if (confirmed) {
                          setPriceLists(
                            priceLists.filter((pl) => pl.id !== priceList.id)
                          );
                          toast({
                            title: "Success",
                            description: "Price list deleted successfully",
                          });
                        }
                      }}
                    >
                      <Trash className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}

            {/* Add price list card */}
            {priceLists.length > 0 && (
              <Card
                className="flex flex-col items-center justify-center h-[280px] border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setModalOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div
                    className="rounded-full p-4 mb-4"
                    style={{ backgroundColor: "#e3f2fd" }}
                  >
                    <Plus className="h-8 w-8" style={{ color: "#1e88e5" }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Add Price List</h3>
                  <p className="text-gray-500 max-w-[200px]">
                    Create a new price list for activities and services
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Your Customers</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                Data refreshed every 6 hours
              </p>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // Simulate refreshing data from API
                  const now = new Date();
                  const updatedCustomers = customers.map((customer) => ({
                    ...customer,
                    lastUpdated: now,
                  }));
                  setCustomers(updatedCustomers);

                  // Show success message
                  toast({
                    title: "Success",
                    description: "Customer data refreshed successfully",
                  });
                }}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7548 5.77409 19.1446 8.33116"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.24516 18.2259 4.85541 15.6688"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.9999 8L19.9999 8L19.9999 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 16L4 16L4 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-[280px]"
                onClick={() => setLocation(`/customers/${customer.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{customer.name}</CardTitle>
                  <CardDescription>
                    {customer.contactPerson && (
                      <div className="text-sm">
                        Contact: {customer.contactPerson}
                      </div>
                    )}
                    {customer.email && (
                      <div className="text-sm truncate">{customer.email}</div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {customer.priceItems.length
                        ? `${customer.priceItems.length} custom prices`
                        : "No custom pricing"}
                    </div>
                    {customer.priceItems.length > 0 && (
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">
                            Sample Custom Prices:
                          </span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {customer.priceItems.slice(0, 3).map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <span className="truncate max-w-[120px]">
                                {item.subActivityName}
                              </span>
                              <span className="font-medium">
                                ${item.price.toFixed(2)}
                              </span>
                            </li>
                          ))}
                          {customer.priceItems.length > 3 && (
                            <li className="text-blue-600 text-xs">
                              + {customer.priceItems.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2 pb-4 mt-auto border-t">
                  <div className="text-xs text-gray-500">
                    Updated:{" "}
                    {new Date(customer.lastUpdated).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setLocation(`/customers/${customer.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Price List Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Price List</DialogTitle>
            <DialogDescription>
              Create a new price list for your activities and services.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price List Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter price list name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a brief description for this price list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Select Sub-Activities and Set Prices
                </h4>
                <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 w-8"></th>
                        <th className="text-left py-2 px-2">Activity</th>
                        <th className="text-left py-2 px-2 w-32">Price ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubActivities.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 px-2">
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(item.id, checked === true)
                              }
                            />
                          </td>
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="py-2 px-2">
                            <Input
                              disabled={!item.selected}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handlePriceChange(item.id, e.target.value)
                              }
                              className="h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Price List</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
