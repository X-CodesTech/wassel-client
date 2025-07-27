import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation } from "wouter";
import { clearSelectedCustomer } from "@/store/customers";
import { useAppDispatch } from "@/hooks/useAppSelector";

type TSelectedCustomer = {
  customerName: string;
  customerAccount: string;
  companyChainId: string;
};

const CustomerDetailsLayoutHeader = ({
  customerName,
  customerAccount,
  companyChainId,
}: TSelectedCustomer) => {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    dispatch(clearSelectedCustomer());
    setLocation("/customers");
  };

  return (
    <>
      <title>{customerName} | Wassel</title>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{customerName}</h2>
          <p className="text-gray-500 mt-1">
            {customerAccount} - {companyChainId}
          </p>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailsLayoutHeader;
