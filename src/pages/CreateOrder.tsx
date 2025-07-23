import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useOrders } from "@/hooks/useOrders";
import { useLocation } from "wouter";
import { CustomerDropdown } from "@/components/CustomerDropdown";
import { LocationDropdown } from "@/components/LocationDropdown";
import {
  Package,
  MapPin,
  User,
  Calendar,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  createOrderStep1Schema,
  createOrderStep2Schema,
  createOrderStep3Schema,
  CreateOrderStep1Data,
  CreateOrderStep2Data,
  CreateOrderStep3Data,
  PickupSpecialRequirementData,
  DeliverySpecialRequirementData,
  CoordinatorData,
} from "@/types/types";

type Step = 1 | 2 | 3;

export default function CreateOrder() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    loading,
    error,
    success,
    createBasicOrder,
    addPickupDeliveryInfo,
    addShippingDetails,
    clearOrderData,
    clearOrderError,
  } = useOrders();

  // Step 1 Form
  const step1Form = useForm<CreateOrderStep1Data>({
    resolver: zodResolver(createOrderStep1Schema),
    defaultValues: {
      service: "",
      typesOfGoods: "",
      goodsDescription: "",
      billingAccount: "", // Will be selected from dropdown
      requesterName: "",
      requesterMobile1: "",
      requesterMobile2: "",
      emailAddress: "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<CreateOrderStep2Data>({
    resolver: zodResolver(createOrderStep2Schema),
    defaultValues: {
      pickupInfo: [
        {
          pickupLocation: "",
          pickupDetailedAddress: "",
          fromTime: "",
          toTime: "",
          pickupSpecialRequirements: [],
          otherRequirements: "",
          pickupNotes: "",
          pickupCoordinator: {
            requesterName: "",
            requesterMobile1: "",
            requesterMobile2: "",
            emailAddress: "",
          },
        },
      ],
      deliveryInfo: [
        {
          deliveryLocation: "",
          deliveryDetailedAddress: "",
          fromTime: "",
          toTime: "",
          deliverySpecialRequirements: [],
          otherRequirements: "",
          deliveryNotes: "",
          deliveryCoordinator: {
            requesterName: "",
            requesterMobile1: "",
            requesterMobile2: "",
            emailAddress: "",
          },
        },
      ],
    },
  });

  // Field arrays for multiple pickup and delivery locations
  const {
    fields: pickupFields,
    append: appendPickup,
    remove: removePickup,
  } = useFieldArray({
    control: step2Form.control,
    name: "pickupInfo",
  });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({
    control: step2Form.control,
    name: "deliveryInfo",
  });

  // Step 3 Form
  const step3Form = useForm<CreateOrderStep3Data>({
    resolver: zodResolver(createOrderStep3Schema),
    defaultValues: {
      shippingUnits: "",
      typeOfTruck: "",
      qty: 1,
      dimM: 1, // Changed from 0 to 1 to meet minimum requirement
      length: 1, // Changed from 0 to 1 to meet minimum requirement
      width: 1, // Changed from 0 to 1 to meet minimum requirement
      height: 1, // Changed from 0 to 1 to meet minimum requirement
      totalWeight: 1, // Changed from 0 to 1 to meet minimum requirement
      note: "",
    },
  });

  // Handle Step 1 submission
  const onStep1Submit = async (data: CreateOrderStep1Data) => {
    try {
      clearOrderError();
      const response = await createBasicOrder(data);
      setOrderId(response.data._id);
      setCurrentStep(2);
      toast({
        title: "Step 1 Completed",
        description: "Basic order information saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create basic order",
        variant: "destructive",
      });
    }
  };

  // Handle Step 2 submission
  const onStep2Submit = async (data: CreateOrderStep2Data) => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID not found. Please start from step 1.",
        variant: "destructive",
      });
      return;
    }

    try {
      clearOrderError();
      await addPickupDeliveryInfo(orderId, data);
      setCurrentStep(3);
      toast({
        title: "Step 2 Completed",
        description: "Pickup and delivery information saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add pickup and delivery info",
        variant: "destructive",
      });
    }
  };

  // Handle Step 3 submission
  const onStep3Submit = async (data: CreateOrderStep3Data) => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID not found. Please start from step 1.",
        variant: "destructive",
      });
      return;
    }

    try {
      clearOrderError();

      // Ensure all numeric values are properly converted to numbers and meet minimum requirements
      const processedData = {
        ...data,
        qty: Math.max(1, Number(data.qty) || 1),
        dimM: Math.max(1, Number(data.dimM) || 1),
        length: Math.max(1, Number(data.length) || 1),
        width: Math.max(1, Number(data.width) || 1),
        height: Math.max(1, Number(data.height) || 1),
        totalWeight: Math.max(1, Number(data.totalWeight) || 1),
      };

      console.log("Step 3 data being sent:", processedData);

      await addShippingDetails(orderId, processedData);
      toast({
        title: "Order Created Successfully",
        description: "Your order has been created and is being processed.",
      });
      clearOrderData();
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add shipping details",
        variant: "destructive",
      });
    }
  };

  // Handle going back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  // Handle going to next step
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  // Clear order data when component unmounts
  useEffect(() => {
    return () => {
      clearOrderData();
    };
  }, []); // Empty dependency array to run only on unmount

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-400 border-gray-300"
              }`}
            >
              {currentStep > step ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepTitle = () => {
    const titles = {
      1: "Basic Order Information",
      2: "Pickup & Delivery Details",
      3: "Shipping Information",
    };
    return titles[currentStep];
  };

  return (
    <div className="w-full space-y-6 p-6">
      <title>Create Order | Wassel</title>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-lg">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Order
          </h1>
          <p className="text-muted-foreground">
            Complete the form below to create a new order
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {renderStepTitle()}
        </h2>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Step 1: Basic Order Information */}
      {currentStep === 1 && (
        <Form {...step1Form}>
          <form
            onSubmit={step1Form.handleSubmit(onStep1Submit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={step1Form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Freight Service">
                              Freight Service
                            </SelectItem>
                            <SelectItem value="Express Delivery">
                              Express Delivery
                            </SelectItem>
                            <SelectItem value="Standard Shipping">
                              Standard Shipping
                            </SelectItem>
                            <SelectItem value="International">
                              International
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="typesOfGoods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Types of Goods</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Electronics, Furniture, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="goodsDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goods Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of the goods"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="billingAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Account</FormLabel>
                        <FormControl>
                          <CustomerDropdown
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select billing account"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Requester Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={step1Form.control}
                    name="requesterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="requesterMobile1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="requesterMobile2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Mobile (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+0987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step1Form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
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

            {/* Navigation */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 2: Pickup & Delivery Details */}
      {currentStep === 2 && (
        <Form {...step2Form}>
          <form
            onSubmit={step2Form.handleSubmit(onStep2Submit)}
            className="space-y-6"
          >
            {/* Pickup Information Accordion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Pickup Information
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendPickup({
                        pickupLocation: "",
                        pickupDetailedAddress: "",
                        fromTime: "",
                        toTime: "",
                        pickupSpecialRequirements: [],
                        otherRequirements: "",
                        pickupNotes: "",
                        pickupCoordinator: {
                          requesterName: "",
                          requesterMobile1: "",
                          requesterMobile2: "",
                          emailAddress: "",
                        },
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pickup Location
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {pickupFields.map((field, index) => (
                    <AccordionItem
                      key={field.id}
                      value={`pickup-${index}`}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">
                            Pickup Location {index + 1}
                          </span>
                          {pickupFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePickup(index);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name={`pickupInfo.${index}.pickupLocation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pickup Location</FormLabel>
                                  <FormControl>
                                    <LocationDropdown
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      placeholder="Select pickup location"
                                      useAddressString={false}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={step2Form.control}
                              name={`pickupInfo.${index}.pickupDetailedAddress`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Detailed Address</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Full pickup address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name={`pickupInfo.${index}.fromTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>From Time</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={step2Form.control}
                              name={`pickupInfo.${index}.toTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>To Time</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={step2Form.control}
                            name={`pickupInfo.${index}.otherRequirements`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Other Requirements</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Additional requirements"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={step2Form.control}
                            name={`pickupInfo.${index}.pickupNotes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pickup Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Special instructions for pickup"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Pickup Coordinator */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-4">
                              Pickup Coordinator
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={step2Form.control}
                                name={`pickupInfo.${index}.pickupCoordinator.requesterName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Coordinator Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Coordinator name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`pickupInfo.${index}.pickupCoordinator.requesterMobile1`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Primary Mobile</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="+1234567890"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`pickupInfo.${index}.pickupCoordinator.requesterMobile2`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Secondary Mobile</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="+0987654321"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`pickupInfo.${index}.pickupCoordinator.emailAddress`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="coordinator@example.com"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Delivery Information Accordion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Delivery Information
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendDelivery({
                        deliveryLocation: "",
                        deliveryDetailedAddress: "",
                        fromTime: "",
                        toTime: "",
                        deliverySpecialRequirements: [],
                        otherRequirements: "",
                        deliveryNotes: "",
                        deliveryCoordinator: {
                          requesterName: "",
                          requesterMobile1: "",
                          requesterMobile2: "",
                          emailAddress: "",
                        },
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery Location
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {deliveryFields.map((field, index) => (
                    <AccordionItem
                      key={field.id}
                      value={`delivery-${index}`}
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">
                            Delivery Location {index + 1}
                          </span>
                          {deliveryFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDelivery(index);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name={`deliveryInfo.${index}.deliveryLocation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Delivery Location</FormLabel>
                                  <FormControl>
                                    <LocationDropdown
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      placeholder="Select delivery location"
                                      useAddressString={false}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={step2Form.control}
                              name={`deliveryInfo.${index}.deliveryDetailedAddress`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Detailed Address</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Full delivery address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name={`deliveryInfo.${index}.fromTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>From Time</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={step2Form.control}
                              name={`deliveryInfo.${index}.toTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>To Time</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={step2Form.control}
                            name={`deliveryInfo.${index}.otherRequirements`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Other Requirements</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Additional requirements"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={step2Form.control}
                            name={`deliveryInfo.${index}.deliveryNotes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Special instructions for delivery"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Delivery Coordinator */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-4">
                              Delivery Coordinator
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={step2Form.control}
                                name={`deliveryInfo.${index}.deliveryCoordinator.requesterName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Coordinator Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Coordinator name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`deliveryInfo.${index}.deliveryCoordinator.requesterMobile1`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Primary Mobile</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="+1234567890"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`deliveryInfo.${index}.deliveryCoordinator.requesterMobile2`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Secondary Mobile</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="+0987654321"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={step2Form.control}
                                name={`deliveryInfo.${index}.deliveryCoordinator.emailAddress`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="coordinator@example.com"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Shipping Information */}
      {currentStep === 3 && (
        <Form {...step3Form}>
          <form
            onSubmit={step3Form.handleSubmit(onStep3Submit)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step3Form.control}
                    name="shippingUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Units</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shipping units" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pallets">Pallets</SelectItem>
                            <SelectItem value="Boxes">Boxes</SelectItem>
                            <SelectItem value="Crates">Crates</SelectItem>
                            <SelectItem value="Containers">
                              Containers
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="typeOfTruck"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Truck</FormLabel>
                        <FormControl>
                          <Input placeholder="Truck type ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={step3Form.control}
                    name="qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="dimM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions (m³)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step3Form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (m)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="totalWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              field.onChange(value > 0 ? value : 1);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step3Form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional shipping notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Step
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  "Creating Order..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
