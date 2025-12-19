/*
 * This page implements the core review flow for the VokaLoka language learning
 * application. It manages a session of flashcards, including "new" cards and
 * the special AGAIN queue which reintroduces cards marked as "again" after
 * a short delay. Keyboard shortcuts (Space/Enter to reveal, 1/2/3 to grade)
 * are registered here as well.
 */
'use client';

import React, { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { getNextCardForReview, submitCardReview, FlashcardDTO } from '@/src/actions/card-actions';
import { SimplifiedQuality } from '@/src/lib/srs';

// Types for the local AGAIN queue and review phase
type AgainItem = { id: string; remainingSkips: number };
type Phase = 'MAIN' | 'AGAIN';

// Utility for joining class names conditionally
function cx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export default function ReviewPage() {
  const [currentCard, setCurrentCard] = useState<FlashcardDTO | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Track the current fetch to avoid race conditions when a new fetch is kicked off
  const fetchIdRef = useRef(0);
  // Maintain session state: current phase and queue of cards marked AGAIN
  const phaseRef = useRef<Phase>('MAIN');
  const againQueueRef = useRef<AgainItem[]>([]);

  // Force a re-render when the again queue changes, since ref updates do not trigger React renders
  const [, force] = useState(0);
  const bump = () => force((x) => x + 1);

  /**
   * Helpers for working with the again queue. These avoid duplicating IDs and
   * manage the spacing between reviews of tough cards during the AGAIN phase.
   */
  const againIds = () => againQueueRef.current.map((x) => x.id);

  const excludeIdsForAgainPhase = () =>
    againQueueRef.current.filter((x) => x.remainingSkips > 0).map((x) => x.id);

  const addOrResetAgain = (cardId: string, skips: number) => {
    const existing = againQueueRef.current.find((x) => x.id === cardId);
    if (existing) existing.remainingSkips = Math.max(existing.remainingSkips, skips);
    else againQueueRef.current.push({ id: cardId, remainingSkips: skips });
    bump();
  };

  const removeFromAgainQueue = (cardId: string) => {
    const before = againQueueRef.current.length;
    againQueueRef.current = againQueueRef.current.filter((x) => x.id !== cardId);
    if (againQueueRef.current.length !== before) bump();
  };

  const clearAgainSkips = () => {
    againQueueRef.current = againQueueRef.current.map((x) => ({ ...x, remainingSkips: 0 }));
    bump();
  };

  /**
   * In the AGAIN phase, every answered card counts as a "tick" on the spacing
   * clock. This helper decrements the remainingSkips on all queued items
   * except the current card. Without this, a large again queue would cause
   * cards to reappear only after the entire queue has been cycled through.
   */
  const advanceAgainSpacing = (opts: { exceptId?: string | null; count: number }) => {
    const { exceptId = null, count } = opts;
    if (count <= 0) return;
    againQueueRef.current = againQueueRef.current.map((x) => {
      if (exceptId && x.id === exceptId) return x;
      return { ...x, remainingSkips: Math.max(0, x.remainingSkips - count) };
    });
    bump();
  };

  const againCount = againQueueRef.current.length;

  /**
   * Fetch the next card for the session. In the MAIN phase, all cards in the
   * again queue are excluded until the primary pass is complete. In the AGAIN
   * phase, only cards from the again queue are shown, and spacing rules apply.
   */
  const fetchCard = useCallback(
    (opts?: { forceIgnoreExcludes?: boolean }) => {
      const fetchId = ++fetchIdRef.current;
      setIsLoadingCard(true);
      setMessage('Loading…');
      setIsFlipped(false);
      const phase = phaseRef.current;
      // Determine which IDs to exclude and include based on the current phase
      const excludeIds = opts?.forceIgnoreExcludes
        ? []
        : phase === 'MAIN'
          ? againIds()
          : excludeIdsForAgainPhase();
      const includeIds = phase === 'AGAIN' ? againIds() : undefined;
      startTransition(async () => {
        try {
          let nextCard = await getNextCardForReview(excludeIds, includeIds);
          // Transition from MAIN to AGAIN when no non-again cards remain
          if (!nextCard && phaseRef.current === 'MAIN' && againQueueRef.current.length > 0) {
            phaseRef.current = 'AGAIN';
            bump();
            nextCard = await getNextCardForReview(excludeIdsForAgainPhase(), againIds());
          }
          // In AGAIN phase, if spacing excludes everything, unblock spacing
          if (!nextCard && phaseRef.current === 'AGAIN' && excludeIdsForAgainPhase().length > 0) {
            clearAgainSkips();
            nextCard = await getNextCardForReview([], againIds());
          }
          if (fetchId !== fetchIdRef.current) return; // Ignore stale fetches
          setCurrentCard(nextCard);
          setMessage(
            nextCard
              ? phaseRef.current === 'AGAIN'
                ? 'AGAIN queue mode — Space/Enter to reveal, then 1/2/3.'
                : 'Tap the card to reveal the answer.'
              : ''
          );
        } catch (err) {
          if (fetchId !== fetchIdRef.current) return;
          console.error(err);
          setCurrentCard(null);
          setMessage('Error fetching cards.');
        } finally {
          if (fetchId !== fetchIdRef.current) return;
          setIsLoadingCard(false);
        }
      });
    },
    [startTransition]
  );

  // Kick off the initial fetch when the component mounts
  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  /**
   * Handle the grading of the current card. When a user presses a grade
   * shortcut or clicks a grading button, this function applies the SRS logic
   * and updates the queue accordingly.
   */
  const handleReview = (quality: SimplifiedQuality) => {
    if (!currentCard || isPending) return;
    if (!isFlipped) return;
    const phase = phaseRef.current;
    const step = 2 + Math.floor(Math.random() * 2); // 2–3 cards delay in AGAIN mode
    if (quality === 'AGAIN') {
      setMessage(
        phase === 'AGAIN'
          ? `Got it — it’ll reappear in ~${step} cards.`
          : 'Queued — you’ll see it after you finish the rest.'
      );
      startTransition(async () => {
        try {
          const updated = await submitCardReview(currentCard.id, quality);
          if (phase === 'MAIN') {
            // MAIN: queue it but do not let it repeat until the main pass is finished
            addOrResetAgain(updated.id, 0);
          } else {
            // AGAIN: set spacing for this card and advance spacing for others
            addOrResetAgain(updated.id, step);
            advanceAgainSpacing({ exceptId: updated.id, count: 1 });
          }
          fetchCard();
        } catch (err) {
          console.error(err);
          setMessage('Error submitting review.');
        }
      });
      return;
    }
    setMessage('Saved. Scheduling…');
    startTransition(async () => {
      try {
        await submitCardReview(currentCard.id, quality);
        if (phase === 'AGAIN') {
          // Mark the card as handled in the again queue and advance spacing
          removeFromAgainQueue(currentCard.id);
          advanceAgainSpacing({ exceptId: null, count: 1 });
        }
        fetchCard();
      } catch (err) {
        console.error(err);
        setMessage('Error submitting review.');
      }
    });
  };

  /**
   * Register keyboard shortcuts for flipping and grading. Space or Enter
   * reveals the card, Escape hides it, and 1/2/3 grade the card when
   * flipped. The handler is removed on unmount.
   */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not intercept typing into inputs or textareas
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (isPending || isLoadingCard) return;
      if (!currentCard) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(true);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsFlipped(false);
        return;
      }
      if (!isFlipped) return;
      if (e.key === '1') {
        e.preventDefault();
        handleReview('AGAIN');
      } else if (e.key === '2') {
        e.preventDefault();
        handleReview('GOOD');
      } else if (e.key === '3') {
        e.preventDefault();
        handleReview('EASY');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentCard, isFlipped, isPending, isLoadingCard]);

  // Pre-render the entire UI into a constant for readability
  const shell = (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      {/* colorful background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute top-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
      </div>
      <div className="relative w-full max-w-6xl">
        {/* top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Voka<span className="text-fuchsia-600">Loka</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">Daily review session</p>
          </div>
          <div className="flex items-center gap-2">
            {againCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-semibold shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {againCount} coming back
              </span>
            )}
            <span
              className={cx(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border shadow-sm',
                isPending
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              )}
            >
              {isPending ? 'Saving…' : 'Ready'}
            </span>
          </div>
        </div>
        {/* grid fills the whitespace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* left panel (stats / filler) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900">Session</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Mode</span>
                <span className="font-semibold">Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Again queue</span>
                <span className="font-semibold">{againCount}</span>
              </div>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">Tip</div>
                <div className="text-xs text-slate-600 mt-1">
                  Shortcuts: <span className="font-semibold">Space/Enter</span> reveal •{' '}
                  <span className="font-semibold">1/2/3</span> grade
                </div>
              </div>
            </div>
          </div>
          {/* main card */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            <div className="px-6 pt-6">
              <p className="text-sm text-slate-600 min-h-[1.25rem]">{message || ' '}</p>
            </div>
            <div className="px-6 py-6">
              {isLoadingCard ? (
                <div className="h-[340px] rounded-2xl bg-slate-100 animate-pulse" />
              ) : !currentCard ? (
                <div className="h-[340px] rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl">🎉</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">All caught up</div>
                    <div className="mt-1 text-sm text-slate-600">No cards are due right now.</div>
                    <button
                      onClick={() => fetchCard({ forceIgnoreExcludes: true })}
                      className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                      Check again
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => !isPending && setIsFlipped((v) => !v)}
                  className={cx(
                    'w-full rounded-2xl border border-slate-200 shadow-sm',
                    'bg-gradient-to-b from-white to-slate-50 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition',
                    isPending && 'opacity-60 cursor-not-allowed hover:shadow-sm hover:translate-y-0'
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wide">{isFlipped ? 'Answer' : 'Prompt'}</span>
                      <span>Tap to flip</span>
                    </div>
                    <div className="mt-4 min-h-[220px] flex items-center justify-center text-center px-2">
                      <div className={cx('transition-all', isFlipped ? 'text-cyan-700' : 'text-slate-900')}>
                        <div className={cx(isFlipped ? 'text-3xl font-semibold' : 'text-4xl font-extrabold')}>
                          {isFlipped ? currentCard.back : currentCard.front}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
                        Reps: <span className="font-semibold text-slate-800">{currentCard.repetitionCount}</span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
                        Interval: <span className="font-semibold text-slate-800">{currentCard.interval}d</span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
                        EF: <span className="font-semibold text-slate-800">{currentCard.easeFactor.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
            {/* actions */}
            <div className="px-6 pb-6">
              {!currentCard ? null : !isFlipped ? (
                <button
                  onClick={() => !isPending && setIsFlipped(true)}
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition disabled:opacity-50"
                >
                  Show answer
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleReview('AGAIN')}
                    disabled={isPending}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                  >
                    Again <span className="text-xs opacity-70">(1)</span>
                  </button>
                  <button
                    onClick={() => handleReview('GOOD')}
                    disabled={isPending}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                  >
                    Good <span className="text-xs opacity-70">(2)</span>
                  </button>
                  <button
                    onClick={() => handleReview('EASY')}
                    disabled={isPending}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50"
                  >
                    Easy <span className="text-xs opacity-70">(3)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* right panel (fill whitespace / future features) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900">Coming soon</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-500" />
                Streaks + daily goal
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                Keyboard shortcuts
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                Audio + examples
              </li>
            </ul>
            <div className="mt-5 rounded-xl bg-slate-900 text-white p-4">
              <div className="text-xs font-semibold text-white/80">Focus</div>
              <div className="mt-1 text-sm font-semibold">Make it feel like a real product.</div>
              <div className="mt-2 text-xs text-white/70">
                After SQL migration, this panel can show charts + review history.
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          If this still looks unstyled, Tailwind isn’t loading — fix your Tailwind setup first.
        </p>
      </div>
    </div>
  );
  return <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100">{shell}</div>;
}