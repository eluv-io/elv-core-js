import AppsPage from "./components/Apps";
import AppFramePage from "./components/AppFrame";
import ProfilePage from "./components/Profile";
import AccountsPage from "./components/Accounts";
import AccountsFormPage from "./components/AccountForm";
import TransferFormPage from "./components/TransferForm";
import Offerings from "./components/offerings/Offerings";
import Terms from "./components/terms/Terms";
import LegacyTerms from "./components/terms_legacy/Terms";
import Privacy from "./components/privacy/Privacy";

export const AppRoutes = [
  { path: "/apps/:app", component: AppFramePage },
  { path: "/profile", component: ProfilePage },
  { path: "/accounts", component: AccountsPage },
  { path: "/accounts/add", component: AccountsFormPage },
  { path: "/transfer", component: TransferFormPage }
];

export const SiteRoutes = [
  { path: "/apps", component: AppsPage },
  { path: "/offerings", component: Offerings },
  { path: "/terms", component: Terms },
  { path: "/terms-legacy", component: LegacyTerms },
  { path: "/privacy", component: Privacy }
];
