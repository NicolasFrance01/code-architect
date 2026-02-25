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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Entry Form */}
          <Card className="lg:col-span-1 shadow-lg border-primary/20 h-fit">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                New Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={v => setFormData({ ...formData, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phase / Work Code</Label>
                  <Select
                    value={formData.phaseId}
                    onValueChange={v => setFormData({ ...formData, phaseId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {phases?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.code} - {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Worker Name</Label>
                  <Input
                    value={formData.workerName}
                    onChange={e => setFormData({ ...formData, workerName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.hours}
                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full font-bold" disabled={createEntry.isPending}>
                  {createEntry.isPending ? "Submitting..." : "Submit Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="lg:col-span-2 shadow-sm">
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
