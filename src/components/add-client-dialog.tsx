import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@/lib/types";

interface AddClientDialogProps {
  onAdd: (client: Client) => void;
  children: React.ReactNode;
}

export function AddClientDialog({ onAdd, children }: AddClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: uuidv4(),
      name,
      industry,
      status: "new",
      contacts: [],
      checklist: {
        companyDetails: true,
        leadsImported: false,
        promptsAdded: false,
        leadsReviewed: false,
        emailsApproved: false,
      },
    });
    setName("");
    setIndustry("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Ltd" />
          </div>
          <div className="space-y-1">
            <Label>Industry</Label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Finance" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
