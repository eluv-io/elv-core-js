import AppsPage from "./components/Apps";
import AppFramePage from "./components/AppFrame";
import ProfilePage from "./components/Profile";
import AccountsPage from "./components/Accounts";
import AccountsFormPage from "./components/AccountForm";
import TransferFormPage from "./components/TransferForm";
import Offerings from "./components/Offerings";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";

export const AppRoutes = [
  { path: "/apps", component: AppsPage },
  { path: "/apps/:app", component: AppFramePage },
  { path: "/profile", component: ProfilePage },
  { path: "/accounts", component: AccountsPage },
  { path: "/accounts/add", component: AccountsFormPage },
  { path: "/transfer", component: TransferFormPage }
];

export const SiteRoutes = [
  { path: "/offerings", component: Offerings },
  { path: "/terms", component: Terms },
  { path: "/privacy", component: Privacy }
];
