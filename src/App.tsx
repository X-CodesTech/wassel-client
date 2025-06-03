import { Switch, Route } from "wouter";
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
import CreateOrder from "@/pages/CreateOrder";
import VendorsList from "@/pages/VendorsList";
import VendorDetails from "@/pages/VendorDetails";
import MainLayout from "@/components/MainLayout";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={ActivityManagement} />
        <Route path="/orders" component={OrdersList} />
        <Route path="/create-order" component={CreateOrder} />
        <Route path="/price-lists" component={PriceLists} />
        <Route path="/price-lists/:id" component={PriceListDetails} />
        <Route path="/customers/:id" component={CustomerDetails} />
        <Route path="/transaction-types" component={TransactionTypes} />
        <Route path="/vendors" component={VendorsList} />
        <Route path="/vendors/:id" component={VendorDetails} />
        <Route path="/admin/locations" component={LocationManagement} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
