import { TableSkeleton } from "@/components/LoadingComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Customer } from "@/types/types";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import CustomerPriceListTable from "./CustomerPriceListTable";
import CustomerDetailsPriceListActions from "./CustomerDetailsPriceListActions";

const CustomerDetailsPriceList = ({ customer }: { customer: Customer }) => {
  const { selectedCustomer, loading } = useAppSelector(
    (state) => state.customers
  );

  return (
    <>
      <div className="w-full flex justify-end mb-4">
        <CustomerDetailsPriceListActions />
      </div>
      <Card className="mb-6">
        {selectedCustomer?.priceLists.map((priceList) => (
          <React.Fragment key={priceList._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{priceList.priceList.name}</CardTitle>
              <div className="flex items-center gap-4">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading === "pending" ? (
                <TableSkeleton rows={5} columns={4} />
              ) : selectedCustomer?.priceLists &&
                selectedCustomer?.priceLists.length > 0 ? (
                <CustomerPriceListTable priceList={priceList.priceList} />
              ) : (
                <div className="text-center text-sm text-gray-500">
                  No price lists found
                </div>
              )}
            </CardContent>
          </React.Fragment>
        ))}
      </Card>
    </>
  );
};

export default CustomerDetailsPriceList;
