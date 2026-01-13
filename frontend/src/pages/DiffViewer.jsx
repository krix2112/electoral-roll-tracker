import React, { useState } from 'react';

export default function DiffViewer() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [changeType, setChangeType] = useState('All');

  const sampleData = [
    { id: 'VTR001234', type: 'Addition', timestamp: '2024-01-15 10:30 AM', risk: 'Low' },
    { id: 'VTR001235', type: 'Deletion', timestamp: '2024-01-15 11:45 AM', risk: 'High' },
    { id: 'VTR001236', type: 'Modification', timestamp: '2024-01-15 02:15 PM', risk: 'Medium' },
    { id: 'VTR001237', type: 'Addition', timestamp: '2024-01-15 03:20 PM', risk: 'Low' },
    { id: 'VTR001238', type: 'Modification', timestamp: '2024-01-15 04:30 PM', risk: 'Medium' },
    { id: 'VTR001239', type: 'Deletion', timestamp: '2024-01-15 05:10 PM', risk: 'High' },
  ];

  const timelineData = [
    { date: 'Jan 05', changes: 45, dominant: 'Addition' },
    { date: 'Jan 06', changes: 32, dominant: 'Modification' },
    { date: 'Jan 07', changes: 78, dominant: 'Addition' },
    { date: 'Jan 08', changes: 23, dominant: 'Addition' },
    { date: 'Jan 09', changes: 56, dominant: 'Modification' },
    { date: 'Jan 10', changes: 89, dominant: 'Addition' },
    { date: 'Jan 11', changes: 134, dominant: 'Deletion' },
    { date: 'Jan 12', changes: 167, dominant: 'Deletion' },
    { date: 'Jan 13', changes: 91, dominant: 'Addition' },
    { date: 'Jan 14', changes: 43, dominant: 'Modification' },
    { date: 'Jan 15', changes: 72, dominant: 'Addition' },
    { date: 'Jan 16', changes: 28, dominant: 'Addition' },
    { date: 'Jan 17', changes: 51, dominant: 'Modification' },
    { date: 'Jan 18', changes: 64, dominant: 'Addition' },
    { date: 'Jan 19', changes: 38, dominant: 'Addition' },
    { date: 'Jan 20', changes: 95, dominant: 'Modification' },
    { date: 'Jan 21', changes: 142, dominant: 'Deletion' },
    { date: 'Jan 22', changes: 108, dominant: 'Addition' },
    { date: 'Jan 23', changes: 47, dominant: 'Modification' },
    { date: 'Jan 24', changes: 69, dominant: 'Addition' },
  ];

  const heatmapData = [
    { region: 'AC-101', fullName: 'Assembly Constituency 101 - North District', changes: 145, risk: 'Medium' },
    { region: 'AC-102', fullName: 'Assembly Constituency 102 - North District', changes: 67, risk: 'Low' },
    { region: 'AC-103', fullName: 'Assembly Constituency 103 - North District', changes: 234, risk: 'High' },
    { region: 'AC-104', fullName: 'Assembly Constituency 104 - North District', changes: 89, risk: 'Medium' },
    { region: 'AC-105', fullName: 'Assembly Constituency 105 - Central District', changes: 178, risk: 'High' },
    { region: 'AC-106', fullName: 'Assembly Constituency 106 - Central District', changes: 45, risk: 'Low' },
    { region: 'AC-107', fullName: 'Assembly Constituency 107 - Central District', changes: 203, risk: 'High' },
    { region: 'AC-108', fullName: 'Assembly Constituency 108 - Central District', changes: 122, risk: 'Medium' },
    { region: 'Ward-12', fullName: 'Municipal Ward 12 - Central District', changes: 56, risk: 'Low' },
    { region: 'Ward-13', fullName: 'Municipal Ward 13 - Central District', changes: 189, risk: 'High' },
    { region: 'Ward-14', fullName: 'Municipal Ward 14 - South District', changes: 98, risk: 'Medium' },
    { region: 'Ward-15', fullName: 'Municipal Ward 15 - South District', changes: 167, risk: 'High' },
    { region: 'Booth-B45', fullName: 'Polling Booth B45 - South District', changes: 34, risk: 'Low' },
    { region: 'Booth-B46', fullName: 'Polling Booth B46 - South District', changes: 210, risk: 'High' },
    { region: 'Booth-B47', fullName: 'Polling Booth B47 - South District', changes: 76, risk: 'Low' },
    { region: 'Booth-B48', fullName: 'Polling Booth B48 - South District', changes: 145, risk: 'Medium' },
    { region: 'Booth-B49', fullName: 'Polling Booth B49 - East District', changes: 52, risk: 'Low' },
    { region: 'Booth-B50', fullName: 'Polling Booth B50 - East District', changes: 198, risk: 'High' },
    { region: 'Booth-B51', fullName: 'Polling Booth B51 - East District', changes: 112, risk: 'Medium' },
    { region: 'Booth-B52', fullName: 'Polling Booth B52 - East District', changes: 83, risk: 'Medium' },
  ];

  const maxChanges = Math.max(...timelineData.map(d => d.changes));

  const getHeatmapColor = (changes) => {
    if (changes < 80) return 'bg-teal-100 border-teal-300';
    if (changes < 150) return 'bg-amber-100 border-amber-400';
    return 'bg-rose-200 border-rose-400';
  };

  const isSpike = (changes) => changes > 120;

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-green-700';
    if (risk === 'Medium') return 'text-amber-600';
    if (risk === 'High') return 'text-red-700';
    return 'text-gray-800';
  };

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
            <p className="text-blue-800 text-3xl font-bold mb-1">1245</p>
            <p className="text-gray-600 text-xs">All modifications tracked</p>
          </div>

          <div className="bg-green-50 border-2 border-green-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Additions</h3>
            <p className="text-green-800 text-3xl font-bold mb-1">687</p>
            <p className="text-gray-600 text-xs">New voter registrations</p>
          </div>

          <div className="bg-red-50 border-2 border-red-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Deletions</h3>
            <p className="text-red-800 text-3xl font-bold mb-1">234</p>
            <p className="text-gray-600 text-xs">Removed entries</p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded p-4">
            <h3 className="text-gray-800 font-bold text-sm mb-2">Modifications</h3>
            <p className="text-amber-800 text-3xl font-bold mb-1">324</p>
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
                  <div className="flex items-end justify-between h-56 gap-1">
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
                    {heatmapData.slice(0, 8).map((item, index) => (
                      <div
                        key={index}
                        className={`${getHeatmapColor(item.changes)} border-2 rounded p-3 text-center hover:shadow-md relative group cursor-pointer transition-shadow`}
                        title={`${item.region}: ${item.changes} changes`}
                      >
                        <div className="text-gray-900 text-xs font-bold">{item.region}</div>
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 z-50">
                          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-4 py-3">
                            <div className="text-gray-900 font-bold text-sm mb-1">{item.fullName}</div>
                            <div className="text-gray-700 text-xs mb-1"><span className="font-semibold">Changes:</span> {item.changes}</div>
                            <div className="text-gray-700 text-xs"><span className="font-semibold">Risk Level:</span> {item.risk}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                            <div className="border-8 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2 pb-3 border-b border-gray-200">
                    {heatmapData.slice(8, 13).map((item, index) => (
                      <div
                        key={index}
                        className={`${getHeatmapColor(item.changes)} border-2 rounded p-3 text-center hover:shadow-md relative group cursor-pointer transition-shadow`}
                        title={`${item.region}: ${item.changes} changes`}
                      >
                        <div className="text-gray-900 text-xs font-bold">{item.region}</div>
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 z-50">
                          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-4 py-3">
                            <div className="text-gray-900 font-bold text-sm mb-1">{item.fullName}</div>
                            <div className="text-gray-700 text-xs mb-1"><span className="font-semibold">Changes:</span> {item.changes}</div>
                            <div className="text-gray-700 text-xs"><span className="font-semibold">Risk Level:</span> {item.risk}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                            <div className="border-8 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {heatmapData.slice(13).map((item, index) => (
                      <div
                        key={index}
                        className={`${getHeatmapColor(item.changes)} border-2 rounded p-3 text-center hover:shadow-md relative group cursor-pointer transition-shadow`}
                        title={`${item.region}: ${item.changes} changes`}
                      >
                        <div className="text-gray-900 text-xs font-bold">{item.region}</div>
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 z-50">
                          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl px-4 py-3">
                            <div className="text-gray-900 font-bold text-sm mb-1">{item.fullName}</div>
                            <div className="text-gray-700 text-xs mb-1"><span className="font-semibold">Changes:</span> {item.changes}</div>
                            <div className="text-gray-700 text-xs"><span className="font-semibold">Risk Level:</span> {item.risk}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                            <div className="border-8 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-100 border-2 border-teal-300 rounded"></div>
                    <span className="text-gray-600 text-xs">Low (&lt;80)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 border-2 border-amber-400 rounded"></div>
                    <span className="text-gray-600 text-xs">Medium (80-150)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-200 border-2 border-rose-400 rounded"></div>
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