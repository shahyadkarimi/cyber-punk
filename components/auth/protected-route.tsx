"use client";

import type React from "react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "../dashboard/dashboard-layout";
import Link from "next/link";
import { Headset } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0f]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00ff9d] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = userProfile?.role;
  console.log(userProfile);

  // Check role permissions
  if (requiredRole && userRole !== requiredRole) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0f]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
            <p className="mt-2 text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (userRole === "seller" && !userProfile?.admin_approved) {
    return (
      fallback || (
        <DashboardLayout>
          <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0f]">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-yellow-400">
                Please wait for admin approval
              </h1>
              <p className="text-gray-400">
                If needed, you can contact support via Telegram.
              </p>
              <Link
                href="https://t.me/mrzblackhat"
                className="flex items-center gap-1 text-neon-green"
              >
                <Headset className="size-5" />
                <span>Telegram support</span>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      )
    );
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0f]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
            <p className="mt-2 text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
