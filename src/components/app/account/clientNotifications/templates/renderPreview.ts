import type { TemplateVariable } from "@/src/store/redux/services/api-types";
import { STRICT_TOKEN_RE } from "./tokenPattern";

export function renderPreview(
  body: string,
  variables: TemplateVariable[],
): string {
  const examples = new Map(variables.map((v) => [v.key, v.example]));
  return body.replace(
    STRICT_TOKEN_RE,
    (match, key) => examples.get(key) ?? match,
  );
}
