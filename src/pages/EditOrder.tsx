import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import orderServices from "@/services/orderServices";
import CreateOrder from "./CreateOrder";
import { PageSkeleton } from "@/components/LoadingComponents";
import { ErrorComponent, NotFoundError } from "@/components/ErrorComponents";

/**
 * EditOrder component - wrapper around CreateOrder for editing existing orders
 * Usage: Navigate to /orders/:orderId/edit
 */
export default function EditOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is required");
      setLoading(false);
      return;
    }

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderServices.getOrderById(orderId);
        setOrderData(response.data);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch order data";

        console.error("Error fetching order:", err);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, toast]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <ErrorComponent
        error={{
          type: "server",
          title: "Failed to Load Order",
          message: error,
          canRetry: true,
        }}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!orderData) {
    return (
      <NotFoundError
        error={{
          title: "Order Not Found",
          message: "The requested order could not be found.",
        }}
      />
    );
  }

  return (
    <CreateOrder mode="edit" orderId={orderId} existingOrderData={orderData} />
  );
}
