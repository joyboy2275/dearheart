import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Check, Copy, Flag, Heart, LoaderCircle, LockKeyhole, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { dedicationCategories, reportReasons, type ReportReason } from "@shared/dedications";
import { Brand } from "@/components/Brand";
import { trpc } from "@/lib/trpc";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function NotePage({ slug }: { slug: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [copied, setCopied] = useState(false);
  const letter = trpc.dedications.bySlug.useQuery({ slug }, { retry: false });
  const reportMutation = trpc.dedications.report.useMutation({
    onSuccess: () => {
      toast.success("Thank you. Your report has been sent for review.");
      setReportOpen(false);
      setDetails("");
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!letter.data) return;
    const priorTitle = document.title;
    document.title = `${letter.data.title || "A letter"} · Dear, Always`;
    if (letter.data.visibility !== "private") {
      return () => { document.title = priorTitle; };
    }
    const existingRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robotsMeta = existingRobots ?? document.createElement("meta");
    const priorRobots = robotsMeta.content;
    if (!existingRobots) {
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = "noindex, nofollow";
    return () => {
      document.title = priorTitle;
      if (existingRobots) robotsMeta.content = priorRobots;
      else robotsMeta.remove();
    };
  }, [letter.data]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.success("Link copied.");
    } catch {
      toast.error("Copy wasn't available. You can copy the address from your browser.");
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try { await navigator.share({ title: letter.data?.title || "A letter from Dear, Always", url: window.location.href }); }
      catch { /* The share sheet can be dismissed without action. */ }
    } else {
      await copyLink();
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await reportMutation.mutateAsync({ slug, reason: reportReason, details: details.trim() || undefined });
  }

  if (letter.isLoading) return <div className="note-loading"><LoaderCircle size={22} className="spin" /><p>Opening this letter…</p></div>;
  if (letter.error?.data?.code === "NOT_FOUND") {
    window.setTimeout(() => { window.location.replace("/404"); }, 0);
    return <div className="note-loading"><p>This letter could not be found.</p></div>;
  }
  if (!letter.data) return <div className="note-loading"><p>This letter couldn't be opened just now.</p><button className="text-link" onClick={() => void letter.refetch()}>Try again</button></div>;

  const dedication = letter.data;
  const categoryLabel = dedicationCategories.find(item => item.value === dedication.category)?.label ?? "A letter";
  const isPublic = dedication.visibility === "public";
  const isSavedPage = new URLSearchParams(window.location.search).has("saved");

  return (
    <div className="note-page">
      <header className="site-header note-header"><div className="header-inner"><Brand /><Link className="back-link" href="/#wall"><ArrowLeft size={15} /> Back to the wall</Link><a className="header-write" href="/#write">Leave a letter <ArrowUpRight size={15} /></a></div></header>
      <main className="note-main">
        <div className="note-topline"><span className="section-kicker"><span className="tiny-heart">♡</span> A LETTER LEFT HERE</span><span className="note-date">{formatDate(dedication.createdAt)}</span></div>
        {isSavedPage && <div className="saved-banner"><span><Check size={17} /> Your words have been saved.</span><span>{isPublic ? "It's now part of the public wall." : "Keep this private link somewhere safe."}</span></div>}
        {!isPublic && <div className="private-banner"><LockKeyhole size={16} /><span><strong>A private letter.</strong> It's off the public wall. Anyone with this link can read it, so share it only with someone you trust.</span></div>}
        <article className="note-paper">
          <div className="note-paper-ornament" aria-hidden="true"><span>♡</span></div>
          <span className="note-category">{categoryLabel}</span>
          {dedication.recipientName && <p className="note-recipient">For {dedication.recipientName},</p>}
          {dedication.title && <h1>{dedication.title}</h1>}
          <div className="note-message">{dedication.message.split("\n").map((paragraph, index) => <p key={index}>{paragraph || <br />}</p>)}</div>
          <div className="note-signoff"><span>With what remains,</span><strong>{dedication.anonymous || !dedication.authorName ? "Someone, still" : dedication.authorName}</strong></div>
          <div className="note-paper-bottom"><span>DEAR, ALWAYS</span><Heart size={16} strokeWidth={1.3} /><span>WORDS WE STILL CARRY</span></div>
        </article>
        <div className="note-actions">
          <button className="note-action-primary" onClick={() => void shareLink()}><Share2 size={16} /> Share this letter</button>
          <button className="note-action-secondary" onClick={() => void copyLink()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy link"}</button>
          {isPublic && <button className="note-report" onClick={() => setReportOpen(true)}><Flag size={14} /> Report</button>}
        </div>
        {isPublic && <p className="note-share-hint">Every letter has its own link. Send it gently, and only if it feels right.</p>}
        <div className="note-lower-cta"><p>There may be words you need to leave, too.</p><a href="/#write">Write your own letter <ArrowUpRight size={15} /></a></div>
      </main>
      <footer className="site-footer note-footer"><Brand /><p>For the words we still carry.</p><span>Made for what stays.</span></footer>

      {reportOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setReportOpen(false); }}>
        <section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
          <button className="modal-close" type="button" aria-label="Close report dialog" onClick={() => setReportOpen(false)}><X size={19} /></button>
          <div className="report-icon"><Flag size={18} /></div>
          <p className="section-kicker">KEEPING THIS SPACE GENTLE</p>
          <h2 id="report-title">Tell us what feels wrong.</h2>
          <p className="report-intro">Your report is private and will be recorded for review. It doesn't automatically remove the letter.</p>
          <form onSubmit={submitReport}>
            <label className="field-label" htmlFor="report-reason">Reason for reporting</label>
            <select id="report-reason" className="text-input" value={reportReason} onChange={event => setReportReason(event.target.value as ReportReason)}>
              {reportReasons.map(reason => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
            </select>
            <label className="field-label report-details-label" htmlFor="report-details">Anything else? <span>(optional)</span></label>
            <textarea id="report-details" className="report-textarea" maxLength={500} value={details} onChange={event => setDetails(event.target.value)} placeholder="A little context can help us understand." />
            <button className="submit-letter report-submit" type="submit" disabled={reportMutation.isPending}>{reportMutation.isPending ? <><LoaderCircle size={16} className="spin" /> Sending…</> : <>Send report <ArrowUpRight size={16} /></>}</button>
          </form>
        </section>
      </div>}
    </div>
  );
}
