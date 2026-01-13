import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DiffViewer = () => {
  const [loading, setLoading] = useState(true);
  const [constituency, setConstituency] = useState('Constituency Name C-102');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-04-23');
  const [changeTypeFilter, setChangeTypeFilter] = useState('All Change');
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [stats, setStats] = useState({
    total: 1582,
    additions: 534,
    modifications: 431,
    deletions: 617
  });

  const [timelineData, setTimelineData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, constituency, changeTypeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const timeline = [];
      const months = ['Jan', 'Mar', 'May', 'July', 'Sep', 'Nov', 'Mar'];
      for (let i = 0; i < months.length; i++) {
        timeline.push({
          month: months[i],
          additions: Math.floor(Math.random() * 200) + 250,
          deletions: Math.floor(Math.random() * 200) + 250,
          modifications: Math.floor(Math.random() * 200) + 250,
        });
      }
      setTimelineData(timeline);

      const heatmap = [];
      const constituencies = ['Sadar Bazar', 'Chandni Chowk', 'Karol Bagh', 'Paharganj', 'Rajendra Nagar'];

      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 12; col++) {
          const intensity = Math.random();
          const totalChanges = Math.floor(Math.random() * 300) + 50;
          const riskLevel = intensity > 0.7 ? 'High' : intensity > 0.4 ? 'Medium' : 'Low';

          heatmap.push({
            id: `${row}-${col}`,
            name: constituencies[Math.floor(Math.random() * constituencies.length)],
            row,
            col,
            totalChanges,
            additions: Math.floor(totalChanges * 0.39),
            deletions: Math.floor(totalChanges * 0.31),
            modifications: Math.floor(totalChanges * 0.30),
            intensity: riskLevel,
            color: intensity > 0.7 ? 'bg-red-500' : intensity > 0.6 ? 'bg-orange-500' : intensity > 0.5 ? 'bg-orange-400' : intensity > 0.4 ? 'bg-yellow-400' : intensity > 0.3 ? 'bg-green-400' : intensity > 0.2 ? 'bg-blue-400' : 'bg-blue-300'
          });
        }
      }
      setHeatmapData(heatmap);

      const table = [];
      for (let i = 0; i < 50; i++) {
        const changeTypes = ['Addition', 'Modification', 'Deletion'];
        const changeType = changeTypes[Math.floor(Math.random() * 3)];
        table.push({
          id: `ID1035`,
          voterId: `ID ID0${38303 + i}`,
          changeType,
          timestamp: `${Math.floor(Math.random() * 28) + 1} Apr 2026`,
          constituency: constituencies[Math.floor(Math.random() * constituencies.length)],
          risk: Math.random() > 0.5 ? 'Low' : Math.random() > 0.5 ? 'Medium' : 'High'
        });
      }
      setTableData(table);

    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const filteredTableData = useMemo(() => {
    return tableData.filter(item => {
      const typeMatch = changeTypeFilter === 'All Change' ||
        (changeTypeFilter === 'Additions' && item.changeType === 'Addition') ||
        (changeTypeFilter === 'Deletions' && item.changeType === 'Deletion') ||
        (changeTypeFilter === 'Modifications' && item.changeType === 'Modification');
      const constituencyMatch = !selectedConstituency || item.constituency === selectedConstituency;
      return typeMatch && constituencyMatch;
    });
  }, [tableData, changeTypeFilter, selectedConstituency]);

  const handleBlockHover = (block, event) => {
    if (block) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    setHoveredBlock(block);
  };

  const handleBlockClick = (block) => {
    setSelectedConstituency(block.name === selectedConstituency ? null : block.name);
  };

  const getChangeTypeColor = (type) => {
    if (type === 'Addition') return 'bg-green-500 text-white';
    if (type === 'Deletion') return 'bg-orange-500 text-white';
    if (type === 'Modification') return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (risk === 'High') return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Diff View</h1>
          <p className="text-gray-500 mt-1">Forensic comparison of electoral roll revisions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Constituency:</label>
            <select
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Constituency Name C-102</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">

            {/* Total Differences Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Total Differences:</div>
              <div className="text-5xl font-bold text-gray-900 mb-6">{stats.total.toLocaleString()}</div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{stats.additions} Additions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">{stats.modifications} Modifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">{stats.deletions} Deletions</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.additions}</div>
                  <div className="text-xs text-gray-500">Additions »</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.modifications}</div>
                  <div className="text-xs text-gray-500">Modifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.deletions}</div>
                  <div className="text-xs text-gray-500">Deletions</div>
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button className="flex-1 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  All Changes
                </button>
                <button className="flex-1 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Additions
                </button>
                <button className="flex-1 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Deletions
                </button>
                <button className="flex-1 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-xs">
                  Modit..
                </button>
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="🔍 Search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Timeline of Electoral Roll Changes</h2>
                <div className="text-xs text-gray-500">Low - High. Change</div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                    label={{ value: '500n', angle: 0, position: 'top' }}
                  />
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="additions" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
                  <Line type="monotone" dataKey="deletions" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                  <Line type="monotone" dataKey="modifications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Differences Table (Left) */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Differences Table</h2>
              </div>
              <div className="overflow-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Voter ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Change Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Timestamp</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTableData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-600">{row.id}</td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{row.voterId}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(row.changeType)}`}>
                            {row.changeType === 'Addition' ? '● Addition' : row.changeType === 'Modification' ? '■ Modification' : '● Deletion'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{row.timestamp}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${getRiskColor(row.risk)}`}>
                            ☑ {row.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column - Heatmap & Table */}
          <div className="lg:col-span-2 space-y-6">

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <select
                value={changeTypeFilter}
                onChange={(e) => setChangeTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>🔍 All Change</option>
                <option>Additions</option>
                <option>Deletions</option>
                <option>Modifications</option>
              </select>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Additions</button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Deletions</button>
              <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Modifications</button>
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="grid grid-cols-12 gap-1 mb-2">
                  {heatmapData.map((block) => (
                    <div
                      key={block.id}
                      className={`aspect-square ${block.color} rounded cursor-pointer hover:opacity-80 transition-all`}
                      onMouseEnter={(e) => handleBlockHover(block, e)}
                      onMouseLeave={() => handleBlockHover(null)}
                      onClick={() => handleBlockClick(block)}
                    />
                  ))}
                </div>

                {/* X-axis labels */}
                <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 text-center">
                  {['Sun', 'Apy', 'Wew', 'Mar', 'Jun', '', '', '', '', '', '', 'Mar'].map((month, i) => (
                    <div key={i}>{month}</div>
                  ))}
                </div>
              </div>

              {/* Y-axis labels */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>100x</span>
                <span>100x</span>
                <span>200x</span>
                <span>300x</span>
                <span>400x</span>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span className="text-gray-600">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span className="text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">High</span>
                </div>
              </div>
            </div>

            {/* Differences Table (Right) */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Differences Table</h2>
                <div className="flex gap-2 text-sm text-gray-600">
                  <button className="hover:text-gray-900">← Previous</button>
                  <span>1</span>
                  <button className="hover:text-gray-900">Next →</button>
                </div>
              </div>
              <div className="overflow-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Voter ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Change Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Constituency</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-600">{row.id}{2388 + idx}</td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">{row.voterId}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(row.changeType)}`}>
                            {row.changeType === 'Addition' ? '● Addition' : row.changeType === 'Modification' ? '■ Modification' : '● Deletion'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${row.constituency === 'Sadar Bazar' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                            {row.constituency === 'Sadar Bazar' ? '□' : '○'} {row.constituency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Heatmap Tooltip */}
      {hoveredBlock && (
        <div
          className="fixed bg-gray-800 text-white text-xs rounded-lg p-4 shadow-2xl z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            maxWidth: '250px'
          }}
        >
          <div className="font-bold text-base mb-3">{hoveredBlock.name}</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">{hoveredBlock.totalChanges} Total Changes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400">✓ {hoveredBlock.additions}</span>
              <span className="text-gray-400">Additions</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400">✓ {hoveredBlock.deletions}</span>
              <span className="text-gray-400">Deletions</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">✓ {hoveredBlock.modifications}</span>
              <span className="text-gray-400">Modifications</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Risk Level:</span>
                <span className={`font-bold ${hoveredBlock.intensity === 'High' ? 'text-red-400' : hoveredBlock.intensity === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {hoveredBlock.intensity}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;