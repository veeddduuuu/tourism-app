import { BaseAgent } from './base';
import type { TripMemory } from '../memory';
import type { WeatherDay, WeatherReport } from '../types';
import { weatherReportSchema } from '../types';
import type { WeatherToolResult } from '../tools/weatherOpenMeteo';
import { getWeatherContext } from '../tools/weatherOpenMeteo';

export class WeatherAgent extends BaseAgent<WeatherReport> {
  readonly name = 'weather';
  readonly outputSchema = weatherReportSchema;
  readonly systemPrompt =
    'You are a travel weather specialist for trips (especially India). ' +
    'You will be given LIVE Open-Meteo data when available. ' +
    'Prefer live numbers over invention. If mode is seasonal_fallback, ' +
    'say so clearly and use climate norms. ' +
    'Return practical alerts (monsoon, heatwave, cyclone, fog) and packing tips. ' +
    'Return a FLAT JSON object with EXACT top-level keys: ' +
    'summary (string), ' +
    'daily (array of {date,condition,high_c,low_c,precipitation_chance,notes}), ' +
    'alerts (string array), packing_tips (string array), ' +
    'source (string: open-meteo|seasonal|llm), resolved_place (string). ' +
    'Do NOT nest under weather_forecast or weather.';

  private tool: WeatherToolResult | null = null;

  async run(memory: TripMemory): Promise<WeatherReport> {
    memory.note(this.name, 'started');
    const r = memory.request;
    this.tool = await getWeatherContext(r.destination, r.start_date, r.end_date);
    if (this.tool.ok) {
      memory.note(
        this.name,
        `open-meteo ${this.tool.mode}; days=${this.tool.daily.length}`
      );
    } else {
      memory.note(this.name, `open-meteo failed: ${this.tool.raw_error}`);
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
    const toolBlock = this.tool?.toPromptBlock() ?? 'LIVE WEATHER TOOL: not run.';
    return (
      `Plan weather outlook for ${r.destination} ` +
      `from ${r.start_date} to ${r.end_date}.\n` +
      `Travelers: ${r.travelers}. Interests: ${r.preferences.interests}.\n` +
      `${toolBlock}\n` +
      `Full context:\n${this.contextJson(memory)}`
    );
  }

  private mergeToolData(result: WeatherReport): WeatherReport {
    const tool = this.tool;
    if (!tool || !tool.ok || !tool.place) {
      if (!result.source) result.source = 'llm';
      return result;
    }
    const place = tool.place;
    const resolved = [place.name, place.admin1, place.country]
      .filter(Boolean)
      .join(', ');
    result.resolved_place = result.resolved_place || resolved;
    if (tool.mode === 'forecast' && tool.daily.length) {
      result.source = 'open-meteo';
      const modelNotes = new Map(result.daily.map((d) => [d.date, d.notes]));
      result.daily = tool.daily.map(
        (d): WeatherDay => ({
          date: d.date,
          condition: d.condition,
          high_c: d.high_c,
          low_c: d.low_c,
          precipitation_chance: d.precipitation_chance,
          notes: modelNotes.get(d.date) ?? '',
        })
      );
    } else if (tool.mode === 'seasonal_fallback') {
      result.source = result.source || 'seasonal';
    } else {
      result.source = result.source || 'open-meteo';
    }
    return result;
  }

  writeToMemory(memory: TripMemory, result: WeatherReport): void {
    memory.weather = result;
  }
}
