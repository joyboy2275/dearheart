import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, Feather, Heart, LoaderCircle, LockKeyhole, PenLine, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { dedicationCategories, type DedicationCategory } from "@shared/dedications";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const heroArt = "/manus-storage/async-images/440H8v6G1b0PWsgvneAqtX/image-1.webp";
const noteArt = "/manus-storage/async-images/440H8v6G1b0PWsgvneAqtX/image-2.webp";

type Visibility = "public" | "private";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function Home() {
  const [category, setCategory] = useState<DedicationCategory | "all">("all");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [anonymous, setAnonymous] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DedicationCategory>("lost");
  const utils = trpc.useUtils();
  const letters = trpc.dedications.list.useQuery({ category: category === "all" ? undefined : category, limit: 24 });
  const createLetter = trpc.dedications.create.useMutation({
    onSuccess: async result => {
      await utils.dedications.list.invalidate();
      window.location.assign(`/note/${result.slug}?saved=1`);
    },
    onError: error => toast.error(error.message),
  });
  const selectedDescription = useMemo(
    () => dedicationCategories.find(item => item.value === selectedCategory)?.description,
    [selectedCategory],
  );

  async function submitLetter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    await createLetter.mutateAsync({
      message: message.trim(),
      title: title.trim() || undefined,
      category: selectedCategory,
      recipientName: recipientName.trim() || undefined,
      authorName: anonymous ? undefined : authorName.trim() || undefined,
      anonymous,
      visibility,
    });
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#wall">The wall</a>
            <a href="#about">A note on this space</a>
          </nav>
          <a className="header-write" href="#write">Leave a letter <PenLine size={15} /></a>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-rule" />A little archive for the heart</div>
            <h1>For the words<br />you <em>still carry.</em></h1>
            <p className="hero-intro">For the one you lost. The one you still cherish. The one who may never know.</p>
            <p className="hero-support">Some feelings need somewhere to land. Leave yours here, just for you or for the people who understand.</p>
            <div className="hero-actions">
              <a className="button-primary" href="#write">Write what you never said <ArrowUpRight size={17} /></a>
              <a className="text-link" href="#wall">Read the letters <ArrowDown size={15} /></a>
            </div>
            <div className="hero-whisper"><span className="tiny-heart">♡</span> No names needed. No perfect words required.</div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src={heroArt} alt="An unsent letter with a pressed flower on warm handmade paper" />
            <div className="image-caption"><span>the things we keep</span><span>01 — always</span></div>
            <div className="hero-seal" aria-hidden="true"><Heart size={19} strokeWidth={1.4} /><span>Dear,<br />Always</span></div>
          </div>
          <div className="hero-side-note" aria-hidden="true">a place for what stays</div>
        </section>

        <section className="write-section section-wrap" id="write">
          <div className="section-heading">
            <span className="section-kicker"><Feather size={14} /> THE LETTER YOU'VE BEEN HOLDING</span>
            <h2>Let it have a <em>place.</em></h2>
            <p>Write a line, a memory, or everything you never got to say.</p>
          </div>
          <div className="write-layout">
            <form className="letter-form" onSubmit={submitLetter}>
              <div className="form-topline"><span>01 / YOUR WORDS</span><span>Private by default</span></div>
              <label className="field-label" htmlFor="letter-title">Give it a title <span>(optional)</span></label>
              <input id="letter-title" className="text-input" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} placeholder="A little name for this feeling" />

              <label className="field-label category-label">What kind of love is this?</label>
              <div className="category-options" role="group" aria-label="Dedication category">
                {dedicationCategories.map(item => (
                  <button className={`category-option ${selectedCategory === item.value ? "is-selected" : ""}`} key={item.value} type="button" onClick={() => setSelectedCategory(item.value)} aria-pressed={selectedCategory === item.value}>
                    {item.label}<span className="category-dot" />
                  </button>
                ))}
              </div>
              <p className="field-hint category-hint">{selectedDescription}</p>

              <label className="field-label" htmlFor="letter-message">Your words <span>· up to 2,400 characters</span></label>
              <textarea id="letter-message" className="message-input" value={message} onChange={event => setMessage(event.target.value)} maxLength={2400} minLength={1} required placeholder="Dear you,\n\nI've been meaning to say…" />
              <div className="character-count">{message.length} / 2,400</div>

              <div className="name-fields">
                <div>
                  <label className="field-label" htmlFor="recipient-name">This is for <span>(optional)</span></label>
                  <input id="recipient-name" className="text-input" value={recipientName} onChange={event => setRecipientName(event.target.value)} maxLength={80} placeholder="A first name, or leave blank" />
                </div>
                {!anonymous && <div>
                  <label className="field-label" htmlFor="author-name">Written by <span>(optional)</span></label>
                  <input id="author-name" className="text-input" value={authorName} onChange={event => setAuthorName(event.target.value)} maxLength={80} placeholder="How you'd like to be known" />
                </div>}
              </div>
              <label className="check-row"><input type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} /><span className="fake-check" aria-hidden="true" /><span>Leave this anonymously</span></label>

              <fieldset className="privacy-fieldset">
                <legend className="field-label">Where should it live?</legend>
                <div className="privacy-options">
                  <label className={`privacy-option ${visibility === "private" ? "is-selected" : ""}`}>
                    <input type="radio" name="visibility" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} />
                    <span className="privacy-icon"><LockKeyhole size={17} /></span>
                    <span><strong>Just for me</strong><small>Kept off the public wall. Anyone with the private link can read it.</small></span>
                    <span className="radio-mark" />
                  </label>
                  <label className={`privacy-option ${visibility === "public" ? "is-selected" : ""}`}>
                    <input type="radio" name="visibility" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} />
                    <span className="privacy-icon"><Heart size={17} /></span>
                    <span><strong>Leave a light on</strong><small>Share it on the wall so someone else might feel less alone.</small></span>
                    <span className="radio-mark" />
                  </label>
                </div>
              </fieldset>
              {selectedCategory === "obsession" && <p className="boundaries-note">A gentle reminder: this is a place to write what you feel, not to contact or track someone who has set a boundary.</p>}
              <button className="submit-letter" type="submit" disabled={createLetter.isPending || !message.trim()}>
                {createLetter.isPending ? <><LoaderCircle size={17} className="spin" /> Saving your words…</> : <><Send size={16} /> Keep these words <ArrowUpRight size={16} /></>}
              </button>
              <p className="privacy-footnote">No account required. You can use a name, or none at all.</p>
            </form>

            <aside className="write-aside">
              <div className="note-art-frame"><img src={noteArt} alt="A folded note with a pressed rose petal" /></div>
              <div className="aside-quote"><span className="quote-mark">“</span><p>Not every love story needs an ending. Some just need to be remembered.</p><span className="quote-attribution">A small truth, held gently</span></div>
              <div className="aside-rule"><span>KEEP WHAT MATTERS</span><span>♡</span></div>
            </aside>
          </div>
        </section>

        <section className="wall-section" id="wall">
          <div className="section-wrap">
            <div className="wall-heading-row">
              <div className="section-heading wall-heading">
                <span className="section-kicker"><Sparkles size={14} /> WORDS LEFT HERE</span>
                <h2>The letters we <em>leave.</em></h2>
                <p>Quiet pieces of other hearts. Read gently.</p>
              </div>
              <div className="wall-note">Every letter belongs to someone.<br />Please read as if it were your own.</div>
            </div>
            <div className="wall-filter" role="group" aria-label="Filter letters by category">
              <button className={category === "all" ? "filter-chip is-active" : "filter-chip"} onClick={() => setCategory("all")} type="button">All letters</button>
              {dedicationCategories.map(item => <button className={category === item.value ? "filter-chip is-active" : "filter-chip"} onClick={() => setCategory(item.value)} key={item.value} type="button">{item.label}</button>)}
            </div>
            {letters.isLoading ? <div className="wall-status"><LoaderCircle className="spin" size={21} /> Gathering the letters…</div> : letters.isError ? <div className="wall-status wall-error">The letters couldn't be reached just now. <button onClick={() => void letters.refetch()}>Try again</button></div> : letters.data?.length ? (
              <div className="letter-grid">
                {letters.data.map((letter, index) => {
                  const categoryLabel = dedicationCategories.find(item => item.value === letter.category)?.label ?? "A letter";
                  return <article className={`letter-card letter-card-${index % 3}`} key={letter.id}>
                    <div className="letter-card-top"><span className="letter-category">{categoryLabel}</span><span className="letter-heart" aria-hidden="true">♡</span></div>
                    {letter.recipientName && <p className="letter-to">For {letter.recipientName}</p>}
                    {letter.title && <h3>{letter.title}</h3>}
                    <blockquote>{letter.message}</blockquote>
                    <div className="letter-card-bottom"><span>{letter.anonymous || !letter.authorName ? "Left anonymously" : `From ${letter.authorName}`}</span><span>{formatDate(letter.createdAt)}</span></div>
                    <Link className="card-open-link" href={`/note/${letter.slug}`} aria-label={`Read ${letter.title || "this letter"}`}>Read this letter <ArrowUpRight size={15} /></Link>
                  </article>;
                })}
              </div>
            ) : (
              <div className="empty-wall"><div className="empty-flower" aria-hidden="true">✳</div><p className="empty-kicker">THE WALL IS STILL QUIET</p><h3>Maybe your words<br />will be the first.</h3><p>Leave a light on for someone who might need it.</p><a className="empty-link" href="#write">Write the first letter <ArrowUpRight size={15} /></a></div>
            )}
            {letters.data?.length === 24 && <p className="wall-limit-note">Showing the most recent 24 letters.</p>}
          </div>
        </section>

        <section className="about-section section-wrap" id="about">
          <div className="about-symbol"><Heart size={23} strokeWidth={1.3} /></div>
          <div className="about-copy"><span className="section-kicker">A NOTE ON THIS SPACE</span><h2>Feel it here.<br /><em>Respect their boundaries.</em></h2><p>Dear, Always is a place to put feelings into words—not a way to find, follow, or contact someone. If they have said no, let this be where the feeling stays. Public letters can be reported if they make this space feel unsafe.</p></div>
          <a className="about-cta" href="#write">Leave your words <ArrowUpRight size={16} /></a>
        </section>
      </main>

      <footer className="site-footer"><Brand /><p>For the words we still carry.</p><a href="#top" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to the beginning ↑</a><span>Made for what stays.</span></footer>
    </div>
  );
}
