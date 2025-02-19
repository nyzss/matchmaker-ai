"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login";
import { RegisterForm } from "@/components/auth/register";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Welcome to Matchmaker AI
                    </CardTitle>
                    <CardDescription className="text-center">
                        Let AI find the perfect candidate for your business
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as "login" | "register")
                        }
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>
                        <div className="mt-4">
                            <TabsContent value="login">
                                <LoginForm />
                            </TabsContent>
                            <TabsContent value="register">
                                <RegisterForm
                                    onSuccess={() => setActiveTab("login")}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
