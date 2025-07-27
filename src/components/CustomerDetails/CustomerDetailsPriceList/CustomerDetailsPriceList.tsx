import { TableSkeleton } from "@/components/LoadingComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import CustomerPriceListTable from "./CustomerPriceListTable";
import CustomerDetailsPriceListActions from "./CustomerDetailsPriceListActions";
import { CustomerPriceListResponse } from "@/services/customerServices";
import { AddPriceListSubActivityDialog } from "@/components/PriceList/PriceListSubActivity/AddPriceListSubActivityDialog";
import DeleteCustomerDetailsSubActivityDialog from "./CustomerDetailsDialogs/DeleteCustomerDetailsSubActivityDialog";
import { setSelectedPriceList } from "@/store/priceLists";

const CustomerDetailsPriceList = () => {
  const dispatch = useAppDispatch();
  const { selectedCustomer, loading } = useAppSelector(
    (state) => state.customers
  );
  const { selectedPriceList } = useAppSelector((state) => state.priceLists);
  const [dialog, setDialog] = useState<"add" | "delete" | null>(null);
  // const [selectedPriceList, setSelectedPriceList] = useState<
  //   CustomerPriceListResponse["priceList"] | null
  // >(null);
  const [selectedSubActivity, setSelectedSubActivity] = useState<
    CustomerPriceListResponse["priceList"]["subActivityPrices"][number] | null
  >(null);

  const handleDialog = ({
    open,
    dialog,
    priceList,
    subActivity,
  }: {
    open: boolean;
    dialog?: "add" | "delete";
    priceList?: CustomerPriceListResponse["priceList"];
    subActivity?: CustomerPriceListResponse["priceList"]["subActivityPrices"][number];
  }) => {
    if (open) {
      dispatch(setSelectedPriceList(priceList || null));
      setDialog(dialog || null);
      setSelectedSubActivity(subActivity || null);
    } else {
      dispatch(setSelectedPriceList(null));
      setDialog(null);
      setSelectedSubActivity(null);
    }
  };

  return (
    <>
      <div className="w-full flex justify-end mb-4">
        <CustomerDetailsPriceListActions />
      </div>
      <Card className="mb-6">
        {selectedCustomer?.priceLists.map((priceList, index) => (
          <React.Fragment key={priceList._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{priceList.priceList.name}</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDialog({
                      open: true,
                      priceList: priceList.priceList,
                      dialog: "add",
                    })
                  }
                >
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

      <DeleteCustomerDetailsSubActivityDialog
        open={dialog === "delete"}
        onOpenChange={(open) => handleDialog({ open })}
        priceList={selectedPriceList!}
        subActivityId={selectedPriceList?._id!}
      />

      <AddPriceListSubActivityDialog
        open={dialog === "add" && !!selectedPriceList}
        onOpenChange={(open) => handleDialog({ open })}
      />
    </>
  );
};

export default CustomerDetailsPriceList;
