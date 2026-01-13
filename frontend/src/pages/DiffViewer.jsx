import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { compareRolls } from '../services/api';
import { Button } from '../components/ui/Button'
import { ChevronLeft } from 'lucide-react'

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
    if (risk === 'Low') return 'text-green-700';
    if (risk === 'Medium') return 'text-amber-600';
    if (risk === 'High') return 'text-red-700';
    return 'text-gray-800';
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
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 shadow-md backdrop-blur text-gray-700 hover:bg-white"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back Home
        </Button>
      </div>

      <div className="bg-indigo-800 px-6 py-6 pt-16">
        <h1 className="text-white text-3xl font-bold mb-2">Roll Change Analysis</h1>
        <p className="text-indigo-200 text-sm">
          Comparing <span className="font-mono text-white">{uploads[0]?.filename}</span> vs <span className="font-mono text-white">{uploads[1]?.filename}</span>
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border-2 border-blue-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Total Changes</h3>
            <p className="text-blue-800 text-3xl font-bold mb-1">{summaryStats.total}</p>
            <p className="text-gray-600 text-xs">All modifications tracked</p>
          </div>

          <div className="bg-green-50 border-2 border-green-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Additions</h3>
            <p className="text-green-800 text-3xl font-bold mb-1">{summaryStats.additions}</p>
            <p className="text-gray-600 text-xs">New voter registrations</p>
          </div>

          <div className="bg-red-50 border-2 border-red-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Deletions</h3>
            <p className="text-red-800 text-3xl font-bold mb-1">{summaryStats.deletions}</p>
            <p className="text-gray-600 text-xs">Removed entries</p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Modifications</h3>
            <p className="text-amber-800 text-3xl font-bold mb-1">{summaryStats.modifications}</p>
            <p className="text-gray-600 text-xs">Updated records</p>
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
                <option>All</option>
                <option>Addition</option>
                <option>Deletion</option>
                <option>Modification</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-indigo-800 px-4 py-3 rounded-t">
              <h2 className="text-white text-lg font-bold">Visual Analysis</h2>
            </div>

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
          </div>
        </div>

        <div className="bg-indigo-800 px-4 py-3 rounded-t">
          <h2 className="text-white text-lg font-bold">Detailed Change Log</h2>
        </div>

        <div className="bg-white border-2 border-gray-300 rounded-b overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Voter ID</th>
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Change Type</th>
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Date</th>
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {listData.length > 0 ? (
                listData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200 font-mono">{row.id}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.type}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.timestamp}</td>
                    <td className={`px-4 py-3 text-sm font-semibold border-b border-gray-200 ${getRiskColor(row.risk)}`}>
                      {row.risk}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500 text-sm">
                    No data available for selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 text-center text-gray-500 text-xs text-italic">
            Showing first {Math.min(100, listData.length)} records
          </div>
        </div>
      </div>

      {selectedConstituency && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center md:p-4"
          onClick={() => setSelectedConstituency(null)}
        >
          <div
            className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-indigo-800 px-4 py-3 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Region Details</h3>
              <button
                onClick={() => setSelectedConstituency(null)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-gray-900 font-semibold text-base mb-2 break-words">{selectedConstituency.fullName}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Total Changes</span>
                  <span className="text-gray-900 font-bold">{selectedConstituency.changes}</span>
                </div>
                {/* Breakdown details */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Additions</span>
                  <span className="text-green-700 font-semibold">{selectedConstituency.breakdown.Addition}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Deletions</span>
                  <span className="text-red-700 font-semibold">{selectedConstituency.breakdown.Deletion}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Modifications</span>
                  <span className="text-amber-700 font-semibold">{selectedConstituency.breakdown.Modification}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}