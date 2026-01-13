import React, { useState, useMemo } from 'react';

export default function DiffViewer() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');

  const rawData = [
    { constituencyId: 'AC-101', changeType: 'Addition', date: '2024-01-05', count: 23, riskLevel: 'Low' },
    { constituencyId: 'AC-101', changeType: 'Modification', date: '2024-01-05', count: 12, riskLevel: 'Low' },
    { constituencyId: 'AC-101', changeType: 'Deletion', date: '2024-01-11', count: 45, riskLevel: 'Medium' },
    { constituencyId: 'AC-101', changeType: 'Addition', date: '2024-01-15', count: 34, riskLevel: 'Low' },
    { constituencyId: 'AC-101', changeType: 'Modification', date: '2024-01-20', count: 31, riskLevel: 'Medium' },
    { constituencyId: 'AC-102', changeType: 'Addition', date: '2024-01-06', count: 18, riskLevel: 'Low' },
    { constituencyId: 'AC-102', changeType: 'Modification', date: '2024-01-09', count: 25, riskLevel: 'Low' },
    { constituencyId: 'AC-102', changeType: 'Addition', date: '2024-01-13', count: 24, riskLevel: 'Low' },
    { constituencyId: 'AC-103', changeType: 'Addition', date: '2024-01-07', count: 45, riskLevel: 'Medium' },
    { constituencyId: 'AC-103', changeType: 'Deletion', date: '2024-01-11', count: 89, riskLevel: 'High' },
    { constituencyId: 'AC-103', changeType: 'Deletion', date: '2024-01-12', count: 100, riskLevel: 'High' },
    { constituencyId: 'AC-103', changeType: 'Modification', date: '2024-01-17', count: 0, riskLevel: 'Low' },
    { constituencyId: 'AC-104', changeType: 'Addition', date: '2024-01-08', count: 32, riskLevel: 'Low' },
    { constituencyId: 'AC-104', changeType: 'Modification', date: '2024-01-14', count: 28, riskLevel: 'Low' },
    { constituencyId: 'AC-104', changeType: 'Addition', date: '2024-01-18', count: 29, riskLevel: 'Low' },
    { constituencyId: 'AC-105', changeType: 'Addition', date: '2024-01-10', count: 67, riskLevel: 'Medium' },
    { constituencyId: 'AC-105', changeType: 'Deletion', date: '2024-01-21', count: 78, riskLevel: 'High' },
    { constituencyId: 'AC-105', changeType: 'Modification', date: '2024-01-23', count: 33, riskLevel: 'Medium' },
    { constituencyId: 'AC-106', changeType: 'Addition', date: '2024-01-05', count: 15, riskLevel: 'Low' },
    { constituencyId: 'AC-106', changeType: 'Modification', date: '2024-01-16', count: 20, riskLevel: 'Low' },
    { constituencyId: 'AC-106', changeType: 'Addition', date: '2024-01-19', count: 10, riskLevel: 'Low' },
    { constituencyId: 'AC-107', changeType: 'Addition', date: '2024-01-07', count: 56, riskLevel: 'Medium' },
    { constituencyId: 'AC-107', changeType: 'Deletion', date: '2024-01-11', count: 98, riskLevel: 'High' },
    { constituencyId: 'AC-107', changeType: 'Deletion', date: '2024-01-12', count: 49, riskLevel: 'High' },
    { constituencyId: 'AC-107', changeType: 'Modification', date: '2024-01-20', count: 0, riskLevel: 'Low' },
    { constituencyId: 'AC-108', changeType: 'Addition', date: '2024-01-09', count: 48, riskLevel: 'Medium' },
    { constituencyId: 'AC-108', changeType: 'Modification', date: '2024-01-14', count: 39, riskLevel: 'Medium' },
    { constituencyId: 'AC-108', changeType: 'Addition', date: '2024-01-22', count: 35, riskLevel: 'Medium' },
    { constituencyId: 'Ward-12', changeType: 'Addition', date: '2024-01-06', count: 22, riskLevel: 'Low' },
    { constituencyId: 'Ward-12', changeType: 'Modification', date: '2024-01-10', count: 18, riskLevel: 'Low' },
    { constituencyId: 'Ward-12', changeType: 'Addition', date: '2024-01-15', count: 16, riskLevel: 'Low' },
    { constituencyId: 'Ward-13', changeType: 'Addition', date: '2024-01-08', count: 52, riskLevel: 'Medium' },
    { constituencyId: 'Ward-13', changeType: 'Deletion', date: '2024-01-11', count: 68, riskLevel: 'High' },
    { constituencyId: 'Ward-13', changeType: 'Deletion', date: '2024-01-12', count: 69, riskLevel: 'High' },
    { constituencyId: 'Ward-13', changeType: 'Modification', date: '2024-01-17', count: 0, riskLevel: 'Low' },
    { constituencyId: 'Ward-14', changeType: 'Addition', date: '2024-01-09', count: 41, riskLevel: 'Medium' },
    { constituencyId: 'Ward-14', changeType: 'Modification', date: '2024-01-14', count: 32, riskLevel: 'Medium' },
    { constituencyId: 'Ward-14', changeType: 'Addition', date: '2024-01-18', count: 25, riskLevel: 'Low' },
    { constituencyId: 'Ward-15', changeType: 'Addition', date: '2024-01-10', count: 58, riskLevel: 'Medium' },
    { constituencyId: 'Ward-15', changeType: 'Deletion', date: '2024-01-21', count: 72, riskLevel: 'High' },
    { constituencyId: 'Ward-15', changeType: 'Modification', date: '2024-01-23', count: 37, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B45', changeType: 'Addition', date: '2024-01-05', count: 12, riskLevel: 'Low' },
    { constituencyId: 'Booth-B45', changeType: 'Modification', date: '2024-01-16', count: 14, riskLevel: 'Low' },
    { constituencyId: 'Booth-B45', changeType: 'Addition', date: '2024-01-19', count: 8, riskLevel: 'Low' },
    { constituencyId: 'Booth-B46', changeType: 'Addition', date: '2024-01-07', count: 78, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B46', changeType: 'Deletion', date: '2024-01-11', count: 65, riskLevel: 'High' },
    { constituencyId: 'Booth-B46', changeType: 'Deletion', date: '2024-01-12', count: 67, riskLevel: 'High' },
    { constituencyId: 'Booth-B47', changeType: 'Addition', date: '2024-01-08', count: 28, riskLevel: 'Low' },
    { constituencyId: 'Booth-B47', changeType: 'Modification', date: '2024-01-14', count: 26, riskLevel: 'Low' },
    { constituencyId: 'Booth-B47', changeType: 'Addition', date: '2024-01-18', count: 22, riskLevel: 'Low' },
    { constituencyId: 'Booth-B48', changeType: 'Addition', date: '2024-01-09', count: 62, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B48', changeType: 'Deletion', date: '2024-01-21', count: 48, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B48', changeType: 'Modification', date: '2024-01-23', count: 35, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B49', changeType: 'Addition', date: '2024-01-06', count: 20, riskLevel: 'Low' },
    { constituencyId: 'Booth-B49', changeType: 'Modification', date: '2024-01-10', count: 18, riskLevel: 'Low' },
    { constituencyId: 'Booth-B49', changeType: 'Addition', date: '2024-01-15', count: 14, riskLevel: 'Low' },
    { constituencyId: 'Booth-B50', changeType: 'Addition', date: '2024-01-07', count: 89, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B50', changeType: 'Deletion', date: '2024-01-11', count: 54, riskLevel: 'High' },
    { constituencyId: 'Booth-B50', changeType: 'Deletion', date: '2024-01-12', count: 55, riskLevel: 'High' },
    { constituencyId: 'Booth-B51', changeType: 'Addition', date: '2024-01-08', count: 48, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B51', changeType: 'Modification', date: '2024-01-14', count: 38, riskLevel: 'Medium' },
    { constituencyId: 'Booth-B51', changeType: 'Addition', date: '2024-01-22', count: 26, riskLevel: 'Low' },
    { constituencyId: 'Booth-B52', changeType: 'Addition', date: '2024-01-09', count: 35, riskLevel: 'Low' },
    { constituencyId: 'Booth-B52', changeType: 'Modification', date: '2024-01-14', count: 28, riskLevel: 'Low' },
    { constituencyId: 'Booth-B52', changeType: 'Addition', date: '2024-01-18', count: 20, riskLevel: 'Low' },
  ];

  const filteredData = useMemo(() => {
    let filtered = [...rawData];

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
  }, [startDate, endDate, changeType]);

  const summaryStats = useMemo(() => {
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

    const dates = ['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21', '2024-01-22', '2024-01-23', '2024-01-24'];

    return dates.map(date => {
      const data = dateMap[date] || { Addition: 0, Deletion: 0, Modification: 0 };
      const changes = data.Addition + data.Deletion + data.Modification;
      let dominant = 'Addition';
      if (data.Deletion > data.Addition && data.Deletion > data.Modification) dominant = 'Deletion';
      else if (data.Modification > data.Addition) dominant = 'Modification';

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        changes,
        dominant,
        full: data
      };
    });
  }, [filteredData]);

  const heatmapData = useMemo(() => {
    const constituencyMap = {};
    filteredData.forEach(item => {
      if (!constituencyMap[item.constituencyId]) {
        constituencyMap[item.constituencyId] = { Addition: 0, Deletion: 0, Modification: 0 };
      }
      constituencyMap[item.constituencyId][item.changeType] += item.count;
    });

    const fullNames = {
      'AC-101': 'Assembly Constituency 101 - North District',
      'AC-102': 'Assembly Constituency 102 - North District',
      'AC-103': 'Assembly Constituency 103 - North District',
      'AC-104': 'Assembly Constituency 104 - North District',
      'AC-105': 'Assembly Constituency 105 - Central District',
      'AC-106': 'Assembly Constituency 106 - Central District',
      'AC-107': 'Assembly Constituency 107 - Central District',
      'AC-108': 'Assembly Constituency 108 - Central District',
      'Ward-12': 'Municipal Ward 12 - Central District',
      'Ward-13': 'Municipal Ward 13 - Central District',
      'Ward-14': 'Municipal Ward 14 - South District',
      'Ward-15': 'Municipal Ward 15 - South District',
      'Booth-B45': 'Polling Booth B45 - South District',
      'Booth-B46': 'Polling Booth B46 - South District',
      'Booth-B47': 'Polling Booth B47 - South District',
      'Booth-B48': 'Polling Booth B48 - South District',
      'Booth-B49': 'Polling Booth B49 - East District',
      'Booth-B50': 'Polling Booth B50 - East District',
      'Booth-B51': 'Polling Booth B51 - East District',
      'Booth-B52': 'Polling Booth B52 - East District',
    };

    return Object.keys(constituencyMap).map(region => {
      const data = constituencyMap[region];
      const total = data.Addition + data.Deletion + data.Modification;
      let risk = 'Low';
      if (total >= 150) risk = 'High';
      else if (total >= 80) risk = 'Medium';

      return {
        region,
        fullName: fullNames[region] || region,
        changes: total,
        risk,
        breakdown: data
      };
    });
  }, [filteredData]);

  const maxChanges = useMemo(() => {
    return Math.max(...timelineData.map(d => d.changes), 1);
  }, [timelineData]);

  const getHeatmapColor = (changes) => {
    if (changes < 80) return 'bg-emerald-300 border-emerald-600';
    if (changes < 150) return 'bg-amber-400 border-amber-700';
    return 'bg-red-400 border-red-700';
  };

  const isSpike = (changes) => changes > 120;

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-green-700';
    if (risk === 'Medium') return 'text-amber-600';
    if (risk === 'High') return 'text-red-700';
    return 'text-gray-800';
  };

  const sampleData = useMemo(() => {
    return filteredData.slice(0, 6).map((item, idx) => ({
      id: `VTR00${1234 + idx}`,
      type: item.changeType,
      timestamp: new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      risk: item.riskLevel
    }));
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="bg-indigo-800 px-6 py-6">
        <h1 className="text-white text-3xl font-bold mb-2">Roll Change Analysis</h1>
        <p className="text-indigo-200 text-sm">Comparative analysis of electoral roll changes over time</p>
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
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                <div className="relative">
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400"></div>
                  <div className="flex items-end justify-between h-72 sm:h-56 gap-1">
                    {timelineData.map((item, index) => {
                      const height = (item.changes / maxChanges) * 100;
                      const spike = isSpike(item.changes);
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 relative">
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
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-2 bg-gray-400"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between mt-3 px-1">
                  {timelineData.map((item, index) => {
                    if (index % 2 === 0) {
                      return (
                        <div key={index} className="flex-1 text-center">
                          <span className="text-gray-700 text-xs font-medium">{item.date}</span>
                        </div>
                      );
                    }
                    return <div key={index} className="flex-1"></div>;
                  })}
                </div>
                <div className="mt-6 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-8 bg-blue-600 rounded-t"></div>
                    <span className="text-gray-700 text-xs">Normal Volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-8 bg-red-600 rounded-t"></div>
                    <span className="text-gray-700 text-xs">Spike (High Volume)</span>
                  </div>
                </div>
                <div className="mt-4 text-center border-t border-gray-200 pt-3">
                  <span className="text-gray-600 text-xs italic">
                    Spikes indicate abnormal volume of roll modifications.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-300 rounded p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-800 font-semibold text-sm mb-1">Analytical Observation</h4>
                  <p className="text-gray-700 text-xs">
                    Jan 11–12 shows a 2.4× spike in deletions concentrated in AC-103, AC-107, and Ward-13. Combined deletion count: 487 records across three constituencies.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-green-400 rounded p-6">
              <h3 className="text-gray-800 font-bold text-base mb-4">Geographical Heatmap</h3>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2 pb-3 border-b border-gray-200">
                    {heatmapData.slice(0, 8).map((item, index) => {
                      const isDeletionFocus = changeType === 'Deletion';
                      const highlightValue = isDeletionFocus ? item.breakdown.Deletion : item.changes;
                      return (
                        <div
                          key={index}
                          className={`${getHeatmapColor(highlightValue)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                          title={`${item.region}: ${item.changes} changes`}
                        >
                          <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                          <div className={`invisible group-hover:visible absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                              <div className="text-gray-900 font-semibold text-xs mb-1">{item.fullName}</div>
                              <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Additions: {item.breakdown.Addition}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Deletions: {item.breakdown.Deletion}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Modifications: {item.breakdown.Modification}</div>
                              <div className="text-gray-700 text-xs mt-1">Risk: {item.risk}</div>
                            </div>
                            <div className={`absolute top-full -mt-px ${index === 0 || index === 1 ? 'left-6' : index === 3 || index === 4 ? 'right-6' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="border-6 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-5 gap-2 pb-3 border-b border-gray-200">
                    {heatmapData.slice(8, 13).map((item, index) => {
                      const isDeletionFocus = changeType === 'Deletion';
                      const highlightValue = isDeletionFocus ? item.breakdown.Deletion : item.changes;
                      return (
                        <div
                          key={index}
                          className={`${getHeatmapColor(highlightValue)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                          title={`${item.region}: ${item.changes} changes`}
                        >
                          <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                          <div className={`invisible group-hover:visible absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                              <div className="text-gray-900 font-semibold text-xs mb-1">{item.fullName}</div>
                              <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Additions: {item.breakdown.Addition}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Deletions: {item.breakdown.Deletion}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Modifications: {item.breakdown.Modification}</div>
                              <div className="text-gray-700 text-xs mt-1">Risk: {item.risk}</div>
                            </div>
                            <div className={`absolute top-full -mt-px ${index === 0 || index === 1 ? 'left-6' : index === 3 || index === 4 ? 'right-6' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="border-6 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {heatmapData.slice(13).map((item, index) => {
                      const isDeletionFocus = changeType === 'Deletion';
                      const highlightValue = isDeletionFocus ? item.breakdown.Deletion : item.changes;
                      return (
                        <div
                          key={index}
                          className={`${getHeatmapColor(highlightValue)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                          title={`${item.region}: ${item.changes} changes`}
                        >
                          <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                          <div className={`invisible group-hover:visible absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 || index === 6 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                              <div className="text-gray-900 font-semibold text-xs mb-1">{item.fullName}</div>
                              <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Additions: {item.breakdown.Addition}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Deletions: {item.breakdown.Deletion}</div>
                              <div className={`text-gray-700 text-xs ${isDeletionFocus && item.breakdown.Deletion > 0 ? 'font-bold' : ''}`}>Modifications: {item.breakdown.Modification}</div>
                              <div className="text-gray-700 text-xs mt-1">Risk: {item.risk}</div>
                            </div>
                            <div className={`absolute top-full -mt-px ${index === 0 || index === 1 ? 'left-6' : index === 3 || index === 4 || index === 6 ? 'right-6' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="border-6 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-300 border-2 border-emerald-600 rounded"></div>
                    <span className="text-gray-600 text-xs">Low (&lt;80)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-400 border-2 border-amber-700 rounded"></div>
                    <span className="text-gray-600 text-xs">Medium (80-150)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-400 border-2 border-red-700 rounded"></div>
                    <span className="text-gray-600 text-xs">High (&gt;150)</span>
                  </div>
                </div>
                <div className="mt-3 text-gray-600 text-xs text-center italic">
                  Darker cells indicate concentrated roll activity requiring verification.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-300 rounded p-4 mb-4">
              <h3 className="text-gray-800 font-bold text-sm mb-4">Change Type Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">Additions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">Deletions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-amber-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">Modifications</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded p-4">
              <h3 className="text-gray-800 font-bold text-sm mb-4">Risk Score Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">Low Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-amber-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 mr-3"></div>
                  <span className="text-gray-800 text-sm">High Risk</span>
                </div>
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
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Timestamp</th>
                <th className="px-4 py-3 text-left text-gray-800 font-bold text-sm">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.id}</td>
                  <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.type}</td>
                  <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.timestamp}</td>
                  <td className={`px-4 py-3 text-sm font-semibold border-b border-gray-200 ${getRiskColor(row.risk)}`}>
                    {row.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}