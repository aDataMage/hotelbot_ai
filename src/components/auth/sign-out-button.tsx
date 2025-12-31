"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const router = useRouter();
    return (
        <Button
            variant="outline"
            onClick={async () => {
                await authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/auth");
                        }
                    }
                });
            }}
            className="gap-2"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </Button>
    )
}
