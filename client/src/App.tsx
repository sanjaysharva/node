import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import Home from "@/pages/home";
import AddServer from "@/pages/add-server";
import AddBot from "@/pages/add-bot";
import AdminPage from "@/pages/admin";
import Events from "@/pages/events";
import Explore from "@/pages/explore";
import JoinMembers from "@/pages/join-members";
import Store from "@/pages/store";
import Quest from "@/pages/quest";
import YourServers from "@/pages/your-servers";
import Advertise from "@/pages/advertise";
import Profile from "@/pages/profile";
import AddEvent from "@/pages/add-event";
import SearchPage from "@/pages/search";
import ServerDetail from "@/pages/server-detail";
import NotFound from "@/pages/not-found";
import CookieConsent from "@/components/cookie-consent";
import HelpCenter from "./pages/help-center";
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicy from "./pages/privacy-policy";
import Blog from "./pages/blog";


function Router() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/advertise-server" component={AddServer} />
      <Route path="/add-bot" component={AddBot} />
      <Route path="/add-server" component={AddServer} />
      <Route path="/your-servers" component={YourServers} />
      <Route path="/events" component={Events} />
      <Route path="/explore" component={Explore} />
      <Route path="/join-members" component={JoinMembers} />
      <Route path="/store" component={Store} />
      <Route path="/quest" component={Quest} />
      <Route path="/profile" component={Profile} />
      <Route path="/add-event" component={AddEvent} />
      <Route path="/search" component={SearchPage} />
      <Route path="/server/:serverId" component={ServerDetail} />
      <Route path="/admin">
          {user?.isAdmin ? <AdminPage /> : <NotFound />}
        </Route>
      <Route path="/blog" component={Blog} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CookieConsent />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;