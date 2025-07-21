import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";
import { useAppSelector, useAppDispatch } from "@/hooks/useAppSelector";
import { actGetLocations } from "@/store/locations/act";

// Validation schemas
const locationPriceSchema = z.object({
  location: z.string().min(1, "Location is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  cost: z.number().min(0, "Cost must be positive"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
});

const subActivityPriceSchema = z.object({
  subActivity: z.string().min(1, "Sub activity is required"),
  pricingMethod: z.enum(["perLocation", "perItem", "perTrip"]),
  cost: z.number().min(0, "Cost must be positive"),
  locationPrices: z.array(locationPriceSchema),
});

const vendorPriceListSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  description: z.string().min(1, "Description is required"),
  descriptionAr: z.string().min(1, "Arabic description is required"),
  effectiveFrom: z.string().min(1, "Effective from date is required"),
  effectiveTo: z.string().min(1, "Effective to date is required"),
  isActive: z.boolean(),
  subActivityPrices: z
    .array(subActivityPriceSchema)
    .min(1, "At least one sub activity price is required"),
});

type VendorPriceListFormData = z.infer<typeof vendorPriceListSchema>;

interface VendorPriceListFormProps {
  vendorId: string;
  initialData?: UpdateVendorPriceListRequest;
  onSubmit: (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VendorPriceListForm({
  vendorId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: VendorPriceListFormProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(actGetLocations({ filters: {}, page: 1, limit: 999999 }));
  }, [dispatch]);

  const [subActivities] = useState([
    { id: "1", name: "Express Delivery" },
    { id: "2", name: "Standard Shipping" },
    { id: "3", name: "Freight Transport" },
    { id: "4", name: "Local Delivery" },
  ]);

  const form = useForm<VendorPriceListFormData>({
    resolver: zodResolver(vendorPriceListSchema),
    defaultValues: {
      vendorId,
      name: initialData?.name || "",
      nameAr: initialData?.nameAr || "",
      description: initialData?.description || "",
      descriptionAr: initialData?.descriptionAr || "",
      effectiveFrom: initialData?.effectiveFrom
        ? new Date(initialData.effectiveFrom).toISOString().split("T")[0]
        : "",
      effectiveTo: initialData?.effectiveTo
        ? new Date(initialData.effectiveTo).toISOString().split("T")[0]
        : "",
      isActive: initialData?.isActive ?? true,
      subActivityPrices: [
        {
          subActivity: "507f1f77bcf86cd799439011",
          pricingMethod: "perLocation",
          cost: 70,
          locationPrices: [
            {
              location: "60d21b4667d0d8992e610c85",
              fromLocation: "60d21b4667d0d8992e610c86",
              toLocation: "60d21b4667d0d8992e610c87",
              cost: 200,
              pricingMethod: "perLocation",
            },
            {
              location: "60d21b4667d0d8992e610c85",
              fromLocation: "60d21b4667d0d8992e610c86",
              toLocation: "60d21b4667d0d8992e610c87",
              cost: 200,
              pricingMethod: "perLocation",
            },
          ],
        },
      ],
    },
  });

  const {
    fields: subActivityFields,
    append: appendSubActivity,
    remove: removeSubActivity,
  } = useFieldArray({
    control: form.control,
    name: "subActivityPrices",
  });

  const handleSubmit = (data: VendorPriceListFormData) => {
    const submitData = {
      ...data,
      effectiveFrom: new Date(data.effectiveFrom).toISOString(),
      effectiveTo: new Date(data.effectiveTo).toISOString(),
    };

    if (initialData?._id) {
      onSubmit({
        ...submitData,
        _id: initialData._id,
      } as UpdateVendorPriceListRequest);
    } else {
      onSubmit(submitData as CreateVendorPriceListRequest);
    }
  };

  const addSubActivity = () => {
    appendSubActivity({
      subActivity: "",
      pricingMethod: "perLocation",
      cost: 0,
      locationPrices: [],
    });
  };

  const handleRemoveSubActivity = (index: number) => {
    if (subActivityFields.length > 1) {
      removeSubActivity(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter price list name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم قائمة الأسعار" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أدخل الوصف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this price list
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sub Activity Prices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sub Activity Prices</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSubActivity}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub Activity
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {subActivityFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Sub Activity {index + 1}</h4>
                  {subActivityFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSubActivity(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name={`subActivityPrices.${index}.subActivity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Activity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub activity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subActivities.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subActivityPrices.${index}.pricingMethod`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="perLocation">
                              Per Location
                            </SelectItem>
                            <SelectItem value="perItem">Per Item</SelectItem>
                            <SelectItem value="perTrip">Per Trip</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subActivityPrices.${index}.cost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Prices */}
                <SubActivityLocationPrices
                  form={form}
                  subActivityIndex={index}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
              ? "Update Price List"
              : "Create Price List"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Sub-component for location prices
interface SubActivityLocationPricesProps {
  form: any;
  subActivityIndex: number;
}

function SubActivityLocationPrices({
  form,
  subActivityIndex,
}: SubActivityLocationPricesProps) {
  const { records: locations, loading: locationsLoading } = useAppSelector(
    (state) => state.locations
  );

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    control: form.control,
    name: `subActivityPrices.${subActivityIndex}.locationPrices`,
  });

  const addLocation = () => {
    appendLocation({
      location: "",
      fromLocation: "",
      toLocation: "",
      cost: 0,
      pricingMethod: "perLocation",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Location Prices</h5>
        <Button type="button" variant="outline" size="sm" onClick={addLocation}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location Price
        </Button>
      </div>

      {locationFields.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No location prices configured
        </div>
      ) : (
        <div className="space-y-3">
          {locationFields.map((field, locIndex) => (
            <div key={field.id} className="border rounded p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Location {locIndex + 1}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLocation(locIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location._id} value={location._id}>
                              {location.area} - {location.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.fromLocation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">From</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="From" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.toLocation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="To" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`subActivityPrices.${subActivityIndex}.locationPrices.${locIndex}.cost`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
