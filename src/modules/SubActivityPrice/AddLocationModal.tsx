import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/store";
import { actAddLocation } from "@/store/locations";
import { axiosErrorHandler } from "@/utils";
import { Location } from "@/types/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

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
    .max(100, "City name must not exceed 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  cityAr: z
    .string()
    .max(100, "اسم المدينة يجب ألا يتجاوز 100 حرف")
    .trim()
    .optional()
    .or(z.literal("")),
  village: z
    .string()
    .max(100, "Village name must not exceed 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  villageAr: z
    .string()
    .max(100, "اسم القرية يجب ألا يتجاوز 100 حرف")
    .trim()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

interface AddLocationModalProps {
  onLocationCreated: (locationId: string | Location) => void;
  trigger?: React.ReactNode;
  mode?: "default" | "locationSelect";
}

export function AddLocationModal({
  onLocationCreated,
  trigger,
  mode = "default",
}: AddLocationModalProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Get locations from Redux store for dropdown options
  const existingLocations = useSelector(
    (state: RootState) => state.locations.records
  );

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    mode: "onChange",
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

  // Get all available options for each field type
  const optionsList = useMemo(() => {
    if (!existingLocations || existingLocations.length === 0) {
      return {
        countries: [],
        areas: [],
        cities: [],
        villages: [],
        countryArs: [],
        areaArs: [],
        cityArs: [],
        villageArs: [],
      };
    }

    return {
      countries: [
        ...new Set(existingLocations.map((loc) => loc.country)),
      ].filter((country): country is string => Boolean(country)),
      areas: [...new Set(existingLocations.map((loc) => loc.area))].filter(
        (area): area is string => Boolean(area)
      ),
      cities: [
        ...new Set(
          existingLocations
            .map((loc) => loc.city)
            .filter((city) => city && city.trim() !== "")
        ),
      ].filter((city): city is string => Boolean(city)),
      villages: [
        ...new Set(
          existingLocations
            .map((loc) => loc.village)
            .filter((village) => village && village.trim() !== "")
        ),
      ].filter((village): village is string => Boolean(village)),
      countryArs: [
        ...new Set(existingLocations.map((loc) => loc.countryAr)),
      ].filter((countryAr): countryAr is string => Boolean(countryAr)),
      areaArs: [...new Set(existingLocations.map((loc) => loc.areaAr))].filter(
        (areaAr): areaAr is string => Boolean(areaAr)
      ),
      cityArs: [
        ...new Set(
          existingLocations
            .map((loc) => loc.cityAr)
            .filter((cityAr) => cityAr && cityAr.trim() !== "")
        ),
      ].filter((cityAr): cityAr is string => Boolean(cityAr)),
      villageArs: [
        ...new Set(
          existingLocations
            .map((loc) => loc.villageAr)
            .filter((villageAr) => villageAr && villageAr.trim() !== "")
        ),
      ].filter((villageAr): villageAr is string => Boolean(villageAr)),
    };
  }, [existingLocations]);

  // Function to get filtered options based on current form values
  const getFilteredOptions = (fieldName: keyof LocationFormData) => {
    if (!existingLocations || existingLocations.length === 0) {
      return [];
    }

    const currentValues = form.getValues();

    switch (fieldName) {
      case "country":
        return optionsList.countries;

      case "countryAr":
        return optionsList.countryArs;

      case "area":
        return optionsList.areas;

      case "areaAr":
        return optionsList.areaArs;

      case "city":
        return optionsList.cities;

      case "cityAr":
        return optionsList.cityArs;

      case "village":
        return optionsList.villages;

      case "villageAr":
        return optionsList.villageArs;

      default:
        return [];
    }
  };

  // Function to find location by selected values
  const findExistingLocation = (
    formData: LocationFormData
  ): Location | null => {
    return (
      existingLocations.find(
        (loc) =>
          loc.country === formData.country &&
          loc.countryAr === formData.countryAr &&
          loc.area === formData.area &&
          loc.areaAr === formData.areaAr &&
          loc.city === (formData.city || "") &&
          loc.cityAr === (formData.cityAr || "") &&
          loc.village === (formData.village || "") &&
          loc.villageAr === (formData.villageAr || "")
      ) || null
    );
  };

  // Function to populate other fields when a location is selected
  const populateFieldsFromLocation = (selectedLocation: Location) => {
    form.setValue("country", selectedLocation.country);
    form.setValue("countryAr", selectedLocation.countryAr);
    form.setValue("area", selectedLocation.area);
    form.setValue("areaAr", selectedLocation.areaAr);
    form.setValue("city", selectedLocation.city || "");
    form.setValue("cityAr", selectedLocation.cityAr || "");
    form.setValue("village", selectedLocation.village || "");
    form.setValue("villageAr", selectedLocation.villageAr || "");
    form.setValue("isActive", selectedLocation.isActive);
  };

  // Handle location selection from dropdown
  const handleLocationSelect = (locationId: string) => {
    const selectedLocation = existingLocations.find(
      (loc) => loc._id === locationId
    );
    if (selectedLocation) {
      populateFieldsFromLocation(selectedLocation);
    }
  };

  const handleSubmit = async (data: LocationFormData) => {
    try {
      // Check if the location already exists
      const existingLocation = findExistingLocation(data);

      if (existingLocation) {
        // Location already exists, return the existing location object
        if (mode === "locationSelect") {
          onLocationCreated(existingLocation);
        } else {
          onLocationCreated(existingLocation._id);
        }
        setOpen(false);
        form.reset();
        toast({
          title: "Location Found",
          description: "This location already exists and has been selected.",
        });
        return;
      }

      // Create new location
      const result = await dispatch(actAddLocation(data)).unwrap();

      if (mode === "locationSelect") {
        // Return the full location object for LocationSelect mode
        // Call the callback first, then close the modal
        onLocationCreated(result);
        // Add a small delay to ensure the callback is processed
        setTimeout(() => {
          setOpen(false);
          form.reset();
        }, 100);
      } else {
        // Return just the ID for regular mode
        onLocationCreated(result._id);
        setOpen(false);
        form.reset();
      }

      toast({
        title: "Success",
        description: "Location added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: axiosErrorHandler(error),
        variant: "destructive",
      });
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  // Prevent modal from closing on window focus changes
  useEffect(() => {
    if (open) {
      const handleWindowFocus = () => {
        // Prevent modal from closing when window regains focus
        // This is a common issue with Dialog components
        console.log("🔍 Window focus event - preventing modal close");
      };

      const handleWindowBlur = () => {
        // Prevent modal from closing when window loses focus
        // This is a common issue with Dialog components
        console.log("🔍 Window blur event - preventing modal close");
      };

      const handleVisibilityChange = () => {
        // Prevent modal from closing when page visibility changes
        console.log("🔍 Page visibility change - preventing modal close");
      };

      // Add event listeners
      window.addEventListener("focus", handleWindowFocus);
      window.addEventListener("blur", handleWindowBlur);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup
      return () => {
        window.removeEventListener("focus", handleWindowFocus);
        window.removeEventListener("blur", handleWindowBlur);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [open]);

  // Watch form values to trigger re-renders of dependent dropdowns
  const watchedValues = form.watch();

  // Ref to track if user is interacting with suggestions
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Ref to track modal state and prevent unwanted closing
  const modalRef = useRef<HTMLDivElement>(null);

  // Render text field based on mode
  const renderTextField = (
    name: keyof Omit<LocationFormData, "isActive">,
    label: string,
    placeholder: string,
    required: boolean = false,
    dir?: "rtl" | "ltr"
  ) => {
    if (mode === "locationSelect") {
      // Render as input with suggestion dropdown for LocationSelect mode
      const options = getFilteredOptions(name);
      const [showSuggestions, setShowSuggestions] = useState(false);
      const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
        []
      );

      // Filter suggestions based on input value
      const filterSuggestions = (inputValue: string) => {
        if (!inputValue.trim()) {
          setFilteredSuggestions(
            options.filter((option): option is string => Boolean(option))
          );
          return;
        }
        const filtered = options.filter(
          (option): option is string =>
            Boolean(option) &&
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredSuggestions(filtered);
      };

      // Handle input change
      const handleInputChange = (
        value: string,
        onChange: (value: string) => void
      ) => {
        onChange(value);
        filterSuggestions(value);
        setShowSuggestions(true);
      };

      // Handle suggestion selection
      const handleSuggestionSelect = (
        selectedValue: string,
        onChange: (value: string) => void
      ) => {
        onChange(selectedValue);
        setShowSuggestions(false);

        // Find a location that matches the selected value and fill only unfilled fields
        const matchingLocation = existingLocations.find((loc) => {
          switch (name) {
            case "country":
              return loc.country === selectedValue;
            case "countryAr":
              return loc.countryAr === selectedValue;
            case "area":
              return loc.area === selectedValue;
            case "areaAr":
              return loc.areaAr === selectedValue;
            case "city":
              return loc.city === selectedValue;
            case "cityAr":
              return loc.cityAr === selectedValue;
            case "village":
              return loc.village === selectedValue;
            case "villageAr":
              return loc.villageAr === selectedValue;
            default:
              return false;
          }
        });

        if (matchingLocation) {
          // Fill only unfilled fields, preserve existing values
          const currentValues = form.getValues();

          // Only set values for fields that are currently empty
          if (!currentValues.country && matchingLocation.country) {
            form.setValue("country", matchingLocation.country);
          }
          if (!currentValues.countryAr && matchingLocation.countryAr) {
            form.setValue("countryAr", matchingLocation.countryAr);
          }
          if (!currentValues.area && matchingLocation.area) {
            form.setValue("area", matchingLocation.area);
          }
          if (!currentValues.areaAr && matchingLocation.areaAr) {
            form.setValue("areaAr", matchingLocation.areaAr);
          }
          if (!currentValues.city && matchingLocation.city) {
            form.setValue("city", matchingLocation.city);
          }
          if (!currentValues.cityAr && matchingLocation.cityAr) {
            form.setValue("cityAr", matchingLocation.cityAr);
          }
          if (!currentValues.village && matchingLocation.village) {
            form.setValue("village", matchingLocation.village);
          }
          if (!currentValues.villageAr && matchingLocation.villageAr) {
            form.setValue("villageAr", matchingLocation.villageAr);
          }
        }
      };

      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>
                {label} {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={placeholder}
                  value={field.value || ""}
                  onChange={(e) =>
                    handleInputChange(e.target.value, field.onChange)
                  }
                  onFocus={() => {
                    setShowSuggestions(true);
                    filterSuggestions(field.value || "");
                  }}
                  onBlur={() => {
                    // Use a longer delay to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 300);
                  }}
                  dir={dir}
                />
              </FormControl>

              {/* Suggestion Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                  onMouseDown={(e) => {
                    // Prevent the input from losing focus when clicking on suggestions
                    e.preventDefault();
                  }}
                >
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onMouseDown={(e) => {
                        // Prevent blur event when clicking on suggestion
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() =>
                        handleSuggestionSelect(suggestion, field.onChange)
                      }
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}

              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />
      );
    }

    // Render as input for default mode
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} dir={dir} />
            </FormControl>
            <FormMessage className="text-red-500 text-sm mt-1" />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Only allow closing when explicitly requested
        if (!newOpen) {
          // Check if we're in the middle of form submission
          if (form.formState.isSubmitting) {
            return; // Don't close if submitting
          }
          // Don't close on window focus changes
          return;
        }
        setOpen(newOpen);
      }}
      modal={true}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Didn't find your location? Add it
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        ref={modalRef}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape key to close modal
          setOpen(false);
        }}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with form elements
          e.preventDefault();
        }}
        onFocusOutside={(e) => {
          // Prevent closing when focus moves outside
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          // Prevent focus issues that might cause modal to close
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          // Prevent focus issues when closing
          e.preventDefault();
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add New Location</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Close</span>×
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country Fields */}
              <div className="space-y-4">
                {renderTextField(
                  "country",
                  "Country (English)",
                  "Enter country name",
                  true
                )}
                {renderTextField(
                  "countryAr",
                  "Country (Arabic)",
                  "أدخل اسم البلد",
                  true,
                  "rtl"
                )}
              </div>

              {/* Area Fields */}
              <div className="space-y-4">
                {renderTextField(
                  "area",
                  "Area (English)",
                  "Enter area name",
                  true
                )}
                {renderTextField(
                  "areaAr",
                  "Area (Arabic)",
                  "أدخل اسم المنطقة",
                  true,
                  "rtl"
                )}
              </div>

              {/* City Fields */}
              <div className="space-y-4">
                {renderTextField("city", "City (English)", "Enter city name")}
                {renderTextField(
                  "cityAr",
                  "City (Arabic)",
                  "أدخل اسم المدينة",
                  false,
                  "rtl"
                )}
              </div>

              {/* Village Fields */}
              <div className="space-y-4">
                {renderTextField(
                  "village",
                  "Village (English)",
                  "Enter village name"
                )}
                {renderTextField(
                  "villageAr",
                  "Village (Arabic)",
                  "أدخل اسم القرية",
                  false,
                  "rtl"
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                onClick={(e) => {
                  // Prevent form submission from closing modal unexpectedly
                  e.preventDefault();
                  form.handleSubmit(handleSubmit)();
                }}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Location"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
