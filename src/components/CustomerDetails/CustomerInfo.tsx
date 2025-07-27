import { Calendar, Clock, Package, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Customer } from "@/types/types";
import { Badge } from "../ui/badge";

const CustomerInfo = ({ customer }: { customer: Customer }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Customer Account
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customer?.custAccount}</div>
          <p className="text-xs text-muted-foreground">Account ID</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customer?.blocked ? (
              <Badge variant="destructive">Blocked</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Created Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(customer?.createdDate).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">Registration date</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(
              customer?.updatedAt || customer?.createdDate
            ).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">Last modification</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInfo;
