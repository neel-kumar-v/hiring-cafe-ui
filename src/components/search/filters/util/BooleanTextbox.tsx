import { Textarea } from "@/components/ui/textarea";
import { decodeSearchExpression, parseSearchExpression } from "@/lib/search";
import type { SearchExpression } from "@/types/search";
import { useEffect, useState } from "react";

export function BooleanTextbox({ value, onChange, placeholder }: {
  value: SearchExpression<string>,
  onChange: (expr: SearchExpression<string>) => void,
  placeholder?: string
}) {
  const [text, setText] = useState(() => decodeSearchExpression(value));

  // Update text if value changes from outside
  useEffect(() => {
    setText(decodeSearchExpression(value));
  }, [value]);

  return (
    <Textarea
      className="w-full min-h-16"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => onChange(parseSearchExpression(text))}
      placeholder={placeholder}
    />
  );
} 