import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import orderServices from "@/services/orderServices";
import { useLocation } from "wouter";
import { CustomerDropdown } from "@/components/CustomerDropdown";
import { LocationDropdown } from "@/components/LocationDropdown";
import { DraftRestorationDialog } from "@/components/DraftRestorationDialog";
import { useCreateOrderStorage } from "@/hooks/useCreateOrderStorage";
import {
  Package,
  MapPin,
  User,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
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
} from "@/types/types";
import { SpecialRequirementsDropdown } from "@/components/SpecialRequirementsDropdown";
import subActivityServices from "@/services/subActivityServices";
import activitieServices from "@/services/activitieServices";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Step = 1 | 2 | 3;

// Utility function to transform order data from API to form format
function transformOrderDataToFormData(orderData: any) {
  if (!orderData) return null;

  const formatDateTime = (dateTime: string | Date) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const extractId = (obj: any) => {
    if (typeof obj === "string") return obj;
    return obj?._id || obj?.id || "";
  };

  // Step 1 data
  const step1Data: CreateOrderStep1Data = {
    service: orderData.service || "Frieght",
    typesOfGoods: orderData.typesOfGoods || "",
    goodsDescription: orderData.goodsDescription || "",
    billingAccount: extractId(orderData.billingAccount),
    contactPerson: orderData.contactPerson || "",
    requesterName: orderData.requesterName || "",
    requesterMobile1: orderData.requesterMobile1 || "",
    requesterMobile2: orderData.requesterMobile2 || "",
    emailAddress: orderData.emailAddress || "",
  };

  // Step 2 data
  const step2Data: CreateOrderStep2Data = {
    pickupInfo: orderData.pickupInfo?.map((pickup: any) => ({
      pickupLocation: extractId(pickup.pickupLocation),
      pickupDetailedAddress: pickup.pickupDetailedAddress || "",
      fromTime: formatDateTime(pickup.fromTime),
      toTime: formatDateTime(pickup.toTime),
      pickupSpecialRequirements:
        pickup.pickupSpecialRequirements?.map((req: any) => ({
          subActivity: extractId(req.subActivity),
          quantity: req.quantity || 1,
          note: req.note || "",
        })) || [],
      otherRequirements: pickup.otherRequirements || "",
      pickupNotes: pickup.pickupNotes || "",
      pickupCoordinator: {
        requesterName: pickup.pickupCoordinator?.requesterName || "",
        requesterMobile1: pickup.pickupCoordinator?.requesterMobile1 || "",
        requesterMobile2: pickup.pickupCoordinator?.requesterMobile2 || "",
        emailAddress: pickup.pickupCoordinator?.emailAddress || "",
      },
    })) || [
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
    deliveryInfo: orderData.deliveryInfo?.map((delivery: any) => ({
      deliveryLocation: extractId(delivery.deliveryLocation),
      deliveryDetailedAddress: delivery.deliveryDetailedAddress || "",
      fromTime: formatDateTime(delivery.fromTime),
      toTime: formatDateTime(delivery.toTime),
      deliverySpecialRequirements:
        delivery.deliverySpecialRequirements?.map((req: any) => ({
          subActivity: extractId(req.subActivity),
          quantity: req.quantity || 1,
          note: req.note || "",
        })) || [],
      otherRequirements: delivery.otherRequirements || "",
      deliveryNotes: delivery.deliveryNotes || "",
      deliveryCoordinator: {
        requesterName: delivery.deliveryCoordinator?.requesterName || "",
        requesterMobile1: delivery.deliveryCoordinator?.requesterMobile1 || "",
        requesterMobile2: delivery.deliveryCoordinator?.requesterMobile2 || "",
        emailAddress: delivery.deliveryCoordinator?.emailAddress || "",
      },
    })) || [
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
  };

  // Step 3 data
  const step3Data: CreateOrderStep3Data = {
    shippingUnits: extractId(orderData.shippingDetails?.shippingUnits),
    typeOfTruck: extractId(orderData.shippingDetails?.typeOfTruck),
    qty: orderData.shippingDetails?.qty || 1,
    dimM: orderData.shippingDetails?.dimM || 1,
    length: orderData.shippingDetails?.length || 1,
    width: orderData.shippingDetails?.width || 1,
    height: orderData.shippingDetails?.height || 1,
    totalWeight: orderData.shippingDetails?.totalWeight || 1,
    note: orderData.shippingDetails?.note || "",
  };

  return { step1Data, step2Data, step3Data };
}

interface CreateOrderProps {
  mode?: "create" | "edit";
  orderId?: string;
  existingOrderData?: any; // This will be the order data from API
}

export default function CreateOrder({
  mode = "create",
  orderId: propOrderId,
  existingOrderData,
}: CreateOrderProps = {}) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [orderId, setOrderId] = useState<string | null>(propOrderId || null);

  // Transform existing order data if in edit mode
  const transformedData =
    mode === "edit" && existingOrderData
      ? transformOrderDataToFormData(existingOrderData)
      : null;

  const [specialRequirements, setSpecialRequirements] = useState<any[]>([]);
  const [specialReqLoading, setSpecialReqLoading] = useState(true);
  const [shippingUnits, setShippingUnits] = useState<any[]>([]);
  const [shippingUnitsLoading, setShippingUnitsLoading] = useState(false);
  const [truckTypes, setTruckTypes] = useState<any[]>([]);
  const [truckTypesLoading, setTruckTypesLoading] = useState(false);

  // Local storage management
  const { saveDraft, loadDraft, clearDraft, hasDraft } =
    useCreateOrderStorage();
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const {
    loading,
    error,
    createBasicOrder,
    addPickupDeliveryInfo,
    addShippingDetails,
    clearOrderData,
    clearOrderError,
  } = useOrders();

  // Clear any existing errors on component mount
  useEffect(() => {
    clearOrderError();
    clearOrderData();
  }, [clearOrderError, clearOrderData]);

  // Check for existing draft on component mount (only in create mode)
  useEffect(() => {
    if (mode === "create" && !draftRestored && hasDraft()) {
      setShowDraftDialog(true);
    }
  }, [mode, draftRestored, hasDraft]);

  // Load special requirements

  useEffect(() => {
    setSpecialReqLoading(true);
    subActivityServices
      .getSubActivityByPricingMethod("perItem,perLocation")
      .then((res) => {
        setSpecialRequirements(res.data.data || []);
      })
      .catch((error: any) => {
        console.error("Failed to fetch special requirements:", error);
        toast({
          title: "Warning",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load special requirements.",
          variant: "destructive",
        });
      })
      .finally(() => setSpecialReqLoading(false));
  }, [toast]);

  // Step 1 Form
  const step1Form = useForm<CreateOrderStep1Data>({
    resolver: zodResolver(createOrderStep1Schema),
    defaultValues: transformedData?.step1Data || {
      service: "Frieght",
      typesOfGoods: "",
      goodsDescription: "",
      billingAccount: "", // Will be selected from dropdown
      contactPerson: "",
      requesterName: "",
      requesterMobile1: "",
      requesterMobile2: "",
      emailAddress: "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<CreateOrderStep2Data>({
    resolver: zodResolver(createOrderStep2Schema),
    defaultValues: transformedData?.step2Data || {
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
    defaultValues: transformedData?.step3Data || {
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

  // Fetch shipping units when step 3 is active
  useEffect(() => {
    if (currentStep === 3) {
      setShippingUnitsLoading(true);
      activitieServices
        .getShippingUnitActivities()
        .then((res: any) => {
          let arr = [];
          if (Array.isArray(res.data)) {
            arr = res.data;
          } else if (res.data && Array.isArray(res.data.data)) {
            arr = res.data.data;
          }
          setShippingUnits(arr);
        })
        .finally(() => setShippingUnitsLoading(false));
    }
  }, [currentStep]);

  // Fetch truck types when shipping unit changes
  useEffect(() => {
    if (currentStep !== 3) return;
    const shippingUnitId = step3Form.watch("shippingUnits");
    if (shippingUnitId) {
      setTruckTypesLoading(true);
      subActivityServices
        .getShippingTruckTypes(shippingUnitId)
        .then((res) => {
          const subActivities = res.data.data?.subActivities || [];
          console.log("Truck types response:", res.data);
          console.log("Sub activities:", subActivities);
          setTruckTypes(subActivities);
          // Reset truck type selection when shipping unit changes
          step3Form.setValue("typeOfTruck", "");
        })
        .finally(() => setTruckTypesLoading(false));
    } else {
      setTruckTypes([]);
      step3Form.setValue("typeOfTruck", "");
    }
  }, [currentStep, step3Form.watch("shippingUnits")]);

  // Handle Step 1 submission
  const onStep1Submit = async (data: CreateOrderStep1Data) => {
    try {
      clearOrderError();

      if (mode === "edit" && orderId) {
        // Update existing order
        await orderServices.updateBasicOrder(orderId, data);
        setCurrentStep(2);
        toast({
          title: "Step 1 Updated",
          description: "Basic order information updated successfully.",
        });
      } else {
        // Create new order
        const response = await createBasicOrder(data);
        setOrderId(response.data._id);
        setCurrentStep(2);
        // Update draft with new order ID
        if (mode === "create") {
          autoSaveDraft();
        }
        toast({
          title: "Step 1 Completed",
          description: "Basic order information saved successfully.",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        mode === "edit"
          ? "Failed to update basic order"
          : "Failed to create basic order";

      console.error("Step 1 submission error:", error);
      toast({
        title: "Error",
        description: errorMessage,
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
      // Update draft with progress (only in create mode)
      if (mode === "create") {
        autoSaveDraft();
      }
      toast({
        title: mode === "edit" ? "Step 2 Updated" : "Step 2 Completed",
        description: "Pickup and delivery information saved successfully.",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add pickup and delivery info";

      console.error("Step 2 submission error:", error);
      toast({
        title: "Error",
        description: errorMessage,
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
        title:
          mode === "edit"
            ? "Order Updated Successfully"
            : "Order Created Successfully",
        description:
          mode === "edit"
            ? "Your order has been updated successfully."
            : "Your order has been created and is being processed.",
      });
      // Clear draft on successful order creation (only in create mode)
      if (mode === "create") {
        clearDraft();
        clearOrderData();
      }
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add shipping details";

      console.error("Step 3 submission error:", error);
      toast({
        title: "Error",
        description: errorMessage,
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

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      if (draft.step1) {
        step1Form.reset(draft.step1);
      }
      if (draft.step2) {
        step2Form.reset(draft.step2);
        // Restore field arrays
        if (draft.step2.pickupInfo) {
          step2Form.setValue("pickupInfo", draft.step2.pickupInfo);
        }
        if (draft.step2.deliveryInfo) {
          step2Form.setValue("deliveryInfo", draft.step2.deliveryInfo);
        }
      }
      if (draft.step3) {
        step3Form.reset(draft.step3);
      }
      if (draft.currentStep) {
        setCurrentStep(draft.currentStep as Step);
      }
      if (draft.orderId) {
        setOrderId(draft.orderId);
      }
      setDraftRestored(true);
      setLastSaved(new Date(draft.timestamp));
      toast({
        title: "Draft Restored",
        description: "Your draft order has been restored successfully.",
      });
    }
    setShowDraftDialog(false);
  };

  // Handle discard draft
  const handleDiscardDraft = () => {
    clearDraft();
    setDraftRestored(true);
    setShowDraftDialog(false);
    toast({
      title: "Draft Discarded",
      description: "Starting with a fresh order form.",
    });
  };

  // Auto-save draft (only in create mode)
  const autoSaveDraft = () => {
    if (mode !== "create") return; // Don't save drafts in edit mode

    const draftData: any = {
      currentStep,
      timestamp: Date.now(),
    };

    if (currentStep >= 1) {
      draftData.step1 = step1Form.getValues();
    }
    if (currentStep >= 2) {
      draftData.step2 = step2Form.getValues();
    }
    if (currentStep >= 3) {
      draftData.step3 = step3Form.getValues();
    }
    if (orderId) {
      draftData.orderId = orderId;
    }

    saveDraft(draftData);
    setLastSaved(new Date());
  };

  // Auto-save on form changes
  useEffect(() => {
    const step1Subscription = step1Form.watch(() => {
      if (currentStep === 1) {
        autoSaveDraft();
      }
    });

    const step2Subscription = step2Form.watch(() => {
      if (currentStep === 2) {
        autoSaveDraft();
      }
    });

    const step3Subscription = step3Form.watch(() => {
      if (currentStep === 3) {
        autoSaveDraft();
      }
    });

    return () => {
      step1Subscription.unsubscribe();
      step2Subscription.unsubscribe();
      step3Subscription.unsubscribe();
    };
  }, [currentStep, step1Form, step2Form, step3Form, orderId, saveDraft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save draft
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        autoSaveDraft();
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved.",
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [autoSaveDraft, toast]);

  // Clear order data when component unmounts
  useEffect(() => {
    return () => {
      clearOrderData();
    };
  }, []); // Empty dependency array to run only on unmount

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (lastSaved) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [lastSaved]);

  const renderStepIndicator = () => {
    const progressPercentage = ((currentStep - 1) / 3) * 100;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
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

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-600">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    );
  };

  const renderStepTitle = () => {
    const titles = {
      1:
        mode === "edit"
          ? "Edit Basic Order Information"
          : "Basic Order Information",
      2:
        mode === "edit"
          ? "Edit Pickup & Delivery Details"
          : "Pickup & Delivery Details",
      3: mode === "edit" ? "Edit Shipping Information" : "Shipping Information",
    };
    return titles[currentStep];
  };

  return (
    <div className="w-full space-y-6 p-6">
      <title>{mode === "edit" ? "Edit Order" : "Create Order"} | Wassel</title>

      {/* Draft Restoration Dialog */}
      <DraftRestorationDialog
        isOpen={showDraftDialog}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        draftInfo={(() => {
          const draft = loadDraft();
          return draft && draft.currentStep
            ? {
                currentStep: draft.currentStep,
                timestamp: draft.timestamp,
              }
            : undefined;
        })()}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
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

        {/* Save Status and Manual Save Button */}
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Save className="h-4 w-4" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoSaveDraft}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Draft</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save your progress (Ctrl/Cmd + S)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {lastSaved && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearDraft();
                        setLastSaved(null);
                        setDraftRestored(false);
                        toast({
                          title: "Draft Cleared",
                          description: "All saved progress has been cleared.",
                        });
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear Draft</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all saved progress and start fresh</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Title and Progress */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {renderStepTitle()}
        </h2>
        {draftRestored && (
          <p className="text-sm text-blue-600 mt-2">
            ✓ Draft restored - continuing from where you left off
          </p>
        )}
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

      {/* Auto-save Status */}
      {lastSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Save className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">
                Your progress is automatically saved. You can safely refresh the
                page or come back later.
              </span>
            </div>
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

                  <FormField
                    control={step1Form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact person name" {...field} />
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

                          <FormField
                            control={step2Form.control}
                            name={`pickupInfo.${index}.pickupSpecialRequirements`}
                            render={({ field }) => (
                              <FormItem>
                                <SpecialRequirementsDropdown
                                  options={specialRequirements}
                                  value={field.value || []}
                                  onChange={field.onChange}
                                  disabled={specialReqLoading}
                                  label="Pickup special requirements"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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

                          <FormField
                            control={step2Form.control}
                            name={`deliveryInfo.${index}.deliverySpecialRequirements`}
                            render={({ field }) => (
                              <FormItem>
                                <SpecialRequirementsDropdown
                                  options={specialRequirements}
                                  value={field.value || []}
                                  onChange={field.onChange}
                                  disabled={specialReqLoading}
                                  label="Delivery special requirements"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                          value={field.value}
                          disabled={shippingUnitsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  shippingUnitsLoading
                                    ? "Loading..."
                                    : "Select shipping unit"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shippingUnits.map((unit) => (
                              <SelectItem key={unit._id} value={unit._id}>
                                {unit.portalActivityNameEn}
                              </SelectItem>
                            ))}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !step3Form.watch("shippingUnits") ||
                            truckTypesLoading
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  truckTypesLoading
                                    ? "Loading..."
                                    : "Select truck type"
                                }
                              >
                                {field.value
                                  ? truckTypes.find(
                                      (t) =>
                                        (t._id || t.portalItemNameEn) ===
                                        field.value
                                    )?.portalItemNameEn || "Select truck type"
                                  : null}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {truckTypes.map((truck) => (
                              <SelectItem
                                key={truck._id || truck.portalItemNameEn}
                                value={truck._id || truck.portalItemNameEn}
                              >
                                {truck.portalItemNameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    {mode === "edit" ? "Edit Order" : "Create Order"}
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
