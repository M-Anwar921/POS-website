import { useEffect, useState } from "react";
import { FiSave, FiRefreshCw, FiCopy } from "react-icons/fi";
import api from "../api/axios";
import toast from "react-hot-toast";

const tabs = ["Store Info", "Currency & Tax", "Receipt", "Email & SMS", "Backup", "Security", "API Keys"];

export default function Settings() {
  const [tab, setTab] = useState("Store Info");
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = () => {
    api.get("/settings").then((res) => setSettings(res.data.data));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (field, value) => setSettings({ ...settings, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      const res = await api.post("/settings/generate-api-key");
      setSettings({ ...settings, apiKey: res.data.data.apiKey });
      toast.success("New API key generated");
    } catch {
      toast.error("Failed to generate key");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    toast.success("Copied to clipboard");
  };

  if (!settings) return null;

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none dark:text-white";
  const labelClass = "text-xs text-[var(--color-muted)] mb-1 block";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold dark:text-white">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white disabled:opacity-60">
          <FiSave size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${tab === t ? "bg-[var(--color-primary)] text-white" : "bg-white dark:bg-[var(--color-card-dark)] text-[var(--color-muted)] border border-gray-200 dark:border-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 max-w-2xl">
        {tab === "Store Info" && (
          <div className="space-y-4">
            <div><label className={labelClass}>Store Name</label><input className={inputClass} value={settings.storeName} onChange={(e) => handleChange("storeName", e.target.value)} /></div>
            <div><label className={labelClass}>Address</label><input className={inputClass} value={settings.storeAddress} onChange={(e) => handleChange("storeAddress", e.target.value)} /></div>
            <div><label className={labelClass}>Phone</label><input className={inputClass} value={settings.storePhone} onChange={(e) => handleChange("storePhone", e.target.value)} /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} value={settings.storeEmail} onChange={(e) => handleChange("storeEmail", e.target.value)} /></div>
          </div>
        )}

        {tab === "Currency & Tax" && (
          <div className="space-y-4">
            <div><label className={labelClass}>Currency Code</label><input className={inputClass} value={settings.currency} onChange={(e) => handleChange("currency", e.target.value)} /></div>
            <div><label className={labelClass}>Currency Symbol</label><input className={inputClass} value={settings.currencySymbol} onChange={(e) => handleChange("currencySymbol", e.target.value)} /></div>
            <div><label className={labelClass}>Default Tax Rate (%)</label><input type="number" className={inputClass} value={settings.taxRate} onChange={(e) => handleChange("taxRate", Number(e.target.value))} /></div>
          </div>
        )}

        {tab === "Receipt" && (
          <div className="space-y-4">
            <div><label className={labelClass}>Printer Name</label><input className={inputClass} value={settings.printerName} onChange={(e) => handleChange("printerName", e.target.value)} placeholder="e.g. Epson TM-T88" /></div>
            <div><label className={labelClass}>Receipt Footer Message</label><textarea rows={2} className={inputClass} value={settings.receiptFooter} onChange={(e) => handleChange("receiptFooter", e.target.value)} /></div>
            <div><label className={labelClass}>Return Policy Text</label><textarea rows={2} className={inputClass} value={settings.returnPolicyText} onChange={(e) => handleChange("returnPolicyText", e.target.value)} /></div>
          </div>
        )}

        {tab === "Email & SMS" && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-muted)]">Used for emailing receipts and low-stock alerts (Nodemailer integration).</p>
            <div><label className={labelClass}>SMTP Host</label><input className={inputClass} value={settings.smtpHost} onChange={(e) => handleChange("smtpHost", e.target.value)} /></div>
            <div><label className={labelClass}>SMTP Port</label><input className={inputClass} value={settings.smtpPort} onChange={(e) => handleChange("smtpPort", e.target.value)} /></div>
            <div><label className={labelClass}>SMTP User</label><input className={inputClass} value={settings.smtpUser} onChange={(e) => handleChange("smtpUser", e.target.value)} /></div>
            <div><label className={labelClass}>SMS Provider</label><input className={inputClass} value={settings.smsProvider} onChange={(e) => handleChange("smsProvider", e.target.value)} placeholder="e.g. Twilio" /></div>
            <div><label className={labelClass}>SMS API Key</label><input className={inputClass} value={settings.smsApiKey} onChange={(e) => handleChange("smsApiKey", e.target.value)} /></div>
          </div>
        )}

        {tab === "Backup" && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm dark:text-white">
              <input type="checkbox" checked={settings.autoBackupEnabled} onChange={(e) => handleChange("autoBackupEnabled", e.target.checked)} />
              Enable automatic backups
            </label>
            <div>
              <label className={labelClass}>Backup Frequency</label>
              <select className={inputClass} value={settings.backupFrequency} onChange={(e) => handleChange("backupFrequency", e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <p className="text-xs text-[var(--color-muted)]">Since this uses MongoDB Atlas, backups are also managed directly in your Atlas cluster settings (Backup tab) — this toggle controls in-app reminders only.</p>
          </div>
        )}

        {tab === "Security" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Session Timeout (minutes)</label>
              <input type="number" className={inputClass} value={settings.sessionTimeoutMinutes} onChange={(e) => handleChange("sessionTimeoutMinutes", Number(e.target.value))} />
            </div>
            <p className="text-xs text-[var(--color-muted)]">Password hashing (bcrypt), JWT authentication, role-based access control, and rate limiting are already active system-wide from Phase 1.</p>
          </div>
        )}

        {tab === "API Keys" && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-muted)]">Use this key to authenticate third-party integrations against your store's API.</p>
            <div className="flex gap-2">
              <input readOnly className={inputClass + " font-mono text-xs"} value={settings.apiKey || "No key generated yet"} />
              {settings.apiKey && (
                <button onClick={copyKey} className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-[var(--color-muted)]"><FiCopy size={14} /></button>
              )}
            </div>
            <button onClick={handleGenerateKey} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 dark:text-white">
              <FiRefreshCw size={14} /> {settings.apiKey ? "Regenerate Key" : "Generate Key"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}