import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// ─── Data ────────────────────────────────────────────────────────────────────

const MODELS_INIT = [
  { org: "OpenAI", name: "GPT-4o", color: "#10A37F" },
  { org: "Anthropic", name: "Claude 3", color: "#D4A574" },
  { org: "Google", name: "Gemini 1.5", color: "#4285F4" },
  { org: "Meta", name: "LLaMA 3", color: "#0668E1" },
  { org: "xAI", name: "Grok", color: "#E2E8F0" },
  { org: "Microsoft", name: "Copilot", color: "#00BCF2" },
  { org: "DeepMind", name: "Alpha 系统", color: "#9C27B0" },
  { org: "字节跳动", name: "豆包", color: "#FF6B35" },
  { org: "阿里巴巴", name: "通义千问", color: "#FF6A00" },
  { org: "百度", name: "文心一言", color: "#2932E1" },
  { org: "DeepSeek", name: "DeepSeek", color: "#00D4FF" },
  { org: "月之暗面", name: "Kimi", color: "#7C3AED" },
  { org: "智谱AI", name: "ChatGLM", color: "#10B981" },
  { org: "Mistral AI", name: "Mistral", color: "#FF7000" },
  { org: "Stability AI", name: "SDXL 3.0", color: "#EC4899" },
  { org: "Cohere", name: "Command R+", color: "#39D353" },
  { org: "讯飞科技", name: "Spark Max", color: "#1E90FF" },
  { org: "01.AI", name: "Yi-Large", color: "#F59E0B" },
  { org: "Perplexity", name: "Sonar Pro", color: "#8B5CF6" },
  { org: "Amazon", name: "Titan Express", color: "#FF9900" },
  { org: "Nvidia", name: "Nemotron-4", color: "#76B900" },
  { org: "华为", name: "盘古 Pro", color: "#CF0A2C" },
  { org: "Tencent", name: "混元 T1", color: "#07C160" },
  { org: "Inflection", name: "Pi 2.5", color: "#E879F9" },
];

const DATA_STEPS = [
  "输入数据加密传输完成",
  "文本分词完成 — 识别 2,847 个语义单元",
  "多语言语义层映射完成",
  "身份特征向量提取完成",
  "时间坐标对齐完成 — 星座已确认",
  "情感状态语义解析完成",
  "MBTI 编码校验完成",
  "职业语境模型构建完成",
  "兴趣向量空间映射完成",
  "人格矩阵初始化完成",
];

const PARALLEL_STEPS = [
  "神经矩阵展开中 — 层数: 96",
  "多头注意力参数重组中",
  "行为轨迹模拟中 — 1,024 步预测",
  "认知结构深度重建中",
  "情绪频谱深度扫描中",
  "社交关系图谱构建中",
  "上下文稳定性检测中",
  "价値观向量对齐中",
  "潜意识层深度解析中",
  "跨文化语境校准中",
  "实时共识指数计算中",
  "最终人格向量合并中",
];

const CONSENSUS_VALUES = [87, 92, 96, 100];

const VERIFY_MODELS = [
  "GPT-4o", "Claude 3.5", "Gemini Pro", "LLaMA 3.1", "Grok-2",
  "DeepSeek-R1", "通义千问", "文心一言", "Kimi", "ChatGLM",
  "Mistral", "Copilot", "豆包", "Yi-Large", "Command R+",
  "Spark Max", "盘古", "Sonar", "Nemotron", "混元",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScanLine() {
  const translateY = useSharedValue(-10);
  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(700, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={[styles.scanLine, style]} />;
}

function GlowOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ), -1, false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 }),
      ), -1, false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[styles.glowOrb, style]} />
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]}>
        <View style={styles.progressGlow} />
      </Animated.View>
    </View>
  );
}

function _PercentText({ target, style: textStyle }: { target: number; style?: any }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <Text style={textStyle || styles.progressValue}>{display}%</Text>;
}

