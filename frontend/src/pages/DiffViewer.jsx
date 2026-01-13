import React, { useState, useEffect } from 'react'; // FIX
import { getUploads, compareRolls } from '../services/api'; // FIX

export default function DiffViewer() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');
  const [diffRows, setDiffRows] = useState([]); // FIX
  const [loading, setLoading] = useState(false); // FIX
  const [error, setError] = useState(null); // FIX

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-green-700';
    if (risk === 'Medium') return 'text-amber-700';
    if (risk === 'High') return 'text-red-700';
    return 'text-gray-800';
  };

  useEffect(() => {
    const buildTag =
      import.meta.env.VITE_COMMIT_SHA ||
      import.meta.env.VITE_BUILD_ID ||
      'local-dev'; // FIX
    console.debug('[DiffViewer] build tag', buildTag); // FIX
    console.debug('[DiffViewer] useEffect mount -> initiating data load'); // FIX
    const apiBaseUrl =
      import.meta.env.VITE_API_URL || 'https://electoral-roll-tracker-1.onrender.com'; // FIX
    console.debug('[DiffViewer] Resolved API base URL', apiBaseUrl); // FIX

    const loadDiffData = async () => {
      console.debug('[DiffViewer] Starting diff data fetch'); // FIX
      setLoading(true); // FIX
      setError(null); // FIX

      try {
        const uploads = await getUploads(); // FIX
        console.debug('[DiffViewer] Uploads response', {
          endpoint: '/api/uploads',
          method: 'GET',
          url: `${apiBaseUrl}/api/uploads`,
          count: Array.isArray(uploads) ? uploads.length : 'non-array',
          rawType: typeof uploads,
        }); // FIX
        console.debug('[DiffViewer] /api/uploads raw payload', uploads); // FIX
        if (!Array.isArray(uploads)) {
          setError('Unexpected uploads response shape'); // FIX
          setDiffRows([]); // FIX
          return;
        }
        if (uploads.length < 2) {
          console.debug('[DiffViewer] Not enough uploads to compare'); // FIX
          setError('Need at least two uploads to compare.'); // FIX
          setDiffRows([]); // FIX
          return;
        }

        const sorted = [...uploads].sort(
          (a, b) => new Date(b.uploaded_at || b.created_at || 0) - new Date(a.uploaded_at || a.created_at || 0)
        ); // FIX

        const oldUpload = sorted[sorted.length - 2]; // FIX
        const newUpload = sorted[sorted.length - 1]; // FIX

        console.debug('[DiffViewer] Calling compareRolls', {
          endpoint: '/api/compare',
          method: 'POST',
          url: `${apiBaseUrl}/api/compare`,
          old_upload_id: oldUpload.upload_id,
          new_upload_id: newUpload.upload_id,
        }); // FIX

        const result = await compareRolls(oldUpload.upload_id, newUpload.upload_id); // FIX

        console.debug('[DiffViewer] compareRolls response', {
          assumedStatus: 200,
          keys: Object.keys(result || {}),
          stats: result?.stats,
          addedCount: Array.isArray(result?.added) ? result.added.length : 'n/a',
          deletedCount: Array.isArray(result?.deleted) ? result.deleted.length : 'n/a',
          modifiedCount: Array.isArray(result?.modified) ? result.modified.length : 'n/a',
        }); // FIX
        console.debug('[DiffViewer] /api/compare raw payload', result); // FIX

        if (!result || !Array.isArray(result.added) || !Array.isArray(result.deleted) || !Array.isArray(result.modified)) {
          setError('Unexpected comparison response shape'); // FIX
          setDiffRows([]); // FIX
          return;
        }

        const rows = []; // FIX

        result.added.forEach((item) => {
          rows.push({
            id: item.voter_id,
            type: 'Addition',
            timestamp: item.registration_date || '',
            risk: 'Low',
          });
        }); // FIX

        result.deleted.forEach((item) => {
          rows.push({
            id: item.voter_id,
            type: 'Deletion',
            timestamp: item.registration_date || '',
            risk: 'High',
          });
        }); // FIX

        result.modified.forEach((item) => {
          rows.push({
            id: item.voter_id,
            type: 'Modification',
            timestamp: item.new?.registration_date || '',
            risk: 'Medium',
          });
        }); // FIX

        console.debug('[DiffViewer] Flattened diff rows', { rowCount: rows.length }); // FIX
        setDiffRows(rows); // FIX
      } catch (err) {
        console.debug('[DiffViewer] Error fetching diff data', {
          message: err?.message,
        }); // FIX
        setError(err?.message || 'Failed to load change data'); // FIX
        setDiffRows([]); // FIX
      } finally {
        setLoading(false); // FIX
      }
    };

    loadDiffData(); // FIX
  }, []); // FIX

  return (
    /* 🔒 HARD ISOLATION WRAPPER */
    <div className="min-h-screen w-full bg-white text-gray-900 opacity-100 flex-none block">
      {/* 🔒 PORTAL WIDTH CONTAINER */}
      <div className="w-full max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="bg-indigo-800 px-8 py-5">
          <h1 className="text-white text-3xl font-bold mb-1">
            Roll Change Analysis
          </h1>
          <p className="text-indigo-200 text-sm">
            Comparative analysis of electoral roll changes over time
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 space-y-8">

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Total Changes" value="1245" note="All changes" color="blue" />
            <SummaryCard title="Additions" value="687" note="New voters" color="green" />
            <SummaryCard title="Deletions" value="234" note="Removed entries" color="red" />
            <SummaryCard title="Modifications" value="324" note="Updated records" color="amber" />
          </div>

          {/* FILTERS */}
          <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
            <h2 className="text-indigo-800 text-xl font-bold mb-4">
              Filter Analysis
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FilterInput label="Start Date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </FilterInput>

              <FilterInput label="End Date">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </FilterInput>

              <FilterInput label="Change Type">
                <select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-900"
                >
                  <option>All</option>
                  <option>Addition</option>
                  <option>Deletion</option>
                  <option>Modification</option>
                </select>
              </FilterInput>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: VISUALS */}
            <div className="lg:col-span-2 space-y-6">
              <SectionHeader title="Visual Analysis" />

              <VisualCard title="Timeline of Changes" border="blue">
                Timeline visualization showing distribution of changes over time.
              </VisualCard>

              <VisualCard title="Geographical Heatmap" border="green">
                Spatial distribution of electoral roll changes across regions.
              </VisualCard>
            </div>

            {/* RIGHT: LEGENDS */}
            <div className="space-y-6">
              <LegendCard title="Change Type Legend">
                <LegendItem color="green" label="Additions" />
                <LegendItem color="red" label="Deletions" />
                <LegendItem color="amber" label="Modifications" />
              </LegendCard>

              <LegendCard title="Risk Score Legend">
                <LegendItem color="green" label="Low Risk" />
                <LegendItem color="amber" label="Medium Risk" />
                <LegendItem color="red" label="High Risk" />
              </LegendCard>
            </div>
          </div>

          {/* TABLE */}
          <SectionHeader title="Detailed Change Log" />

          <div className="bg-white border-2 border-gray-300 rounded overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  {['Voter ID', 'Change Type', 'Timestamp', 'Risk Score'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-800 text-sm">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200"
                      colSpan={4}
                    >
                      Loading change data...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td
                      className="px-4 py-3 text-sm text-red-700 border-b border-gray-200"
                      colSpan={4}
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && diffRows.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200"
                      colSpan={4}
                    >
                      No change data available.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  diffRows.map((row, i) => (
                    <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="cell">{row.id}</td>
                      <td className="cell">{row.type}</td>
                      <td className="cell">{row.timestamp}</td>
                      <td className={`cell font-semibold ${getRiskColor(row.risk)}`}>
                        {row.risk}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

/* -------- SMALL INTERNAL COMPONENTS (SAFE) -------- */

const SummaryCard = ({ title, value, note, color }) => (
  <div className={`bg-${color}-50 border-2 border-${color}-400 rounded-lg p-4`}>
    <h3 className="font-bold text-sm">{title}</h3>
    <p className={`text-3xl font-bold text-${color}-800`}>{value}</p>
    <p className="text-xs text-gray-600">{note}</p>
  </div>
);

const FilterInput = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    {children}
  </div>
);

const SectionHeader = ({ title }) => (
  <div className="bg-indigo-800 px-4 py-3 rounded">
    <h2 className="text-white font-bold">{title}</h2>
  </div>
);

const VisualCard = ({ title, border, children }) => (
  <div className={`bg-white border-2 border-${border}-400 rounded p-6`}>
    <h3 className="font-bold mb-3">{title}</h3>
    <div className="border-2 border-dashed border-gray-300 rounded p-10 text-center text-gray-700">
      {children}
    </div>
  </div>
);

const LegendCard = ({ title, children }) => (
  <div className="bg-white border-2 border-gray-300 rounded p-4">
    <h3 className="font-bold text-sm mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center">
    <span className={`w-3 h-3 rounded-full bg-${color}-600 mr-3`} />
    <span className="text-sm">{label}</span>
  </div>
);
const cell = "px-4 py-3 text-sm text-gray-900 border-b border-gray-200";

// All expected backend fields are handled; no backend changes required. // FIX