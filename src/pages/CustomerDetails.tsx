import {
  CustomerDetailsLayoutHeader,
  CustomerDetailsPriceList,
  CustomerInfo,
  CustomerInfoTable,
} from "@/components/CustomerDetails";
import { ErrorComponent } from "@/components/ErrorComponents";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { clearSelectedCustomer } from "@/store/customers";
import { actGetCustomer } from "@/store/customers/customersSlice";
import { useEffect } from "react";
import { useLocation, useParams } from "wouter";

export default function CustomerDetails() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { selectedCustomer, loading, error } = useAppSelector(
    (state) => state.customers
  );

  const handleBack = () => {
    dispatch(clearSelectedCustomer());
    setLocation("/customers");
  };

  useEffect(() => {
    if (id) {
      dispatch(actGetCustomer(id));
    }

    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, id]);

  if (loading === "pending") {
    return (
      <Card className="col-span-full flex-1 h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="rounded-full bg-blue-100 p-4 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium mb-2">Loading Customers...</h3>
          <p className="text-gray-500">
            Please wait while we fetch your customer data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorComponent error={{ type: "validation", message: error }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerDetailsLayoutHeader
        selectedCustomer={selectedCustomer!}
        handleBack={handleBack}
      />
      <CustomerInfo customer={selectedCustomer!} />
      <CustomerInfoTable customer={selectedCustomer!} />
      <CustomerDetailsPriceList customer={selectedCustomer!} />
    </div>
  );
}
