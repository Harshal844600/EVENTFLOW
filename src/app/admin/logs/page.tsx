import { prisma } from "@/lib/prisma";

export default async function AdminLogsPage() {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: true }
  });

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-4xl uppercase">Audit Logs</h2>

      <div className="bg-card-bg border border-card-border rounded overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 border-b border-card-border text-secondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-secondary">No logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{log.admin.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/20 text-primary px-2 py-1 text-xs font-bold rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-secondary">
                    {log.targetType}: {log.targetId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
