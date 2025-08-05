import { TableSkeleton } from "@/components/LoadingComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import CustomerPriceListTable from "./CustomerPriceListTable";
import CustomerDetailsPriceListActions from "./CustomerDetailsPriceListActions";
import { CustomerPriceListResponse } from "@/services/customerServices";
import { AddPriceListSubActivityDialog } from "@/components/PriceList/PriceListSubActivity/AddPriceListSubActivityDialog";
import DeleteCustomerDetailsSubActivityDialog from "./CustomerDetailsDialogs/DeleteCustomerDetailsSubActivityDialog";
import { setSelectedPriceList } from "@/store/priceLists";
import SubActivityPriceManager from "@/components/SubActivityPriceManager";

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
              <CardTitle>{priceList?.priceList?.name}</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() =>
                    handleDialog({
                      open: true,
                      priceList: priceList?.priceList,
                      dialog: "add",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading === "pending" ? (
                <TableSkeleton rows={5} columns={4} />
              ) : selectedCustomer?.priceLists &&
                selectedCustomer?.priceLists.length > 0 ? (
                <CustomerPriceListTable priceList={priceList?.priceList} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-blue-100 p-3 mb-3">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium mb-1">
                    No Sub-Activities
                  </h4>
                  <p className="text-gray-500 max-w-md mb-4">
                    This price list doesn't have any sub-activities yet. Click
                    "Add Sub-Activity" above to get started.
                  </p>
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

      <SubActivityPriceManager
        contextType="customer"
        dialogTitle="Add Sub-Activity"
        dialogDescription="Add a new sub-activity to the price list"
        isDialogOpen={dialog === "add" || !!selectedSubActivity}
        setIsDialogOpen={(isOpen) => {
          if (!isOpen) {
            handleDialog({ open: false });
          }
        }}
        editData={selectedSubActivity || undefined}
        setEditData={setSelectedSubActivity}
        subActivityPriceId={selectedSubActivity?._id || ""}
        priceListId={selectedPriceList?._id || ""}
      />

      {/* <AddPriceListSubActivityDialog
        open={dialog === "add" && !!selectedPriceList}
        onOpenChange={(open) => handleDialog({ open })}
        isCustomerPriceList={true}
      /> */}
    </>
  );
};

export default CustomerDetailsPriceList;
