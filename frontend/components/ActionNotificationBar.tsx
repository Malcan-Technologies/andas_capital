"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CreditCard,
  CheckCircle,
  ShieldCheck,
  KeyRound,
  UserCheck,
  FileSignature,
  FileCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bell,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ActionNotification {
  id: string;
  type:
    | "INCOMPLETE_APPLICATION"
    | "PENDING_APP_FEE"
    | "APPROVED"
    | "PENDING_ATTESTATION"
    | "CERT_CHECK"
    | "PENDING_SIGNING_OTP"
    | "PENDING_KYC"
    | "PENDING_PROFILE_CONFIRMATION"
    | "PENDING_CERTIFICATE_OTP"
    | "PENDING_SIGNING_OTP_DS"
    | "PENDING_SIGNATURE"
    | "PENDING_FRESH_OFFER"
    | "PROFILE_INCOMPLETE";
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  metadata?: {
    productName?: string;
    amount?: string;
    date?: string;
    applicationId?: string;
    completionPercentage?: number;
    missing?: string[];
  };
}

interface ActionNotificationBarProps {
  notifications: ActionNotification[];
}

export default function ActionNotificationBar({
  notifications,
}: ActionNotificationBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const ROTATION_INTERVAL = 8000; // 8 seconds

  const goToNext = useCallback(() => {
    if (notifications.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
    setProgress(0);
  }, [notifications.length]);

  const goToPrev = useCallback(() => {
    if (notifications.length <= 1) return;
    setCurrentIndex((prev) =>
      prev === 0 ? notifications.length - 1 : prev - 1
    );
    setProgress(0);
  }, [notifications.length]);

  // Auto-rotate and progress bar
  useEffect(() => {
    if (notifications.length <= 1 || isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + 100 / (ROTATION_INTERVAL / 100);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [notifications.length, isPaused, goToNext]);

  // Reset index when notifications change
  useEffect(() => {
    if (currentIndex >= notifications.length) {
      setCurrentIndex(0);
    }
  }, [notifications.length, currentIndex]);

  if (notifications.length === 0) {
    return null;
  }

  const currentNotification = notifications[currentIndex];

  const getNotificationConfig = (type: string) => {
    const configs: Record<
      string,
      {
        icon: React.ReactNode;
        gradient: string;
        iconBg: string;
        badgeColor: string;
        buttonColor: string;
      }
    > = {
      INCOMPLETE_APPLICATION: {
        icon: <Clock className="h-5 w-5" />,
        gradient: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-100 text-amber-600",
        badgeColor: "bg-amber-100 text-amber-700",
        buttonColor: "bg-amber-500 hover:bg-amber-600",
      },
      PENDING_APP_FEE: {
        icon: <CreditCard className="h-5 w-5" />,
        gradient: "from-orange-500 to-red-500",
        iconBg: "bg-orange-100 text-orange-600",
        badgeColor: "bg-orange-100 text-orange-700",
        buttonColor: "bg-orange-500 hover:bg-orange-600",
      },
      APPROVED: {
        icon: <CheckCircle className="h-5 w-5" />,
        gradient: "from-emerald-500 to-teal-500",
        iconBg: "bg-emerald-100 text-emerald-600",
        badgeColor: "bg-emerald-100 text-emerald-700",
        buttonColor: "bg-emerald-500 hover:bg-emerald-600",
      },
      PENDING_ATTESTATION: {
        icon: <ShieldCheck className="h-5 w-5" />,
        gradient: "from-cyan-500 to-blue-500",
        iconBg: "bg-cyan-100 text-cyan-600",
        badgeColor: "bg-cyan-100 text-cyan-700",
        buttonColor: "bg-cyan-500 hover:bg-cyan-600",
      },
      CERT_CHECK: {
        icon: <FileCheck className="h-5 w-5" />,
        gradient: "from-indigo-500 to-purple-500",
        iconBg: "bg-indigo-100 text-indigo-600",
        badgeColor: "bg-indigo-100 text-indigo-700",
        buttonColor: "bg-indigo-500 hover:bg-indigo-600",
      },
      PENDING_SIGNING_OTP: {
        icon: <KeyRound className="h-5 w-5" />,
        gradient: "from-purple-500 to-pink-500",
        iconBg: "bg-purple-100 text-purple-600",
        badgeColor: "bg-purple-100 text-purple-700",
        buttonColor: "bg-purple-500 hover:bg-purple-600",
      },
      PENDING_CERTIFICATE_OTP: {
        icon: <KeyRound className="h-5 w-5" />,
        gradient: "from-purple-500 to-pink-500",
        iconBg: "bg-purple-100 text-purple-600",
        badgeColor: "bg-purple-100 text-purple-700",
        buttonColor: "bg-purple-500 hover:bg-purple-600",
      },
      PENDING_KYC: {
        icon: <UserCheck className="h-5 w-5" />,
        gradient: "from-violet-500 to-purple-500",
        iconBg: "bg-violet-100 text-violet-600",
        badgeColor: "bg-violet-100 text-violet-700",
        buttonColor: "bg-violet-500 hover:bg-violet-600",
      },
      PENDING_PROFILE_CONFIRMATION: {
        icon: <UserCheck className="h-5 w-5" />,
        gradient: "from-blue-500 to-indigo-500",
        iconBg: "bg-blue-100 text-blue-600",
        badgeColor: "bg-blue-100 text-blue-700",
        buttonColor: "bg-blue-500 hover:bg-blue-600",
      },
      PENDING_SIGNING_OTP_DS: {
        icon: <FileSignature className="h-5 w-5" />,
        gradient: "from-fuchsia-500 to-purple-500",
        iconBg: "bg-fuchsia-100 text-fuchsia-600",
        badgeColor: "bg-fuchsia-100 text-fuchsia-700",
        buttonColor: "bg-fuchsia-500 hover:bg-fuchsia-600",
      },
      PENDING_SIGNATURE: {
        icon: <FileSignature className="h-5 w-5" />,
        gradient: "from-rose-500 to-pink-500",
        iconBg: "bg-rose-100 text-rose-600",
        badgeColor: "bg-rose-100 text-rose-700",
        buttonColor: "bg-rose-500 hover:bg-rose-600",
      },
      PENDING_FRESH_OFFER: {
        icon: <Sparkles className="h-5 w-5" />,
        gradient: "from-teal-500 to-emerald-500",
        iconBg: "bg-teal-100 text-teal-600",
        badgeColor: "bg-teal-100 text-teal-700",
        buttonColor: "bg-teal-500 hover:bg-teal-600",
      },
      PROFILE_INCOMPLETE: {
        icon: <AlertTriangle className="h-5 w-5" />,
        gradient: "from-slate-600 to-slate-800",
        iconBg: "bg-slate-100 text-slate-600",
        badgeColor: "bg-slate-100 text-slate-700",
        buttonColor: "bg-slate-700 hover:bg-slate-800",
      },
    };

    return (
      configs[type] || {
        icon: <Bell className="h-5 w-5" />,
        gradient: "from-slate-500 to-slate-700",
        iconBg: "bg-slate-100 text-slate-600",
        badgeColor: "bg-slate-100 text-slate-700",
        buttonColor: "bg-slate-600 hover:bg-slate-700",
      }
    );
  };

  const config = getNotificationConfig(currentNotification.type);

  return (
    <Card
      className="relative overflow-hidden border-0 shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient top bar */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${config.gradient}`}
        aria-hidden="true"
      />

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5">
          {/* Left: Icon + Content */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={`flex-shrink-0 p-3 rounded-xl ${config.iconBg} shadow-sm`}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base lg:text-lg font-heading font-semibold text-slate-900 truncate">
                  {currentNotification.title}
                </h3>
                {currentNotification.priority === "HIGH" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-red-100 text-red-700 hover:bg-red-100"
                  >
                    Action Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 font-body line-clamp-2">
                {currentNotification.description}
              </p>
              {currentNotification.metadata?.date && (
                <p className="text-xs text-slate-400 mt-1.5 font-body">
                  {currentNotification.metadata.date}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action + Navigation */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Navigation for multiple notifications */}
            {notifications.length > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrev}
                  className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5 px-2">
                  {notifications.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setProgress(0);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex
                          ? "w-4 bg-slate-800"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Go to notification ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Action Button */}
            <Button
              asChild
              className={`${config.buttonColor} text-white rounded-xl font-body font-medium shadow-sm`}
            >
              <Link href={currentNotification.buttonHref}>
                {currentNotification.buttonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress bar for auto-rotation */}
        {notifications.length > 1 && (
          <div className="h-0.5 w-full bg-slate-100">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
