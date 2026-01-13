import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { compareRolls } from '../services/api';
import { Button } from '../components/ui/Button'
import { ChevronLeft, Home } from 'lucide-react'

export default function DiffViewer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState({ added: [], deleted: [], modified: [] });
  const [comparisonStats, setComparisonStats] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const uploads = location.state?.uploads || [];

  useEffect(() => {
    if (uploads.length < 2) {
      // Redirect or show empty state if not enough files
      // For now, if no data, we could just show loading or error
      setError("Please upload at least two files to view differences.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Compare the first two files found in the navigation state
        // Sort by upload path or just take index 0 and 1
        // Assuming index 0 is old, index 1 is new, or let backend decide? 
        // Best guess: logic in Upload page puts them in order. 
        // For distinct comparison, let's assume uploads[0] is Old, uploads[1] is New.
        const oldFile = uploads[0];
        const newFile = uploads[1];

        const result = await compareRolls(oldFile.upload_id, newFile.upload_id);

        setComparisonData({
          added: result.added || [],
          deleted: result.deleted || [],
          modified: result.modified || []
        });
        setComparisonStats(result.stats);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to compare files. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [uploads]);

  // Transform backend data into the flat structure expected by the UI
  // { date, constituencyId, constituencyName, changeType, count, riskLevel }
  const transformedData = useMemo(() => {
    const flatData = [];

    // Helper to process record list
    const processRecords = (records, type) => {
      records.forEach(rec => {
        // Backend record: { voter_id, name, age, address, registration_date, ... }
        // We need to derive 'Constituency' from address or mock it if missing
        // For visual demo, if address is missing, use "Unknown"
        // Mocking constituency extraction from address string for demo purposes
        // E.g. "123 Main St, Ward 15" -> "Ward 15"

        let constituencyName = "General Division";
        let constituencyId = "GEN-01";

        // Simple extraction logic or default
        if (rec.address && rec.address.toLowerCase().includes('ward')) {
          const match = rec.address.match(/Ward\s*-?\s*(\d+)/i);
          if (match) {
            const wardNum = match[1];
            constituencyName = `Municipal Ward ${wardNum}`;
            constituencyId = `ward-${wardNum}`;
          }
        }

        flatData.push({
          date: rec.registration_date, // YYYY-MM-DD
          constituencyId,
          constituencyName,
          changeType: type,
          count: 1, // Individual record
          riskLevel: 'Low', // Default risk, can be upgraded if backend provided alerts
          // Include raw data for details view
          details: rec
        });
      });
    };

    if (comparisonData.added) processRecords(comparisonData.added, 'Addition');
    if (comparisonData.deleted) processRecords(comparisonData.deleted, 'Deletion');

    // Modification data structure is different: { voter_id, old: {}, new: {}, changes: {} }
    // We use new.registration_date for timeline placement
    if (comparisonData.modified) {
      comparisonData.modified.forEach(mod => {
        const rec = mod.new;
        let constituencyName = "General Division";
        let constituencyId = "GEN-01";
        if (rec.address && rec.address.toLowerCase().includes('ward')) {
          const match = rec.address.match(/Ward\s*-?\s*(\d+)/i);
          if (match) {
            const wardNum = match[1];
            constituencyName = `Municipal Ward ${wardNum}`;
            constituencyId = `ward-${wardNum}`;
          }
        }

        flatData.push({
          date: rec.registration_date,
          constituencyId,
          constituencyName,
          changeType: 'Modification',
          count: 1,
          riskLevel: 'Medium', // Modifications are inherently worth checking
          details: mod
        });
      });
    }

    return flatData;
  }, [comparisonData]);

  // Calculate Date Ranges for Inputs
  const { minDateStr, maxDateStr } = useMemo(() => {
    if (transformedData.length === 0) return { minDateStr: '2020-01-01', maxDateStr: '2030-01-01' };
    const dates = transformedData.map(d => d.date).sort();
    return {
      minDateStr: dates[0],
      maxDateStr: dates[dates.length - 1]
    };
  }, [transformedData]);

  // Filter Logic
  const filteredData = useMemo(() => {
    let filtered = [...transformedData];

    if (changeType !== 'All') {
      filtered = filtered.filter(item => item.changeType === changeType);
    }

    if (startDate) {
      filtered = filtered.filter(item => item.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(item => item.date <= endDate);
    }

    return filtered;
  }, [transformedData, startDate, endDate, changeType]);


  // ---- AGGREGATION LOGIC (Reused from previous, updated dependencies) ----

  const summaryStats = useMemo(() => {
    // If we have actual backend stats, use them for total accuracy? 
    // Or aggregate from filteredData to respect filters.
    // Let's aggregate from filteredData to make the UI dynamic.
    const additions = filteredData.filter(d => d.changeType === 'Addition').reduce((sum, d) => sum + d.count, 0);
    const deletions = filteredData.filter(d => d.changeType === 'Deletion').reduce((sum, d) => sum + d.count, 0);
    const modifications = filteredData.filter(d => d.changeType === 'Modification').reduce((sum, d) => sum + d.count, 0);
    const total = additions + deletions + modifications;
    return { total, additions, deletions, modifications };
  }, [filteredData]);

  const timelineData = useMemo(() => {
    const dateMap = {};
    filteredData.forEach(item => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = { Addition: 0, Deletion: 0, Modification: 0 };
      }
      dateMap[item.date][item.changeType] += item.count;
    });

    const allDates = Object.keys(dateMap).sort();
    if (allDates.length === 0) return [];

    return allDates.map(date => {
      const data = dateMap[date];
      const changes = data.Addition + data.Deletion + data.Modification;
      let dominant = 'Addition';
      if (data.Deletion > data.Addition && data.Deletion > data.Modification) dominant = 'Deletion';
      else if (data.Modification > data.Addition) dominant = 'Modification';

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateKey: date,
        changes,
        dominant,
        full: data
      };
    });
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const constituencyMap = {};
    const constituencyRiskMap = {};

    filteredData.forEach(item => {
      if (!constituencyMap[item.constituencyId]) {
        constituencyMap[item.constituencyId] = { Addition: 0, Deletion: 0, Modification: 0 };
        constituencyRiskMap[item.constituencyId] = { name: item.constituencyName, risks: [] };
      }
      constituencyMap[item.constituencyId][item.changeType] += item.count;
      constituencyRiskMap[item.constituencyId].risks.push(item.riskLevel);
    });

    return Object.keys(constituencyMap).map(region => {
      const data = constituencyMap[region];
      const total = data.Addition + data.Deletion + data.Modification;
      const risks = constituencyRiskMap[region].risks;

      let riskLevel = 'Low';
      if (risks.includes('High')) riskLevel = 'High';
      else if (risks.includes('Medium')) riskLevel = 'Medium';

      return {
        region,
        fullName: constituencyRiskMap[region].name,
        changes: total,
        risk: riskLevel,
        breakdown: data
      };
    });
  }, [filteredData]);

  const maxChanges = useMemo(() => {
    return Math.max(...timelineData.map(d => d.changes), 1);
  }, [timelineData]);

  const getHeatmapColorByRisk = (riskLevel) => {
    if (riskLevel === 'Low') return 'bg-emerald-400 border-emerald-700';
    if (riskLevel === 'Medium') return 'bg-amber-500 border-amber-800';
    return 'bg-red-500 border-red-800';
  };

  const isSpike = (changes) => changes > 20; // Adjusted threshold for demo data

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (risk === 'High') return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700';
  };

  // Sample data list (first 100 rows for table)
  const listData = useMemo(() => {
    return filteredData.slice(0, 100).map((item, idx) => ({
      id: item.details?.voter_id || `VTR-${idx}`,
      type: item.changeType,
      timestamp: item.date,
      risk: item.riskLevel
    }));
  }, [filteredData]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="fixed top-4 left-4 flex gap-2 z-50">
          <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Link to="/">
            <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white">
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Analyzing Electoral Differences...</p>
        <p className="text-gray-400 text-sm mt-1">Comparing {uploads.length} files</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="fixed top-4 left-4 flex gap-2 z-50">
          <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Link to="/">
            <Button variant="secondary" size="sm" className="bg-white/90 shadow-sm hover:bg-white">
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-2">Comparison Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/upload')}>Return to Upload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 relative">

      {/* Home Button Overlay */}
      {/* Navigation Overlay */}
      <div className="fixed top-4 left-4 flex gap-2 z-50">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 shadow-md backdrop-blur text-gray-700 hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Link to="/">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 shadow-md backdrop-blur text-gray-700 hover:bg-white"
          >
            <Home className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>
      </div>

      <div className="bg-indigo-800 px-6 py-6 pt-16">
        <h1 className="text-white text-3xl font-bold mb-2">Roll Change Analysis</h1>
        <p className="text-indigo-200 text-sm">
          Comparing <span className="font-mono text-white">{uploads[0]?.filename}</span> vs <span className="font-mono text-white">{uploads[1]?.filename}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded shadow-lg p-4 border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Changes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summaryStats.total}</p>
          </div>
          <div className="bg-white rounded shadow-lg p-4 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Additions</h3>
            <p className="text-3xl font-bold text-green-600 mt-1">+{summaryStats.additions}</p>
          </div>
          <div className="bg-white rounded shadow-lg p-4 border-l-4 border-red-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Deletions</h3>
            <p className="text-3xl font-bold text-red-600 mt-1">-{summaryStats.deletions}</p>
          </div>
          <div className="bg-white rounded shadow-lg p-4 border-l-4 border-amber-500">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Modifications</h3>
            <p className="text-3xl font-bold text-amber-600 mt-1">~{summaryStats.modifications}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-300 rounded p-6 mb-6">
          <h2 className="text-gray-800 text-xl font-bold mb-4">Filter Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={minDateStr}
                max={maxDateStr}
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || minDateStr}
                max={maxDateStr}
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Change Type</label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-800"
              >
                <option value="All">All Changes</option>
                <option value="Addition">Additions Only</option>
                <option value="Deletion">Deletions Only</option>
                <option value="Modification">Modifications Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className="bg-white border-2 border-blue-400 rounded-b p-6 mb-4">
            <h3 className="text-gray-800 font-bold text-base mb-4">Timeline of Changes</h3>
            <div className="p-4">
              {timelineData.length > 0 ? (
                <>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400"></div>
                    <div className="flex items-end justify-between h-72 sm:h-56 gap-1 overflow-x-auto">
                      {timelineData.map((item, index) => {
                        const height = (item.changes / maxChanges) * 100;
                        const spike = isSpike(item.changes);
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 relative min-w-[10px]">
                            <div
                              className={`w-full ${spike ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-t relative group cursor-pointer transition-all`}
                              style={{ height: `${height}%`, minHeight: '8px' }}
                            >
                              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-20 shadow-lg">
                                <div className="font-bold mb-1">{item.date}</div>
                                <div className="text-gray-200">{item.changes} changes</div>
                                <div className="text-gray-300 text-xs">Type: {item.dominant}</div>
                              </div>
                              {spike && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-1">
                                  <div className="bg-red-600 text-white text-xs px-1 rounded font-bold">!</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No data available for selected filters
                </div>
              )}
              <div className="mt-6 flex items-center justify-center gap-6">
                {/* Legend code same as before */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-8 bg-blue-600 rounded-t"></div>
                  <span className="text-gray-700 text-xs">Normal Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-8 bg-red-600 rounded-t"></div>
                  <span className="text-gray-700 text-xs">Spike (High Volume)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-green-400 rounded p-6">
            <h3 className="text-gray-800 font-bold text-base mb-4">Constituency/Region Heatmap</h3>
            <div className="p-4">
              {heatmapData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {heatmapData.map((item, index) => (
                    <div
                      key={index}
                      className={`${getHeatmapColorByRisk(item.risk)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                      title={`${item.region}: ${item.changes} changes`}
                      onClick={() => setSelectedConstituency(item)}
                    >
                      <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                      {/* Tooltip logic simplified/kept */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No regional data available
                </div>
              )}
              {/* Legend */}
            </div>
          </div>
        </div>

        {/* Sidebar Legends - reused */}
        <div className="lg:col-span-1">
          {/* Legend Blocks */}
          <div className="bg-white border-2 border-gray-300 rounded p-4 mb-4">
            <h3 className="text-gray-800 font-bold text-sm mb-4">Change Type Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-600 mr-3"></div><span className="text-gray-800 text-sm">Additions</span></div>
              <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-red-600 mr-3"></div><span className="text-gray-800 text-sm">Deletions</span></div>
              <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-amber-600 mr-3"></div><span className="text-gray-800 text-sm">Modifications</span></div>
            </div>
          </div>
          {/* Risk Legend */}
          <div className="bg-white border-2 border-gray-300 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-4">Risk Levels/Intensity</h3>
            <div className="space-y-3">
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-emerald-400 border border-emerald-700 mr-3"></div><span className="text-gray-800 text-sm">Low (Normal)</span></div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-amber-500 border border-amber-800 mr-3"></div><span className="text-gray-800 text-sm">Medium (Watch)</span></div>
              <div className="flex items-center"><div className="w-4 h-4 rounded bg-red-500 border border-red-800 mr-3"></div><span className="text-gray-800 text-sm">High (Anomalous)</span></div>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white border-2 border-gray-300 rounded p-6 mb-8">
          <h3 className="text-gray-800 font-bold text-xl mb-4">Detailed Change Log</h3>
          <p className="text-gray-500 text-sm mb-4">Showing first {Math.min(filteredData.length, 100)} records</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-bold text-sm uppercase">Voter ID</th>
                  <th className="px-4 py-3 text-gray-700 font-bold text-sm uppercase">Type</th>
                  <th className="px-4 py-3 text-gray-700 font-bold text-sm uppercase">Date</th>
                  <th className="px-4 py-3 text-gray-700 font-bold text-sm uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">{row.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.type === 'Addition' ? 'bg-green-100 text-green-800' :
                        row.type === 'Deletion' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.timestamp}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getRiskColor(row.risk)}`}>
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedConstituency && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedConstituency(null)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedConstituency.fullName}</h3>
              <p className="text-gray-600 mb-4">Region ID: {selectedConstituency.region}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Total Changes</span>
                  <span className="font-bold text-indigo-600">{selectedConstituency.changes}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-green-600 font-bold text-lg">+{selectedConstituency.breakdown.Addition}</div>
                    <div className="text-green-800 text-xs">Added</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-red-600 font-bold text-lg">-{selectedConstituency.breakdown.Deletion}</div>
                    <div className="text-red-800 text-xs">Deleted</div>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded">
                    <div className="text-amber-600 font-bold text-lg">~{selectedConstituency.breakdown.Modification}</div>
                    <div className="text-amber-800 text-xs">Modified</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedConstituency(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}