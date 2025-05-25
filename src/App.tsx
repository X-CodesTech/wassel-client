import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ActivityManagement from "@/pages/ActivityManagement";
import PriceLists from "@/pages/PriceLists";
import PriceListDetails from "@/pages/PriceListDetails";
import CustomerDetails from "@/pages/CustomerDetails";
import TransactionTypes from "@/pages/TransactionTypes";
import LocationManagement from "@/pages/LocationManagement";
import OrdersList from "@/pages/OrdersList";
import MainLayout from "@/components/MainLayout";
import CreateOrder from "./pages/CreateOrder";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={ActivityManagement}/>
        <Route path="/orders" component={OrdersList}/>
        <Route path="/create-order" component={CreateOrder}/>
        <Route path="/price-lists" component={PriceLists}/>
        <Route path="/price-lists/:id" component={PriceListDetails}/>
        <Route path="/customers/:id" component={CustomerDetails}/>
        <Route path="/transaction-types" component={TransactionTypes}/>
        <Route path="/admin/locations" component={LocationManagement}/>
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
