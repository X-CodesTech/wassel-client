import { Button } from "./ui/button";
import { FileText, Plus } from "lucide-react";
import { Card } from "./ui/card";
import { Vendor } from "@/types/types";
import { TVendorDialogType } from "@/pages/VendorDetails";

type VendorDetailsEmptyStateProps = {
  vendorDetails: Vendor;
  handleOpenDialog: (type: TVendorDialogType, priceListId?: string) => void;
};

const VendorDetailsEmptyState = ({
  vendorDetails,
  handleOpenDialog,
}: VendorDetailsEmptyStateProps) => {
  return (
    <Card className="mb-6">
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No price lists found
        </h3>
        <p className="text-gray-500 mb-4">
          This vendor doesn't have any price lists configured yet.
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!!vendorDetails?._id}
          onClick={() => handleOpenDialog("createPriceList")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create First Price List
        </Button>
      </div>
    </Card>
  );
};

export default VendorDetailsEmptyState;
