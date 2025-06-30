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
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  MapPin,
  Filter,
  ChevronDown,
} from "lucide-react";

// Form schema matching the bilingual JSON structure
const locationFormSchema = z.object({
  country: z.string().min(1, "Country is required"),
  countryAr: z.string().min(1, "Country (Arabic) is required"),
  area: z.string().min(1, "Area is required"),
  areaAr: z.string().min(1, "Area (Arabic) is required"),
  city: z.string().min(1, "City is required"),
  cityAr: z.string().min(1, "City (Arabic) is required"),
  village: z.string().min(1, "Village is required"),
  villageAr: z.string().min(1, "Village (Arabic) is required"),
  isActive: z.boolean().default(true),
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
                  <FormLabel>Country (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم البلد" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
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
                  <FormLabel>Area (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter area name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areaAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم المنطقة"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormLabel>City (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cityAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل اسم المدينة"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormLabel>Village (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter village name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="villageAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم القرية" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
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
                  onCheckedChange={field.onChange}
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

LocationForm.displayName = "LocationForm";

export default function LocationManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const {
    records: locations,
    loading,
    error,
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
    dispatch(actGetLocations());
  }, [dispatch]);

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
    (data: LocationFormData) => {
      dispatch(actAddLocation(data));
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    },
    [dispatch, addForm, toast]
  );

  // Handle edit form submission
  const handleEditSubmit = useCallback(
    (data: LocationFormData) => {
      if (editingLocation) {
        dispatch(
          actUpdateLocation({ id: editingLocation._id, location: data })
        );
        setEditingLocation(null);
        editForm.reset();
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      }
    },
    [dispatch, editingLocation, editForm, toast]
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

  // Handle delete
  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to delete this location?")) {
        dispatch(actDeleteLocation(id));
        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
      }
    },
    [dispatch, toast]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (updates: Partial<LocationFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingLocation(null);
  }, []);

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
  const uniqueAreas = [
    ...new Set(
      locations
        .filter((l) => !filters.country || l.country === filters.country)
        .map((l) => l.area)
    ),
  ];
  const uniqueCities = [
    ...new Set(
      locations
        .filter(
          (l) =>
            (!filters.country || l.country === filters.country) &&
            (!filters.area || l.area === filters.area)
        )
        .map((l) => l.city)
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Location Management</h1>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              {loading ? (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(location._id)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingLocation}
        onOpenChange={() => setEditingLocation(null)}
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
