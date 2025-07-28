import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { getStructuredAddress } from "@/utils/getStructuredAddress";
import { UseFormReturn } from "react-hook-form";

type TLocationSelect = {
  form: UseFormReturn<any>;
  disabled?: boolean;
  name: string;
  label: string;
  defaultValues?: string;
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
      render={({ field }) => (
        <FormItem className="flex flex-col h-full">
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || defaultValues}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue />
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
      )}
    />
  );
};

export default LocationSelect;