function ModelCard({ org, name, color, visible, index }: {
  org: string; name: string; color: string; visible: boolean; index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const scale = useSharedValue(0.95);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.2)) });
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.2)) });
    }
  }, [visible]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
  return (
    <Animated.View style={[styles.modelCard, style]}>
      <View style={[styles.modelAccent, { backgroundColor: color }]} />
      <View style={styles.modelCardContent}>
        <Text style={styles.modelCardOrg}>{org}</Text>
        <Text style={[styles.modelCardName, { color }]}>{name}</Text>
      </View>
      <View style={styles.modelOnline}>
        <View style={[styles.modelOnlineDot, { backgroundColor: color }]} />
        <Text style={[styles.modelOnlineText, { color }]}>在线</Text>
      </View>
    </Animated.View>
  );
}

function DataLogRow({ text, index, visible }: { text: string; index: number; visible: boolean }) {
  const opacity = useSharedValue(0);
  const x = useSharedValue(-10);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      x.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    }
  }, [visible]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  return (
    <Animated.View style={[styles.dataLogRow, style]}>
      <View style={styles.dataLogDot} />
      <Text style={styles.dataLogText}>{text}</Text>
      <View style={styles.dataLogBadge}>
        <Text style={styles.dataLogBadgeText}>DONE</Text>
      </View>
    </Animated.View>
  );
}

function ParallelRow({ text, visible }: { text: string; visible: boolean }) {
  const opacity = useSharedValue(0);
  const x = useSharedValue(10);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      x.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    }
  }, [visible]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  return (
    <Animated.View style={[styles.parallelRow, style]}>
      <View style={styles.parallelDot} />
      <Text style={styles.parallelText}>{text}</Text>
      <View style={styles.parallelBadge}>
        <Text style={styles.parallelBadgeText}>RUN</Text>
      </View>
    </Animated.View>
  );
}

function VerifyCard({ name, checked, visible }: {
  name: string; checked: boolean; visible: boolean;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    }
  }, [visible]);
  const bgOpacity = useSharedValue(0);
  useEffect(() => {
    if (checked) {
      bgOpacity.value = withTiming(1, { duration: 400 });
    }
  }, [checked]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));
  return (
    <Animated.View style={[styles.verifyCard, style]}>
      <Animated.View style={[styles.verifyCardBg, bgStyle]} />
      <Text style={[styles.verifyCardCheck, checked && styles.verifyCardCheckDone]}>
        {checked ? "✓" : "◯"}
      </Text>
      <Text style={[styles.verifyCardName, checked && styles.verifyCardNameDone]}>{name}</Text>
      <Text style={[styles.verifyCardStatus, checked && styles.verifyCardStatusDone]}>
        {checked ? "通过" : "校验中"}
      </Text>
    </Animated.View>
  );
}

