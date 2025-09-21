import HomeLayout from "@/layout/home-layout";
import ContactPage from "@/view/contact";
import FeaturesPage from "@/view/features";
import HomePage from "@/view/home";
import PricingPlanPage from "@/view/pricing";

const homeRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "features",
        element: <FeaturesPage />,
      },
      {
        path: "pricing",
        element: <PricingPlanPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
    ],
  },
];

export default homeRoutes;
