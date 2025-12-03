import React, { useEffect, useState } from 'react';
import { fetchStatistics, fetchWords } from '../services/api';
import './Stats.css';

interface StatsData {
  streak: number;
  lastReviewDate?: string | null;
  totalWords: number;
  knownWords: number;
  learning: number;
  developing: number;
  good: number;
  cefrLevel: string;
  dueInDays?: number[];
  dueToday?: number;
}

interface WordEntry {
  id: string;
  word: string;
  status: string;
  deckId?: string;
  deckName?: string;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // Filters for deck and status selection
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  /**
   * Compute aggregated counts of words by status.  Returns an object with
   * properties `learning`, `developing`, and `good` where each value
   * indicates how many words currently fall into that category.  The
   * percentages relative to the total number of words are also computed
   * on the fly.
   */
  const computeStatusCounts = (list: WordEntry[]) => {
    const counts = { learning: 0, developing: 0, good: 0 };
    list.forEach((w) => {
      if (w.status === 'learning') counts.learning += 1;
      else if (w.status === 'developing') counts.developing += 1;
      else if (w.status === 'good') counts.good += 1;
    });
    const total = list.length || 1; // avoid divide by zero
    return {
      counts,
      percentages: {
        learning: (counts.learning / total) * 100,
        developing: (counts.developing / total) * 100,
        good: (counts.good / total) * 100,
      },
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await fetchStatistics();
        const wordData = await fetchWords();
        setStats({
          streak: statsData.streak ?? 0,
          lastReviewDate: statsData.lastReviewDate ?? null,
          totalWords: statsData.totalWords ?? wordData.length,
          knownWords: statsData.knownWords ?? 0,
          learning: statsData.learning ?? 0,
          developing: statsData.developing ?? 0,
          good: statsData.good ?? 0,
          cefrLevel: statsData.cefrLevel ?? '',
          dueInDays: statsData.dueInDays ?? [],
          dueToday: statsData.dueToday ?? 0,
        });
        setWords(wordData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Listen for real-time updates triggered by reviews
    function onStatsUpdated() {
      loadData();
    }
    window.addEventListener('vokaloka:statsUpdated', onStatsUpdated as EventListener);
    return () => window.removeEventListener('vokaloka:statsUpdated', onStatsUpdated as EventListener);
  }, []);

  /** Filter the words list based on currently selected deck and status. */
  const getFilteredWords = () => {
    return words.filter((w) => {
      const deckMatch = selectedDeck === 'all' || w.deckName === selectedDeck;
      const statusMatch = selectedStatus === 'all' || w.status === selectedStatus;
      return deckMatch && statusMatch;
    });
  };

  return (
    <div className="stats">
      <h2>Your Statistics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : stats ? (
        <>
          <div className="stats-summary">
            <div className="stat-item">
              <h3>Daily Streak</h3>
              <p>{stats.streak}</p>
            </div>
            <div className="stat-item">
              <h3>Words Known</h3>
              <p>{stats.knownWords}</p>
            </div>
            <div className="stat-item">
              <h3>Total Words</h3>
              <p>{stats.totalWords}</p>
            </div>
            {stats.lastReviewDate && (
              <div className="stat-item">
                <h3>Last Review</h3>
                <p>{new Date(stats.lastReviewDate).toLocaleDateString()}</p>
              </div>
            )}

            {/* Display estimated CEFR level */}
            <div className="stat-item">
              <h3>CEFR Level</h3>
              <p>{stats.cefrLevel}</p>
            </div>
            <div className="stat-item">
              <h3>Due Today</h3>
              <p>{stats.dueToday ?? 0}</p>
            </div>
          </div>

          {/* Small schedule chart for next 30 days */}
          {stats.dueInDays && stats.dueInDays.length > 0 && (
            <div className="schedule-chart">
              <h3>Upcoming reviews (next {stats.dueInDays.length - 1} days)</h3>
              <div className="chart-bars">
                {stats.dueInDays.map((count, idx) => {
                  const max = Math.max(...(stats.dueInDays || [1]));
                  const height = max > 0 ? Math.round((count / max) * 100) : 2;
                  return (
                    <div key={idx} className="chart-bar" title={`Day ${idx}: ${count}`}>
                      <div className="bar-fill" style={{ height: `${height}%` }} />
                      <div className="bar-label">{idx}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter controls */}
          <div className="filters">
            <label>
              Deck:
              <select value={selectedDeck} onChange={(e) => setSelectedDeck(e.target.value)}>
                <option value="all">All</option>
                {Array.from(new Set(words.map((w) => w.deckName || 'Unknown'))).map((deckName) => (
                  <option key={deckName} value={deckName || ''}>{deckName}</option>
                ))}
              </select>
            </label>
            <label>
              Status:
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="learning">Learning</option>
                <option value="developing">Developing</option>
                <option value="good">Good</option>
              </select>
            </label>
          </div>

          {/* Progress bar showing distribution of learning statuses */}
          {(() => {
            const filteredWords = getFilteredWords();
            const { counts, percentages } = computeStatusCounts(filteredWords);
            return (
              <div className="progress-container">
                <h3>Progress Overview</h3>
                <div className="progress-bar">
                  <div
                    className="progress-segment learning"
                    style={{ width: `${percentages.learning}%` }}
                    title={`${counts.learning} learning`}
                  />
                  <div
                    className="progress-segment developing"
                    style={{ width: `${percentages.developing}%` }}
                    title={`${counts.developing} developing`}
                  />
                  <div
                    className="progress-segment good"
                    style={{ width: `${percentages.good}%` }}
                    title={`${counts.good} known`}
                  />
                </div>
                <ul className="progress-legend">
                  <li className="learning">Learning: {counts.learning}</li>
                  <li className="developing">Developing: {counts.developing}</li>
                  <li className="good">Good: {counts.good}</li>
                </ul>
              </div>
            );
          })()}
          <h3 className="word-list-title">Word List</h3>
          {/* Group words by deck name so users can explore each deck separately */}
          {(() => {
            // group filtered words
            const groups: Record<string, WordEntry[]> = {};
            const filteredWords = getFilteredWords();
            filteredWords.forEach(word => {
              const deckName = word.deckName || 'Unknown';
              if (!groups[deckName]) groups[deckName] = [];
              groups[deckName].push(word);
            });
            return Object.entries(groups).map(([deckName, entries]) => (
              <div key={deckName} className="deck-group">
                <h4 className="deck-title">{deckName}</h4>
                <ul className="word-list">
                  {entries.map(word => (
                    <li key={word.id} className={`word-item ${word.status}`}>
                      <span className="word-text">{word.word}</span>
                      <span className="word-status">{word.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ));
          })()}
        </>
      ) : (
        <p>No statistics available.</p>
      )}
    </div>
  );
};

export default Stats;