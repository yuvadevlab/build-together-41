import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Copy,
  FileText,
  Filter,
  Globe2,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  Menu,
  MessageSquareText,
  Minus,
  Moon,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type WorkspacePage = "Knowledge" | "Overview" | "Playground" | "Widget" | "Inbox" | "Analytics" | "Settings";

const navigation: { label: WorkspacePage; icon: typeof LayoutDashboard; group: string }[] = [
  { label: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
  { label: "Knowledge", icon: BookOpen, group: "WORKSPACE" },
  { label: "Playground", icon: Sparkles, group: "BUILD" },
  { label: "Widget", icon: Code2, group: "BUILD" },
  { label: "Inbox", icon: Inbox, group: "OPERATE" },
  { label: "Analytics", icon: Activity, group: "OPERATE" },
  { label: "Settings", icon: Settings2, group: "CONFIGURE" },
];

const pageInfo: Record<WorkspacePage, { title: string; subtitle: string }> = {
  Overview: { title: "Overview", subtitle: "Your assistant is learning and helping around the clock." },
  Knowledge: { title: "Knowledge & versions", subtitle: "Manage the sources and versions behind your assistant." },
  Playground: { title: "Prompt playground", subtitle: "Tune your assistant and test answers against your knowledge." },
  Widget: { title: "Widget customizer", subtitle: "Make the assistant feel at home on your website." },
  Inbox: { title: "Live support inbox", subtitle: "Step into conversations when visitors need a person." },
  Analytics: { title: "Analytics & knowledge gaps", subtitle: "See what your visitors ask, and where your knowledge can grow." },
  Settings: { title: "Settings & integrations", subtitle: "Manage your workspace, domains, and connected tools." },
};

const discoveredPages = [
  { path: "acme.com/", title: "Acme — Home", depth: 0 },
  { path: "acme.com/pricing", title: "Plans & pricing", depth: 1 },
  { path: "acme.com/help/getting-started", title: "Getting started", depth: 2 },
  { path: "acme.com/help/billing", title: "Billing & subscriptions", depth: 2 },
  { path: "acme.com/help/refunds", title: "Refund policy", depth: 2 },
  { path: "acme.com/about", title: "About Acme", depth: 1 },
];

const sourceRows = [
  { name: "acme.com", detail: "42 pages · updated 12 min ago", type: "Web", chunks: "1,284", synced: "Today, 10:42 AM", status: "Ready" },
  { name: "Help center", detail: "18 pages · support.acme.com", type: "Web", chunks: "642", synced: "Today, 9:18 AM", status: "Ready" },
  { name: "Product handbook.pdf", detail: "PDF · 2.4 MB", type: "Doc", chunks: "156", synced: "Yesterday", status: "Ready" },
  { name: "Returns & refunds.md", detail: "Markdown · 12 KB", type: "Doc", chunks: "34", synced: "Oct 24, 2026", status: "Ready" },
];

const initialMessages = [
  { who: "visitor", text: "How do I update my billing details?", time: "10:41 AM" },
  { who: "assistant", text: "You can update your billing details from Settings → Billing. Your new payment method will be used for your next renewal. [1]", time: "10:41 AM" },
  { who: "visitor", text: "Will this affect my current plan?", time: "10:42 AM" },
  { who: "assistant", text: "No, changing your payment method won't change your plan or billing cycle. [2]", time: "10:42 AM" },
];

const integrationList = [
  { name: "Shopify", detail: "Look up orders and shipping updates", icon: "S", tone: "integration-shopify" },
  { name: "Zendesk", detail: "Create support tickets from conversations", icon: "Z", tone: "integration-zendesk" },
  { name: "Jira", detail: "Turn product feedback into issues", icon: "J", tone: "integration-jira" },
  { name: "Custom webhooks", detail: "Send events to your own endpoints", icon: "↗", tone: "integration-webhook" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KnowledgAI — Knowledge workspace" },
      { name: "description", content: "Build, manage, and improve your AI assistant's knowledge and customer support experience." },
      { property: "og:title", content: "KnowledgAI — Knowledge workspace" },
      { property: "og:description", content: "Manage your AI assistant's knowledge, support conversations, and performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgAI,
});

function TinySelect({ value, onValueChange, options, className = "" }: { value: string; onValueChange: (value: string) => void; options: string[]; className?: string }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function KnowledgAI() {
  const [page, setPage] = useState<WorkspacePage>("Knowledge");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(true);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [version, setVersion] = useState("v1.1 — Help center draft");
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const [siteUrl, setSiteUrl] = useState("https://acme.com");
  const [discovered, setDiscovered] = useState(false);
  const [exclude, setExclude] = useState("");
  const [selectedPaths, setSelectedPaths] = useState<string[]>(discoveredPages.map((entry) => entry.path));
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [playMessages, setPlayMessages] = useState<{ role: "visitor" | "assistant"; text: string }[]>([]);
  const [persona, setPersona] = useState("Helpful & direct");
  const [model, setModel] = useState("GPT-4o mini");
  const [temperature, setTemperature] = useState([0.25]);
  const [threshold, setThreshold] = useState([76]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetExpanded, setWidgetExpanded] = useState(false);
  const [widgetName, setWidgetName] = useState("Acme Assistant");
  const [widgetPlacement, setWidgetPlacement] = useState("Bottom right");
  const [widgetColor, setWidgetColor] = useState("#61D5B4");
  const [widgetQuery, setWidgetQuery] = useState("");
  const [widgetMessages, setWidgetMessages] = useState<string[]>([]);
  const [inboxTab, setInboxTab] = useState("Needs human");
  const [activeConversation, setActiveConversation] = useState("Olivia Parker");
  const [takenOver, setTakenOver] = useState(false);
  const [supportReply, setSupportReply] = useState("");
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sourceNotice, setSourceNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (crawlProgress <= 0 || crawlProgress >= 100) return;
    const timer = window.setInterval(() => setCrawlProgress((progress) => Math.min(100, progress + 8)), 600);
    return () => window.clearInterval(timer);
  }, [crawlProgress > 0 && crawlProgress < 100]);

  const visiblePages = useMemo(
    () => discoveredPages.filter(({ path }) => !exclude.trim() || !path.includes(exclude.replaceAll("*", ""))),
    [exclude],
  );

  const handleDiscover = () => {
    if (!siteUrl.trim()) return;
    setDiscovered(true);
    setSelectedPaths(discoveredPages.map((entry) => entry.path));
    setCrawlProgress(0);
  };

  const sendPlaygroundMessage = (value: string) => {
    const text = value.trim();
    if (!text) return;
    setPlayMessages((messages) => [...messages, { role: "visitor", text }, { role: "assistant", text: "You can update your account details from Settings → Billing. Changes to your payment method apply to your next renewal, and your current plan stays the same. [1] [2]" }]);
    setQuery("");
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles((existing) => [...existing, ...Array.from(files).map((file) => file.name)]);
  };

  const toggleIntegration = (name: string) => setIntegrations((list) => list.includes(name) ? list.filter((item) => item !== name) : [...list, name]);

  return (
    <div className={dark ? "dark" : "light"}>
      <div className="workspace-shell min-h-screen bg-background text-foreground">
        <aside className={`workspace-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileNav ? "mobile-open" : ""}`}>
          <div className="brand-lockup">
            <div className="brand-mark"><Network size={19} strokeWidth={2.1} /></div>
            {!collapsed && <span className="brand-name">Knowledg<span>AI</span></span>}
            <Button variant="ghost" size="icon" className="sidebar-collapse" onClick={() => setCollapsed((value) => !value)} title={collapsed ? "Expand navigation" : "Collapse navigation"} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
          <Button variant="outline" className="tenant-switcher" onClick={() => setSourceNotice("Acme Corp workspace selected") }>
            <div className="tenant-avatar">A</div>{!collapsed && <><span className="tenant-label"><strong>Acme Corp</strong><small>Main assistant</small></span><ChevronDown size={15} /></>}
          </Button>
          <nav className="sidebar-nav" aria-label="Main navigation">
            {navigation.map((item, index) => {
              const previous = navigation[index - 1];
              return <div key={item.label}>
                {(!previous || previous.group !== item.group) && !collapsed && <p className="nav-group-label">{item.group}</p>}
                <Button variant="ghost" className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => { setPage(item.label); setMobileNav(false); }} title={collapsed ? item.label : undefined} aria-current={page === item.label ? "page" : undefined}>
                  <item.icon size={17} strokeWidth={1.8} /><span>{!collapsed && item.label}</span>{item.label === "Inbox" && !collapsed && <span className="nav-count">3</span>}
                </Button>
              </div>;
            })}
          </nav>
          {!collapsed && <div className="sidebar-bottom">
            <div className="plan-box"><div className="plan-box-icon"><Zap size={15} /></div><div><strong>Pro workspace</strong><span>18.4k / 50k credits</span></div><Button variant="ghost" size="icon" title="View plan"><ArrowUpRight /></Button><Progress value={37} className="plan-progress" /></div>
            <Button variant="ghost" className="sidebar-profile" onClick={() => setProfileOpen((open) => !open)}><div className="profile-avatar">JD</div><span><strong>Jordan Davis</strong><small>Workspace admin</small></span><MoreHorizontal size={18} /></Button>
            {profileOpen && <div className="profile-popover"><p>jordan@acme.com</p><Button variant="ghost" onClick={() => setPage("Settings")}>Workspace settings</Button><Button variant="ghost" onClick={() => setProfileOpen(false)}>Close menu</Button></div>}
          </div>}
        </aside>

        <main className="workspace-main">
          <header className="topbar">
            <Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label="Open navigation"><Menu /></Button>
            <div className="topbar-breadcrumb"><span>Acme Corp</span><ChevronRight size={14} /><strong>{pageInfo[page].title}</strong></div>
            <div className="topbar-actions">
              <div className="production-indicator"><span className="status-dot" /><span>Production</span><b>v1.0</b><ChevronDown size={13} /></div>
              <div className="topbar-popover-wrap">
                <Button variant="ghost" size="icon" className="icon-button notification-button" aria-label="Ingestion notifications" onClick={() => setNoticeOpen((open) => !open)}><Bell size={18} /><span className="notification-count">2</span></Button>
                {noticeOpen && <div className="notification-panel"><div className="popover-heading"><strong>Ingestion activity</strong><span>2 active</span></div><div className="job-notice"><div className="job-icon"><Globe2 size={16} /></div><div><strong>Crawling acme.com</strong><span>24 of 42 pages discovered</span><Progress value={57} /></div></div><div className="job-notice"><div className="job-icon file-job"><FileText size={16} /></div><div><strong>manual.pdf indexed</strong><span>156 chunks · just now</span></div><CheckCircle2 className="notice-check" size={16} /></div><Button variant="ghost" className="popover-link" onClick={() => { setPage("Knowledge"); setNoticeOpen(false); }}>View all activity <ArrowRight size={14} /></Button></div>}
              </div>
              <Button variant="ghost" size="icon" className="icon-button theme-toggle" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark((value) => !value)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button>
              <Button variant="ghost" size="icon" className="topbar-user" aria-label="Profile menu" onClick={() => setProfileOpen((open) => !open)}><span className="profile-avatar small">JD</span></Button>
            </div>
          </header>

          <div className="page-content">
            <div className="page-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> KNOWLEDGE OPERATIONS</div><h1>{pageInfo[page].title}</h1><p>{pageInfo[page].subtitle}</p></div>
              <div className="heading-actions"><span className="updated-label"><span className="status-dot" /> All systems operational</span>{page === "Knowledge" && <Button variant="default" onClick={() => setPromoteOpen(true)} disabled={promoted}><ArrowUpRight size={16} />{promoted ? "Live in production" : "Promote to production"}</Button>}</div>
            </div>
            {sourceNotice && <div className="inline-notice"><CheckCircle2 size={16} />{sourceNotice}<Button variant="ghost" size="icon" onClick={() => setSourceNotice("")} aria-label="Dismiss notice"><X /></Button></div>}
            {page === "Knowledge" && <KnowledgePage {...{ version, setVersion, discovered, handleDiscover, siteUrl, setSiteUrl, visiblePages, selectedPaths, setSelectedPaths, exclude, setExclude, crawlProgress, setCrawlProgress, uploadedFiles, handleFiles, fileInput, sourceNotice, setSourceNotice, promoted, setPromoteOpen, setEmbedOpen }} />}
            {page === "Overview" && <OverviewPage onNavigate={setPage} />}
            {page === "Playground" && <PlaygroundPage {...{ version, setVersion, persona, setPersona, model, setModel, temperature, setTemperature, threshold, setThreshold, inspectorOpen, setInspectorOpen, playMessages, query, setQuery, sendPlaygroundMessage, setSourceNotice }} />}
            {page === "Widget" && <WidgetPage {...{ widgetOpen, setWidgetOpen, widgetExpanded, setWidgetExpanded, widgetName, setWidgetName, widgetPlacement, setWidgetPlacement, widgetColor, setWidgetColor, widgetQuery, setWidgetQuery, widgetMessages, setWidgetMessages, setEmbedOpen }} />}
            {page === "Inbox" && <InboxPage {...{ inboxTab, setInboxTab, activeConversation, setActiveConversation, takenOver, setTakenOver, supportReply, setSupportReply }} />}
            {page === "Analytics" && <AnalyticsPage onAddAnswer={() => setPage("Knowledge")} />}
            {page === "Settings" && <SettingsPage {...{ integrations, toggleIntegration, setSourceNotice, setEmbedOpen }} />}
          </div>
          <footer className="workspace-footer"><span><span className="status-dot" /> KnowledgAI systems normal</span><span>Data refreshed just now <span className="footer-separator">·</span> <Button variant="link" onClick={() => setSourceNotice("Workspace documentation opened")}>Documentation</Button></span></footer>
        </main>

        <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
          <DialogContent><DialogHeader><div className="dialog-icon"><ArrowUpRight size={18} /></div><DialogTitle>Promote this version?</DialogTitle><DialogDescription>Version {version.split(" —")[0]} will become the live knowledge source for your Acme assistant. The current production version will be kept as an earlier release.</DialogDescription></DialogHeader><div className="dialog-version-row"><span>New production version</span><strong>{version.split(" —")[0]} · Help center draft</strong></div><DialogFooter><Button variant="outline" onClick={() => setPromoteOpen(false)}>Cancel</Button><Button onClick={() => { setPromoted(true); setPromoteOpen(false); setSourceNotice("Version promoted to production"); }}>Promote version</Button></DialogFooter></DialogContent>
        </Dialog>
        <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
          <DialogContent><DialogHeader><div className="dialog-icon"><Code2 size={18} /></div><DialogTitle>Embed your assistant</DialogTitle><DialogDescription>Add the snippet to your website to make your knowledge assistant available to visitors.</DialogDescription></DialogHeader><div className="embed-code"><code>&lt;script src="https://cdn.knowledg.ai/widget.js" data-chatbot-id="acme-main" defer&gt;&lt;/script&gt;</code><Button variant="outline" size="icon" aria-label="Copy embed code" onClick={() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }} title="Copy embed code">{copied ? <Check /> : <Copy />}</Button></div><div className="domain-row"><ShieldCheck size={17} /><span><strong>Allowed domains</strong><small>acme.com, www.acme.com</small></span><Button variant="outline" size="sm" onClick={() => setSourceNotice("Domain settings opened")}>Manage</Button></div><DialogFooter><Button variant="outline" onClick={() => setEmbedOpen(false)}>Close</Button><Button onClick={() => { setEmbedOpen(false); setSourceNotice(copied ? "Embed code copied" : "Embed code is ready to copy"); }}>Done</Button></DialogFooter></DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function KnowledgePage(props: {
  version: string; setVersion: (value: string) => void; discovered: boolean; handleDiscover: () => void; siteUrl: string; setSiteUrl: (value: string) => void; visiblePages: typeof discoveredPages; selectedPaths: string[]; setSelectedPaths: (value: string[]) => void; exclude: string; setExclude: (value: string) => void; crawlProgress: number; setCrawlProgress: (value: number) => void; uploadedFiles: string[]; handleFiles: (files: FileList | null) => void; fileInput: React.RefObject<HTMLInputElement | null>; sourceNotice: string; setSourceNotice: (value: string) => void; promoted: boolean; setPromoteOpen: (value: boolean) => void; setEmbedOpen: (value: boolean) => void;
}) {
  const { version, setVersion, discovered, handleDiscover, siteUrl, setSiteUrl, visiblePages, selectedPaths, setSelectedPaths, exclude, setExclude, crawlProgress, setCrawlProgress, uploadedFiles, handleFiles, fileInput, setSourceNotice, promoted, setPromoteOpen } = props;
  const isAllSelected = visiblePages.length > 0 && visiblePages.every(({ path }) => selectedPaths.includes(path));
  const selectedVisibleCount = visiblePages.filter(({ path }) => selectedPaths.includes(path)).length;
  const togglePath = (path: string, checked: boolean) => setSelectedPaths(checked ? [...selectedPaths, path] : selectedPaths.filter((item) => item !== path));

  return <div className="knowledge-layout">
    <div className="knowledge-main-column">
      <div className="version-toolbar">
        <div className="version-selector-group"><div className="version-icon"><BookOpen size={17} /></div><div className="version-copy"><span>KNOWLEDGE VERSION</span><TinySelect value={version} onValueChange={setVersion} options={["v1.0 — Full website · Live", "v1.1 — Help center draft", "v1.2 — Product docs draft"]} className="version-select" /></div><span className={`status-pill ${version.startsWith("v1.0") ? "live" : "draft"}`}><i />{version.startsWith("v1.0") ? "LIVE" : "DRAFT"}</span></div>
        <div className="version-actions"><Button variant="outline" size="sm" onClick={() => { setVersion("v1.2 — Product docs draft"); setSourceNotice("New draft version created"); }}><Plus size={15} /> New version</Button><Button size="sm" onClick={() => setPromoteOpen(true)} disabled={promoted || version.startsWith("v1.0")}><ArrowUpRight size={15} /> Promote</Button></div>
      </div>

      <section className="panel crawler-panel">
        <div className="section-heading"><div><div className="section-icon green"><Globe2 size={17} /></div></div><div className="section-title"><h2>Discover website pages</h2><p>Find the pages your assistant should know about.</p></div><span className="step-label">STEP 01 <ArrowRight size={13} /> 02</span></div>
        <div className="crawler-form"><div className="url-input-wrap"><Link2 size={16} /><Input value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} aria-label="Website URL" placeholder="https://yourwebsite.com" onKeyDown={(event) => { if (event.key === "Enter") handleDiscover(); }} /></div><Button onClick={handleDiscover}><Search size={15} /> Discover pages</Button></div>
        {discovered && <div className="discovered-block"><div className="discovered-heading"><div><strong>Discovered pages</strong><span className="result-count">{visiblePages.length} pages found</span></div><div className="exclude-control"><Filter size={14} /><Input value={exclude} onChange={(event) => setExclude(event.target.value)} placeholder="Exclude path e.g. /blog/*" aria-label="Exclude paths" /></div></div>
          <div className="paths-table-wrap"><table className="paths-table"><thead><tr><th><Checkbox checked={isAllSelected} onCheckedChange={(checked) => setSelectedPaths(checked ? [...new Set([...selectedPaths, ...visiblePages.map((entry) => entry.path)])] : selectedPaths.filter((path) => !visiblePages.some((entry) => entry.path === path)))} aria-label="Select all discovered pages" /></th><th>PAGE</th><th>DEPTH</th><th>STATUS</th></tr></thead><tbody>{visiblePages.map((entry) => <tr key={entry.path}><td><Checkbox checked={selectedPaths.includes(entry.path)} onCheckedChange={(checked) => togglePath(entry.path, checked === true)} aria-label={`Select ${entry.path}`} /></td><td><strong>{entry.title}</strong><span>{entry.path}</span></td><td><span className="depth-mark">{entry.depth}</span></td><td><span className="table-status"><span className="status-dot" /> Discovered</span></td></tr>)}</tbody></table></div>
          <div className="crawl-footer"><span>{selectedVisibleCount} of {visiblePages.length} pages selected</span><Button size="sm" disabled={selectedVisibleCount === 0 || crawlProgress > 0 && crawlProgress < 100} onClick={() => { setCrawlProgress(1); setSourceNotice("Crawling selected pages in the background"); }}><Globe2 size={15} /> Start crawling selected <span className="button-count">{selectedVisibleCount}</span></Button></div>
        </div>}
      </section>

      <section className="panel upload-panel">
        <div className="section-heading"><div className="section-icon blue"><Upload size={17} /></div><div className="section-title"><h2>Add documents</h2><p>Bring in playbooks, policies, and product guides.</p></div><span className="format-list">PDF <i /> DOCX <i /> TXT <i /> MD</span></div>
        <label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); }}><input ref={fileInput} type="file" accept=".pdf,.docx,.txt,.md,.markdown" multiple onChange={(event) => { handleFiles(event.target.files); event.currentTarget.value = ""; }} /><div className="upload-icon"><Upload size={18} /></div><div className="dropzone-copy"><strong>Drop files here or <span>browse</span></strong><small>PDF, DOCX, TXT, or Markdown · up to 25 MB each</small></div><span className="upload-limit">MAX 25 MB</span></label>
        {uploadedFiles.length > 0 && <div className="upload-queue">{uploadedFiles.map((name, index) => <div className="upload-file" key={`${name}-${index}`}><FileText size={15} /><span>{name}</span><CheckCircle2 size={15} /><Button variant="ghost" size="icon" aria-label={`Remove ${name}`} onClick={() => handleFiles(null)}><X /></Button></div>)}</div>}
      </section>

      {crawlProgress > 0 && <section className="panel progress-panel"><div className="progress-topline"><div className="progress-title"><div className="section-icon green"><Globe2 size={16} /></div><div><strong>{crawlProgress >= 100 ? "Crawl complete" : "Crawling acme.com"}</strong><span>{crawlProgress >= 100 ? "42 pages added to your knowledge" : `${Math.min(42, Math.round(crawlProgress * 0.42))} of 42 pages · Safe to leave this page`}</span></div></div><span className="progress-percent">{crawlProgress}%</span></div><Progress value={crawlProgress} /><div className="progress-stages"><span className={crawlProgress > 0 ? "stage-active" : ""}>Crawling pages</span><i /><span className={crawlProgress >= 50 ? "stage-active" : ""}>Extracting content</span><i /><span className={crawlProgress >= 80 ? "stage-active" : ""}>Indexing</span><i /><span className={crawlProgress >= 100 ? "stage-active" : ""}>Ready</span></div></section>}

      <section className="panel source-list-panel"><div className="source-list-heading"><div><h2>Indexed sources</h2><p>Sources currently included in {version.split(" —")[0]}.</p></div><div className="source-list-actions"><span className="source-count"><span className="status-dot" /> 4 sources</span><Button variant="outline" size="sm" onClick={() => { setDiscovered(false); setCrawlProgress(0); }}><Plus size={15} /> Add source</Button></div></div>
        <div className="sources-table-wrap"><table className="sources-table"><thead><tr><th>SOURCE</th><th>TYPE</th><th>CHUNKS</th><th>LAST SYNCED</th><th>STATUS</th><th></th></tr></thead><tbody>{sourceRows.map((row) => <tr key={row.name}><td><div className="source-name-cell"><div className={`source-type-icon ${row.type === "Web" ? "web" : "doc"}`}>{row.type === "Web" ? <Globe2 size={16} /> : <FileText size={16} />}</div><span><strong>{row.name}</strong><small>{row.detail}</small></span></div></td><td><span className="type-tag">{row.type}</span></td><td>{row.chunks}</td><td>{row.synced}</td><td><span className="ready-tag"><i /> Ready</span></td><td><Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`} title="Source actions" onClick={() => setSourceNotice(`${row.name} source actions opened`)}><MoreHorizontal /></Button></td></tr>)}</tbody></table></div>
      </section>
    </div>
    <aside className="knowledge-side-column"><div className="side-card version-side-card"><div className="side-card-label"><span>VERSION HISTORY</span><Button variant="ghost" size="icon" aria-label="Version history options"><MoreHorizontal /></Button></div><div className="timeline"><div className="timeline-entry current"><span className="timeline-marker"><i /></span><div><strong>v1.1 <span className="status-pill draft">DRAFT</span></strong><p>Help center refresh</p><small>Edited 14 min ago by Jordan</small><Button variant="outline" size="sm" onClick={() => setVersion("v1.1 — Help center draft")}>Selected version</Button></div></div><div className="timeline-entry"><span className="timeline-marker"><i /></span><div><strong>v1.0 <span className="status-pill live"><i /> LIVE</span></strong><p>Full website knowledge</p><small>Published Oct 21, 2026</small><Button variant="ghost" size="sm" onClick={() => setVersion("v1.0 — Full website · Live")}>View live version</Button></div></div><div className="timeline-entry"><span className="timeline-marker"><i /></span><div><strong>v0.9</strong><p>Initial knowledge import</p><small>Published Oct 10, 2026</small></div></div></div><Button variant="outline" className="full-width-button" onClick={() => { setVersion("v1.2 — Product docs draft"); setSourceNotice("New draft version created"); }}><Plus size={15} /> Create new version</Button></div>
      <div className="side-card source-health-card"><div className="side-card-label"><span>SOURCE HEALTH</span><CircleHelp size={15} /></div><div className="health-score"><div className="health-ring"><span>98</span><small>/ 100</small></div><div><strong>Looking healthy</strong><p>All sources are up to date.</p></div></div><div className="health-stat"><span>Synced successfully</span><strong>4 / 4</strong></div><div className="health-stat"><span>Freshness</span><strong>12 min ago</strong></div><div className="health-stat"><span>Broken links</span><strong className="good-value">0 detected</strong></div><Button variant="ghost" className="health-link" onClick={() => setSourceNotice("Source health check complete")}>View health report <ArrowRight size={14} /></Button></div>
      <div className="help-card"><div className="help-icon"><LifeBuoy size={16} /></div><strong>Building your knowledge?</strong><p>See how to keep your assistant's answers accurate and up to date.</p><Button variant="link" onClick={() => setSourceNotice("Knowledge setup guide opened")}>Read the guide <ArrowUpRight size={14} /></Button></div>
    </aside>
  </div>;
}

function OverviewPage({ onNavigate }: { onNavigate: (page: WorkspacePage) => void }) {
  return <div className="overview-page"><div className="overview-welcome panel"><div><div className="eyebrow">MONDAY, OCTOBER 27, 2026</div><h2>Good morning, Jordan <span>✦</span></h2><p>Your assistant has resolved 89% of conversations this week.</p><Button onClick={() => onNavigate("Playground")}><Sparkles size={15} /> Test your assistant</Button></div><div className="welcome-visual"><div className="welcome-orbit"><div><Network size={31} /></div><i /><b /><em /></div><span>AI ASSISTANT <strong>ONLINE</strong></span></div></div>
    <div className="metric-grid"><MetricCard label="Conversations" value="2,481" delta="↑ 12.8%" note="vs. last 7 days" icon={MessageSquareText} tone="mint" /><MetricCard label="AI resolution rate" value="89.4%" delta="↑ 3.2%" note="vs. last 7 days" icon={ShieldCheck} tone="blue" /><MetricCard label="Avg. response time" value="1.4s" delta="↓ 0.3s" note="vs. last 7 days" icon={Zap} tone="amber" /><MetricCard label="Knowledge gaps" value="18" delta="Needs review" note="unanswered questions" icon={CircleHelp} tone="rose" /></div>
    <div className="overview-grid"><section className="panel overview-chart"><div className="panel-header"><div><h2>Conversation activity</h2><p>Support volume and AI resolution over time.</p></div><TinySelect value="Last 7 days" onValueChange={() => {}} options={["Last 7 days", "Last 30 days", "This quarter"]} className="small-select" /></div><div className="chart-legend"><span><i className="legend-conversations" /> Conversations</span><span><i className="legend-resolved" /> AI resolved</span></div><div className="chart-area"><div className="chart-y-labels"><span>500</span><span>375</span><span>250</span><span>125</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 760 200" preserveAspectRatio="none" role="img" aria-label="Conversation activity chart"><defs><linearGradient id="chartMint" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" className="chart-gradient-start" /><stop offset="100%" className="chart-gradient-end" /></linearGradient></defs><path d="M0 154 C45 137 60 148 102 122 S157 134 204 101 S254 112 306 91 S359 108 408 72 S461 87 510 65 S562 81 612 53 S670 66 710 39 S738 55 760 28 L760 200 L0 200 Z" fill="url(#chartMint)" /><path d="M0 154 C45 137 60 148 102 122 S157 134 204 101 S254 112 306 91 S359 108 408 72 S461 87 510 65 S562 81 612 53 S670 66 710 39 S738 55 760 28" className="chart-line-primary" /><path d="M0 176 C50 167 62 173 102 159 S157 167 204 144 S257 154 306 129 S361 143 408 111 S459 126 510 101 S562 119 612 89 S670 105 710 72 S737 83 760 60" className="chart-line-secondary" /></svg><div className="chart-x-labels"><span>Oct 21</span><span>Oct 22</span><span>Oct 23</span><span>Oct 24</span><span>Oct 25</span><span>Oct 26</span><span>Oct 27</span></div></div></div></section>
      <section className="panel overview-activity"><div className="panel-header"><div><h2>Recent activity</h2><p>Latest workspace updates.</p></div><Button variant="ghost" size="icon" aria-label="Activity options"><MoreHorizontal /></Button></div><div className="activity-list"><ActivityRow icon={Globe2} tone="green" title="Website crawl completed" detail="42 pages added to v1.1" time="12m ago" /><ActivityRow icon={MessageSquareText} tone="blue" title="New conversation resolved" detail="AI resolved with 2 citations" time="28m ago" /><ActivityRow icon={Users} tone="amber" title="Human handoff requested" detail="Olivia Parker · Billing question" time="41m ago" /><ActivityRow icon={FileText} tone="violet" title="Document indexed" detail="Product handbook.pdf · 156 chunks" time="1h ago" /></div><Button variant="ghost" className="view-all-button" onClick={() => onNavigate("Inbox")}>View all activity <ArrowRight size={14} /></Button></section></div>
    <div className="quick-links"><button onClick={() => onNavigate("Knowledge")}><BookOpen /><span><strong>Manage knowledge</strong><small>Update sources and versions</small></span><ArrowRight /></button><button onClick={() => onNavigate("Widget")}><Code2 /><span><strong>Customize your widget</strong><small>Style and embed your assistant</small></span><ArrowRight /></button><button onClick={() => onNavigate("Analytics")}><Activity /><span><strong>Explore analytics</strong><small>Find new knowledge opportunities</small></span><ArrowRight /></button></div>
  </div>;
}

function MetricCard({ label, value, delta, note, icon: Icon, tone }: { label: string; value: string; delta: string; note: string; icon: typeof Activity; tone: string }) {
  return <div className="metric-card panel"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><div className="metric-foot"><span className={delta.startsWith("Needs") ? "metric-alert" : "metric-delta"}>{delta}</span><span>{note}</span></div><div className={`metric-sparkline ${tone}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>;
}

function ActivityRow({ icon: Icon, tone, title, detail, time }: { icon: typeof Activity; tone: string; title: string; detail: string; time: string }) {
  return <div className="activity-row"><div className={`activity-icon ${tone}`}><Icon size={15} /></div><div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>;
}

function PlaygroundPage(props: {
  version: string; setVersion: (value: string) => void; persona: string; setPersona: (value: string) => void; model: string; setModel: (value: string) => void; temperature: number[]; setTemperature: (value: number[]) => void; threshold: number[]; setThreshold: (value: number[]) => void; inspectorOpen: boolean; setInspectorOpen: (value: boolean) => void; playMessages: { role: "visitor" | "assistant"; text: string }[]; query: string; setQuery: (value: string) => void; sendPlaygroundMessage: (value: string) => void; setSourceNotice: (value: string) => void;
}) {
  const { version, setVersion, persona, setPersona, model, setModel, temperature, setTemperature, threshold, setThreshold, inspectorOpen, setInspectorOpen, playMessages, query, setQuery, sendPlaygroundMessage, setSourceNotice } = props;
  return <div className={`playground-layout ${inspectorOpen ? "with-inspector" : ""}`}>
    <aside className="playground-config panel"><div className="playground-config-title"><div><div className="eyebrow">TEST ENVIRONMENT</div><h2>Configuration</h2></div><Button variant="ghost" size="icon" title="Reset configuration" onClick={() => setSourceNotice("Configuration restored to saved settings")}><MoreHorizontal /></Button></div>
      <label className="field-label">KNOWLEDGE VERSION</label><TinySelect value={version} onValueChange={setVersion} options={["v1.1 — Help center draft", "v1.0 — Full website · Live", "v1.2 — Product docs draft"]} className="config-select" />
      <div className="config-divider" /><label className="field-label" htmlFor="system-prompt">SYSTEM PROMPT</label><Textarea id="system-prompt" className="prompt-editor" defaultValue={"You are Acme's helpful support assistant.\n\nUse only the provided knowledge to answer questions. Be clear, direct, and friendly. If the answer isn't in your sources, say so and offer to connect the visitor with our support team. Always cite your sources."} /><div className="editor-footer"><span><Code2 size={13} /> Markdown</span><span>326 tokens</span></div>
      <label className="field-label config-spaced">ASSISTANT PERSONA</label><TinySelect value={persona} onValueChange={setPersona} options={["Helpful & direct", "Formal support agent", "Friendly assistant", "Technical specialist"]} className="config-select" />
      <div className="slider-field"><div className="slider-label"><label className="field-label">TEMPERATURE</label><span>{temperature[0].toFixed(2)}</span></div><Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.05} aria-label="Temperature" /><div className="range-labels"><span>Strict & factual</span><span>Creative</span></div></div>
      <div className="slider-field"><div className="slider-label"><label className="field-label">ANSWER CONFIDENCE</label><span>{threshold[0]}%</span></div><Slider value={threshold} onValueChange={setThreshold} min={50} max={95} step={1} aria-label="Answer confidence threshold" /><div className="range-labels"><span>More answers</span><span>More cautious</span></div></div>
      <label className="field-label config-spaced">LANGUAGE MODEL</label><TinySelect value={model} onValueChange={setModel} options={["GPT-4o mini", "Gemini 2.0 Flash", "Claude 3.5 Sonnet"]} className="config-select" /><div className="model-status"><span className="status-dot" /> Connected to workspace</div>
      <div className="config-button-stack"><Button onClick={() => setSourceNotice("Playground settings saved to this version")}><Check size={15} /> Save settings to version</Button><Button variant="outline" onClick={() => setSourceNotice("Version ready to promote from Knowledge & versions")}><ArrowUpRight size={15} /> Promote this version</Button></div>
    </aside>
    <section className="playground-chat panel"><div className="chat-panel-header"><div><div className="live-dot-label"><span className="status-dot" /> PLAYGROUND SESSION</div><strong>Acme support assistant <span className="header-muted">· {version.split(" —")[0]}</span></strong></div><div className="chat-header-actions"><Button variant="outline" size="sm" onClick={() => { setSourceNotice("New test conversation started"); }}><Plus size={14} /> New test</Button><Button variant="ghost" size="icon" aria-label="Toggle retrieval inspector" title="Toggle retrieval inspector" onClick={() => setInspectorOpen(!inspectorOpen)}><SlidersHorizontal /></Button></div></div>
      <div className="chat-transcript">{playMessages.length === 0 ? <div className="chat-empty-state"><div className="chat-empty-icon"><Bot size={27} /></div><h3>Ask your assistant anything</h3><p>Test answers against the selected knowledge version and see how sources are used.</p><div className="suggestion-list"><button onClick={() => sendPlaygroundMessage("How do I update my billing details?")}>How do I update my billing details? <ArrowUpRight size={13} /></button><button onClick={() => sendPlaygroundMessage("What is your refund policy?")}>What is your refund policy? <ArrowUpRight size={13} /></button><button onClick={() => sendPlaygroundMessage("Can I change my subscription?")}>Can I change my subscription? <ArrowUpRight size={13} /></button></div></div> : <div className="message-list">{playMessages.map((message, index) => <div className={`play-message ${message.role}`} key={`${index}-${message.text}`}><div className="message-avatar">{message.role === "assistant" ? <Network size={14} /> : "JD"}</div><div><div className="message-name">{message.role === "assistant" ? "Acme assistant" : "You"} <span>{message.role === "assistant" ? "just now" : "now"}</span></div><div className="message-bubble">{message.text.split(/(\[1\]|\[2\])/).map((part, partIndex) => part === "[1]" || part === "[2]" ? <button key={partIndex} className="citation-chip" title={`${part === "[1]" ? "Billing & subscriptions" : "Payment methods guide"} · 96% relevance · Click to view source`}>{part}</button> : part)}</div>{message.role === "assistant" && <div className="answer-actions"><span><ShieldCheck size={13} /> Grounded in 2 sources</span><Button variant="ghost" size="icon" title="Copy answer" aria-label="Copy answer" onClick={() => setSourceNotice("Answer copied") }><Copy /></Button></div>}</div></div>)}</div>}</div>
      <div className="chat-composer-wrap"><div className="composer-context"><span><BookOpen size={13} /> v1.1 knowledge</span><span><Zap size={13} /> {model}</span><span><Clock3 size={13} /> ~1.4s</span></div><div className="chat-composer"><Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendPlaygroundMessage(query); }} placeholder="Ask a question about your business..." aria-label="Ask your assistant" /><Button size="icon" aria-label="Send question" onClick={() => sendPlaygroundMessage(query)}><Send size={16} /></Button></div><div className="composer-footnote">AI responses are simulated in this preview. <span>Review answers before publishing.</span></div></div>
    </section>
    {inspectorOpen && <aside className="retrieval-inspector panel"><div className="inspector-heading"><div><div className="eyebrow">UNDER THE HOOD</div><h2>Retrieval inspector</h2></div><Button variant="ghost" size="icon" title="Hide inspector" aria-label="Hide inspector" onClick={() => setInspectorOpen(false)}><PanelLeftClose /></Button></div><div className="inspector-query-label">SEARCH QUERY</div><div className="inspector-query">{playMessages.find((message) => message.role === "visitor")?.text || "How do I update my billing details?"}</div><div className="retrieved-heading"><span>TOP RETRIEVED CHUNKS</span><span>2 RESULTS</span></div><div className="chunk-card"><div className="chunk-top"><span className="chunk-rank">01</span><span className="chunk-score">96% match</span></div><strong>Billing & subscriptions</strong><span className="chunk-url">acme.com/help/billing</span><p>Update your billing information by opening Settings and selecting Billing. Your payment method changes apply to your next scheduled renewal.</p><div className="score-bars"><span>Vector <i><b style={{ width: "96%" }} /></i><strong>0.96</strong></span><span>BM25 <i><b style={{ width: "82%" }} /></i><strong>0.82</strong></span></div></div><div className="chunk-card"><div className="chunk-top"><span className="chunk-rank">02</span><span className="chunk-score">91% match</span></div><strong>Managing payment methods</strong><span className="chunk-url">acme.com/help/payment-methods</span><p>Changes to an existing payment method won't affect your active plan or billing cycle.</p><div className="score-bars"><span>Vector <i><b style={{ width: "91%" }} /></i><strong>0.91</strong></span><span>BM25 <i><b style={{ width: "76%" }} /></i><strong>0.76</strong></span></div></div><div className="inspector-metrics"><div><span>TIME TO FIRST TOKEN</span><strong>482 <small>ms</small></strong></div><div><span>TOTAL LATENCY</span><strong>1.42 <small>s</small></strong></div></div><div className="inspector-footer"><span><Activity size={13} /> Retrieval ready</span><span>v1.1 · 1,960 chunks</span></div></aside>}
  </div>;
}

