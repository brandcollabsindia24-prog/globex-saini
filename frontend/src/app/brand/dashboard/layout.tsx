import { ReactNode } from "react";

type BrandDashboardLayoutProps = {
	children: ReactNode;
};

export default function BrandDashboardLayout({
	children,
}: BrandDashboardLayoutProps) {
	return <>{children}</>;
}
