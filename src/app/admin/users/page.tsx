import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, eventsCreated: true } }
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-4xl uppercase">Users</h2>

      <div className="bg-card-bg border border-card-border rounded overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 border-b border-card-border text-secondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-foreground/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground">{user.name}</p>
                  <p className="text-secondary text-xs">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-xs text-secondary">{user._count.bookings} bookings</p>
                  {user.role === 'ADMIN' && (
                    <p className="text-xs text-primary">{user._count.eventsCreated} events</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
