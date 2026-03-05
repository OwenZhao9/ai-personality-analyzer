import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// 第一页：即将揭示
function RevealPage1({ onNext }: { onNext: () => void }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const dotOpacity1 = useSharedValue(0);
  const dotOpacity2 = useSharedValue(0);
  const dotOpacity3 = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    // 三个点依次出现
    dotOpacity1.value = withDelay(600, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(200, withTiming(0.3, { duration: 200 })),
    ));
    dotOpacity2.value = withDelay(900, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(200, withTiming(0.3, { duration: 200 })),
    ));
    dotOpacity3.value = withDelay(1200, withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(200, withTiming(0.3, { duration: 200 })),
    ));
    // 2.5秒后自动跳转
    const timer = setTimeout(() => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onNext();
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  return (
    <View style={styles.page}>
      <Animated.View style={[styles.revealContent, containerStyle]}>
        <View style={styles.glowCircle}>
          <Text style={styles.glowIcon}>◈</Text>
        </View>
        <Text style={styles.revealTitle}>即将揭示你的</Text>
        <Text style={styles.revealTitleAccent}>深层人格核心</Text>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </Animated.View>
    </View>
  );
}

// 第二页：核心揭示
function RevealPage2({ onEnter }: { onEnter: () => void }) {
  const opacity = useSharedValue(0);
  const textY = useSharedValue(24);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    textY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
    btnOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
    if (Platform.OS !== "web") {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <View style={styles.page}>
      <Animated.View style={[styles.coreContent, containerStyle]}>
        <Text style={styles.coreText}>你写的内容</Text>
        <Text style={styles.coreTextAccent}>就是你的核心</Text>
        <View style={styles.coreDivider} />
        <Text style={styles.coreSubText}>
          所有答案，早已在你心中。
        </Text>
      </Animated.View>
      <Animated.View style={[styles.enterBtnWrap, btnStyle]}>
        <Pressable
          onPress={onEnter}
          style={({ pressed }) => [
            styles.enterBtn,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
          ]}
        >
          <Text style={styles.enterBtnText}>查看完整报告</Text>
          <Text style={styles.enterBtnArrow}>→</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function RevealScreen() {
  const router = useRouter();
  const [page, setPage] = useState<1 | 2>(1);

  const handleEnterReport = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/report" as any);
  };

  return (
    <ScreenContainer containerClassName="bg-[#060A14]" edges={["top", "left", "right", "bottom"]}>
      {page === 1 ? (
        <RevealPage1 onNext={() => setPage(2)} />
      ) : (
        <RevealPage2 onEnter={handleEnterReport} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  // Page 1
  revealContent: {
    alignItems: "center",
    gap: 16,
  },
  glowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,212,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(0,212,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 8,
  },
  glowIcon: {
    fontSize: 40,
    color: "rgba(0,212,255,0.9)",
  },
  revealTitle: {
    fontSize: 24,
    color: "#7A8FA6",
    fontWeight: "300",
    letterSpacing: 2.5,
    textAlign: "center",
  },
  revealTitleAccent: {
    fontSize: 32,
    color: "#00D4FF",
    fontWeight: "700",
    letterSpacing: 3.5,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(0,212,255,0.8)",
  },
  // Page 2
  coreContent: {
    alignItems: "center",
    gap: 12,
    marginBottom: 60,
  },
  coreText: {
    fontSize: 26,
    color: "#A0B4C8",
    fontWeight: "300",
    letterSpacing: 2.5,
    textAlign: "center",
  },
  coreTextAccent: {
    fontSize: 34,
    color: "#E8EEF4",
    fontWeight: "700",
    letterSpacing: 2.5,
    textAlign: "center",
  },
  coreDivider: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(0,212,255,0.35)",
    marginVertical: 14,
  },
  coreSubText: {
    fontSize: 15,
    color: "#4A6070",
    letterSpacing: 2,
    textAlign: "center",
    lineHeight: 24,
  },
  enterBtnWrap: {
    position: "absolute",
    bottom: 60,
    left: 32,
    right: 32,
    alignItems: "center",
  },
  enterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D4FF",
    paddingHorizontal: 44,
    paddingVertical: 17,
    borderRadius: 50,
    gap: 10,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 12,
  },
  enterBtnText: {
    color: "#050810",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
  },
  enterBtnArrow: {
    color: "#050810",
    fontSize: 17,
    fontWeight: "700",
  },
});