function WidgetPage(props: {
  widgetOpen: boolean; setWidgetOpen: (value: boolean) => void; widgetExpanded: boolean; setWidgetExpanded: (value: boolean) => void; widgetName: string; setWidgetName: (value: string) => void; widgetPlacement: string; setWidgetPlacement: (value: string) => void; widgetColor: string; setWidgetColor: (value: string) => void; widgetQuery: string; setWidgetQuery: (value: string) => void; widgetMessages: string[]; setWidgetMessages: (value: string[]) => void; setEmbedOpen: (value: boolean) => void;
}) {
  const { widgetOpen, setWidgetOpen, widgetExpanded, setWidgetExpanded, widgetName, setWidgetName, widgetPlacement, setWidgetPlacement, widgetColor, setWidgetColor, widgetQuery, setWidgetQuery, widgetMessages, setWidgetMessages, setEmbedOpen } = props;
  const [widgetTab, setWidgetTab] = useState("Appearance");
  const [expandable, setExpandable] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [domainEnabled, setDomainEnabled] = useState(true);
  const sendWidgetMessage = (text: string) => { if (!text.trim()) return; setWidgetMessages([...widgetMessages, text.trim()]); setWidgetQuery(""); };
  return <div className="widget-page"><div className="widget-controls panel"><div className="widget-controls-header"><div className="eyebrow">YOUR ASSISTANT WIDGET</div><div className="widget-tabs">{["Appearance", "Behavior", "Install"].map((tab) => <Button key={tab} variant="ghost" className={widgetTab === tab ? "selected" : ""} onClick={() => { setWidgetTab(tab); if (tab === "Install") setEmbedOpen(true); }}>{tab}</Button>)}</div></div>
    {widgetTab !== "Install" && <div className="widget-control-body"><div className="control-section"><div className="control-section-title"><div><h3>Widget placement</h3><p>Choose where your assistant appears.</p></div><div className="section-icon violet"><ArrowDownRight size={16} /></div></div><TinySelect value={widgetPlacement} onValueChange={setWidgetPlacement} options={["Bottom right", "Bottom left", "Top right"]} className="config-select" /><div className="slider-two-col"><div><div className="slider-label"><span>Margin X</span><strong>24 px</strong></div><Slider defaultValue={[24]} min={0} max={80} step={1} aria-label="Horizontal widget margin" /></div><div><div className="slider-label"><span>Margin Y</span><strong>24 px</strong></div><Slider defaultValue={[24]} min={0} max={80} step={1} aria-label="Vertical widget margin" /></div></div></div>
      <div className="control-section"><div className="control-section-title"><div><h3>Brand identity</h3><p>Use a name visitors recognize.</p></div><div className="section-icon green"><Bot size={16} /></div></div><label className="field-label" htmlFor="widget-name">CHATBOT NAME</label><Input id="widget-name" value={widgetName} onChange={(event) => setWidgetName(event.target.value)} /><label className="field-label form-label-spaced" htmlFor="widget-tagline">TAGLINE</label><Input id="widget-tagline" defaultValue="Here to help, anytime." /><div className="color-picker-row"><div><label className="field-label">ACCENT COLOR</label><span className="color-hint">Match your brand palette</span></div><label className="color-picker"><input type="color" value={widgetColor} onChange={(event) => setWidgetColor(event.target.value)} aria-label="Widget accent color" /><span>{widgetColor.toUpperCase()}</span></label></div></div>
      <div className="control-section"><div className="control-section-title"><div><h3>Welcome experience</h3><p>Start each conversation warmly.</p></div></div><label className="field-label" htmlFor="widget-greeting">GREETING</label><Textarea id="widget-greeting" defaultValue="Hi there! 👋 How can I help you today?" className="greeting-input" /><span className="field-label starter-label">STARTER PROMPTS</span><div className="starter-chip-list"><span>Track my order <Button variant="ghost" size="icon" aria-label="Remove starter prompt"><X /></Button></span><span>Return an item <Button variant="ghost" size="icon" aria-label="Remove starter prompt"><X /></Button></span><Button variant="outline" size="sm"><Plus size={14} /> Add prompt</Button></div></div>
      <div className="control-section settings-toggles"><div className="setting-toggle-row"><span><strong>Expandable window</strong><small>Allow a full-screen chat view</small></span><Switch checked={expandable} onCheckedChange={setExpandable} aria-label="Enable expandable mode" /></div><div className="setting-toggle-row"><span><strong>Message sounds</strong><small>Play a tone when a reply arrives</small></span><Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} aria-label="Enable message sounds" /></div><div className="setting-toggle-row"><span><strong>Show privacy note</strong><small>Display a data-use disclaimer</small></span><Switch defaultChecked aria-label="Show privacy disclaimer" /></div></div>
    </div>}
    <div className="widget-controls-footer"><Button variant="outline" onClick={() => setSourceNoticeWidget("Changes discarded")}>Discard changes</Button><Button onClick={() => setSourceNoticeWidget("Widget settings saved")}>Save changes</Button></div></div>
    <div className="widget-preview-wrap"><div className="preview-toolbar"><div><span className="preview-live-dot" /> LIVE PREVIEW <span className="preview-separator">/</span> {widgetPlacement}</div><Button variant="outline" size="sm" onClick={() => setEmbedOpen(true)}><Code2 size={15} /> Get embed code</Button></div><div className="website-sandbox"><div className="mock-browser-bar"><div className="browser-lights"><i /><i /><i /></div><div className="browser-address"><ShieldCheck size={12} /> acme.com</div><MoreHorizontal size={18} /></div><div className="mock-site"><nav className="mock-site-nav"><div className="mock-acme-mark">A</div><span>acme</span><div className="mock-site-links"><span>Products</span><span>Solutions</span><span>Resources</span><span>Pricing</span></div><Button variant="outline" size="sm">Contact sales</Button></nav><div className="mock-hero"><span className="mock-hero-tag"><i /> BUILT FOR WHAT'S NEXT</span><h2>Make more room<br />for <span>what matters.</span></h2><p>One thoughtful workspace for your team's most important work. Less busywork, more momentum.</p><div className="mock-hero-actions"><Button size="sm">Explore platform <ArrowRight size={14} /></Button><Button variant="outline" size="sm">See how it works</Button></div><div className="mock-hero-proof"><div className="avatar-stack"><i>A</i><i>M</i><i>S</i><b>+</b></div><span>Trusted by <strong>2,000+</strong> growing teams</span></div></div><div className="mock-site-bottom"><span>Thoughtfully designed for your next big thing.</span><span>Scroll to explore <ArrowDownRight size={13} /></span></div>
      {widgetOpen ? <div className={`widget-window ${widgetExpanded ? "expanded" : ""}`}><div className="widget-window-head" style={{ "--widget-accent": widgetColor } as React.CSSProperties}><div className="widget-bot-mark"><Network size={15} /></div><div><strong>{widgetName}</strong><small><i /> Replies instantly</small></div><div className="widget-head-actions">{expandable && <Button variant="ghost" size="icon" aria-label={widgetExpanded ? "Shrink widget" : "Expand widget"} title={widgetExpanded ? "Shrink" : "Expand"} onClick={() => setWidgetExpanded(!widgetExpanded)}>{widgetExpanded ? <ArrowDownRight /> : <ArrowUpRight />}</Button>}<Button variant="ghost" size="icon" aria-label="Minimize widget" title="Minimize" onClick={() => { setWidgetOpen(false); setWidgetExpanded(false); }}><Minus /></Button></div></div><div className="widget-chat-body"><div className="widget-welcome-message"><div className="widget-small-avatar"><Network size={13} /></div><div><strong>{widgetName}</strong><p>Hi there! 👋 How can I help you today?</p><small>Just now</small></div></div>{widgetMessages.map((message, index) => <div className="widget-visitor-message" key={`${message}-${index}`}>{message}</div>)}{widgetMessages.length === 0 && <div className="widget-suggestions"><button onClick={() => sendWidgetMessage("Track my order")}>Track my order</button><button onClick={() => sendWidgetMessage("Return an item")}>Return an item</button></div>}</div><div className="widget-chat-input"><Input value={widgetQuery} onChange={(event) => setWidgetQuery(event.target.value)} placeholder="Ask us anything..." onKeyDown={(event) => { if (event.key === "Enter") sendWidgetMessage(widgetQuery); }} aria-label="Message the widget" /><Button size="icon" aria-label="Send widget message" style={{ "--widget-accent": widgetColor } as React.CSSProperties} onClick={() => sendWidgetMessage(widgetQuery)}><Send size={15} /></Button></div></div> : <Button className={`widget-launcher ${widgetPlacement === "Bottom left" ? "launcher-left" : widgetPlacement === "Top right" ? "launcher-top" : ""}`} style={{ "--widget-accent": widgetColor } as React.CSSProperties} size="icon" aria-label="Open assistant widget" onClick={() => setWidgetOpen(true)}><MessageSquareText size={21} /></Button>}
    </div></div><div className="preview-under-note"><span><span className="status-dot" /> Preview updates as you make changes</span><span>Preview site: acme.com</span></div></div></div>;
}

