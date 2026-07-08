"use client";

import { useState } from "react";
import ClientManager from "./ClientManager";
import TeamManager from "./TeamManager";
import SupportRequestManager from "./SupportRequestManager";
import type { ClientRecord } from "@/lib/clients";
import type { TeamMemberRecord } from "@/lib/userStore";
import type { SupportRequestGroup } from "@/lib/supportRequests";

const TABS = [
  { id: "clients", label: "Client Manager" },
  { id: "team", label: "Team Manager" },
  { id: "support", label: "Support Requests" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AdminTabsProps {
  initialClients: ClientRecord[];
  initialTeamMembers: TeamMemberRecord[];
  initialSupportRequestGroups: SupportRequestGroup[];
}

export default function AdminTabs({
  initialClients,
  initialTeamMembers,
  initialSupportRequestGroups,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("clients");

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-6">
        {activeTab === "clients" && <ClientManager initialClients={initialClients} />}
        {activeTab === "team" && (
          <TeamManager initialTeamMembers={initialTeamMembers} />
        )}
        {activeTab === "support" && (
          <SupportRequestManager initialGroups={initialSupportRequestGroups} />
        )}
      </div>
    </div>
  );
}
