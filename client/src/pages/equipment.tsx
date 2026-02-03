import { LayoutShell } from "@/components/layout-shell";
import { useEquipment, useCreateEquipment } from "@/hooks/use-inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Plus, Wrench } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Equipment() {
  const { data: equipment } = useEquipment();
  const createEquip = useCreateEquipment();
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createEquip.mutate({
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      serialNumber: formData.get("serialNumber") as string,
      status: "yard",
    }, {
      onSuccess: () => toast({ title: "Equipment Added" })
    });
  };

  return (
    <LayoutShell>
       <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Heavy Equipment</h1>
            <p className="text-muted-foreground mt-1">Fleet management and maintenance logs.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg"><Plus className="mr-2 h-5 w-5" /> Add Equipment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="CAT 320 Excavator" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="type" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excavator">Excavator</SelectItem>
                      <SelectItem value="Bulldozer">Bulldozer</SelectItem>
                      <SelectItem value="Crane">Crane</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Generator">Generator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input name="serialNumber" />
                </div>
                <Button type="submit" className="w-full">Add Equipment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {equipment?.map((item) => (
            <Card key={item.id} className="border-t-4 border-t-secondary hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-xs">{item.serialNumber || 'NO S/N'}</Badge>
                  <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                </div>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <Badge className={
                    item.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                    item.status === 'repair' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-slate-500 hover:bg-slate-600'
                  }>
                    {item.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">{item.hoursUsed} hrs</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Wrench className="mr-2 h-3 w-3" /> Log Maintenance
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
