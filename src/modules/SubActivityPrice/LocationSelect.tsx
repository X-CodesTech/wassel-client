import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { UseFormReturn } from "react-hook-form";

type LocationObject = {
  _id: string;
  label: string;
  [key: string]: any; // Allow other properties
};

type TLocationSelect = {
  form: UseFormReturn<any>;
  disabled?: boolean;
  name: string;
  label: string;
  defaultValues?: LocationObject;
};

const LocationSelect = ({
  form,
  disabled,
  name,
  label,
  defaultValues,
}: TLocationSelect) => {
  const { records, pagination, loading, error } = useAppSelector(
    (state) => state.locations
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Get current field value (should be location ID)
        const currentValue = field.value || defaultValues?._id || "";

        // Find the location object from records to display the label
        const selectedLocation = records.find(
          (location) => location._id === currentValue
        );

        // Get display text - prefer computed address from records, fallback to defaultValues label
        const displayText = selectedLocation
          ? getStructuredAddress(selectedLocation).en
          : defaultValues?.label || "";

        return (
          <FormItem className="flex flex-col h-full">
            <FormLabel>{label}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={currentValue}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select location">
                    {displayText || "Select location"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {records?.map((location) => (
                  <SelectItem key={location._id} value={location._id}>
                    {getStructuredAddress(location).en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        );
      }}
    />
  );
};

export default LocationSelect;
