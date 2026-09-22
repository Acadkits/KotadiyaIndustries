import type { FieldDef } from "./schemas";

export function Field({
  def,
  value,
  onChange,
  error,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const v = value ?? "";
  const over = def.maxLength ? v.length > def.maxLength : false;
  const commonCls =
    "w-full rounded-sm border bg-background p-2.5 text-sm outline-none focus:border-primary " +
    (error || over ? "border-red-500/60" : "border-border");
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium">
          {def.label}
          {def.required && <span className="ml-1 text-red-400">*</span>}
        </label>
        {def.maxLength && (
          <span className={"text-[10px] tabular-nums " + (over ? "text-red-400" : "text-muted-foreground")}>
            {v.length}/{def.maxLength}
          </span>
        )}
      </div>
      {def.type === "textarea" ? (
        <textarea
          value={v}
          onChange={(e) => onChange(e.target.value)}
          rows={def.name === "title" ? 2 : 4}
          className={commonCls}
          aria-invalid={!!error || over}
        />
      ) : (
        <input
          type="text"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className={commonCls}
          aria-invalid={!!error || over}
        />
      )}
      {def.hint && !error && <p className="text-[11px] text-muted-foreground">{def.hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
