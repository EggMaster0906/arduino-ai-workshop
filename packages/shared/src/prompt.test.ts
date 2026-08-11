import { describe, expect, it } from "vitest";
import { buildArduinoPrompt } from "./prompt.js";

describe("buildArduinoPrompt", () => {
  it("uses every structured requirement without inventing values", () => {
    const prompt = buildArduinoPrompt({
      goal: "製作可開關的柵欄",
      hardware: ["Arduino UNO", "SG90，訊號線接 D9"],
      control: "Serial Monitor",
      logic: ["OPEN 時移動到 90°", "CLOSE 時移動到 0°"],
      aiHelp: "產生程式並逐段解釋"
    });

    expect(prompt).toContain("製作可開關的柵欄");
    expect(prompt).toContain("SG90，訊號線接 D9");
    expect(prompt).toContain("OPEN 時移動到 90°");
    expect(prompt).toContain("不要自行假設");
  });
});
