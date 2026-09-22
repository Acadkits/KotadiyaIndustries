import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SectionSchema } from "./schemas";
import { Field } from "./Field";

export function SectionForm({
  schema,
  value,
  onChange,
}: {
  schema: SectionSchema;
  value: any;
  onChange: (v: any) => void;
}) {
  const setField = (name: string, v: string) => onChange({ ...value, [name]: v });

  return (
    <div className="space-y-4">
      {schema.fields.map((f) => (
        <Field key={f.name} def={f} value={value?.[f.name] ?? ""} onChange={(v) => setField(f.name, v)} />
      ))}

      {schema.kind === "objectWithList" && (
        <ListEditor
          schema={schema}
          list={Array.isArray(value?.[schema.listKey]) ? value[schema.listKey] : []}
          onChange={(list) => onChange({ ...value, [schema.listKey]: list })}
        />
      )}
    </div>
  );
}

function ListEditor({
  schema,
  list,
  onChange,
}: {
  schema: Extract<SectionSchema, { kind: "objectWithList" }>;
  list: any[];
  onChange: (list: any[]) => void;
}) {
  const update = (i: number, patch: any) => {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(list.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const row: any = {};
    for (const f of schema.itemFields) row[f.name] = "";
    if (schema.autoNumberField) {
      row[schema.autoNumberField] = String(list.length + 1).padStart(2, "0");
    }
    onChange([...list, row]);
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center justify-between border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-metallic">{schema.listLabel}</h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-sm border border-primary px-2.5 py-1 text-xs text-primary hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" /> Add {schema.itemLabel.toLowerCase()}
        </button>
      </div>

      {list.length === 0 && (
        <p className="rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No {schema.listLabel.toLowerCase()} yet. Click "Add {schema.itemLabel.toLowerCase()}" to create one.
        </p>
      )}

      {list.map((item, i) => (
        <div key={i} className="rounded-sm border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {schema.itemLabel} {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </IconBtn>
              <IconBtn onClick={() => remove(i)} title="Remove" danger>
                <Trash2 className="h-3.5 w-3.5" />
              </IconBtn>
            </div>
          </div>
          <div className="space-y-3">
            {schema.itemFields.map((f) => (
              <Field
                key={f.name}
                def={f}
                value={item?.[f.name] ?? ""}
                onChange={(v) => update(i, { [f.name]: v })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "rounded-sm border border-border p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 " +
        (danger ? "hover:border-red-500/60 hover:text-red-400" : "")
      }
    >
      {children}
    </button>
  );
}
