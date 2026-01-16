import { FileDown, Share2, Filter } from "lucide-react";
import { Button } from "@/components/diff-viewer/ui/button";

const changeLog = [
  {
    id: "V001245",
    constituency: "North East Delhi",
    type: "DELETION",
    date: "Feb 1, 2025",
    risk: "High",
  },
  {
    id: "V001246",
    constituency: "North East Delhi",
    type: "DELETION",
    date: "Feb 1, 2025",
    risk: "High",
  },
  {
    id: "V001247",
    constituency: "South Delhi",
    type: "ADDITION",
    date: "Feb 1, 2025",
    risk: "Low",
  },
  {
    id: "V001248",
    constituency: "New Delhi",
    type: "MODIFICATION",
    date: "Jan 28, 2025",
    risk: "Medium",
  },
  {
    id: "V001249",
    constituency: "East Delhi",
    type: "DELETION",
    date: "Feb 1, 2025",
    risk: "High",
  },
];

export function DetailedChangeLog() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Detailed Change Log</h3>
          <p className="text-sm text-gray-600">Top 100 records sorted by risk priority</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 size={16} />
            Share
          </Button>
          <Button variant="default" size="sm" className="gap-2">
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
                Voter ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Constituency
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Risk Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {changeLog.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {log.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.constituency}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    log.type === "DELETION" ? "bg-red-100 text-red-700" :
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
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    log.risk === "High" ? "bg-red-100 text-red-700" :
                    log.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {log.risk}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing 5 of 1,400 records
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
