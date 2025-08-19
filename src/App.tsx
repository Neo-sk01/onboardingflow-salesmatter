import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Plus,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  FileSpreadsheet,
  Mail,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Globe,
  Users,
  UserPlus,
  Trash2,
  Pencil,
  Send,
  ListChecks,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Client, Lead, PromptTemplate } from "@/lib/types";

// ----------------------------
// Mock data
// ----------------------------

const seedClients: Client[] = [
  {
    id: "c1",
    name: "Acme FinTech",
    industry: "Finance",
    status: "new",
    contacts: [
      { id: "ct1", name: "Sarah Mokoena", email: "sarah@acme.co", role: "CMO" },
    ],
    checklist: {
      companyDetails: true,
      leadsImported: true,
      promptsAdded: false,
      leadsReviewed: false,
      emailsApproved: false,
    },
  },
  {
    id: "c2",
    name: "Byte Health",
    industry: "Healthcare",
    status: "active",
    contacts: [
      { id: "ct2", name: "Thabo Nkosi", email: "thabo@bytehealth.io", role: "Head of Ops" },
    ],
    checklist: {
      companyDetails: true,
      leadsImported: true,
      promptsAdded: true,
      leadsReviewed: true,
      emailsApproved: false,
    },
  },
];

const seedLeads: Lead[] = [
  {
    id: "l1",
    clientId: "c1",
    name: "Naledi Khoza",
    title: "VP Marketing",
    company: "Acme FinTech",
    email: "naledi@acme.co",
    linkedin: "https://linkedin.com/in/naledi",
    website: "https://acme.co",
    templates: [
      {
        id: "t1",
        label: "ROI-focused",
        content:
          "Write a concise cold email to {{name}} ({{title}} at {{company}}) showing a 25% ROI within 60 days using SalesMatter automations.",
        tags: ["ROI", "Short"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "t2",
        label: "Case study angle",
        content:
          "Draft an outreach email referencing our {{industry}} case study. Emphasize lead enrichment + batch sending for {{company}}.",
        tags: ["Case Study"],
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "l2",
    clientId: "c1",
    name: "Sipho Dlamini",
    title: "Head of Sales",
    company: "Acme FinTech",
    email: "sipho@acme.co",
    linkedin: "https://linkedin.com/in/sipho",
    website: "https://acme.co",
    templates: [],
  },
  {
    id: "l3",
    clientId: "c2",
    name: "Aisha Patel",
    title: "Growth Lead",
    company: "Byte Health",
    email: "aisha@bytehealth.io",
    linkedin: "https://linkedin.com/in/aisha",
    website: "https://bytehealth.io",
    templates: [
      {
        id: "t3",
        label: "Tech angle",
        content:
          "Personalize an email to {{name}} highlighting how SalesMatter integrates with CRMs and enriches leads via LinkedIn and websites.",
        tags: ["Tech"],
        createdAt: new Date().toISOString(),
      },
    ],
    approved: true,
  },
];

// ----------------------------
// Helpers
// ----------------------------

function fuzzyIncludes(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function parseSimpleCSV(text: string) {
  // very naive CSV: comma-separated, first row headers
  const rows = text.split(/\r?\n/).filter(Boolean);
  const headers = rows.shift()?.split(",") || [];
  return rows.map((r) => {
    const cols = r.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h.trim()] = (cols[i] || "").trim()));
    return obj;
  });
}

// ----------------------------
// Main App
// ----------------------------

export default function SalesMatterOnboarding() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id ?? null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const filteredClients = useMemo(() => {
    if (!query) return clients;
    return clients.filter(
      (c) => fuzzyIncludes(c.name, query) || fuzzyIncludes(c.industry || "", query)
    );
  }, [clients, query]);

  const filteredLeads = useMemo(() => {
    const scoped = selectedClientId ? leads.filter((l) => l.clientId === selectedClientId) : leads;
    if (!query) return scoped;
    return scoped.filter(
      (l) =>
        fuzzyIncludes(l.name, query) ||
        fuzzyIncludes(l.title || "", query) ||
        fuzzyIncludes(l.company || "", query) ||
        fuzzyIncludes(l.email || "", query)
    );
  }, [leads, query, selectedClientId]);

  useEffect(() => {
    if (selectedClientId) {
      // In a real app, you'd fetch this data
      // For now, we'll just use the mock data
    }
  }, [selectedClientId]);

  const allTemplates = useMemo(() =>
    leads.flatMap((l) => l.templates.map((t) => ({ lead: l, template: t }))),
  [leads]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar query={query} setQuery={setQuery} />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <OnboardingChecklist
          clientId={selectedClientId}
          updateClient={(next) => {
            setClients((prev) => prev.map((c) => (c.id === next.id ? next : c)));
          }}
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4 md:max-w-xl">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="leads">Lead Lists</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Templates</TabsTrigger>
            <TabsTrigger value="emails">Email Outreach</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="pt-4">
            <ClientsTab
              clients={filteredClients}
              onAddClient={(client) => setClients((prev) => [client, ...prev])}
              onUpdateClient={(client) =>
                setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)))
              }
              onDeleteClient={(id) => {
                setClients((prev) => prev.filter((c) => c.id !== id));
                if (selectedClientId === id) setSelectedClientId(clients[0]?.id ?? null);
              }}
            />
          </TabsContent>

          <TabsContent value="leads" className="pt-4">
            <LeadsTab
              clients={clients}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              leads={filteredLeads}
              addLeads={(newLeads) => setLeads((prev) => [...newLeads, ...prev])}
              updateLead={(lead) => setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)))}
              deleteLead={(id) => setLeads((prev) => prev.filter((l) => l.id !== id))}
            />
          </TabsContent>

          <TabsContent value="prompts" className="pt-4">
            <PromptsTab
              leads={filteredLeads}
              updateLead={(lead) => setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)))}
            />
          </TabsContent>

          <TabsContent value="emails" className="pt-4">
            <EmailOutreachTab
              leads={filteredLeads}
              updateLead={(lead) => setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ----------------------------
// Top Bar
// ----------------------------

function TopBar({ query, setQuery }: {
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto p-3 md:p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <ListChecks className="h-5 w-5" /> Onboarding Dashboard
        </div>
        <Separator orientation="vertical" className="mx-2 hidden md:block" />
        <div className="relative ml-auto w-full max-w-lg">
          <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, leads, emails..."
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="ml-1"><Filter className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>My workspace</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Active clients</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Needs approval</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ----------------------------
// Onboarding Checklist (per selected client)
// ----------------------------

function OnboardingChecklist({ clientId, updateClient }: { clientId: string | null; updateClient: (c: Client) => void }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!clientId) return;
      setLoading(true);
      try {
        // Mock API call
        await new Promise(res => setTimeout(res, 800));
        const client = seedClients.find(c => c.id === clientId);
        if (client) {
          setClientName(client.name);
          const checklistItems: ChecklistItem[] = [
            { id: "companyDetails", label: "Company details added", checked: client.checklist.companyDetails },
            { id: "leadsImported", label: "Leads imported / CSV uploaded", checked: client.checklist.leadsImported },
            { id: "promptsAdded", label: "Prompt templates added (per lead)", checked: client.checklist.promptsAdded },
            { id: "leadsReviewed", label: "Enriched leads reviewed", checked: client.checklist.leadsReviewed },
            { id: "emailsApproved", label: "Email drafts approved", checked: client.checklist.emailsApproved },
          ];
          setItems(checklistItems);
        }
      } catch (error) {
        console.error("Failed to fetch client data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [clientId]);

  const updateItem = (id: string, checked: boolean) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked } : item));
    // Here you would also make an API call to update the backend
  };

  const done = items.filter(Boolean).length;
  const pct = Math.round((done / items.length) * 100);

  if (!clientId) return null;

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading checklist...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Users className="h-5 w-5" /> Onboarding – {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} />
        <div className="grid gap-2 md:grid-cols-5">
          {items.map((it) => (
            <label key={it.id} className={cn(
              "flex items-center gap-2 rounded-lg border p-2 text-sm",
              it.checked ? "bg-emerald-50 border-emerald-200" : ""
            )}>
              <Checkbox
                checked={it.checked}
                onCheckedChange={(v) => updateItem(it.id, Boolean(v))}
              />
              {it.label}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------
// Clients Tab
// ----------------------------

function ClientsTab({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}: {
  clients: Client[];
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
  onDeleteClient: (id: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <DataTable
        columns={columns}
        data={clients}
        onAddClient={onAddClient}
        onUpdateClient={onUpdateClient}
        onDeleteClient={onDeleteClient}
      />
    </div>
  );
}

// ----------------------------
// Leads Tab
// ----------------------------

function LeadsTab({
  clients,
  selectedClientId,
  setSelectedClientId,
  leads,
  addLeads,
  updateLead,
  deleteLead,
}: {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string) => void;
  leads: Lead[];
  addLeads: (l: Lead[]) => void;
  updateLead: (l: Lead) => void;
  deleteLead: (id: string) => void;
}) {
  const [csvOpen, setCsvOpen] = useState(false);

  const onCSV = async (file: File) => {
    const text = await file.text();
    const rows = parseSimpleCSV(text);
    const newLeads: Lead[] = rows.map((r) => ({
      id: uuidv4(),
      clientId: selectedClientId || clients[0]?.id || "",
      name: r.name || r.Name || "Unknown",
      title: r.title || r.Title || "",
      company: r.company || r.Company || "",
      email: r.email || r.Email || "",
      linkedin: r.linkedin || r.LinkedIn || "",
      website: r.website || r.Website || "",
      templates: [],
    }));
    addLeads(newLeads);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle>Lead Lists</CardTitle>
          <div className="flex items-center gap-2">
            <ClientPicker clients={clients} value={selectedClientId} onChange={setSelectedClientId} />
            <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-2"/>Upload CSV</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload CSV</DialogTitle>
                </DialogHeader>
                <CSVDropzone onFile={onCSV} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Templates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.title}</TableCell>
                  <TableCell>{l.company}</TableCell>
                  <TableCell>{l.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-muted-foreground">
                      {l.linkedin && <a href={l.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline"><LinkIcon className="h-3.5 w-3.5"/>LinkedIn</a>}
                      {l.website && <a href={l.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline"><Globe className="h-3.5 w-3.5"/>Website</a>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {l.templates.length} template{l.templates.length !== 1 ? "s" : ""}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-xl">
                        <SheetHeader>
                          <SheetTitle>Prompt Templates · {l.name}</SheetTitle>
                        </SheetHeader>
                        <TemplatesManager lead={l} onChange={updateLead} />
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateLead({ ...l, approved: !l.approved })}>
                          {l.approved ? <><XCircle className="h-4 w-4 mr-2"/>Unapprove</> : <><CheckCircle2 className="h-4 w-4 mr-2"/>Approve</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteLead(l.id)}>
                          <Trash2 className="h-4 w-4 mr-2"/>Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-6 w-6 mb-2" />
              No leads yet. Upload a CSV to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientPicker({ clients, value, onChange }: { clients: Client[]; value: string | null; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs">Client</Label>
      <select
        className="h-9 rounded-md border bg-transparent px-3 text-sm"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

function CSVDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [drag, setDrag] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center",
        drag ? "border-primary" : ""
      )}
    >
      <Upload className="h-6 w-6" />
      <div className="text-sm">Drag & drop CSV here</div>
      <div className="text-xs text-muted-foreground">or click to browse</div>
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

// ----------------------------
// Templates Manager (per lead)
// ----------------------------

function TemplatesManager({ lead, onChange }: { lead: Lead; onChange: (l: Lead) => void }) {
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");

  const add = () => {
    if (!label.trim() || !content.trim()) return;
    const t: PromptTemplate = { id: uuidv4(), label, content, tags: tag ? [tag] : [], createdAt: new Date().toISOString() };
    onChange({ ...lead, templates: [t, ...lead.templates] });
    setLabel(""); setContent(""); setTag("");
  };

  const edit = (id: string, next: Partial<PromptTemplate>) => {
    onChange({
      ...lead,
      templates: lead.templates.map((t) => (t.id === id ? { ...t, ...next } : t)),
    });
  };

  const remove = (id: string) => {
    onChange({ ...lead, templates: lead.templates.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. ROI-focused" />
        </div>
        <div className="grid gap-2">
          <Label>Template Prompt</Label>
          <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Use {{name}}, {{title}}, {{company}} placeholders..." />
        </div>
        <div className="grid gap-2">
          <Label>Tag (optional)</Label>
          <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. ROI, Case Study" />
        </div>
        <div className="flex justify-end">
          <Button onClick={add}><Plus className="h-4 w-4 mr-2"/>Add Template</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {lead.templates.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.label}</div>
              <div className="flex items-center gap-2">
                {t.tags.map((tg) => <Badge key={tg} variant="secondary">{tg}</Badge>)}
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            </div>
            <Textarea className="mt-2" rows={4} value={t.content} onChange={(e) => edit(t.id, { content: e.target.value })} />
            <div className="text-xs text-muted-foreground mt-2">Created {new Date(t.createdAt).toLocaleString()}</div>
          </motion.div>
        ))}

        {lead.templates.length === 0 && (
          <div className="text-sm text-muted-foreground">No templates for this lead yet.</div>
        )}
      </div>
    </div>
  );
}

// ----------------------------
// Prompts Tab (aggregated view)
// ----------------------------

function PromptsTab({ leads, updateLead }: { leads: Lead[]; updateLead: (l: Lead) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {leads.map((l) => (
        <Card key={l.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{l.name} · {l.company}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground">{l.title} · {l.email}</div>
            <Separator />
            <div className="space-y-3">
              {l.templates.map((t) => (
                <div key={t.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.label}</div>
                    <div className="flex gap-1">{t.tags.map((tg) => <Badge key={tg} variant="secondary">{tg}</Badge>)}</div>
                  </div>
                  <Textarea className="mt-2" rows={4} value={t.content} onChange={(e) => updateLead({ ...l, templates: l.templates.map((x) => x.id === t.id ? { ...x, content: e.target.value } : x) })} />
                </div>
              ))}
              {l.templates.length === 0 && <div className="text-sm text-muted-foreground">No templates yet.</div>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ----------------------------
// Email Outreach Tab (preview + approvals + batch send simulation)
// ----------------------------

function EmailOutreachTab({ leads, updateLead }: { leads: Lead[]; updateLead: (l: Lead) => void }) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedDrafts = useMemo(() => {
    // create a simple draft by combining the first template (if any) with lead placeholders
    return leads.map((l) => {
      const t = l.templates[0];
      const text = t ? renderTemplate(t.content, l) : "No template available.";
      return { lead: l, draft: text, templateLabel: t?.label };
    });
  }, [leads]);

  const startBatch = async () => {
    setSending(true);
    setProgress(0);
    // simulate batch send in chunks of 20
    const chunk = 20;
    for (let i = 0; i < selectedDrafts.length; i++) {
      // fake delay per email
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 60));
      const l = selectedDrafts[i].lead;
      if (i % chunk === chunk - 1 || i === selectedDrafts.length - 1) {
        setProgress(Math.round(((i + 1) / selectedDrafts.length) * 100));
      }
      // mark approved as sent (for UI only)
      updateLead({ ...l, approved: true });
    }
    setProgress(100);
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle>Email Drafts & Approval</CardTitle>
          <div className="flex items-center gap-2">
            <Button disabled={sending || selectedDrafts.length === 0} onClick={startBatch}>
              <Send className="h-4 w-4 mr-2"/>Send in Batches
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sending && <Progress value={progress} />}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedDrafts.map(({ lead, draft, templateLabel }) => (
              <Card key={lead.id} className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4"/> {lead.name} · {lead.company}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">Using template: {templateLabel || "—"}</div>
                  <Textarea rows={8} value={draft} onChange={() => {}} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      {lead.approved ? <Badge>Approved</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={lead.approved ? "outline" : "default"} onClick={() => updateLead({ ...lead, approved: !lead.approved })}>
                        {lead.approved ? <><XCircle className="h-4 w-4 mr-1"/>Unapprove</> : <><CheckCircle2 className="h-4 w-4 mr-1"/>Approve</>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderTemplate(t: string, l: Lead) {
  return t
    .replaceAll("{{name}}", l.name)
    .replaceAll("{{title}}", l.title || "")
    .replaceAll("{{company}}", l.company || "");
}
