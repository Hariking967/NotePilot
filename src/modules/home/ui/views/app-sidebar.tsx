"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  FileTextIcon,
  SearchIcon,
  MapIcon,
  BookOpenIcon,
  ZapIcon,
  ListIcon,
  BriefcaseIcon,
  UsersIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const items = [
  { id: "all-notes", label: "All Notes", icon: FileTextIcon },
  { id: "ai-search", label: "AI Search", icon: SearchIcon },
  { id: "mindmaps", label: "Mindmaps", icon: MapIcon },
  { id: "flashcards", label: "Flashcards", icon: BookOpenIcon },
  { id: "quizzes", label: "Quizzes", icon: ZapIcon },
  { id: "todo-list", label: "Todo List", icon: ListIcon },
  { id: "organize", label: "Organize", icon: BriefcaseIcon },
  { id: "collaborate", label: "Collaborate", icon: UsersIcon },
];

export default function AppSidebar() {
  const router = useRouter();
  const { data } = authClient.useSession();

  const [active, setActive] = React.useState<string>("all-notes");
  const [locked, setLocked] = React.useState<string | null>(null);

  // helper styles: base black, and hover/active gradient left->right dark-green->black
  const baseClass =
    "flex h-full w-full flex-col bg-black text-white transition-all duration-300";

  const buttonGradient = (isActive: boolean) =>
    isActive
      ? "bg-[linear-gradient(90deg,#064e3b,rgba(0,0,0,0.95))]"
      : "hover:bg-[linear-gradient(90deg,#064e3b,rgba(0,0,0,0.95))]";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar side="left" variant="sidebar" collapsible="none">
          <div className={baseClass}>
            <SidebarHeader className="px-4 py-6">
              <div className="text-xl font-semibold">NotePilot</div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup className="px-2 pt-2">
                <SidebarMenu className="flex flex-col gap-1 px-2">
                  {items.map((it) => {
                    const Icon = it.icon;
                    const isActive = (locked ?? active) === it.id;

                    return (
                      <SidebarMenuItem key={it.id}>
                        <SidebarMenuButton
                          onClick={() => {
                            // clicking locks the gradient for the selected item
                            setActive(it.id);
                            setLocked(it.id);
                          }}
                          isActive={isActive}
                          className={`flex items-center gap-3 ${buttonGradient(
                            isActive
                          )} rounded-md px-3 py-2`}
                        >
                          <Icon className="size-4 text-emerald-200" />
                          <span className="truncate">{it.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <div className="flex-1" />

            <SidebarFooter className="px-4 py-4">
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-800 flex items-center justify-center">
                    <UserIcon className="size-4 text-emerald-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {data?.user.name ?? "Guest"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => router.push("/auth/sign-in"),
                          },
                        })
                      }
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>

        <SidebarInset />
      </div>
    </SidebarProvider>
  );
}