function setSourceNoticeWidget(message: string) {
  window.dispatchEvent(new CustomEvent("workspace-notice", { detail: message }));
}

function InboxPage(props: { inboxTab: string; setInboxTab: (value: string) => void; activeConversation: string; setActiveConversation: (value: string) => void; takenOver: boolean; setTakenOver: (value: boolean) => void; supportReply: string; setSupportReply: (value: string) => void }) {
  const { inboxTab, setInboxTab, activeConversation, setActiveConversation, takenOver, setTakenOver, supportReply, setSupportReply } = props;
  const [sentReplies, setSentReplies] = useState<string[]>([]);
  const sessions = inboxTab === "Needs human" ? [{ name: "Olivia Parker", topic: "Billing & subscription", time: "2m", initials: "OP", tone: "pink", unread: 2, preview: "Could I speak to someone about my renewal?" }, { name: "Marcus Chen", topic: "Order status", time: "8m", initials: "MC", tone: "blue", unread: 1, preview: "My tracking link isn't working" }, { name: "Priya Nair", topic: "Refund request", time: "18m", initials: "PN", tone: "amber", unread: 0, preview: "I need help with a recent charge" }] : inboxTab === "Active AI" ? [{ name: "Sam Rivera", topic: "Product question", time: "1m", initials: "SR", tone: "green", unread: 0, preview: "Thanks, that answered my question!" }, { name: "Taylor Kim", topic: "Getting started", time: "5m", initials: "TK", tone: "violet", unread: 0, preview: "Where can I find the onboarding guide?" }] : [{ name: "Alex Morgan", topic: "Plan change", time: "Yesterday", initials: "AM", tone: "blue", unread: 0, preview: "My plan has been updated. Thank you." }];
  return <div className="inbox-layout panel"><aside className="inbox-list"><div className="inbox-list-header"><div><h2>Conversations</h2><span>12 active today</span></div><Button variant="ghost" size="icon" aria-label="Conversation filters"><Filter /></Button></div><div className="inbox-search"><Search size={15} /><Input placeholder="Search conversations" aria-label="Search conversations" /></div><div className="inbox-tabs">{["Needs human", "Active AI", "Resolved"].map((tab) => <Button key={tab} variant="ghost" className={inboxTab === tab ? "selected" : ""} onClick={() => { setInboxTab(tab); setActiveConversation(tab === "Active AI" ? "Sam Rivera" : tab === "Resolved" ? "Alex Morgan" : "Olivia Parker"); setTakenOver(false); }}>{tab}{tab === "Needs human" && <span className="urgent-count">3</span>}</Button>)}</div><div className="session-list">{sessions.map((session) => <Button variant="ghost" className={`session-item ${activeConversation === session.name ? "active" : ""}`} key={session.name} onClick={() => { setActiveConversation(session.name); setTakenOver(false); }}><span className={`session-avatar ${session.tone}`}>{session.initials}</span><span className="session-copy"><span><strong>{session.name}</strong><small>{session.time}</small></span><span>{session.topic}</span><small className="session-preview">{session.preview}</small></span>{session.unread > 0 && <i className="session-unread">{session.unread}</i>}</Button>)}</div><div className="inbox-list-foot"><span><span className="status-dot" /> Inbox synced</span><Button variant="ghost" size="icon" title="Inbox settings" aria-label="Inbox settings"><Settings2 /></Button></div></aside>
    <section className="conversation-panel"><div className="conversation-head"><div className={`session-avatar ${activeConversation === "Olivia Parker" ? "pink" : "blue"}`}>{activeConversation.split(" ").map((word) => word[0]).join("")}</div><div><strong>{activeConversation}</strong><span>Visitor · from United States</span></div><div className="conversation-head-actions"><span className={takenOver ? "operator-active" : "ai-active"}><i /> {takenOver ? "You are replying" : inboxTab === "Resolved" ? "Resolved" : "AI handling"}</span><Button variant="ghost" size="icon" title="More conversation options" aria-label="More conversation options"><MoreHorizontal /></Button></div></div>{inboxTab === "Needs human" && !takenOver && <div className="handoff-banner"><div className="handoff-mark"><Users size={16} /></div><div><strong>Visitor requested a live agent</strong><span>The assistant has paused and is waiting for your reply.</span></div><Button size="sm" onClick={() => setTakenOver(true)}>Take over conversation <ArrowRight size={14} /></Button></div>}<div className="conversation-timeline"><div className="date-divider"><span>TODAY, OCTOBER 27</span></div><div className="conversation-event"><span className="event-icon ai"><Bot size={13} /></span><div><strong>AI assistant</strong><span>Hi Olivia! How can I help you today?</span><time>10:40 AM</time></div></div><div className="conversation-event visitor-event"><span className="event-icon visitor">OP</span><div><strong>{activeConversation}</strong><span>My annual plan just renewed, and I meant to switch to monthly. Can I change that?</span><time>10:41 AM</time></div></div><div className="conversation-event"><span className="event-icon ai"><Bot size={13} /></span><div><strong>AI assistant <span className="event-tag">AI reply</span></strong><span>You can change your billing plan from Settings → Subscription. Changes to your billing cycle take effect at the next renewal. <button className="inline-citation">[1]</button></span><time>10:41 AM</time></div></div><div className="conversation-event visitor-event"><span className="event-icon visitor">OP</span><div><strong>{activeConversation}</strong><span>I can't find a way to reverse today's charge. Could I speak to someone?</span><time>10:43 AM</time></div></div><div className="handoff-event"><Users size={14} /><span>Visitor requested a human agent</span><time>10:43 AM</time></div>{sentReplies.map((reply, index) => <div className="conversation-event operator-event" key={`${reply}-${index}`}><span className="event-icon operator">JD</span><div><strong>Jordan Davis <span className="event-tag human">HUMAN</span></strong><span>{reply}</span><time>Just now</time></div></div>)}</div><div className="reply-area"><div className="reply-mode"><span>{takenOver ? <Users size={13} /> : <Bot size={13} />}</span>{takenOver ? "Replying as Jordan Davis" : "AI assistant is handling this conversation"}<Button variant="link" onClick={() => setTakenOver(!takenOver)}>{takenOver ? "Return to AI" : "Take over"}</Button></div><div className="reply-composer"><Input value={supportReply} onChange={(event) => setSupportReply(event.target.value)} placeholder={takenOver ? "Write a reply..." : "Take over to reply to this visitor"} disabled={!takenOver} aria-label="Write a support reply" onKeyDown={(event) => { if (event.key === "Enter" && supportReply.trim() && takenOver) { setSentReplies([...sentReplies, supportReply.trim()]); setSupportReply(""); } }} /><Button size="icon" aria-label="Send reply" disabled={!takenOver || !supportReply.trim()} onClick={() => { if (supportReply.trim()) { setSentReplies([...sentReplies, supportReply.trim()]); setSupportReply(""); } }}><Send size={15} /></Button></div><div className="reply-footnote">Press Enter to send <span>·</span> Conversation stored securely</div></div></section>
    <aside className="visitor-details"><div className="visitor-details-heading"><h3>Visitor details</h3><Button variant="ghost" size="icon" aria-label="Visitor detail options"><MoreHorizontal /></Button></div><div className="visitor-profile"><div className="visitor-large-avatar">{activeConversation.split(" ").map((word) => word[0]).join("")}</div><strong>{activeConversation}</strong><span>Returning visitor</span><Button variant="outline" size="sm"><MessageSquareText size={14} /> View history</Button></div><div className="detail-block"><span className="field-label">SESSION</span><div className="detail-row"><span>Session ID</span><strong>ses_8c2...4b91 <Copy size={12} /></strong></div><div className="detail-row"><span>Country</span><strong>🇺🇸 United States</strong></div><div className="detail-row"><span>IP address</span><strong>198.51.100.42</strong></div><div className="detail-row"><span>Browser</span><strong>Chrome · macOS</strong></div></div><div className="detail-block"><span className="field-label">VISITOR JOURNEY</span><div className="journey-item"><span className="journey-mark"><Globe2 size={12} /></span><span><strong>Pricing page</strong><small>Visited 10:39 AM</small></span></div><div className="journey-item"><span className="journey-mark"><BookOpen size={12} /></span><span><strong>Billing help article</strong><small>Visited 10:40 AM</small></span></div><div className="journey-item"><span className="journey-mark"><MessageSquareText size={12} /></span><span><strong>Started conversation</strong><small>10:40 AM · 4 min on site</small></span></div></div><div className="visitor-tags"><span>Returning customer</span><span>Billing</span></div><Button variant="outline" className="full-width-button"><ArrowUpRight size={14} /> Open in CRM</Button></aside>
  </div>;
}

