import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRight,
  Package,
  MapPin,
  User,
  Calendar,
  Printer,
  Save,
  Send,
} from "lucide-react";
import { useLocation } from "wouter";

const serviceRequestSchema = z.object({
  // Service info
  freightService: z.string().min(1, "Please select a freight service"),
  operationPoint: z.string().min(1, "Operation point is required"),
  billingAmount: z.string().min(1, "Billing amount is required"),

  // Requester info
  requesterName: z.string().min(1, "Requester name is required"),
  requesterContact1: z.string().min(1, "Primary contact is required"),
  requesterContact2: z.string().optional(),
  emailAddress: z.string().email("Valid email address is required"),

  // Pickup info
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupDateTime: z.string().min(1, "Pickup date and time is required"),
  pickupNotes: z.string().optional(),

  // Pickup coordinator info
  coordinatorName: z.string().min(1, "Coordinator name is required"),
  coordinatorContact1: z.string().min(1, "Coordinator contact is required"),
  coordinatorContact2: z.string().optional(),
  coordinatorEmail: z.string().email("Valid coordinator email is required"),

  // Labor requirements
  laborRequired: z.enum(["yes", "no"]),
  laborDetails: z.string().optional(),
  pickupNotes2: z.string().optional(),

  // Delivery info
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryDateTime: z.string().min(1, "Delivery date and time is required"),
  deliveryNotes: z.string().optional(),

  // Delivery coordinator info
  deliveryCoordinatorName: z
    .string()
    .min(1, "Delivery coordinator name is required"),
  deliveryCoordinatorContact1: z
    .string()
    .min(1, "Delivery coordinator contact is required"),
  deliveryCoordinatorContact2: z.string().optional(),
  deliveryCoordinatorEmail: z
    .string()
    .email("Valid delivery coordinator email is required"),

  // Delivery labor requirements
  deliveryLaborRequired: z.enum(["yes", "no"]),
  deliveryLaborDetails: z.string().optional(),
  deliveryNotes2: z.string().optional(),

  // Shipping details
  serviceType: z.string().min(1, "Service type is required"),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  quantity: z.string().optional(),
  specialInstructions: z.string().optional(),
  assignedTo: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export default function CreateOrder() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      laborRequired: "no",
      deliveryLaborRequired: "no",
    },
  });

  const onSubmit = (data: ServiceRequestFormData) => {
    console.log("Service request data:", data);

    toast({
      title: "Service Request Submitted",
      description:
        "Your service request has been submitted successfully and is being processed.",
    });

    // Navigate back to orders list
    navigate("/orders");
  };

  return (
    <div className="w-full space-y-6 p-6">
      <title>Create Order | Wassel</title>
      <div className="flex items-center space-x-4 mb-8 relative">
        <div className="bg-blue-600 text-white p-3 rounded-lg">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Request a service
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to request a new service
          </p>
        </div>

        {/* Absolute positioned button */}
        <div className="absolute top-0 right-0">
          <Button
            type="submit"
            form="service-request-form"
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-white font-medium rounded-lg"
          >
            <Send className="mr-2 h-5 w-5" />
            Send order
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          id="service-request-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Service info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="freightService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Freight service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type of service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="express">
                            Express Delivery
                          </SelectItem>
                          <SelectItem value="standard">
                            Standard Shipping
                          </SelectItem>
                          <SelectItem value="freight">
                            Freight Service
                          </SelectItem>
                          <SelectItem value="international">
                            International
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operationPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operation point</FormLabel>
                      <FormControl>
                        <Input placeholder="Operation point" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="Billing Amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Requester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Requester info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="requesterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Requester Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requesterContact1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester contact 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Requester contact 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requesterContact2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester contact 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Requester contact 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Pickup Info Section */}
          <div className="bg-blue-50 p-1 rounded-lg">
            <div className="bg-blue-600 text-white p-3 rounded-lg mb-6">
              <h3 className="font-medium">
                Trip schedule for pickup operation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Pickup Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Pickup info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup location</FormLabel>
                        <FormControl>
                          <Input placeholder="Pickup location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Pickup address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup date and time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Amount</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Pickup special requirements
                      </Label>
                      <div className="flex space-x-2">
                        <Button type="button" variant="outline" size="sm">
                          Equipment
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Teflon
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Crane
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Electric unit
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="laborRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labor</FormLabel>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="yes"
                                checked={field.value === "yes"}
                                onChange={() => field.onChange("yes")}
                              />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="no"
                                checked={field.value === "no"}
                                onChange={() => field.onChange("no")}
                              />
                              <span>No</span>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="laborDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many men?</FormLabel>
                          <FormControl>
                            <Input placeholder="Number of workers" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pickupNotes2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional pickup notes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Coordinator Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Pickup coordinator info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="coordinatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Coordinator name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coordinatorContact1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester contact 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Coordinator contact 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coordinatorContact2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester contact 2</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Coordinator contact 2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coordinatorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Coordinator email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Delivery Info Section */}
          <div className="bg-blue-50 p-1 rounded-lg">
            <div className="bg-blue-600 text-white p-3 rounded-lg mb-6">
              <h3 className="font-medium">
                Trip schedule for delivery operation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Delivery info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery location</FormLabel>
                        <FormControl>
                          <Input placeholder="Delivery location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Delivery address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery date and time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Amount</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Delivery special requirements
                      </Label>
                      <div className="flex space-x-2">
                        <Button type="button" variant="outline" size="sm">
                          Equipment
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Teflon
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Crane
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          Electric unit
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryLaborRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labor</FormLabel>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="yes"
                                checked={field.value === "yes"}
                                onChange={() => field.onChange("yes")}
                              />
                              <span>Yes</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="no"
                                checked={field.value === "no"}
                                onChange={() => field.onChange("no")}
                              />
                              <span>No</span>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryLaborDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other requirement</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Additional requirements"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryNotes2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional delivery notes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Coordinator Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Delivery coordinator info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryCoordinatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Delivery coordinator name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryCoordinatorContact1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester contact 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Delivery coordinator contact 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryCoordinatorContact2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester contact 2</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Delivery coordinator contact 2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryCoordinatorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Delivery coordinator email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-blue-50 p-1 rounded-lg">
            <div className="bg-blue-600 text-white p-3 rounded-lg mb-6">
              <h3 className="font-medium">
                Trip schedule for shipping operation
              </h3>
            </div>

            <Card className="m-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Shipping details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Service Type
                    </Label>
                    <div className="flex space-x-1">
                      <Button type="button" variant="outline" size="sm">
                        FCL
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        LCL
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        FTL
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        LTL
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        Express
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>H*W*L (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="Dimensions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="Weight (kg)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total amount of items</FormLabel>
                        <FormControl>
                          <Input placeholder="Quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any description of items</FormLabel>
                        <FormControl>
                          <Input placeholder="Item description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned to</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Personnel assigned to this shipment for tracking"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
