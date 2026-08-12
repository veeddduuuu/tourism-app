import { BaseAgent } from './base';
import type { TripMemory } from '../memory';
import type { SafetyReport } from '../types';
import { safetyReportSchema } from '../types';
import type { SafetyNewsResult } from '../tools/safetyIndiaNews';
import { fetchIndiaSafetyNews } from '../tools/safetyIndiaNews';

export class SafetyAgent extends BaseAgent<SafetyReport> {
  readonly name = 'safety';
  readonly outputSchema = safetyReportSchema;
  readonly systemPrompt =
    'You are a travel safety analyst focused on India destinations. ' +
    'You will receive LIVE NewsAPI headlines when available. ' +
    'Assess whether it is reasonably safe to visit for a normal tourist trip. ' +
    'Be balanced: political noise ≠ travel ban; floods/landslides/curfews matter. ' +
    'risk_level must be one of: low, moderate, high, unknown. ' +
    'safe_to_visit=false only when risk_level is high or conditions clearly unsafe. ' +
    'Include concrete concerns and practical recommendations. ' +
    'JSON keys: summary, risk_level, safe_to_visit, concerns[], recommendations[], ' +
    'headlines[{title,source,url,published_at}], sources_note.';

  private tool: SafetyNewsResult | null = null;

  async run(memory: TripMemory): Promise<SafetyReport> {
    memory.note(this.name, 'started');
    const r = memory.request;
    this.tool = await fetchIndiaSafetyNews(r.destination);
    if (this.tool.ok) {
      memory.note(this.name, `newsapi headlines=${this.tool.headlines.length}`);
    } else {
      memory.note(this.name, `newsapi skipped/failed: ${this.tool.raw_error}`);
    }

    let result = await this.llm.completeJson({
      system: this.systemPrompt,
      user: this.buildUserPrompt(memory),
      schema: this.outputSchema,
    });
    result = this.mergeToolData(result);
    this.writeToMemory(memory, result);
    memory.markRan(this.name);
    memory.note(this.name, 'finished');
    return result;
  }

  buildUserPrompt(memory: TripMemory): string {
    const r = memory.request;
    const toolBlock = this.tool?.toPromptBlock() ?? 'LIVE SAFETY NEWS TOOL: not run.';
    let weatherBit = '';
    if (memory.weather) {
      weatherBit =
        `Weather summary: ${memory.weather.summary}. ` +
        `Alerts: ${memory.weather.alerts.slice(0, 3)}.\n`;
    }
    return (
      `Assess travel safety for ${r.destination}, India ` +
      `(${r.start_date} → ${r.end_date}), travelers=${r.travelers}.\n` +
      `${weatherBit}` +
      `${toolBlock}\n` +
      `Context:\n${this.contextJson(memory)}`
    );
  }

  private mergeToolData(result: SafetyReport): SafetyReport {
    const tool = this.tool;
    if (tool?.ok && tool.headlines.length && !result.headlines.length) {
      result.headlines = tool.headlines.slice(0, 8).map((h) => ({
        title: h.title,
        source: h.source,
        url: h.url,
        published_at: h.published_at,
      }));
    }
    if (tool && !tool.configured) {
      result.sources_note =
        result.sources_note ||
        'NewsAPI not configured — assessment is model knowledge only.';
      if (result.risk_level === 'low') result.risk_level = 'unknown';
    } else if (tool?.ok) {
      result.sources_note =
        result.sources_note ||
        'Headlines from NewsAPI (India-focused query); not an official advisory.';
    } else if (tool && !tool.ok) {
      result.sources_note =
        result.sources_note ||
        `Live news unavailable (${tool.raw_error}); treat as unchecked.`;
      if (result.risk_level === 'low') result.risk_level = 'unknown';
    }
    return result;
  }

  writeToMemory(memory: TripMemory, result: SafetyReport): void {
    memory.safety = result;
  }
}
