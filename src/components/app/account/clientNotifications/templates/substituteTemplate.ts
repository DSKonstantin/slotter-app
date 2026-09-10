import type { TemplateVariable } from "./templateVariables";

export const substituteTemplate = (
  text: string,
  variables: TemplateVariable[],
): string =>
  variables.reduce(
    (acc, variable) => acc.split(variable.token).join(variable.sample),
    text,
  );
