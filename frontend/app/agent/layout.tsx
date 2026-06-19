"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentNavbar from "@/components/agent/AgentNavbar";
import { cn } from "@/lib/utils";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";
import { getAdminData } from "@/lib/utils/token";
import { Clock, Loader2 } from "lucide-react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  // Guard the agent routes
  useRedirectIfUnauthenticated(["agent", "super-admin"]);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      try {
        const adminData = getAdminData();
        const status = adminData?.status || "PENDING";

        // If status is PENDING, show waiting page
        if (status === "PENDING") {
          setIsApproved(false);
          // Check if we're already on the waiting page to avoid redirect loop
          if (!window.location.pathname.includes('/agent/waiting')) {
            router.replace('/agent/waiting');
          }
        } else {
          setIsApproved(true);
          // If we're on waiting page but approved, redirect to dashboard
          if (window.location.pathname.includes('/agent/waiting')) {
            router.replace('/agent/dashboard');
          }
        }
      } catch (error) {
        console.error("Error checking agent status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  // Show loading state while checking status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-estate-bg">
        <Loader2 className="w-8 h-8 animate-spin text-estate-navy" />
      </div>
    );
  }

  // If not approved and not on waiting page, show waiting page directly
  if (!isApproved && !window.location.pathname.includes('/agent/waiting')) {
    return <WaitingForApprovalPage />;
  }

  // If on waiting page but approved, this will be handled by the redirect above
  // but just in case, render nothing (redirect will happen)
  if (isApproved && window.location.pathname.includes('/agent/waiting')) {
    return null;
  }

  // Render the actual layout for approved agents
  return (
    <div className="min-h-screen bg-estate-bg text-estate-text font-sans antialiased overflow-x-hidden relative flex">
      {/* Shared Sidebar Component */}
      <AgentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Panel Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Navigation Header */}
        <AgentNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic page contents with fade-up animation */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}

// Waiting for Approval Component
function WaitingForApprovalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = () => {
    setIsChecking(true);
    try {
      const adminData = getAdminData();
      const status = adminData?.status || "PENDING";

      if (status !== "PENDING") {
        router.replace('/agent/dashboard');
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-estate-bg px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-estate-navy mb-3">
          Waiting for Approval
        </h1>
        
        <p className="text-estate-text-sec mb-6">
          Your agent account is currently pending approval by an administrator.
          You will be notified once your account has been activated.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6 text-left">
          <p className="font-semibold mb-2">What happens next?</p>
          <ul className="space-y-1 text-left list-disc list-inside text-amber-600">
            <li>Admin reviews your application</li>
            <li>You receive an email confirmation when approved</li>
            <li>You can then access all agent features</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-estate-navy text-white rounded-xl hover:bg-estate-navy/90 transition disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Status'
            )}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="text-sm text-estate-muted hover:text-estate-navy transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}