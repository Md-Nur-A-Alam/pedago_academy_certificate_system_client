"use client";

import Link from "next/link";
import { Trophy, Users, Award, Image as ImageIcon, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  const { admin, isSuperAdmin, isLoading } = useCurrentAdmin();

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const quickLinks = [
    {
      title: "Competitions",
      desc: "Create and configure competition events, prefixes, and details",
      href: "/admin/competitions",
      icon: Trophy,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Participants & Results",
      desc: "Import Excel rosters, register winners, and manage serial codes",
      href: "/admin/participants",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Certificate Templates",
      desc: "Design winner and participant certificates with dynamic text zones",
      href: "/admin/certificate-templates",
      icon: Award,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Poster Templates",
      desc: "Configure personalized photo poster templates and text zones",
      href: "/admin/poster-templates",
      icon: ImageIcon,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Admin Management",
            desc: "Add and manage administrator accounts and permission roles",
            href: "/admin/admins",
            icon: ShieldCheck,
            color: "bg-amber-50 text-amber-600 border-amber-100",
            badge: "Super Admin",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-[#1A284A] to-[#29479B] rounded-2xl p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {isSuperAdmin ? "Super Admin Portal" : "Admin Portal"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {admin?.name || "Administrator"}! 👋
          </h1>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Signed in as <span className="font-semibold text-white">{admin?.email}</span>. Configure competitions, customize certificate and poster designs, or upload bulk participant rosters.
          </p>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div>
        <h2 className="text-lg font-bold text-[#1A284A] mb-4">
          Quick Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white p-6 rounded-2xl border border-gray-200/70 shadow-2xs hover:shadow-md hover:border-[#29479B]/30 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#1A284A] group-hover:text-[#29479B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-[#29479B] group-hover:translate-x-1 transition-transform">
                  <span>Open Section</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
