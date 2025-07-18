import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateVendorPriceListRequest,
  UpdateVendorPriceListRequest,
} from "@/services/vendorServices";
import VendorPriceListForm from "./VendorPriceListForm";

interface VendorPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  initialData?: UpdateVendorPriceListRequest;
  onSubmit: (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest
  ) => void;
  isLoading?: boolean;
}

export default function VendorPriceListModal({
  isOpen,
  onClose,
  vendorId,
  initialData,
  onSubmit,
  isLoading = false,
}: VendorPriceListModalProps) {
  const isEditing = !!initialData;
  const title = isEditing ? "Edit Price List" : "Add New Price List";

  const handleSubmit = (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest
  ) => {
    if (isEditing && "_id" in data) {
      onSubmit(data as UpdateVendorPriceListRequest);
    } else {
      onSubmit(data as CreateVendorPriceListRequest);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <VendorPriceListForm
          vendorId={vendorId}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