function AnalyticsPage({ onAddAnswer }: { onAddAnswer: () => void }) {
  const [period, setPeriod] = useState("Last 7 days");
  const [feedbackFilter, setFeedbackFilter] = useState("All feedback");
  const [savedGaps, setSavedGaps] = useState<string[]>([]);
  const gaps = [
    { id: "refund", count: 18, question: "What is the refund policy for annual renewals?", area: "Billing & refunds", confidence: "32% confidence", impact: "High impact" },
    { id: "shipping", count: 12, question: "How long does international shipping take?", area: "Shipping & delivery", confidence: "41% confidence", impact: "High impact" },
    { id: "seats", count: 8, question: "Can I share my subscription with my team?", area: "Plans & subscriptions", confidence: "47% confidence", impact: "Moderate" },
  ];
  return <div className="analytics-page"><div className="analytics-toolbar"><div className="analytics-live"><span className="status-dot" /> DATA UPDATED 4 MIN AGO</div><TinySelect value={period} onValueChange={setPeriod} options={["Last 7 days", "Last 30 days", "This quarter"]} className="small-select" /></div>
    <div className="metric-grid"><MetricCard label="Total conversations" value="2,481" delta="↑ 12.8%" note="vs. previous period" icon={MessageSquareText} tone="mint" /><MetricCard label="AI resolution rate" value="89.4%" delta="↑ 3.2%" note="vs. previous period" icon={ShieldCheck} tone="blue" /><MetricCard label="Avg. response time" value="1.4s" delta="↓ 0.3s" note="vs. previous period" icon={Zap} tone="amber" /><MetricCard label="Unanswered queries" value="18" delta="↑ 4 new" note="questions to review" icon={CircleHelp} tone="rose" /></div>
    <section className="panel gap-miner-panel"><div className="gap-heading"><div className="gap-title-icon"><Search size={17} /></div><div><div className="eyebrow">KNOWLEDGE GAP MINER</div><h2>Questions your knowledge can't answer yet</h2><p>Repeated questions with low-confidence answers are opportunities to improve.</p></div><span className="gap-total">18 GAPS</span></div><div className="gap-list">{gaps.map((gap, index) => <div className="gap-item" key={gap.id}><div className="gap-rank">0{index + 1}</div><div className="gap-copy"><div><span className="gap-topic">{gap.area}</span><span className="gap-meta">· {gap.confidence}</span></div><strong>{gap.count} visitors asked: “{gap.question}”</strong><span className="gap-footnote">No sources cover this question yet. <b>{gap.impact}</b></span></div><Button variant={savedGaps.includes(gap.id) ? "secondary" : "outline"} size="sm" onClick={() => { if (!savedGaps.includes(gap.id)) { setSavedGaps([...savedGaps, gap.id]); onAddAnswer(); } }} disabled={savedGaps.includes(gap.id)}>{savedGaps.includes(gap.id) ? <Check size={14} /> : <Plus size={14} />}{savedGaps.includes(gap.id) ? "Added to knowledge" : "Add answer"}</Button></div>)}</div><Button variant="ghost" className="view-gaps-button">View all 18 unanswered questions <ArrowRight size={14} /></Button></section>
    <section className="panel feedback-panel"><div className="panel-header"><div><div className="eyebrow">VOICE OF THE CUSTOMER</div><h2>Feedback ledger</h2><p>Recent visitor ratings and answer quality.</p></div><TinySelect value={feedbackFilter} onValueChange={setFeedbackFilter} options={["All feedback", "Helpful", "Not helpful"]} className="small-select" /></div><div className="feedback-table-wrap"><table className="feedback-table"><thead><tr><th>VISITOR QUESTION</th><th>RATING</th><th>CITATION ACCURACY</th><th>COMMENT</th><th>TIME</th></tr></thead><tbody>{[
      ["How do I update my payment method?", "Helpful", "98%", "Clear and quick, thank you!", "10:42 AM"],
      ["Can I pause my subscription?", "Not helpful", "64%", "I still can't find the pause option.", "9:56 AM"],
      ["Where can I download my invoice?", "Helpful", "95%", "Found it right away.", "9:31 AM"],
      ["Do you ship to Canada?", "Helpful", "91%", "", "Yesterday"],
    ].filter((row) => feedbackFilter === "All feedback" || row[1] === feedbackFilter).map((row) => <tr key={row[0]}><td><span className="feedback-query-icon"><MessageSquareText size={14} /></span>{row[0]}</td><td><span className={`rating-tag ${row[1] === "Helpful" ? "up" : "down"}`}>{row[1] === "Helpful" ? "↑" : "↓"} {row[1]}</span></td><td><span className="accuracy-cell"><i><b style={{ width: row[2] }} /></i>{row[2]}</span></td><td className="feedback-comment">{row[3] || "—"}</td><td>{row[4]}</td></tr>)}</tbody></table></div><Button variant="ghost" className="view-all-button">View all feedback <ArrowRight size={14} /></Button></section>
  </div>;
}

