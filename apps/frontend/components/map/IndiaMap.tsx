import React from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  INDIA_STATES,
  INDIA_WIDTH,
  INDIA_HEIGHT,
} from "../../constants/indiaMap";

interface Props {
  selected?: string | null;
  onSelect: (name: string) => void;
}

/**
 * Real, tappable map of India built from per-state SVG paths (generated from
 * assets/map/india.geojson). Each state is an individual <Path> — tapping it
 * reports the state name to the parent, and the selected state is highlighted.
 */
export default function IndiaMap({ selected, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width - 32, 440);
  const mapHeight = (mapWidth * INDIA_HEIGHT) / INDIA_WIDTH;

  // Draw the selected state last so its highlight/stroke sits on top of neighbours.
  const ordered = selected
    ? [
        ...INDIA_STATES.filter((s) => s.name !== selected),
        ...INDIA_STATES.filter((s) => s.name === selected),
      ]
    : INDIA_STATES;

  return (
    <View style={{ width: mapWidth, height: mapHeight }}>
      <Svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${INDIA_WIDTH} ${INDIA_HEIGHT}`}
      >
        {ordered.map((s) => {
          const isSel = selected === s.name;
          return (
            <Path
              key={s.id}
              d={s.d}
              fill={isSel ? "#FF6B35" : "#15477E"}
              stroke={isSel ? "#FFE0C2" : "rgba(180,214,255,0.35)"}
              strokeWidth={isSel ? 2.5 : 0.8}
              strokeLinejoin="round"
              onPress={() => onSelect(s.name)}
            />
          );
        })}
      </Svg>
    </View>
  );
}
