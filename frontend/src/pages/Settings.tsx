import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import './Settings.css';

const Settings: React.FC = () => {
  const [globalNew, setGlobalNew] = useState<number>(10);
  const [userNew, setUserNew] = useState<number>(10);
  const [modelEnabled, setModelEnabled] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('claude_haiku_4.5');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any = await fetchSettings();
        if (!mounted) return;
        setGlobalNew(data.global?.global_new_per_day ?? 10);
        setModelEnabled(Boolean(data.global?.force_model));
        setModelName(data.global?.model ?? 'claude_haiku_4.5');
        setUserNew(data.user?.new_per_day ?? data.global?.global_new_per_day ?? 10);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function onSaveGlobal() {
    setSaving(true);
    try {
      await updateSettings({ global_new_per_day: Number(globalNew), model: modelName, force_model: Boolean(modelEnabled) });
      setMessage('Global settings saved');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onSaveUser() {
    setSaving(true);
    try {
      await updateSettings({ new_per_day: Number(userNew) });
      setMessage('User settings saved');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section className="settings-section">
            <h3>Spaced Repetition</h3>
            <label>
              Global new cards per day:
              <input type="number" min={0} value={globalNew} onChange={(e) => setGlobalNew(Number(e.target.value))} />
            </label>
            <label>
              Your new cards per day:
              <input type="number" min={0} value={userNew} onChange={(e) => setUserNew(Number(e.target.value))} />
            </label>
            <div className="settings-actions">
              <button className="btn" onClick={onSaveGlobal} disabled={saving}>Save Global</button>
              <button className="btn" onClick={onSaveUser} disabled={saving}>Save For Me</button>
            </div>
          </section>

          <section className="settings-section">
            <h3>Model</h3>
            <label>
              <input type="checkbox" checked={modelEnabled} onChange={(e) => setModelEnabled(e.target.checked)} />
              Enable Claude Haiku 4.5 for all clients
            </label>
            <label>
              Model name:
              <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} />
            </label>
            <div className="settings-actions">
              <button className="btn" onClick={onSaveGlobal} disabled={saving}>Save Model Settings</button>
            </div>
          </section>

          {message && <div className="settings-message">{message}</div>}
        </>
      )}
    </div>
  );
};

export default Settings;
