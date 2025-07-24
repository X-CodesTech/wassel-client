import { Dialog, DialogContent } from "@/components/ui/dialog";
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
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest,
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
  const handleSubmit = (
    data: CreateVendorPriceListRequest | UpdateVendorPriceListRequest,
  ) => {
    onSubmit(data as CreateVendorPriceListRequest);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
