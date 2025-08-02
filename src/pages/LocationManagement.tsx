import { useState, useEffect, useCallback, memo } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppSelector } from "@/hooks/useAppSelector";
import { AppDispatch } from "@/store";
import {
  actGetLocations,
  actAddLocation,
  actUpdateLocation,
  actDeleteLocation,
  clearError,
} from "@/store/locations";
import { Location } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { axiosErrorHandler } from "@/utils";
import { confirm } from "@/components/ConfirmDialog/dialogService";
import { TLoading } from "@/types";

// Form schema matching the bilingual JSON structure
const locationFormSchema = z.object({
  country: z
    .string()
    .min(1, "Country name is required")
    .min(2, "Country name must be at least 2 characters")
    .max(100, "Country name must not exceed 100 characters")
    .trim(),
  countryAr: z
    .string()
    .min(1, "اسم البلد مطلوب")
    .min(2, "اسم البلد يجب أن يكون على الأقل حرفين")
    .max(100, "اسم البلد يجب ألا يتجاوز 100 حرف")
    .trim(),
  area: z
    .string()
    .min(1, "Area name is required")
    .min(2, "Area name must be at least 2 characters")
    .max(100, "Area name must not exceed 100 characters")
    .trim(),
  areaAr: z
    .string()
    .min(1, "اسم المنطقة مطلوب")
    .min(2, "اسم المنطقة يجب أن يكون على الأقل حرفين")
    .max(100, "اسم المنطقة يجب ألا يتجاوز 100 حرف")
    .trim(),
  city: z
    .string()
    .min(1, "City name is required")
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must not exceed 100 characters")
    .trim(),
  cityAr: z
    .string()
    .min(1, "اسم المدينة مطلوب")
    .min(2, "اسم المدينة يجب أن يكون على الأقل حرفين")
    .max(100, "اسم المدينة يجب ألا يتجاوز 100 حرف")
    .trim(),
  village: z
    .string()
    .min(1, "Village name is required")
    .min(2, "Village name must be at least 2 characters")
    .max(100, "Village name must not exceed 100 characters")
    .trim(),
  villageAr: z
    .string()
    .min(1, "اسم القرية مطلوب")
    .min(2, "اسم القرية يجب أن يكون على الأقل حرفين")
    .max(100, "اسم القرية يجب ألا يتجاوز 100 حرف")
    .trim(),
  isActive: z.boolean(),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface LocationFilters {
  search: string;
  country: string;
  area: string;
  city: string;
  showActiveOnly: boolean;
}

// Memoized form component to prevent re-renders
const LocationForm = memo(
  ({
    form,
    onSubmit,
    isLoading,
    onCancel,
  }: {
    form: any;
    onSubmit: (data: LocationFormData) => void;
    isLoading: boolean;
    onCancel: () => void;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country (Arabic) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم البلد" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Area Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Area (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter area name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areaAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Area (Arabic) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم المنطقة"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* City Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cityAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City (Arabic) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم المدينة"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Village Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Village (English) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter village name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="villageAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Village (Arabic) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم القرية" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable this location
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Location"}
          </Button>
        </div>
      </form>
    </Form>
  )
);

const DeleteButton = ({ locationId }: { locationId: string }) => {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<TLoading>("idle");

  const handleDeleteClick = (id: string) => async () => {
    // 1️⃣ ask for confirmation
    const confirmed = await confirm({
      title: "Delete Location",
      description:
        "Are you sure you want to delete this location? This cannot be undone.",
    });

    if (!confirmed) return;

    // 2️⃣ perform the async action
    try {
      setLoading("pending");
      await dispatch(actDeleteLocation(id)).unwrap();
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      setLoading("fulfilled");
    } catch (error) {
      setLoading("rejected");
      toast({
        title: "Error",
        description: axiosErrorHandler(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDeleteClick(locationId)}
      disabled={loading === "pending"}
      className={`text-red-600 hover:text-red-700 ${
        loading === "pending" && "opacity-50 cursor-not-allowed"
      }`}
    >
      {loading === "pending" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
};

LocationForm.displayName = "LocationForm";

export default function LocationManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const {
    records: locations,
    loading,
    error,
    pagination,
  } = useAppSelector((state) => state.locations);

  // State for dialogs and filters
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<LocationFilters>({
    search: "",
    country: "",
    area: "",
    city: "",
    showActiveOnly: true,
  });

  // Load locations on component mount
  useEffect(() => {
    dispatch(actGetLocations({ filters, page: 1, limit: 10 }));
  }, [dispatch, filters]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Add form
  const addForm = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    mode: "onChange", // Validate on change for immediate feedback
    defaultValues: {
      country: "",
      countryAr: "",
      area: "",
      areaAr: "",
      city: "",
      cityAr: "",
      village: "",
      villageAr: "",
      isActive: true,
    },
  });

  // Edit form
  const editForm = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    mode: "onChange", // Validate on change for immediate feedback
    defaultValues: {
      country: "",
      countryAr: "",
      area: "",
      areaAr: "",
      city: "",
      cityAr: "",
      village: "",
      villageAr: "",
      isActive: true,
    },
  });

  // Handle add form submission
  const handleAddSubmit = useCallback(
    async (data: LocationFormData) => {
      try {
        // Trigger validation before submitting
        const isValid = await addForm.trigger();
        if (!isValid) {
          toast({
            title: "Validation Error",
            description:
              "Please check all required fields and correct any errors",
            variant: "destructive",
          });
          return;
        }

        await dispatch(actAddLocation(data)).unwrap();
        setIsAddDialogOpen(false);
        addForm.reset();
        toast({
          title: "Success",
          description: "Location added successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add location",
          variant: "destructive",
        });
      }
    },
    [dispatch, addForm, toast]
  );

  // Handle edit form submission
  const handleEditSubmit = useCallback(
    async (data: LocationFormData) => {
      if (editingLocation) {
        try {
          // Trigger validation before submitting
          const isValid = await editForm.trigger();
          if (!isValid) {
            toast({
              title: "Validation Error",
              description:
                "Please check all required fields and correct any errors",
              variant: "destructive",
            });
            return;
          }

          await dispatch(
            actUpdateLocation({ id: editingLocation._id, location: data })
          ).unwrap();
          setEditingLocation(null);
          editForm.reset();
          toast({
            title: "Success",
            description: "Location updated successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update location",
            variant: "destructive",
          });
        }
      }
    },
    [dispatch, editingLocation, editForm, toast]
  );

  // Handle cancel actions
  const handleCancel = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingLocation(null);
    addForm.reset();
    editForm.reset();
  }, [addForm, editForm]);

  // Handle add dialog close
  const handleAddDialogClose = useCallback(
    (open: boolean) => {
      setIsAddDialogOpen(open);
      if (!open) {
        addForm.reset();
      }
    },
    [addForm]
  );

  // Handle edit click
  const handleEditClick = useCallback(
    (location: Location) => {
      setEditingLocation(location);
      editForm.reset({
        country: location.country,
        countryAr: location.countryAr,
        area: location.area,
        areaAr: location.areaAr,
        city: location.city,
        cityAr: location.cityAr,
        village: location.village,
        villageAr: location.villageAr,
        isActive: location.isActive,
      });
    },
    [editForm]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (updates: Partial<LocationFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.country.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.countryAr.includes(filters.search) ||
      location.area.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.areaAr.includes(filters.search) ||
      location.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.cityAr.includes(filters.search) ||
      location.village.toLowerCase().includes(filters.search.toLowerCase()) ||
      location.villageAr.includes(filters.search);

    const matchesCountry =
      !filters.country || location.country === filters.country;
    const matchesArea = !filters.area || location.area === filters.area;
    const matchesCity = !filters.city || location.city === filters.city;
    const matchesActiveStatus = !filters.showActiveOnly || location.isActive;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesArea &&
      matchesCity &&
      matchesActiveStatus
    );
  });

  // Get unique values for filter dropdowns
  const uniqueCountries = [...new Set(locations.map((l) => l.country))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Location Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <LocationForm
              form={addForm}
              onSubmit={handleAddSubmit}
              isLoading={loading}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Filters</h3>
              </div>
            </div>

            <div className="flex flex-row items-center gap-20">
              {/* Nested Location Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <span>
                      {filters.country
                        ? `${filters.country}${
                            filters.area ? ` > ${filters.area}` : ""
                          }${filters.city ? ` > ${filters.city}` : ""}`
                        : "All Locations"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Select Location</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleFilterChange({
                        country: "",
                        area: "",
                        city: "",
                      })
                    }
                  >
                    All Locations
                  </DropdownMenuItem>
                  {uniqueCountries.map((country) => (
                    <DropdownMenuSub key={country}>
                      <DropdownMenuSubTrigger>{country}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleFilterChange({
                              country,
                              area: "",
                              city: "",
                            })
                          }
                        >
                          All {country}
                        </DropdownMenuItem>
                        {locations
                          .filter((loc) => loc.country === country)
                          .map((loc) => loc.area)
                          .filter(
                            (area, index, self) => self.indexOf(area) === index
                          )
                          .map((area) => (
                            <DropdownMenuSub key={area}>
                              <DropdownMenuSubTrigger>
                                {area}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleFilterChange({
                                      country,
                                      area,
                                      city: "",
                                    })
                                  }
                                >
                                  All {area}
                                </DropdownMenuItem>
                                {locations
                                  .filter(
                                    (loc) =>
                                      loc.country === country &&
                                      loc.area === area
                                  )
                                  .map((loc) => loc.city)
                                  .filter(
                                    (city, index, self) =>
                                      self.indexOf(city) === index
                                  )
                                  .map((city) => (
                                    <DropdownMenuItem
                                      key={city}
                                      onClick={() =>
                                        handleFilterChange({
                                          country,
                                          area,
                                          city,
                                        })
                                      }
                                    >
                                      {city}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Active Only Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-active-only"
                  checked={filters.showActiveOnly}
                  onCheckedChange={(checked) =>
                    handleFilterChange({ showActiveOnly: checked })
                  }
                />
                <label
                  htmlFor="show-active-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Active Only
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country (EN)</TableHead>
                <TableHead>Country (AR)</TableHead>
                <TableHead>Area (EN)</TableHead>
                <TableHead>Area (AR)</TableHead>
                <TableHead>City (EN)</TableHead>
                <TableHead>City (AR)</TableHead>
                <TableHead>Village (EN)</TableHead>
                <TableHead>Village (AR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !locations.length ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Loading locations...
                  </TableCell>
                </TableRow>
              ) : filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No locations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location: Location) => (
                  <TableRow key={location._id}>
                    <TableCell className="font-medium">
                      {location.country}
                    </TableCell>
                    <TableCell className="font-medium" dir="rtl">
                      {location.countryAr}
                    </TableCell>
                    <TableCell>{location.area}</TableCell>
                    <TableCell dir="rtl">{location.areaAr}</TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell dir="rtl">{location.cityAr}</TableCell>
                    <TableCell>{location.village}</TableCell>
                    <TableCell dir="rtl">{location.villageAr}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          location.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {location.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteButton
                          key={location._id}
                          locationId={location._id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-1">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageLimit={pagination.limit}
            totalResults={pagination.total}
            onLimitChange={(limit) => {
              dispatch(actGetLocations({ filters, limit }));
            }}
            onPageChange={(page) => {
              dispatch(actGetLocations({ filters, page }));
            }}
          />
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingLocation}
        onOpenChange={(open) => !open && setEditingLocation(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <LocationForm
            form={editForm}
            onSubmit={handleEditSubmit}
            isLoading={loading}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
