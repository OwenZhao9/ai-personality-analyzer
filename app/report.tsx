import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share,
  Platform,
  Modal,
  ActivityIndicator,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useUser, getZodiac, getAge } from "@/lib/user-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

// ─── Fade-in Row ──────────────────────────────────────────────────────────────
function FadeInRow({ label, value, delay, accent }: {
  label: string;
  value: string;
  delay: number;
  accent?: boolean;
}) {
  "use no memo";
  if (!value) return null;
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-16);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));
  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && styles.rowValueAccent]}>{value}</Text>
    </Animated.View>
  );
}

function FadeInBlock({ children, delay }: { children: React.ReactNode; delay: number }) {
  "use no memo";
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Divider({ delay }: { delay: number }) {
  "use no memo";
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.divider, style]} />;
}

// ─── Truth Mode Modal ─────────────────────────────────────────────────────────
function TruthModeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  "use no memo";
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 300 });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      scale.value = withTiming(0.85, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.modalBox, boxStyle]}>
          <View style={styles.modalIconRow}>
            <Text style={styles.modalIcon}>⚠</Text>
            <Text style={styles.modalBadge}>真相模式</Text>
          </View>
          <Text style={styles.modalLine1}>其实我们没有算任何东西。</Text>
          <Text style={styles.modalLine2}>你写什么，{"\n"}我们就报告什么。</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalSub}>本应用为纯娱乐产品 · 无任何 AI 分析</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalCloseBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.modalCloseBtnText}>我知道了</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─── iOS Publish Modal ────────────────────────────────────────────────────────
function PublishIOSModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  "use no memo";
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 300 });
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const steps = [
    { icon: "1", label: "创建检查点", desc: "点击右上角「发布」按钮前，先保存检查点" },
    { icon: "2", label: "点击发布", desc: "在界面右上角点击 Publish 按钮" },
    { icon: "3", label: "选择 iOS", desc: "选择 iOS 平台，系统将自动构建 IPA 文件" },
    { icon: "4", label: "下载安装", desc: "构建完成后下载 IPA，通过 TestFlight 分发" },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={iosModalStyles.overlay}>
        <Pressable style={iosModalStyles.backdrop} onPress={onClose} />
        <Animated.View style={[iosModalStyles.sheet, boxStyle]}>
          {/* Header */}
          <View style={iosModalStyles.header}>
            <View style={iosModalStyles.headerLeft}>
              <View style={iosModalStyles.appleLogo}>
                <Text style={iosModalStyles.appleLogoText}></Text>
              </View>
              <View>
                <Text style={iosModalStyles.title}>发布到 iOS</Text>
                <Text style={iosModalStyles.subtitle}>通过 Expo EAS 构建 iOS 应用</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [iosModalStyles.closeBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={iosModalStyles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Steps */}
          <View style={iosModalStyles.stepsContainer}>
            {steps.map((step, i) => (
              <View key={i} style={iosModalStyles.stepRow}>
                <View style={iosModalStyles.stepNum}>
                  <Text style={iosModalStyles.stepNumText}>{step.icon}</Text>
                </View>
                <View style={iosModalStyles.stepContent}>
                  <Text style={iosModalStyles.stepLabel}>{step.label}</Text>
                  <Text style={iosModalStyles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Info box */}
          <View style={iosModalStyles.infoBox}>
            <Text style={iosModalStyles.infoIcon}>ℹ</Text>
            <Text style={iosModalStyles.infoText}>
              需要 Apple Developer 账号（$99/年）才能将应用发布到 App Store 或通过 TestFlight 分发。
            </Text>
          </View>

          {/* Actions */}
          <View style={iosModalStyles.actions}>
            <Pressable
              onPress={() => {
                Linking.openURL("https://developer.apple.com/programs/");
                onClose();
              }}
              style={({ pressed }) => [
                iosModalStyles.primaryBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={iosModalStyles.primaryBtnText}>Apple Developer 官网</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                iosModalStyles.secondaryBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={iosModalStyles.secondaryBtnText}>我知道了</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const iosModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  sheet: {
    backgroundColor: "#080C1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appleLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  appleLogoText: {
    fontSize: 24,
    color: "#E2E8F0",
  },
  title: {
    color: "#E2E8F0",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#4A6070",
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#64748B",
    fontSize: 14,
  },
  stepsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,212,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: {
    color: "#00D4FF",
    fontSize: 14,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepLabel: {
    color: "#D8E4F0",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  stepDesc: {
    color: "#4A6070",
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(251,191,36,0.06)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
    borderRadius: 12,
    padding: 14,
  },
  infoIcon: {
    color: "#FBBF24",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 1,
  },
  infoText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    letterSpacing: 0.2,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#E2E8F0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: "#060A14",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnText: {
    color: "#4A6070",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});

// ─// ─── 长图分享组件（复用报告页真实样式） ────────────────────────────────────────────;

function SharePoster({ userInfo, zodiac, age }: {
  userInfo: any;
  zodiac: string;
  age: number;
}) {
  // 数据行列表（不用动画，直接渲染）
  function StaticRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    if (!value) return null;
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, accent && styles.rowValueAccent]}>{value}</Text>
      </View>
    );
  }
  function StaticDivider() {
    return <View style={styles.divider} />;
  }

  const hasBasic = userInfo.occupation || userInfo.interests || userInfo.relationship;
  const hasExtra = userInfo.mbti || userInfo.confusion || userInfo.selfIntro;

  return (
    <View style={posterStyles.longWrapper}>
      {/* 顶部标识栏 */}
      <View style={posterStyles.longTopBar}>
        <View style={posterStyles.longTopLeft}>
          <View style={posterStyles.longTopDot} />
          <Text style={posterStyles.longTopLabel}>AI PERSONALITY ANALYSIS</Text>
        </View>
        <Text style={posterStyles.longTopDate}>{new Date().toISOString().slice(0, 10)}</Text>
      </View>

      {/* 标题区（与报告页一致） */}
      <View style={[styles.header, { borderBottomWidth: 0 }]}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>FINAL REPORT</Text>
        </View>
        <Text style={styles.headerTitle}>多模型联合人格终局报告</Text>
        <Text style={styles.headerSub}>25 个顶级大模型联合分析 · 一致性指数 100%</Text>
      </View>

      {/* 数据卡片 */}
      <View style={[posterStyles.longContent]}>
        <View style={styles.card}>
          <StaticRow label="你的名字" value={userInfo.name} accent />
          <StaticRow label="你的性别" value={userInfo.gender} />
          <StaticRow label="你的出生日期" value={userInfo.birthDate} />
          <StaticRow label="你的星座" value={zodiac} accent />
          <StaticRow label="你的年龄" value={age > 0 ? `${age} 岁` : ""} accent />
          {hasBasic ? (
            <>
              <StaticDivider />
              <StaticRow label="你的职业" value={userInfo.occupation} />
              <StaticRow label="你的兴趣爱好" value={userInfo.interests} />
              <StaticRow label="你的情感状态" value={userInfo.relationship} />
            </>
          ) : null}
          {hasExtra ? (
            <>
              <StaticDivider />
              <StaticRow label="你的 MBTI" value={userInfo.mbti} />
              <StaticRow label="你当前的困惑" value={userInfo.confusion} />
              <StaticRow label="你的自我介绍" value={userInfo.selfIntro} />
            </>
          ) : null}
        </View>

        {/* Verdict */}
        <View style={styles.verdictBox}>
          <Text style={styles.verdictTitle}>✓ 多模型一致确认</Text>
          <Text style={styles.verdictLine}>数据冲突：未发现　逻辑偏差：未发现</Text>
          <Text style={styles.verdictLine}>一致性指数：100%</Text>
        </View>
      </View>
    </View>
  );
}

const posterStyles = StyleSheet.create({
  // 长图外层容器
  longWrapper: { width: 375, backgroundColor: "#060A14", paddingBottom: 32 },
  longTopBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,212,255,0.08)" },
  longTopLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  longTopDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(0,212,255,0.9)" },
  longTopLabel: { color: "rgba(0,212,255,0.75)", fontSize: 9, fontWeight: "700", letterSpacing: 2.5 },
  longTopDate: { color: "rgba(0,212,255,0.35)", fontSize: 9, letterSpacing: 1 },
  longContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 14 },
  // 旧外层容器（保留以备用）
  wrapper: { width: 375, backgroundColor: "#060A14", overflow: "hidden", position: "relative", paddingBottom: 28 },
  // 背景光晕
  glowTop: { position: "absolute", top: -80, left: "50%", marginLeft: -120, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(0,212,255,0.07)" },
  glowBottom: { position: "absolute", bottom: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(124,58,237,0.08)" },
  // 扫描线
  scanLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(0,212,255,0.022)" },
  // 顶部标识栏
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(0,212,255,0.08)" },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  topDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "rgba(0,212,255,0.9)" },
  topLabel: { color: "rgba(0,212,255,0.75)", fontSize: 9, fontWeight: "700", letterSpacing: 2.5 },
  topDate: { color: "rgba(0,212,255,0.35)", fontSize: 9, letterSpacing: 1 },
  // 主视觉区
  heroArea: { alignItems: "center", paddingTop: 36, paddingBottom: 24, gap: 12 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, borderColor: "rgba(0,212,255,0.35)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,212,255,0.04)" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(0,212,255,0.1)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#00D4FF", fontSize: 28, fontWeight: "700", letterSpacing: 2 },
  nameText: { color: "#E8EEF4", fontSize: 34, fontWeight: "700", letterSpacing: 3, textAlign: "center" },
  genderText: { color: "#4A6070", fontSize: 13, letterSpacing: 2, textAlign: "center" },
  // MBTI + 星座强调强强强
  badgeRow: { flexDirection: "row", justifyContent: "center", gap: 14, paddingHorizontal: 24, paddingBottom: 28 },
  mbtiBadge: { flex: 1, alignItems: "center", backgroundColor: "rgba(0,212,255,0.06)", borderWidth: 1.5, borderColor: "rgba(0,212,255,0.3)", borderRadius: 16, paddingVertical: 14, gap: 4 },
  mbtiLabel: { color: "rgba(0,212,255,0.5)", fontSize: 9, fontWeight: "700", letterSpacing: 3 },
  mbtiValue: { color: "#00D4FF", fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  zodiacBadge: { flex: 1, alignItems: "center", backgroundColor: "rgba(124,58,237,0.06)", borderWidth: 1.5, borderColor: "rgba(124,58,237,0.35)", borderRadius: 16, paddingVertical: 14, gap: 4 },
  zodiacLabel: { color: "rgba(167,139,250,0.55)", fontSize: 9, fontWeight: "700", letterSpacing: 3 },
  zodiacValue: { color: "#A78BFA", fontSize: 28, fontWeight: "800", letterSpacing: 2 },
  // 分隔线
  dividerLine: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 20, marginBottom: 20 },
  // 次要信息网格
  detailGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  detailItem: { width: "47%", backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  detailLabel: { color: "#3D5068", fontSize: 10, letterSpacing: 1.5 },
  detailValue: { color: "#8FA8C0", fontSize: 14, fontWeight: "600", letterSpacing: 0.5 },
  // 底部确认条
  confirmBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, backgroundColor: "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: "rgba(16,185,129,0.18)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  confirmDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(16,185,129,0.85)" },
  confirmText: { flex: 1, color: "rgba(16,185,129,0.75)", fontSize: 11, fontWeight: "500", letterSpacing: 0.5 },
  confirmBadge: { backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 8, width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  confirmBadgeText: { color: "rgba(16,185,129,0.9)", fontSize: 14, fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReportScreen() {
  const router = useRouter();
  const { userInfo } = useUser();

  const zodiac = getZodiac(userInfo.birthDate);
  const age = getAge(userInfo.birthDate);

  const [showTruth, setShowTruth] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const titleTapCount = useRef(0);
  const titleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareCardRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleTitleTap = () => {
    titleTapCount.current += 1;
    if (titleTapTimer.current) clearTimeout(titleTapTimer.current);
    if (titleTapCount.current >= 3) {
      titleTapCount.current = 0;
      setShowTruth(true);
    } else {
      titleTapTimer.current = setTimeout(() => {
        titleTapCount.current = 0;
      }, 800);
    }
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (Platform.OS === "web") {
      const lines = [
        "【AI 多模型联合人格分析报告】",
        "",
        `姓名：${userInfo.name}`,
        `星座：${zodiac}`,
        `年龄：${age > 0 ? `${age} 岁` : "未知"}`,
        `职业：${userInfo.occupation || "未填写"}`,
        `兴趣爱好：${userInfo.interests || "未填写"}`,
        `情感状态：${userInfo.relationship || "未填写"}`,
        userInfo.mbti ? `MBTI：${userInfo.mbti}` : null,
        userInfo.confusion ? `当前困惑：${userInfo.confusion}` : null,
        userInfo.selfIntro ? `自我介绍：${userInfo.selfIntro}` : null,
        "",
        "✓ 多模型一致确认 · 一致性指数 100%",
        "本报告所有内容均来自你刚才输入的信息",
      ].filter(Boolean).join("\n");
      try {
        await Share.share({ message: lines });
      } catch (_) {}
      return;
    }

    setIsGenerating(true);
    try {
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      setPosterUri(uri);
      setShowPosterPreview(true);
    } catch (e) {
      const lines = [
        "【AI 多模型联合人格分析报告】",
        `姓名：${userInfo.name}`,
        `星座：${zodiac}`,
        `年龄：${age > 0 ? `${age} 岁` : "未知"}`,
        "✓ 多模型一致确认 · 一致性指数 100%",
      ].join("\n");
      try { await Share.share({ message: lines }); } catch (_) {}
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePosterShare = async () => {
    if (!posterUri) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.saveToLibraryAsync(posterUri);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
      await Share.share({
        url: posterUri,
        title: "我的人格分析报告",
        message: "AI 多模型联合人格分析报告 · 快来测测你的人格！",
      });
    } catch (_) {} finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/" as any);
  };



  const baseDelay = 150;
  let rowIndex = 0;
  const nextDelay = () => {
    const d = baseDelay + rowIndex * 90;
    rowIndex++;
    return d;
  };

  return (
    <ScreenContainer containerClassName="bg-[#060A14]" edges={["top", "left", "right"]}>
      {/* Header */}
      <FadeInBlock delay={0}>
        <Pressable onPress={handleTitleTap} style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>FINAL REPORT</Text>
          </View>
          <Text style={styles.headerTitle}>多模型联合人格终局报告</Text>
          <Text style={styles.headerSub}>
            25 个顶级大模型联合分析 · 一致性指数 100%
          </Text>
        </Pressable>
      </FadeInBlock>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main conclusion card */}
        <FadeInBlock delay={80}>
          <View style={styles.card}>
            <FadeInRow label="你的名字" value={userInfo.name} delay={nextDelay()} accent />
            <FadeInRow label="你的性别" value={userInfo.gender} delay={nextDelay()} />
            <FadeInRow label="你的出生日期" value={userInfo.birthDate} delay={nextDelay()} />
            <FadeInRow label="你的星座" value={zodiac} delay={nextDelay()} accent />
            <FadeInRow label="你的年龄" value={age > 0 ? `${age} 岁` : ""} delay={nextDelay()} accent />

            {(userInfo.occupation || userInfo.interests || userInfo.relationship) ? (
              <>
                <Divider delay={nextDelay()} />
                <FadeInRow label="你的职业" value={userInfo.occupation} delay={nextDelay()} />
                <FadeInRow label="你的兴趣爱好" value={userInfo.interests} delay={nextDelay()} />
                <FadeInRow label="你的情感状态" value={userInfo.relationship} delay={nextDelay()} />
              </>
            ) : null}

            {(userInfo.mbti || userInfo.confusion || userInfo.selfIntro) ? (
              <>
                <Divider delay={nextDelay()} />
                <FadeInRow label="你的 MBTI" value={userInfo.mbti} delay={nextDelay()} />
                <FadeInRow label="你当前的困惑" value={userInfo.confusion} delay={nextDelay()} />
                <FadeInRow label="你的自我介绍" value={userInfo.selfIntro} delay={nextDelay()} />
              </>
            ) : null}
          </View>
        </FadeInBlock>

        {/* Verdict footer */}
        <FadeInBlock delay={baseDelay + rowIndex * 90 + 100}>
          <View style={styles.verdictBox}>
            <Text style={styles.verdictTitle}>✓ 多模型一致确认</Text>
            <Text style={styles.verdictLine}>数据冲突：未发现　逻辑偏差：未发现</Text>
            <Text style={styles.verdictLine}>一致性指数：100%</Text>
          </View>
        </FadeInBlock>



        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionsBar}>
        <View style={styles.actions}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
              isGenerating && { opacity: 0.6 },
            ]}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#060A14" size="small" />
            ) : (
              <Text style={styles.shareBtnText}>生成长图并分享</Text>
            )}
          </Pressable>
          <Pressable
            onPress={handleRestart}
            style={({ pressed }) => [
              styles.restartBtn,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
            ]}
          >
            <Text style={styles.restartBtnText}>重新分析</Text>
          </Pressable>
        </View>
      </View>

      {/* Off-screen poster for capture */}
      <View style={{ position: "absolute", top: -9999, left: 0 }} pointerEvents="none">
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          <SharePoster userInfo={userInfo} zodiac={zodiac} age={age} />
        </ViewShot>
      </View>

      {/* Poster Preview Modal */}
      <Modal
        visible={showPosterPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPosterPreview(false)}
      >
        <View style={styles.posterModalOverlay}>
          <View style={styles.posterModalSheet}>
            <View style={styles.posterModalDragBar} />
            <View style={styles.posterModalHeader}>
              <View style={styles.posterModalHeaderLeft} />
              <Pressable
                onPress={() => setShowPosterPreview(false)}
                style={({ pressed }) => [styles.posterModalCloseBtn, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.posterModalClose}>关闭</Text>
              </Pressable>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.posterModalContent}
              showsVerticalScrollIndicator={false}
            >
              {posterUri ? (
                <View style={styles.posterImageWrapper}>
                  <Image
                    source={{ uri: posterUri }}
                    style={styles.posterPreviewImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
            </ScrollView>
            <View style={styles.posterModalActions}>
              {saveSuccess && (
                <View style={styles.saveSuccessHint}>
                  <Text style={styles.saveSuccessText}>✓ 已保存到相册</Text>
                </View>
              )}
              <Pressable
                onPress={handlePosterShare}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.posterShareBtn,
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
                  isSaving && { opacity: 0.6 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#060A14" size="small" />
                ) : (
                  <Text style={styles.posterShareBtnText}>📱 保存并分享</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Truth Mode Modal */}
      <TruthModeModal visible={showTruth} onClose={() => setShowTruth(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  headerBadge: {
    backgroundColor: "rgba(0,212,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.22)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: "rgba(0,212,255,0.9)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3.5,
  },
  headerTitle: {
    color: "#D8E4F0",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  headerSub: {
    color: "#3D5068",
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 14,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingVertical: 8,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  rowLabel: {
    color: "#4A6070",
    fontSize: 13,
    width: 110,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  rowValue: {
    color: "#B8C8D8",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  rowValueAccent: {
    color: "#D8E4F0",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginVertical: 4,
  },
  verdictBox: {
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.18)",
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  verdictTitle: {
    color: "rgba(16,185,129,0.9)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  verdictLine: {
    color: "#3D5068",
    fontSize: 12,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  // iOS Publish Banner
  iosBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  },
  iosBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iosBannerIcon: {
    fontSize: 28,
  },
  iosBannerTitle: {
    color: "#D8E4F0",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  iosBannerSub: {
    color: "#4A6070",
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iosBannerArrow: {
    color: "#4A6070",
    fontSize: 24,
    fontWeight: "300",
  },
  // Bottom actions
  actionsBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#060A14",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: "#00D4FF",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  shareBtnText: {
    color: "#050810",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  restartBtn: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  restartBtnText: {
    color: "#4A6070",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 1.2,
  },
  // Truth Mode Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: "#0D1120",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(251,191,36,0.35)",
    padding: 28,
    alignItems: "center",
    gap: 12,
    width: "100%",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  modalIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  modalIcon: { fontSize: 22, color: "#FBBF24" },
  modalBadge: { color: "#FBBF24", fontSize: 13, fontWeight: "700", letterSpacing: 2 },
  modalLine1: { color: "#E2E8F0", fontSize: 20, fontWeight: "700", textAlign: "center", letterSpacing: 0.5 },
  modalLine2: { color: "#94A3B8", fontSize: 17, textAlign: "center", lineHeight: 26, letterSpacing: 0.5 },
  modalDivider: { width: 40, height: 1, backgroundColor: "rgba(251,191,36,0.25)", marginVertical: 4 },
  modalSub: { color: "#475569", fontSize: 11, letterSpacing: 0.5, textAlign: "center" },
  modalCloseBtn: {
    marginTop: 8,
    backgroundColor: "rgba(251,191,36,0.12)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
    borderRadius: 50,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  modalCloseBtnText: { color: "#FBBF24", fontSize: 15, fontWeight: "700", letterSpacing: 1 },
  // Poster Preview Modal
  saveSuccessHint: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
    padding: 12,
    alignItems: "center",
  },
  saveSuccessText: { color: "#10B981", fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  posterModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", justifyContent: "flex-end" },
  posterModalSheet: {
    backgroundColor: "#080C1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(0,212,255,0.15)",
    height: "92%" as any,
    overflow: "hidden",
  },
  posterModalDragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  posterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,212,255,0.08)",
  },
  posterModalHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  posterModalHeaderDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00D4FF" },
  posterModalTitle: { color: "#D8E4F0", fontSize: 15, fontWeight: "700", letterSpacing: 1.5 },
  posterModalCloseBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  posterModalClose: { color: "#7A8FA6", fontSize: 13, fontWeight: "500", letterSpacing: 0.5 },
  posterModalContent: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 20 },
  posterImageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  posterPreviewImage: {
    width: Dimensions.get("window").width - 40,
    height: (Dimensions.get("window").width - 40) * 1.8,
    borderRadius: 16,
  },
  posterModalActions: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,212,255,0.08)",
    backgroundColor: "#080C1A",
  },
  posterShareBtn: {
    width: "100%" as any,
    backgroundColor: "#00D4FF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  posterShareBtnText: {
    color: "#060A14",
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
  },
});
