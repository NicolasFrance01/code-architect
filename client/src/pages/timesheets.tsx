import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useTimeEntries, useCreateTimeEntry } from "@/hooks/use-time-entries";
import { useProjects } from "@/hooks/use-projects";
import { usePhases } from "@/hooks/use-phases";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

export default function Timesheets() {
  const { user } = useAuth();
  const { data: entries } = useTimeEntries();
  const { data: projects } = useProjects({ status: "active" });
  const { data: phases } = usePhases();
  const createEntry = useCreateTimeEntry();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    projectId: "",
    phaseId: "",
    workerName: "",
    hours: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createEntry.mutate({
      projectId: parseInt(formData.projectId),
      phaseId: parseInt(formData.phaseId),
      foremanId: user.id,
      workerName: formData.workerName,
      hours: formData.hours,
      date: formData.date,
      notes: formData.notes
    }, {
      onSuccess: () => {
        toast({ title: "Time Entry Submitted" });
        setFormData({ ...formData, workerName: "", hours: "", notes: "" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <LayoutShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Timesheets</h1>
          <p className="text-muted-foreground mt-1">Daily labor logs for field crews.</p>
        </div>

        <div className="grid gap-8 grid-cols-1">
          {/* Recent Entries */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left font-medium">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Worker</th>
                      <th className="p-3">Project</th>
                      <th className="p-3">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No entries found for today.
                        </td>
                      </tr>
                    )}
                    {entries?.map((entry) => (
                      <tr key={entry.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-mono">{format(new Date(entry.date), 'MM/dd')}</td>
                        <td className="p-3 font-medium">{entry.workerName}</td>
                        <td className="p-3 text-muted-foreground">
                          {projects?.find(p => p.id === entry.projectId)?.name || `Project #${entry.projectId}`}
                        </td>
                        <td className="p-3 font-bold">{entry.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
