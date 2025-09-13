import HomeLayout from "@/layout/home-layout";
import HomePage from "@/view/home";


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
        path: "contact",
        element: <div className="mt-24">Contact Page</div>,
      },
    ],
  },
];

export default homeRoutes;
