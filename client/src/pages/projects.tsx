import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Projects() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jobNumber: "",
    name: "",
    client: "",
    location: "",
    budgetHours: 0,
    status: "active" as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        toast({ title: "Success", description: "Project created successfully" });
        setFormData({ jobNumber: "", name: "", client: "", location: "", budgetHours: 0, status: "active" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <LayoutShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage construction sites and jobs.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Number</Label>
                    <Input
                      required
                      value={formData.jobNumber}
                      onChange={e => setFormData({ ...formData, jobNumber: e.target.value })}
                      placeholder="e.g. 25-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Downtown Office Renovation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    required
                    value={formData.client}
                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget Hours</Label>
                  <Input
                    type="number"
                    required
                    value={formData.budgetHours}
                    onChange={e => setFormData({ ...formData, budgetHours: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-card border-border/50" placeholder="Search projects..." />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p>Loading projects...</p>
          ) : (
            projects?.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-300 border-border/60 group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                      {project.jobNumber}
                    </Badge>
                    <Badge className={
                      project.status === 'active' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' :
                        project.status === 'paused' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' :
                          'bg-slate-500/10 text-slate-600 hover:bg-slate-500/20'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display leading-tight group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    Started {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'N/A'}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Hours Used</span>
                      <span className="font-medium text-foreground">0 / {project.budgetHours}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[0%]" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button variant="ghost" className="w-full text-xs uppercase tracking-wider font-semibold border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
