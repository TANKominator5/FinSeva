export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "FinSeva",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Contact",
      href: "/Contact",
    },
    {
      label: "Recommendations",
      href: "/recommendation",
    },
    {
      label: "Tax Calculator",
      href: "/compareregime",
    },
    {
      label: "Login",
      href: "/login",
    },
    {
      label: "Signup",
      href: "/signup",
    },
    {
      label: "Summary",
      href: "/incometaxsummary",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  navMenuItems: [
    {
      label: "My Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
};