function PulsingRing({ size, delay, color }: { size: number; delay: number; color: string }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0.8, { duration: 0 }),
      ), -1, false,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0.8, { duration: 0 }),
      ), -1, false,
    ));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: color,
    }, style]} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalysisScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [modelsVisible, setModelsVisible] = useState<boolean[]>(Array(25).fill(false));
  const [dataStep, setDataStep] = useState(0);
  const [dataProgress, setDataProgress] = useState(0);
  const [parallelStep, setParallelStep] = useState(0);
  const [consensusIdx, setConsensusIdx] = useState(0);
  const [verifyVisible, setVerifyVisible] = useState<boolean[]>(Array(20).fill(false));
  const [verifyChecked, setVerifyChecked] = useState<boolean[]>(Array(20).fill(false));
  const [showFinalBtn, setShowFinalBtn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const phaseIn = () => {
    titleOpacity.value = 0;
    titleY.value = 10;
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
  };

  useEffect(() => {
    phaseIn();
    if (phase === 0) runPhase0();
    else if (phase === 1) runPhase1();
    else if (phase === 2) runPhase2();
    else if (phase === 3) runPhase3();
    else if (phase === 4) runPhase4();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  const runPhase0 = () => {
    MODELS_INIT.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setModelsVisible((prev) => {
          const next = [...prev]; next[i] = true; return next;
        });
        if (i === MODELS_INIT.length - 1) {
          timerRef.current = setTimeout(() => setPhase(1), 1000);
        }
      }, i * 250);
    });
  };

  const runPhase1 = () => {
    DATA_STEPS.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setDataStep(i + 1);
        setDataProgress(Math.round(((i + 1) / DATA_STEPS.length) * 100));
        if (i === DATA_STEPS.length - 1) {
          timerRef.current = setTimeout(() => setPhase(2), 800);
        }
      }, i * 500 + 300);
    });
  };

  const runPhase2 = () => {
    PARALLEL_STEPS.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setParallelStep(i + 1);
      }, i * 380 + 200);
    });
    CONSENSUS_VALUES.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setConsensusIdx(i);
        if (i === CONSENSUS_VALUES.length - 1) {
          timerRef.current = setTimeout(() => setPhase(3), 800);
        }
      }, i * 580 + 600);
    });
  };

  const runPhase3 = () => {
    VERIFY_MODELS.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setVerifyVisible((prev) => {
          const next = [...prev]; next[i] = true; return next;
        });
        timerRef.current = setTimeout(() => {
          setVerifyChecked((prev) => {
            const next = [...prev]; next[i] = true; return next;
          });
          if (i === VERIFY_MODELS.length - 1) {
            timerRef.current = setTimeout(() => setPhase(4), 700);
          }
        }, 280);
      }, i * 320 + 200);
    });
  };

  const runPhase4 = () => {
    timerRef.current = setTimeout(() => {
      setShowFinalBtn(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 2200);
  };

  const handleGoReport = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/reveal" as any);
  };

  // ── Phase 0: Model Init ──
  const renderPhase0 = () => (
    <View style={styles.phaseContent}>
      <View style={styles.gridList}>
        {MODELS_INIT.map((m, i) => (
          <ModelCard
            key={m.name}
            org={m.org}
            name={m.name}
            color={m.color}
            visible={modelsVisible[i]}
            index={i}
          />
        ))}
      </View>
    </View>
  );

  // ── Phase 1: Data Loading ──
  const renderPhase1 = () => (
    <View style={styles.phaseContent}>
      <View style={styles.dataLogBox}>
        {DATA_STEPS.map((step, i) => (
          <DataLogRow
            key={i}
            text={step}
            index={i}
            visible={i < dataStep}
          />
        ))}
        {dataStep < DATA_STEPS.length && (
          <View style={styles.processingRow}>
            <View style={styles.processingDot} />
            <Text style={styles.processingText}>处理中…</Text>
            <View style={styles.processingDots}>
              {[0, 1, 2].map((j) => (
                <_BlinkDot key={j} delay={j * 200} />
              ))}
            </View>
          </View>
        )}
      </View>
      <View style={styles.progressCard}>
        <View style={styles.progressCardHeader}>
          <Text style={styles.progressCardLabel}>数据处理进度</Text>
          <_PercentText target={dataProgress} />
        </View>
        <ProgressBar progress={dataProgress} />
        <View style={styles.progressCardFooter}>
          <Text style={styles.progressCardSub}>
            {dataStep} / {DATA_STEPS.length} 项完成
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Phase 2: Parallel Inference ──
  const renderPhase2 = () => (
    <View style={styles.phaseContent}>
      <View style={styles.parallelBox}>
        {PARALLEL_STEPS.map((step, i) => (
          <ParallelRow key={i} text={step} visible={i < parallelStep} />
        ))}
      </View>
      <View style={styles.consensusCard}>
        <Text style={styles.consensusCardLabel}>多模型共识指数</Text>
        <View style={styles.consensusValueRow}>
          <_PercentText target={CONSENSUS_VALUES[consensusIdx]} style={styles.consensusValue} />
          {CONSENSUS_VALUES[consensusIdx] === 100 && (
            <View style={styles.consensusBadge}>
              <Text style={styles.consensusBadgeText}>完美共识</Text>
            </View>
          )}
        </View>
        <ProgressBar progress={CONSENSUS_VALUES[consensusIdx]} />
      </View>
    </View>
  );

  // ── Phase 3: Verification ──
  const renderPhase3 = () => (
    <View style={styles.phaseContent}>
      <View style={styles.verifyGrid}>
        {VERIFY_MODELS.map((name, i) => (
          <VerifyCard
            key={name}
            name={name}
            checked={verifyChecked[i]}
            visible={verifyVisible[i]}
          />
        ))}
      </View>
      {verifyChecked.every(Boolean) && (
        <_VerifyResult />
      )}
    </View>
  );

  // ── Phase 4: Final Synthesis ──
  const renderPhase4 = () => (
    <SynthPhase showFinalBtn={showFinalBtn} onGoReport={handleGoReport} />
  );

  const PHASE_TITLES = [
    "多模型系统初始化中",
    "用户数据加载中",
    "多模型交叉分析中",
    "多模型一致性校验",
    "人格矩阵最终合成",
  ];

  const PHASE_SUBTITLES = [
    "正在接入全球顶级大模型节点",
    "解析并向量化用户输入数据",
    "15 个模型并行推理中",
    "交叉比对模型输出结果",
    "生成最终人格分析报告",
  ];

  return (
    <ScreenContainer containerClassName="bg-[#060A14]" edges={["top", "left", "right", "bottom"]}>
      <ScanLine />

      {/* Phase step bar */}
      <View style={styles.stepBar}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              i === phase && styles.stepDotActive,
              i < phase && styles.stepDotDone,
            ]}>
              {i < phase && <Text style={styles.stepDotCheck}>✓</Text>}
              {i === phase && <View style={styles.stepDotPulse} />}
            </View>
            {i < 4 && <View style={[styles.stepLine, i < phase && styles.stepLineDone]} />}
          </View>
        ))}
      </View>

      {/* Title block */}
      <Animated.View style={[styles.titleBlock, titleStyle]}>
        <View style={styles.phasePill}>
          <Text style={styles.phasePillText}>PHASE {phase + 1} / 5</Text>
        </View>
        <Text style={styles.phaseTitle}>{PHASE_TITLES[phase]}</Text>
        <Text style={styles.phaseSub}>{PHASE_SUBTITLES[phase]}</Text>
      </Animated.View>

      {/* Content */}
      <View style={{ flex: 1, overflow: "hidden" }}>
        {phase === 0 && renderPhase0()}
        {phase === 1 && renderPhase1()}
        {phase === 2 && renderPhase2()}
        {phase === 3 && renderPhase3()}
        {phase === 4 && renderPhase4()}
      </View>
    </ScreenContainer>
  );
}

