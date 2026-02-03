import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTools, useMaterials, useCreateTool, useCreateMaterial } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { data: tools } = useTools();
  const { data: materials } = useMaterials();
  const createTool = useCreateTool();
  const createMaterial = useCreateMaterial();
  const { toast } = useToast();
  const [toolOpen, setToolOpen] = useState(false);
  const [matOpen, setMatOpen] = useState(false);

  // Forms states would go here similar to Projects page
  // For brevity, implementing basic structure

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createTool.mutate({
      name: formData.get("name") as string,
      barcode: formData.get("barcode") as string,
      category: formData.get("category") as string,
      status: "available",
      location: "Warehouse"
    }, {
      onSuccess: () => {
        setToolOpen(false);
        toast({ title: "Tool added" });
      }
    });
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMaterial.mutate({
      name: formData.get("name") as string,
      unit: formData.get("unit") as string,
      quantity: Number(formData.get("quantity")),
      supplier: formData.get("supplier") as string,
    }, {
      onSuccess: () => {
        setMatOpen(false);
        toast({ title: "Material added" });
      }
    });
  };

  return (
    <LayoutShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track tools and materials across all sites.</p>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="mt-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Tool Tracker</h2>
              <Dialog open={toolOpen} onOpenChange={setToolOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Tool</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Tool</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateTool} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Barcode</Label>
                      <Input name="barcode" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input name="category" placeholder="Drills, Saws, etc." />
                    </div>
                    <Button type="submit" className="w-full">Add Tool</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools?.map(tool => (
                <Card key={tool.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.barcode}</p>
                      </div>
                      <Badge variant={tool.status === 'available' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                    </div>
                    <div className="mt-4 text-sm">
                      <p>Location: <span className="font-medium">{tool.location}</span></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="mt-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Material Stock</h2>
              <Dialog open={matOpen} onOpenChange={setMatOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Material</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateMaterial} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input name="unit" placeholder="pcs, kg, m" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Quantity</Label>
                      <Input name="quantity" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Input name="supplier" />
                    </div>
                    <Button type="submit" className="w-full">Add Material</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 font-medium border-b border-border/50">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Unit</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {materials?.map(mat => (
                    <tr key={mat.id} className="hover:bg-muted/30">
                      <td className="p-4 font-medium">{mat.name}</td>
                      <td className="p-4 text-muted-foreground">{mat.supplier || '-'}</td>
                      <td className="p-4 text-right font-mono">{mat.quantity}</td>
                      <td className="p-4 text-right text-muted-foreground">{mat.unit}</td>
                      <td className="p-4">
                        {mat.quantity <= (mat.reorderLevel || 0) && (
                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}
