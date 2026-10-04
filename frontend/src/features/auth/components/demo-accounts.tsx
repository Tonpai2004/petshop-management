import { KeyRound } from "lucide-react";

const accounts = [
  { username: "admin", password: "Admin@123", role: "Admin", note: "full access" },
  { username: "staff", password: "Staff@123", role: "Staff", note: "can't delete" },
];

interface DemoAccountsProps {
  onPick: (username: string, password: string) => void;
}

export function DemoAccounts({ onPick }: DemoAccountsProps) {
  return (
    <div className="bg-muted/50 rounded-lg border border-dashed p-3">
      <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
        <KeyRound className="size-3.5" />
        Demo accounts (click to fill)
      </p>
      <div className="grid grid-cols-2 gap-2">
        {accounts.map((account) => (
          <button
            key={account.username}
            type="button"
            onClick={() => onPick(account.username, account.password)}
            className="bg-background hover:border-primary/40 hover:bg-primary/5 rounded-md border px-2.5 py-2 text-left transition-colors"
          >
            <p className="text-xs font-medium">{account.role}</p>
            <p className="text-muted-foreground font-mono text-[11px]">
              {account.username} / {account.password}
            </p>
            <p className="text-muted-foreground text-[11px]">{account.note}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