// ── Helper components defined after main ──

function _BlinkDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.2, { duration: 400 }),
      ), -1, false,
    ));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.blinkDot, style]} />;
}

function _VerifyResult() {
  const opacity = useSharedValue(0);
  const y = useSharedValue(10);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    y.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));
  return (
    <Animated.View style={[styles.verifyResultCard, style]}>
      <View style={styles.verifyResultRow}>
        <Text style={styles.verifyResultIcon}>✓</Text>
        <Text style={styles.verifyResultText}>数据冲突：</Text>
        <Text style={styles.verifyResultGreen}>未发现</Text>
      </View>
      <View style={styles.verifyResultRow}>
        <Text style={styles.verifyResultIcon}>✓</Text>
        <Text style={styles.verifyResultText}>逻辑偏差：</Text>
        <Text style={styles.verifyResultGreen}>未发现</Text>
      </View>
      <View style={styles.verifyResultRow}>
        <Text style={styles.verifyResultIcon}>✓</Text>
        <Text style={styles.verifyResultText}>一致性指数：</Text>
        <Text style={styles.verifyResultGreen}>100%</Text>
      </View>
    </Animated.View>
  );
}

function SynthPhase({ showFinalBtn, onGoReport }: { showFinalBtn: boolean; onGoReport: () => void }) {
  // Container: fade in + slide up
  const containerOpacity = useSharedValue(0);
  const containerY = useSharedValue(30);
  // Orb area: delayed scale in
  const orbOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.7);
  // Text area: further delayed fade in
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  // Final button: animated in when showFinalBtn becomes true
  const btnOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.85);

  useEffect(() => {
    // Container slides in
    containerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    containerY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    // Orb scales in with slight delay
    orbOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    orbScale.value = withDelay(200, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.1)) }));
    // Text fades in after orb
    textOpacity.value = withDelay(500, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    textY.value = withDelay(500, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, []);

  useEffect(() => {
    if (showFinalBtn) {
      btnOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
      btnScale.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.back(1.15)) });
    }
  }, [showFinalBtn]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerY.value }],
  }));
  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <Animated.View style={[styles.synthContainer, containerStyle]}>
      <Animated.View style={[styles.synthOrbArea, orbStyle]}>
        <GlowOrb />
        <PulsingRing size={160} delay={0} color="rgba(0,212,255,0.6)" />
        <PulsingRing size={200} delay={500} color="rgba(124,58,237,0.4)" />
        <PulsingRing size={240} delay={1000} color="rgba(16,185,129,0.3)" />
        <View style={styles.synthCoreCircle}>
          <Text style={styles.synthCoreIcon}>∞</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.synthTextArea, textStyle]}>
        <Text style={styles.synthLine1}>全局人格矩阵构建完成</Text>
        <Text style={showFinalBtn ? styles.synthLineDone : styles.synthLine2}>
          {showFinalBtn ? "✓  结论已生成" : "多模型综合结论生成中"}
        </Text>
        {showFinalBtn && (
          <Animated.View style={btnStyle}>
            <Pressable
              onPress={onGoReport}
              style={({ pressed }) => [
                styles.finalBtn,
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
              ]}
            >
              <Text style={styles.finalBtnText}>进入最终报告</Text>
              <Text style={styles.finalBtnArrow}>→</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,212,255,0.15)",
    zIndex: 0,
  },
  glowOrb: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,212,255,0.06)",
  },

  // Step bar
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 32,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: "rgba(0,212,255,0.8)",
    backgroundColor: "rgba(0,212,255,0.12)",
  },
  stepDotDone: {
    borderColor: "rgba(16,185,129,0.8)",
    backgroundColor: "rgba(16,185,129,0.12)",
  },
  stepDotCheck: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  stepDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00D4FF",
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  stepLineDone: {
    backgroundColor: "rgba(16,185,129,0.7)",
  },

  // Title block
  titleBlock: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: "center",
    gap: 6,
  },
  phasePill: {
    backgroundColor: "rgba(0,212,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  phasePillText: {
    color: "rgba(0,212,255,0.9)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3.5,
  },
  phaseTitle: {
    color: "#E8EEF4",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  phaseSub: {
    color: "#3D5068",
    fontSize: 12,
    letterSpacing: 0.8,
    textAlign: "center",
  },

  // Phase content wrapper
  phaseContent: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },

  // Phase 0 – Model cards
  gridList: {
    flex: 1,
    gap: 5,
  },
  modelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    paddingRight: 12,
  },
  modelAccent: {
    width: 3,
    alignSelf: "stretch",
    marginRight: 12,
  },
  modelCardContent: {
    flex: 1,
    paddingVertical: 8,
  },
  modelCardOrg: {
    color: "#3D5068",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  modelCardName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  modelOnline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modelOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  modelOnlineText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Phase 1 – Data loading
  dataLogBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    gap: 2,
  },
  dataLogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  dataLogDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  dataLogText: {
    color: "#7A8FA6",
    fontSize: 13,
    flex: 1,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  dataLogBadge: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dataLogBadgeText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dataLogDone: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  processingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D4FF",
    opacity: 0.5,
  },
  processingDots: {
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto" as any,
  },
  blinkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#00D4FF",
  },
  processingText: {
    color: "#3D5068",
    fontSize: 13,
    flex: 1,
    letterSpacing: 0.3,
  },
  progressCard: {
    backgroundColor: "rgba(0,212,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.1)",
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  progressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressCardLabel: {
    color: "#3D5068",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  progressValue: {
    color: "#00D4FF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#00D4FF",
    position: "relative",
  },
  progressGlow: {
    position: "absolute",
    right: 0,
    top: -2,
    bottom: -2,
    width: 12,
    backgroundColor: "rgba(0,212,255,0.6)",
    borderRadius: 6,
  },
  progressCardFooter: {
    alignItems: "flex-end",
  },
  progressCardSub: {
    color: "#2D3F55",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Phase 2 – Parallel
  parallelBox: {
    flex: 1,
    backgroundColor: "rgba(124,58,237,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.08)",
    padding: 14,
    gap: 2,
  },
  parallelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  parallelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7C3AED",
  },
  parallelText: {
    color: "#7A8FA6",
    fontSize: 13,
    flex: 1,
    letterSpacing: 0.3,
  },
  parallelBadge: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  parallelBadgeText: {
    color: "#7C3AED",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  consensusCard: {
    backgroundColor: "rgba(124,58,237,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.15)",
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  consensusCardLabel: {
    color: "rgba(167,139,250,0.9)",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "600",
  },
  consensusValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  consensusValue: {
    color: "#E8EEF4",
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: 2,
  },
  consensusBadge: {
    backgroundColor: "rgba(16,185,129,0.15)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.4)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  consensusBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Phase 3 – Verify
  verifyGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignContent: "flex-start",
  },
  verifyCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
    position: "relative",
  },
  verifyCardBg: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(16,185,129,0.07)",
  },
  verifyCardCheck: {
    color: "#2D3F52",
    fontSize: 14,
    width: 18,
    textAlign: "center",
  },
  verifyCardCheckDone: {
    color: "rgba(16,185,129,0.9)",
  },
  verifyCardName: {
    color: "#4A6070",
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  verifyCardNameDone: {
    color: "#B8C8D8",
  },
  verifyCardStatus: {
    color: "#2D3F52",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  verifyCardStatusDone: {
    color: "rgba(16,185,129,0.9)",
    fontWeight: "600",
  },
  verifyResultCard: {
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.18)",
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  verifyResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifyResultIcon: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
    width: 16,
  },
  verifyResultText: {
    color: "#64748B",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  verifyResultGreen: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Phase 4 – Synthesis
  synthContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    paddingBottom: 30,
  },
  synthOrbArea: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  synthCoreCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(0,212,255,0.07)",
    borderWidth: 1.5,
    borderColor: "rgba(0,212,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  synthCoreIcon: {
    fontSize: 42,
    color: "rgba(0,212,255,0.9)",
  },
  synthTextArea: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  synthLine1: {
    color: "#7A8FA6",
    fontSize: 15,
    letterSpacing: 1.2,
    textAlign: "center",
    lineHeight: 22,
  },
  synthLine2: {
    color: "#4A6070",
    fontSize: 14,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  synthLineDone: {
    color: "rgba(16,185,129,0.9)",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
  },
  finalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D4FF",
    paddingHorizontal: 36,
    paddingVertical: 17,
    borderRadius: 50,
    gap: 10,
    marginTop: 8,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 12,
  },
  finalBtnText: {
    color: "#050810",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 2,
  },
  finalBtnArrow: {
    color: "#050810",
    fontSize: 17,
    fontWeight: "700",
  },
});