function SettingsPage(props: { integrations: string[]; toggleIntegration: (name: string) => void; setSourceNotice: (value: string) => void; setEmbedOpen: (value: boolean) => void }) {
  const { integrations, toggleIntegration, setSourceNotice, setEmbedOpen } = props;
  const [settingTab, setSettingTab] = useState("Integrations");
  const [developmentMode, setDevelopmentMode] = useState(false);
  return <div className="settings-page"><div className="settings-nav panel">{["Integrations", "General", "Domains & security", "Team & access", "Usage & billing"].map((tab) => <Button key={tab} variant="ghost" className={settingTab === tab ? "selected" : ""} onClick={() => setSettingTab(tab)}>{tab === "Integrations" ? <Link2 /> : tab === "General" ? <Settings2 /> : tab === "Domains & security" ? <ShieldCheck /> : tab === "Team & access" ? <Users /> : <Zap />}{tab}<ChevronRight size={14} /></Button>)}</div><div className="settings-content"><div className="settings-intro"><div className="eyebrow">WORKSPACE CONFIGURATION</div><h2>{settingTab}</h2><p>{settingTab === "Integrations" ? "Give your assistant the tools to do more than answer questions." : "Manage your KnowledgAI workspace preferences and access."}</p></div>{settingTab === "Integrations" ? <><div className="integration-banner"><div className="integration-banner-icon"><Sparkles size={18} /></div><div><strong>Give your assistant a helping hand.</strong><p>Connect the tools your team already uses to unlock useful actions in a conversation.</p></div><span>COMING SOON</span></div><div className="integration-grid">{integrationList.map((item) => <div className="integration-card panel" key={item.name}><div className={`integration-logo ${item.tone}`}>{item.icon}</div><div className="integration-card-copy"><strong>{item.name}</strong><span>{item.detail}</span></div><Button variant={integrations.includes(item.name) ? "secondary" : "outline"} size="sm" onClick={() => toggleIntegration(item.name)}>{integrations.includes(item.name) ? <><Check size={14} /> Connected</> : "Connect"}</Button><span className="integration-preview-tag">PREVIEW</span></div>)}</div><div className="panel domain-settings"><div className="domain-settings-heading"><div><h3>Allowed domains</h3><p>Protect your assistant by restricting where it can be embedded.</p></div><Button variant="outline" size="sm" onClick={() => setEmbedOpen(true)}><Plus size={14} /> Add domain</Button></div><div className="domain-list-row"><div className="domain-mark"><Globe2 size={16} /></div><div><strong>acme.com</strong><span>Verified · Production</span></div><span className="verified-tag"><CheckCircle2 size={13} /> Verified</span><Button variant="ghost" size="icon" aria-label="Domain actions"><MoreHorizontal /></Button></div><div className="domain-list-row"><div className="domain-mark"><Globe2 size={16} /></div><div><strong>www.acme.com</strong><span>Verified · Production</span></div><span className="verified-tag"><CheckCircle2 size={13} /> Verified</span><Button variant="ghost" size="icon" aria-label="Domain actions"><MoreHorizontal /></Button></div><div className="development-mode-row"><div className="devmode-icon"><Code2 size={15} /></div><span><strong>Development mode</strong><small>Allow localhost testing without domain verification</small></span><Switch checked={developmentMode} onCheckedChange={setDevelopmentMode} aria-label="Development mode" /></div></div><div className="panel workspace-api-card"><div className="api-card-icon"><ShieldCheck size={16} /></div><div><strong>Workspace security</strong><p>API keys and webhook secrets are encrypted and managed securely.</p></div><Button variant="outline" size="sm" onClick={() => setSourceNotice("Security settings opened")}>Security settings <ArrowRight size={14} /></Button></div></> : <div className="panel settings-placeholder"><div className="section-icon blue"><Settings2 size={19} /></div><h3>{settingTab}</h3><p>Workspace controls are available here in the interactive preview.</p><Button variant="outline" onClick={() => setSourceNotice(`${settingTab} preferences saved`)}>Save preferences</Button></div>}</div></div>;
}