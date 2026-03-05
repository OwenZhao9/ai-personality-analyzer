import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// 左侧标签
const LEFT_TAGS = [
  "GPT-4o", "Gemini", "Grok", "豆包", "Kimi", "Mistral",
];
// 右侧标签
const RIGHT_TAGS = [
  "Claude 3", "LLaMA 3", "DeepSeek", "通义千问", "文心一言", "ChatGLM",
];

function FloatingTag({
  name,
  delay,
  x,
  y,
  align,
}: {
  name: string;
  delay: number;
  x: number;
  y: number;
  align: "left" | "right";
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.65, { duration: 1400, easing: Easing.out(Easing.ease) }),
          withTiming(0.15, { duration: 1400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
          withTiming(10, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.floatingTag,
        align === "right" && styles.floatingTagRight,
        { left: align === "left" ? x : undefined, right: align === "right" ? x : undefined, top: y },
        style,
      ]}
    >
      <Text style={styles.floatingTagText}>{name}</Text>
    </Animated.View>
  );
}

function PulsingRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const DURATION = 3600;

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: DURATION, easing: Easing.out(Easing.cubic) }),
          withTiming(0.3, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.65, { duration: DURATION * 0.22, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: DURATION * 0.78, easing: Easing.in(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulsingRing,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.9);

  useEffect(() => {
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }));
    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
    btnOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    btnScale.value = withDelay(1400, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value }],
  }));

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/input" as any);
  };

  const leftYPositions = [130, 210, 300, 400, 490, 580];
  const rightYPositions = [150, 240, 330, 420, 510, 600];

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]" edges={["top", "left", "right", "bottom"]}>
      {/* 左侧飘动标签 */}
      {LEFT_TAGS.map((name, i) => (
        <FloatingTag
          key={`left-${name}`}
          name={name}
          delay={i * 250}
          x={8}
          y={leftYPositions[i]}
          align="left"
        />
      ))}

      {/* 右侧飘动标签 */}
      {RIGHT_TAGS.map((name, i) => (
        <FloatingTag
          key={`right-${name}`}
          name={name}
          delay={i * 250 + 120}
          x={8}
          y={rightYPositions[i]}
          align="right"
        />
      ))}

      {/* 中央内容 */}
      <View style={styles.centerContent}>
        {/* 脉冲光环 */}
        <View style={styles.ringsContainer}>
          <PulsingRing delay={0} size={220} />
          <PulsingRing delay={730} size={220} />
          <PulsingRing delay={1460} size={220} />
        </View>

        {/* Logo 圆圈 */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>AI</Text>
          <Text style={styles.logoSubText}>∞</Text>
        </View>

        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.titleLine1}>AI 多模型联合</Text>
          <Text style={styles.titleLine2}>人格分析系统</Text>
        </Animated.View>

        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>全球顶级大模型联合分析</Text>
          <Text style={styles.subtitleSub}>· 娱乐产品 · 仅供参考 ·</Text>
        </Animated.View>

        <Animated.View style={[btnStyle, styles.btnWrapper]}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startBtn,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
            ]}
          >
            <Text style={styles.startBtnText}>开始分析</Text>
            <Text style={styles.startBtnArrow}>→</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={subtitleStyle}>
          <Text style={styles.disclaimer}>
            本应用为娱乐产品，报告内容来源于用户输入及基础日期计算
          </Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  ringsContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    height: 220,
  },
  pulsingRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.7)",
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(0,212,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(0,212,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    zIndex: 1,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#00D4FF",
    letterSpacing: 3,
  },
  logoSubText: {
    fontSize: 18,
    color: "#A78BFA",
    marginTop: -4,
  },
  titleContainer: {
    alignItems: "center",
    gap: 4,
    zIndex: 1,
  },
  titleLine1: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E8EEF4",
    letterSpacing: 4,
    textAlign: "center",
  },
  titleLine2: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00D4FF",
    letterSpacing: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#4A5568",
    letterSpacing: 2.5,
    textAlign: "center",
    zIndex: 1,
    lineHeight: 20,
  },
  subtitleSub: {
    fontSize: 11,
    color: "#2D3748",
    letterSpacing: 3.5,
    textAlign: "center",
    marginTop: 4,
  },
  btnWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    zIndex: 1,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D4FF",
    paddingHorizontal: 52,
    paddingVertical: 17,
    borderRadius: 50,
    gap: 10,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#050810",
    letterSpacing: 2.5,
  },
  startBtnArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#050810",
  },
  disclaimer: {
    fontSize: 10,
    color: "#2D3748",
    textAlign: "center",
    letterSpacing: 0.8,
    lineHeight: 17,
    marginTop: 4,
    zIndex: 1,
  },
  floatingTag: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.25)",
    backgroundColor: "rgba(0,212,255,0.05)",
  },
  floatingTagRight: {},
  floatingTagText: {
    fontSize: 11,
    color: "rgba(0,212,255,0.85)",
    letterSpacing: 0.8,
    fontWeight: "500",
  },
});
