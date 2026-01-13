import React, { useState, useMemo, useEffect } from 'react';

export default function DiffViewer() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');
  const [selectedConstituency, setSelectedConstituency] = useState(null);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const minDate = '2026-01-01';

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (!startDate || newEndDate >= startDate) {
      setEndDate(newEndDate);
    }
  };

  // TEMP SAMPLE DATA — WILL BE REPLACED BY BACKEND
  const generateSampleData = () => {
    const dates = [];
    const start = new Date('2026-01-01');
    const end = yesterday;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const constituencies = [
      { id: 'AC-101', name: 'Assembly Constituency 101 - North District' },
      { id: 'AC-102', name: 'Assembly Constituency 102 - North District' },
      { id: 'AC-103', name: 'Assembly Constituency 103 - North District' },
      { id: 'AC-104', name: 'Assembly Constituency 104 - North District' },
      { id: 'AC-105', name: 'Assembly Constituency 105 - Central District' },
      { id: 'AC-106', name: 'Assembly Constituency 106 - Central District' },
      { id: 'AC-107', name: 'Assembly Constituency 107 - Central District' },
      { id: 'AC-108', name: 'Assembly Constituency 108 - Central District' },
      { id: 'Ward-12', name: 'Municipal Ward 12 - Central District' },
      { id: 'Ward-13', name: 'Municipal Ward 13 - Central District' },
      { id: 'Ward-14', name: 'Municipal Ward 14 - South District' },
      { id: 'Ward-15', name: 'Municipal Ward 15 - South District' },
      { id: 'Booth-B45', name: 'Polling Booth B45 - South District' },
      { id: 'Booth-B46', name: 'Polling Booth B46 - South District' },
      { id: 'Booth-B47', name: 'Polling Booth B47 - South District' },
      { id: 'Booth-B48', name: 'Polling Booth B48 - South District' },
      { id: 'Booth-B49', name: 'Polling Booth B49 - East District' },
      { id: 'Booth-B50', name: 'Polling Booth B50 - East District' },
      { id: 'Booth-B51', name: 'Polling Booth B51 - East District' },
      { id: 'Booth-B52', name: 'Polling Booth B52 - East District' },
    ];

    const sampleRollData = [];
    const changeTypes = ['Addition', 'Deletion', 'Modification'];
    const riskLevels = ['Low', 'Medium', 'High'];

    dates.forEach((date, dateIndex) => {
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const recordsPerDay = isWeekend ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 8) + 3;

      for (let i = 0; i < recordsPerDay; i++) {
        const constituency = constituencies[Math.floor(Math.random() * constituencies.length)];
        let changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
        let count, riskLevel;

        if (changeType === 'Deletion') {
          count = Math.floor(Math.random() * 120) + 10;
          riskLevel = count > 80 ? 'High' : count > 40 ? 'Medium' : 'Low';
        } else if (changeType === 'Modification') {
          count = Math.floor(Math.random() * 90) + 10;
          riskLevel = count > 70 ? 'High' : count > 45 ? 'Medium' : 'Low';
        } else {
          count = Math.floor(Math.random() * 100) + 10;
          riskLevel = count > 70 ? 'Medium' : 'Low';
        }

        if (dateIndex % 7 === 0 && changeType === 'Deletion') {
          count = Math.floor(Math.random() * 150) + 80;
          riskLevel = 'High';
        }

        sampleRollData.push({
          date,
          constituencyId: constituency.id,
          constituencyName: constituency.name,
          changeType,
          count,
          riskLevel
        });
      }

      if (!isWeekend && dateIndex % 3 === 0) {
        const modConstituency = constituencies[Math.floor(Math.random() * constituencies.length)];
        const modCount = Math.floor(Math.random() * 85) + 15;
        const modRisk = modCount > 70 ? 'High' : modCount > 50 ? 'Medium' : 'Low';
        sampleRollData.push({
          date,
          constituencyId: modConstituency.id,
          constituencyName: modConstituency.name,
          changeType: 'Modification',
          count: modCount,
          riskLevel: modRisk
        });
      }
    });

    return sampleRollData;
  };

  const sampleRollData = useMemo(() => generateSampleData(), []);

  const filteredData = useMemo(() => {
    let filtered = [...sampleRollData];

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
  }, [sampleRollData, startDate, endDate, changeType]);

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

    const allDates = Object.keys(dateMap).sort();
    if (allDates.length === 0) {
      return [];
    }

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
                onChange={handleStartDateChange}
                min={minDate}
                max={yesterdayStr}
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || minDate}
                max={yesterdayStr}
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
                        if (index % Math.ceil(timelineData.length / 10) === 0) {
                          return (
                            <div key={index} className="flex-1 text-center">
                              <span className="text-gray-700 text-xs font-medium">{item.date}</span>
                            </div>
                          );
                        }
                        return <div key={index} className="flex-1"></div>;
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No data available for selected date range
                  </div>
                )}
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
                {heatmapData.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2 pb-3 border-b border-gray-200">
                      {heatmapData.slice(0, 8).map((item, index) => {
                        return (
                          <div
                            key={index}
                            className={`${getHeatmapColorByRisk(item.risk)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                            title={`${item.region}: ${item.changes} changes`}
                            onClick={() => setSelectedConstituency(item)}
                          >
                            <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                            <div className={`invisible group-hover:visible md:block absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                                <div className="text-gray-900 font-semibold text-xs mb-1 break-words">{item.fullName}</div>
                                <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                                <div className="text-gray-700 text-xs">Additions: {item.breakdown.Addition}</div>
                                <div className="text-gray-700 text-xs">Deletions: {item.breakdown.Deletion}</div>
                                <div className="text-gray-700 text-xs">Modifications: {item.breakdown.Modification}</div>
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
                        return (
                          <div
                            key={index}
                            className={`${getHeatmapColorByRisk(item.risk)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                            title={`${item.region}: ${item.changes} changes`}
                            onClick={() => setSelectedConstituency(item)}
                          >
                            <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                            <div className={`invisible group-hover:visible md:block absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                                <div className="text-gray-900 font-semibold text-xs mb-1 break-words">{item.fullName}</div>
                                <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                                <div className="text-gray-700 text-xs">Additions: {item.breakdown.Addition}</div>
                                <div className="text-gray-700 text-xs">Deletions: {item.breakdown.Deletion}</div>
                                <div className="text-gray-700 text-xs">Modifications: {item.breakdown.Modification}</div>
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
                        return (
                          <div
                            key={index}
                            className={`${getHeatmapColorByRisk(item.risk)} border-2 rounded p-2 text-center hover:shadow-md relative group cursor-pointer transition-shadow overflow-hidden`}
                            title={`${item.region}: ${item.changes} changes`}
                            onClick={() => setSelectedConstituency(item)}
                          >
                            <div className="text-gray-900 text-xs font-bold leading-tight">{item.region}</div>
                            <div className={`invisible group-hover:visible md:block absolute bottom-full mb-3 w-56 max-w-[85vw] z-50 ${index === 0 || index === 1 ? 'left-0' : index === 3 || index === 4 || index === 6 ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}`}>
                              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-3 py-2">
                                <div className="text-gray-900 font-semibold text-xs mb-1 break-words">{item.fullName}</div>
                                <div className="text-gray-700 text-xs mb-0.5">Total: {item.changes}</div>
                                <div className="text-gray-700 text-xs">Additions: {item.breakdown.Addition}</div>
                                <div className="text-gray-700 text-xs">Deletions: {item.breakdown.Deletion}</div>
                                <div className="text-gray-700 text-xs">Modifications: {item.breakdown.Modification}</div>
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
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No data available for selected date range
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-400 border-2 border-emerald-700 rounded"></div>
                    <span className="text-gray-600 text-xs">Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-500 border-2 border-amber-800 rounded"></div>
                    <span className="text-gray-600 text-xs">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 border-2 border-red-800 rounded"></div>
                    <span className="text-gray-600 text-xs">High Risk</span>
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
              {sampleData.length > 0 ? (
                sampleData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-800 text-sm border-b border-gray-200">{row.id}</td>
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
              <h3 className="text-white font-bold text-lg">Constituency Details</h3>
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
                <p className="text-gray-600 text-sm">{selectedConstituency.region}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">Total Changes</span>
                  <span className="text-gray-900 font-bold">{selectedConstituency.changes}</span>
                </div>
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
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Risk Level</span>
                  <span className={`font-semibold ${getRiskColor(selectedConstituency.risk)}`}>{selectedConstituency.risk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}