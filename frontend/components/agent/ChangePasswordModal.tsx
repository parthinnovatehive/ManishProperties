"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/api/client";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const response: any = await apiClient.post("/api/agents/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast.success("Password changed successfully");
        handleClose();
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div onClick={handleClose} className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-x-4 top-20 max-w-lg mx-auto bg-white z-[99999] rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="p-5 border-b border-estate-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Change Password</h3>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-estate-surface rounded-lg transition">
            <svg className="w-5 h-5 text-estate-text-sec" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Current Password</span>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 pr-10 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-estate-muted hover:text-estate-navy">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">New Password</span>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 pr-10 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-estate-muted hover:text-estate-navy">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Confirm New Password</span>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 pr-10 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                placeholder="Re-enter new password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-estate-muted hover:text-estate-navy">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-estate-navy text-white text-sm font-bold hover:bg-estate-navy-mid transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</>
              ) : (
                <><KeyRound className="w-4 h-4" /> Change Password</>
              )}
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
