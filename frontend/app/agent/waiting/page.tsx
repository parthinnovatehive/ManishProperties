// app/agent/waiting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminData } from "@/lib/utils/token";
import { Clock, Building2, Mail, RefreshCw } from "lucide-react";

export default function AgentWaitingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
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

  useEffect(() => {
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
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
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="text-sm text-estate-muted hover:text-estate-navy transition"
          >
            Return to Home
          </button>
        </div>

        <div className="mt-6 text-xs text-estate-muted">
          <Building2 className="inline w-3 h-3 mr-1" />
          Manish Properties • Agent Portal
        </div>
      </div>
    </div>
  );
}