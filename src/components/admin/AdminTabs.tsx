"use client";

import { useState } from "react";
import ClientManager from "./ClientManager";
import TeamManager from "./TeamManager";
import type { ClientRecord } from "@/lib/clients";

const TABS = [
  { id: "clients", label: "Client Manager" },
  { id: "team", label: "Team Manager" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AdminTabsProps {
  initialClients: ClientRecord[];
}

export default function AdminTabs({ initialClients }: AdminTabsProps) {
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
        {activeTab === "clients" ? (
          <ClientManager initialClients={initialClients} />
        ) : (
          <TeamManager />
        )}
      </div>
    </div>
  );
}
