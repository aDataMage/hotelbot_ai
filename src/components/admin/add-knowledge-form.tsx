"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Database, CheckCircle, AlertCircle } from "lucide-react";

export function AddKnowledgeForm() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: "general",
        content: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        setMessage("");

        try {
            const res = await fetch("/api/admin/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to add knowledge");
            }

            setStatus("success");
            setMessage("Knowledge successfully embedded and added to database.");
            setFormData({ title: "", category: "general", content: "" }); // Reset form
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full border-[var(--border)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[var(--gold)]" />
                    Add Knowledge
                </CardTitle>
                <CardDescription>
                    Add new information to the AI's knowledge base. Content is automatically embedded and indexed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            placeholder="e.g., Late Checkout Policy"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select
                            value={formData.category}
                            onValueChange={val => setFormData({ ...formData, category: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="policy">Policy</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="nearby">Nearby Attraction</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                            placeholder="Detailed description of the policy, service, or fact..."
                            className="min-h-[150px]"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    {status === "success" && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {message}
                        </div>
                    )}

                    {status === "error" && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {message}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading} className="flex-1 gradient-gold text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Embed to Knowledge Base
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const scenarios = [
                                    { title: "Drone Usage Policy", category: "policy", content: "To ensure guest privacy, the use of unmanned aerial systems (drones) is strictly prohibited on hotel property without prior written approval from management." },
                                    { title: "Midnight Snack Service", category: "service", content: "Late-night gourmet operational from 11 PM to 4 AM. Dial 99. Features waygu sliders and truffled fries." },
                                    { title: "The Hidden Cellar", category: "restaurant", content: "Exclusive wine tasting room located B2 level. Reservatons only. Features rare vintage collection from 1950s." },
                                    { title: "Bioluminescent Bay", category: "nearby", content: "Natural glowing bay located 15 mins drive north. Best viewed on moonless nights. Guided kayak tours available at concierge." },
                                    { title: "Sustainable Energy Fact", category: "general", content: "100% of the hotel's daytime energy is generated by our offshore solar farm." }
                                ];
                                const random = scenarios[Math.floor(Math.random() * scenarios.length)];
                                setFormData(random);
                            }}
                            title="Fill with random test data"
                        >
                            🪄
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
