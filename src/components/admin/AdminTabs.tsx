"use client";

import { useState } from "react";
import ClientManager from "./ClientManager";
import TeamManager from "./TeamManager";
import SupportRequestManager from "./SupportRequestManager";
import EmailDiagnostics from "./EmailDiagnostics";
import type { ClientRecord } from "@/lib/clients";
import type { TeamMemberRecord } from "@/lib/userStore";
import type { SupportRequestGroups } from "@/lib/supportRequests";

const TABS = [
  { id: "clients", label: "Client Manager" },
  { id: "team", label: "Team Manager" },
  { id: "support", label: "Support Requests" },
  { id: "diagnostics", label: "Diagnostics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AdminTabsProps {
  initialClients: ClientRecord[];
  initialTeamMembers: TeamMemberRecord[];
  initialSupportRequestGroups: SupportRequestGroups;
}

export default function AdminTabs({
  initialClients,
  initialTeamMembers,
  initialSupportRequestGroups,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("clients");
  const [activeRequestCount, setActiveRequestCount] = useState(() =>
    initialSupportRequestGroups.active.reduce(
      (sum, group) => sum + group.items.length,
      0
    )
  );

  return (
    <div>
      <div className="border-b border-sage-200">
        <nav className="-mb-px flex gap-6" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === tab.id
                  ? "border-mint-600 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-sage-200 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.id === "support" && activeRequestCount > 0 && (
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                  {activeRequestCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-6">
        {activeTab === "clients" && (
          <ClientManager
            initialClients={initialClients}
            teamMembers={initialTeamMembers}
          />
        )}
        {activeTab === "team" && (
          <TeamManager initialTeamMembers={initialTeamMembers} />
        )}
        {activeTab === "support" && (
          <SupportRequestManager
            initialGroups={initialSupportRequestGroups}
            teamMembers={initialTeamMembers}
            onActiveCountChange={setActiveRequestCount}
          />
        )}
        {activeTab === "diagnostics" && <EmailDiagnostics />}
      </div>
    </div>
  );
}
