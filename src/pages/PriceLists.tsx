import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DollarSign, Users, Plus, Edit, Trash, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubActivity } from "@/lib/types";

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

// Form schema for price list
const priceListFormSchema = z.object({
  name: z.string().min(1, "Price list name is required"),
  description: z.string().optional(),
  items: z.array(
    z.object({
      subActivityId: z.number(),
      price: z.number().min(0, "Price must be positive"),
    })
  ).optional(), // Made items optional by removing the min(1) validation
});

type PriceListFormValues = z.infer<typeof priceListFormSchema>;

export default function PriceLists() {
  // Get location to check for URL parameters
  const [location] = useLocation();
  // Check if we have a tab parameter in the URL
  const getInitialTab = () => {
    if (location.includes('?')) {
      const params = new URLSearchParams(location.split('?')[1]);
      const tabParam = params.get('tab');
      return tabParam === 'customers' ? 'customers' : 'price-lists';
    }
    return 'price-lists';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Update the active tab when URL changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedSubActivities, setSelectedSubActivities] = useState<{ 
    id: number, 
    name: string, 
    price: string,
    selected: boolean 
  }[]>([]);

  // Load sub-activities
  const { data: subActivities = [] } = useQuery<SubActivity[]>({
    queryKey: ['/api/sub-activities'],
    // For now, we'll just show a loading state if the data is not available
  });

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
  const [customers, setCustomers] = useState<{
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
  }[]>([]);

  // Initialize sample customer data on first render
  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    
    if (!storedCustomers) {
      // Simulate data that would come from a 3rd party API
      const sampleCustomers = [
        {
          id: 1,
          name: "ABC Logistics",
          contactPerson: "John Smith",
          email: "john@abclogistics.com",
          phone: "+1 555-123-4567",
          priceItems: [
            { id: 1, subActivityId: 1, subActivityName: "Box Packaging (Standard)", price: 25.99 },
            { id: 2, subActivityId: 2, subActivityName: "Wrap Packaging (Premium)", price: 45.50 },
            { id: 3, subActivityId: 3, subActivityName: "Label Printing", price: 3.25 }
          ],
          lastUpdated: new Date()
        },
        {
          id: 2,
          name: "XYZ Shipping",
          contactPerson: "Jane Doe",
          email: "jane@xyzshipping.com",
          phone: "+1 555-987-6543",
          priceItems: [
            { id: 1, subActivityId: 4, subActivityName: "Basic Insurance", price: 19.99 },
            { id: 2, subActivityId: 5, subActivityName: "Premium Insurance", price: 49.99 },
            { id: 3, subActivityId: 6, subActivityName: "Express Processing", price: 15.00 }
          ],
          lastUpdated: new Date()
        },
        {
          id: 3,
          name: "Global Transport Ltd",
          contactPerson: "Robert Johnson",
          email: "robert@globaltransport.com",
          phone: "+1 555-555-5555",
          priceItems: [
            { id: 1, subActivityId: 7, subActivityName: "Local Delivery", price: 12.99 },
            { id: 2, subActivityId: 8, subActivityName: "International Shipping", price: 89.99 }
          ],
          lastUpdated: new Date()
        },
        {
          id: 4,
          name: "City Couriers",
          contactPerson: "Maria Garcia",
          email: "maria@citycouriers.com",
          phone: "+1 555-222-3333",
          priceItems: [],
          lastUpdated: new Date()
        },
        {
          id: 5,
          name: "Fast Track Delivery",
          contactPerson: "David Wong",
          email: "david@fasttrack.com",
          phone: "+1 555-111-9999",
          priceItems: [
            { id: 1, subActivityId: 9, subActivityName: "Same-Day Delivery", price: 35.99 },
            { id: 2, subActivityId: 10, subActivityName: "Next-Day Delivery", price: 18.99 }
          ],
          lastUpdated: new Date()
        },
        {
          id: 6,
          name: "Elite Freight Services",
          contactPerson: "Sarah Johnson",
          email: "sarah@elitefreight.com",
          phone: "+1 555-444-7777",
          priceItems: [],
          lastUpdated: new Date()
        }
      ];
      
      setCustomers(sampleCustomers);
      localStorage.setItem('customers', JSON.stringify(sampleCustomers));
    } else {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  // Save customers to localStorage whenever they change
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  // Load price lists from localStorage if available
  useEffect(() => {
    const storedPriceLists = localStorage.getItem('priceLists');
    if (storedPriceLists) {
      setPriceLists(JSON.parse(storedPriceLists));
    }
  }, []);

  // Save price lists to localStorage whenever they change
  useEffect(() => {
    if (priceLists.length > 0) {
      localStorage.setItem('priceLists', JSON.stringify(priceLists));
    }
  }, [priceLists]);

  // Initialize selected sub-activities when sub-activities data loads
  useEffect(() => {
    if (subActivities && subActivities.length > 0) {
      const subActivityOptions = subActivities.map(item => ({
        id: item.id,
        name: item.itemName,
        price: "0.00",
        selected: false
      }));
      setSelectedSubActivities(subActivityOptions);
    }
  }, [subActivities]);

  // Handle form submission
  const onSubmit = (data: PriceListFormValues) => {
    // Create a new price list
    const newPriceList: PriceList = {
      id: priceLists.length + 1,
      name: data.name,
      description: data.description || "",
      items: data.items ? data.items.map((item, index) => ({
        id: index + 1,
        subActivityId: item.subActivityId,
        subActivityName: subActivities.find(sa => sa.id === item.subActivityId)?.itemName || "Custom Item",
        price: item.price
      })) : [], // Use empty array if items is undefined
      createdAt: new Date()
    };

    // Add it to the list
    setPriceLists([...priceLists, newPriceList]);
    
    // Reset form and close modal
    form.reset();
    setModalOpen(false);
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedSubActivities(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: checked } : item
      )
    );
  };

  const handlePriceChange = (id: number, price: string) => {
    setSelectedSubActivities(prev => 
      prev.map(item => 
        item.id === id ? { ...item, price } : item
      )
    );
  };

  // Update form values before submission
  const handleFormSubmit = form.handleSubmit(() => {
    const selectedItems = selectedSubActivities
      .filter(item => item.selected)
      .map(item => ({
        subActivityId: item.id,
        price: parseFloat(item.price) || 0
      }));

    // Update the form items - even if empty
    form.setValue("items", selectedItems);
    
    // Submit the form
    onSubmit(form.getValues());
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pricing Management</h2>
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
          window.history.replaceState(null, '', `/price-lists?tab=${value}`);
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="price-lists" 
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Price Lists</span>
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
        </TabsList>

        {/* Price Lists Tab */}
        <TabsContent value="price-lists" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Your Price Lists</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price list cards */}
            {priceLists.map((priceList) => (
              <Card 
                key={priceList.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-[280px]"
                onClick={() => setLocation(`/price-lists/${priceList.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{priceList.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {priceList.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {priceList.items.length} items
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Sample Items:</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {priceList.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span className="truncate max-w-[120px]">{item.subActivityName}</span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                        {priceList.items.length > 3 && (
                          <li className="text-blue-600 text-xs">
                            + {priceList.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 pb-4 mt-auto border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setLocation(`/price-lists/edit/${priceList.id}`);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      // We'll implement delete functionality later
                      const confirmed = window.confirm(`Are you sure you want to delete "${priceList.name}"?`);
                      if (confirmed) {
                        setPriceLists(priceLists.filter(pl => pl.id !== priceList.id));
                      }
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Add price list card */}
            <Card 
              className="flex flex-col items-center justify-center h-[280px] border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="rounded-full p-4 mb-4" style={{ backgroundColor: '#e3f2fd' }}>
                  <Plus className="h-8 w-8" style={{ color: '#1e88e5' }} />
                </div>
                <h3 className="text-lg font-medium mb-2">Add Price List</h3>
                <p className="text-gray-500 max-w-[200px]">
                  Create a new price list for activities and services
                </p>
              </CardContent>
            </Card>
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
                  // In a real app, this would call the API endpoint
                  const now = new Date();
                  const updatedCustomers = customers.map(customer => ({
                    ...customer,
                    lastUpdated: now
                  }));
                  setCustomers(updatedCustomers);
                  
                  // Show success message
                  alert("Customer data refreshed successfully");
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7548 5.77409 19.1446 8.33116" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M19.931 4.02148L20 8L16 8.06891" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.24522 18.2259 4.85541 15.6688" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.06897 19.9785L4 16L8 15.9311" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh Now
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card 
                key={customer.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow text-center flex flex-col"
                onClick={() => setLocation(`/customers/${customer.id}`)}
              >
                <CardContent className="flex flex-col items-center justify-center flex-grow py-8">
                  <div className="rounded-full text-white h-16 w-16 flex items-center justify-center text-xl font-bold mb-4" 
                    style={{ 
                      background: 'linear-gradient(to right, #6366f1, #9333ea)',
                      color: 'white'
                    }}>
                    {customer.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <CardTitle className="mb-2">{customer.name}</CardTitle>
                  <CardDescription>
                    {customer.priceItems.length} custom prices
                  </CardDescription>
                </CardContent>
                <div className="bg-gray-50 py-3 px-4 text-sm border-t">
                  <p className="text-gray-500">
                    Click to view details
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8">
            <Card className="bg-gray-50 border-dashed">
              <CardHeader>
                <CardTitle>About Customer Data</CardTitle>
                <CardDescription>
                  How customer data is managed in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full p-2 mt-1" style={{ backgroundColor: '#e3f2fd' }}>
                    <Users className="h-4 w-4" style={{ color: '#1e88e5' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Automated Data Synchronization</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Customer data is synchronized automatically from the external API every 6 hours.
                      The system maintains custom pricing for each customer.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-2 mt-1">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Import/Export Functionality</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      You can import custom pricing data via Excel/CSV files for each customer,
                      and export current pricing to a CSV file for offline review.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Price List Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Price List</DialogTitle>
            <DialogDescription>
              Create a price list with custom prices for sub-activities
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6">
              <div className="grid gap-4 py-4">
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="items"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Sub-Activities and Set Prices</FormLabel>
                        <FormMessage />
                        <div className="border rounded-md p-3 mt-2">
                          <div className="bg-gray-50 p-2 mb-3 grid grid-cols-12 font-medium text-sm">
                            <div className="col-span-1"></div>
                            <div className="col-span-7">Sub-Activity</div>
                            <div className="col-span-4">Price ($)</div>
                          </div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {selectedSubActivities.map((item) => (
                              <div key={item.id} className="grid grid-cols-12 items-center">
                                <div className="col-span-1">
                                  <Checkbox 
                                    checked={item.selected}
                                    onCheckedChange={(checked) => 
                                      handleCheckboxChange(item.id, checked as boolean)
                                    }
                                  />
                                </div>
                                <div className="col-span-7 truncate">{item.name}</div>
                                <div className="col-span-4">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    disabled={!item.selected}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            ))}
                            {selectedSubActivities.length === 0 && (
                              <div className="text-center py-4 text-gray-500">
                                No sub-activities available
                              </div>
                            )}
                          </div>
                        </div>
                        <FormDescription className="mt-2 text-xs">
                          Check the sub-activities you want to include and set their prices.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
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
                <Button 
                  type="button" 
                  onClick={handleFormSubmit}
                >
                  Create Price List
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}