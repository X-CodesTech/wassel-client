import { TableSkeleton } from "@/components/LoadingComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/types";
import { Plus, Trash2 } from "lucide-react";

const CustomerDetailsPriceList = ({ customer }: { customer: Customer }) => {
  const item = {
    _id: "123",
    name: "Customer Price List",
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{item.name}</CardTitle>
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
        <TableSkeleton rows={5} columns={4} />
      </CardContent>
    </Card>
  );
};

export default CustomerDetailsPriceList;
