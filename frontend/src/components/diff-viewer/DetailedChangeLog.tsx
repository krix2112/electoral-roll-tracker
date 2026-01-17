
import { FileDown, Share2, Filter } from "lucide-react";
import { Button } from "@/components/diff-viewer/ui/button";
import { useMemo, useState } from "react";

interface DetailedChangeLogProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
}

export function DetailedChangeLog({ data }: DetailedChangeLogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const recordsPerPage = 50;

  const changeLog = useMemo(() => {
    const logs = [
      ...data.added.map(item => ({
        ...item,
        type: 'ADDITION',
        risk: 'Low',
        date: item.date || item.uploaded_at || 'Feb 1, 2025'
      })),
      ...data.deleted.map(item => ({
        ...item,
        type: 'DELETION',
        risk: 'High',
        date: item.date || item.uploaded_at || 'Feb 1, 2025'
      })),
      ...data.modified.map(item => ({
        ...item,
        type: 'MODIFICATION',
        risk: 'Medium',
        date: item.date || item.uploaded_at || 'Feb 1, 2025'
      }))
    ];

    // Sort by risk priority: High -> Medium -> Low
    const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    logs.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

    // Apply filter if set
    const filtered = filterType ? logs.filter(log => log.type === filterType) : logs;

    return filtered;
  }, [data, filterType]);

  // Pagination
  const totalPages = Math.ceil(changeLog.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedLogs = changeLog.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFilterToggle = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const applyFilter = (type: string | null) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page when filtering
    setShowFilterMenu(false);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Voter ID,Name,Constituency,Type,Risk"].join(",") + "\n"
      + changeLog.map(e => `${e.voter_id || e.id},${e.name || "N/A"},${e.constituency || "Unknown"},${e.type},${e.risk}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "change_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Detailed Change Log</h3>
          <p className="text-sm text-gray-600">Records sorted by risk priority</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleFilterToggle}
            >
              <Filter size={16} />
              Filter {filterType && `(${filterType})`}
            </Button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter(null)}
                  >
                    All Types
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('ADDITION')}
                  >
                    Additions Only
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('DELETION')}
                  >
                    Deletions Only
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('MODIFICATION')}
                  >
                    Modifications Only
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2 opacity-50 cursor-not-allowed" title="Share coming soon">
            <Share2 size={16} />
            Share
          </Button>
          <Button variant="default" size="sm" className="gap-2" onClick={handleExport}>
            <FileDown size={16} />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sector / Constituency
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Delta Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Risk Classification
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {log.voter_id || log.id || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.constituency || "Unknown"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${log.type === "DELETION" ? "bg-red-100 text-red-700" :
                    log.type === "ADDITION" ? "bg-emerald-100 text-emerald-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.date}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${log.risk === "High" ? "bg-red-100 text-red-700" :
                    log.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                    {log.risk}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 opacity-50 cursor-not-allowed" title="View details coming soon">
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {paginatedLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No records found. Compare two files to see details.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, changeLog.length)} of {changeLog.length} records
          {filterType && ` (filtered by ${filterType})`}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
