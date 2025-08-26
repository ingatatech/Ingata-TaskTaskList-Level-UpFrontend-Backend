import React from 'react';
import Header from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children, userRole, activeSection, onSectionChange, onAddTask, onAddUser }: {
    children: React.ReactNode;
    userRole: "admin" | "user";
    activeSection: string;
    onSectionChange: (section: string) => void;
    onAddTask?: () => void;
    onAddUser?: () => void;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Fixed Header spanning the full width */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-background shadow-sm">
                <Header />
            </div>

            {/* Content area below the header */}
            <div className="flex flex-1 pt-16">
                {/* Fixed Sidebar container with scroll */}
                <div className="hidden lg:flex w-64 fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">
                    <Sidebar 
                        userRole={userRole} 
                        activeSection={activeSection} 
                        onSectionChange={onSectionChange} 
                        onAddTask={onAddTask} 
                        onAddUser={onAddUser} 
                    />
                </div>
                
                {/* Main Content with Padding */}
                <main className="flex-1 overflow-y-auto bg-background p-6 lg:ml-64">
                    {children}
                </main>
            </div>
        </div>
    );
}
