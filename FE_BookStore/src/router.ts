import UserLayout from "./components/Layout/DefautLayout/UserLayout/UserLayout";
import Home from "./pages/User/Home";
import ProductPage from "./pages/User/Product";
import BookDetails from "./pages/User/BookDetails";
import OrderPage from "./pages/User/OrderPages";
import RegisterPage from "./pages/Register/Register";
import LoginPage from "./pages/Login/Login";
import AdminLayout from "./components/Layout/DefautLayout/AdminLayout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import BookManagement from "./pages/Admin/BookManagement";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminCategoryManagement from "./pages/Admin/CategoryManagement";
import OrderManagement from "./pages/Admin/Ordermanagement";
import AddressManagement from "./pages/Admin/AddressManagement";
import AboutPage from "./pages/User/About";
import ProfilePage from "./pages/User/Profilepage";
import ContactPage from "./pages/User/Contact";
import FaqPage from "./pages/User/Faqpage";
import OrderHistoryPage from "./pages/User/OrderHistoryPage";
import AuthorManagement from "./pages/Admin/AuthorManagement"
import ForbiddenPage from "./pages/Forbidden/Forbidden";
import Oauth2Callback from "./pages/Auth/Oauth2Callback";
import VerifySuccessPage from "./pages/VerifySuccess/VerifySuccessPage";
import AdminProfile from "./pages/Admin/AdminProfile";
import ReviewManagement from "./pages/Admin/ReviewManagement";
import PromotionManagement from "./pages/Admin/PromotionManagement";
import InventoryManagement from "./pages/Admin/InventoryManagement";
import ShipmentManagement from "./pages/Admin/ShipmentManagement";
import PaymentManagement from "./pages/Admin/PaymentManagement";
import PublisherManagement from "./pages/Admin/PublisherManagement";


const PublicPage = [
    { path: "/", component: Home, layout: UserLayout },
    { path: "/books", component: ProductPage, layout: UserLayout },
    { path: "/books/:slug", component: BookDetails, layout: UserLayout },
    { path: "/checkout", component: OrderPage, layout: UserLayout },
    { path: "/register", component: RegisterPage, layout: null },
    { path: "/login", component: LoginPage, layout: null },
    { path: "/403", component: ForbiddenPage, layout: null },
    { path: "/profile", component: ProfilePage, layout: UserLayout },
    { path: "/about", component: AboutPage, layout: UserLayout },
    { path: "/faq", component: FaqPage, layout: UserLayout },
    { path: "/contact", component: ContactPage, layout: UserLayout },
    { path: "/my-orders", component: OrderHistoryPage, layout: UserLayout },
    { path: "/oauth2/callback/google", component: Oauth2Callback, layout: null },
    { path: "/oauth2/callback/facebook", component: Oauth2Callback, layout: null },
    { path: "/verify-success", component: VerifySuccessPage, layout: null },
];

const PrivatePage = [
    { path: "/admin", component: Dashboard, layout: AdminLayout },
    { path: "/admin/books", component: BookManagement, layout: AdminLayout },
    { path: "/admin/users", component: AdminUserManagement, layout: AdminLayout },
    { path: "/admin/categories", component: AdminCategoryManagement, layout: AdminLayout },
    { path: "/admin/orders", component: OrderManagement, layout: AdminLayout },
    { path: "/admin/addresses", component: AddressManagement, layout: AdminLayout },
    { path: "/admin/authors", component: AuthorManagement, layout: AdminLayout },
    { path: "/admin/profile", component: AdminProfile, layout: AdminLayout },
    { path: "/admin/reviews", component: ReviewManagement, layout: AdminLayout },
    { path: "/admin/promotions", component: PromotionManagement, layout: AdminLayout },
    { path: "/admin/inventory", component: InventoryManagement, layout: AdminLayout },
    { path: "/admin/shipments", component: ShipmentManagement, layout: AdminLayout },
    { path: "/admin/payments", component: PaymentManagement, layout: AdminLayout },
    { path: "/admin/publishers", component: PublisherManagement, layout: AdminLayout },
];

export { PublicPage, PrivatePage };
