import React from "react";
import { Image } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
} from "react-native-svg";
import type { Gender, AgeGroup } from "../../stores/appStore";
import { getGuideArt } from "../../constants/guideArt";

interface Props {
  gender: Gender;
  age: AgeGroup;
  color: string; // clothing / role accent
  size?: number;
  background?: boolean;
  skin?: string;
  /** Guide id — if illustrated art is registered for it, that art is shown. */
  id?: string;
}

/**
 * A flat-illustration character avatar drawn entirely in SVG, so it scales
 * crisply and reacts to the chosen gender + age group without any image assets:
 *  - hair length / style depends on gender
 *  - senior → grey hair + glasses; young → rounder face + rosy cheeks
 *  - male adult/senior → light beard
 *  - clothing colour = the guide's role accent
 */
export default function GuideAvatar({
  gender,
  age,
  color,
  size = 96,
  background = true,
  skin = "#F1C39B",
  id,
}: Props) {
  // Prefer real illustrated art when it's registered for this guide.
  const art = getGuideArt(id, gender, age);
  if (art) {
    return (
      <Image
        source={art}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }

  const hair = age === "senior" ? "#D6D9DE" : "#2B2A33";
  const isFemale = gender === "female";
  const hasBeard = gender === "male" && age !== "young";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {background && <Circle cx={50} cy={50} r={50} fill={color + "22"} />}

      {/* Long side hair (female), drawn behind the head */}
      {isFemale && (
        <Path
          d="M27 40 Q19 70 35 78 Q28 58 33 42 Z M73 40 Q81 70 65 78 Q72 58 67 42 Z"
          fill={hair}
        />
      )}

      {/* Shoulders / clothing */}
      <Path d="M16 100 Q16 73 50 73 Q84 73 84 100 Z" fill={color} />
      <Path
        d="M42 74 Q50 82 58 74 L56 73 Q50 79 44 73 Z"
        fill="#FFFFFF"
        opacity={0.22}
      />

      {/* Neck + ears */}
      <Rect x={44} y={62} width={12} height={13} rx={5} fill={skin} />
      <Circle cx={29} cy={46} r={5} fill={skin} />
      <Circle cx={71} cy={46} r={5} fill={skin} />
      {isFemale && (
        <>
          <Circle cx={29} cy={52} r={1.8} fill={color} />
          <Circle cx={71} cy={52} r={1.8} fill={color} />
        </>
      )}

      {/* Head */}
      <Ellipse cx={50} cy={45} rx={22} ry={24} fill={skin} />

      {/* Beard */}
      {hasBeard && (
        <Path
          d="M31 47 Q33 69 50 69 Q67 69 69 47 Q60 60 50 60 Q40 60 31 47 Z"
          fill={hair}
          opacity={0.92}
        />
      )}

      {/* Hair on top + fringe */}
      <Path
        d="M27 46 Q25 19 50 19 Q75 19 73 46 Q69 31 50 31 Q31 31 27 46 Z"
        fill={hair}
      />
      {isFemale ? (
        <Path d="M31 34 Q40 27 50 30 Q60 27 69 34 Q60 33 50 34 Q40 33 31 34 Z" fill={hair} />
      ) : (
        <Path d="M33 33 Q42 28 50 30 Q58 28 67 33 Q58 31 50 32 Q42 31 33 33 Z" fill={hair} />
      )}

      {/* Cheeks (young) */}
      {age === "young" && (
        <>
          <Circle cx={37} cy={53} r={3.4} fill="#F5A79C" opacity={0.55} />
          <Circle cx={63} cy={53} r={3.4} fill="#F5A79C" opacity={0.55} />
        </>
      )}

      {/* Eyes */}
      <Circle cx={42} cy={46} r={2.5} fill="#2B2A33" />
      <Circle cx={58} cy={46} r={2.5} fill="#2B2A33" />

      {/* Glasses (senior) */}
      {age === "senior" && (
        <G stroke="#3A3A3A" strokeWidth={1.6} fill="none">
          <Circle cx={42} cy={46} r={6.5} />
          <Circle cx={58} cy={46} r={6.5} />
          <Line x1={48.5} y1={46} x2={51.5} y2={46} />
        </G>
      )}

      {/* Smile */}
      <Path
        d="M43 55 Q50 61 57 55"
        stroke="#B5654A"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* Bindi (female) */}
      {isFemale && <Circle cx={50} cy={34} r={1.9} fill="#D6336C" />}
    </Svg>
  );
}
