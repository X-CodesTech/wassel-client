import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Customer } from "@/types/types";

const CustomerDetailsLayoutHeader = ({
  selectedCustomer,
  handleBack,
}: {
  selectedCustomer: Customer;
  handleBack: () => void;
}) => {
  return (
    <>
      <title>{selectedCustomer?.custName} | Wassel</title>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {selectedCustomer?.custName}
          </h2>
          <p className="text-gray-500 mt-1">
            {selectedCustomer?.custAccount} - {selectedCustomer?.companyChainId}
          </p>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailsLayoutHeader;
