import React, { useEffect, useState } from 'react';
import { fetchGrammarCategories, fetchGrammarLessons, fetchGrammarLesson } from '../services/api';
import './Grammar.css';

interface Lesson {
  id: string;
  title: string;
  content: string;
}

const Grammar: React.FC = () => {
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await fetchGrammarCategories();
        setLevels(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load grammar categories');
      }
    };
    loadLevels();
  }, []);

  async function handleSelectLevel(level: string) {
    setSelectedLesson(null);
    setSelectedLevel(level);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrammarLessons(level);
      setLessons(data);
    } catch (err: any) {
      setLessons([]);
      setError(err.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectLesson(lesson: Lesson) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrammarLesson(selectedLevel!, lesson.id);
      setSelectedLesson(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grammar-page">
      <h2>Grammar</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="grammar-levels">
        {levels.map((level) => (
          <button
            key={level}
            className={`level-button ${selectedLevel === level ? 'active' : ''}`}
            onClick={() => handleSelectLevel(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)} Grammar
          </button>
        ))}
      </div>
      {selectedLevel && (
        <div className="lesson-section">
          <h3>{selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Lessons</h3>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <ul className="lesson-list">
              {lessons.map((lesson) => (
                <li key={lesson.id} className={selectedLesson?.id === lesson.id ? 'active' : ''}>
                  <button onClick={() => handleSelectLesson(lesson)}>
                    {lesson.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selectedLesson && (
        <div className="lesson-content">
          <h4>{selectedLesson.title}</h4>
          <pre>{selectedLesson.content}</pre>
        </div>
      )}
    </div>
  );
};

export default Grammar;