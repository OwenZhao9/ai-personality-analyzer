import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useUser, UserInfo } from "@/lib/user-context";
import * as Haptics from "expo-haptics";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ["男", "女", "其他", "不愿透露"];
const MBTI_OPTIONS = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
  "不知道",
];
const RELATIONSHIP_OPTIONS = ["单身", "恋爱中", "已婚", "分手中", "复杂", "不愿透露"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ─── WheelPicker ─────────────────────────────────────────────────────────────

function WheelPicker({
  data,
  selectedValue,
  onValueChange,
}: {
  data: string[];
  selectedValue: string;
  onValueChange: (v: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = data.indexOf(selectedValue);
  const didInitScroll = useRef(false);
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    if (didInitScroll.current) return;
    const timer = setTimeout(() => {
      if (scrollRef.current && selectedIndex >= 0) {
        scrollRef.current.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
        didInitScroll.current = true;
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      scrollRef.current?.scrollTo({ y: clampedIndex * ITEM_HEIGHT, animated: true });
      if (data[clampedIndex] !== data[selectedIndexRef.current]) {
        onValueChange(data[clampedIndex]);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    [data, onValueChange],
  );

  return (
    <View style={pickerStyles.column}>
      <View style={pickerStyles.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        nestedScrollEnabled
      >
        {data.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <Pressable
              key={item}
              onPress={() => {
                const idx = data.indexOf(item);
                onValueChange(item);
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={pickerStyles.item}
            >
              <Text style={[pickerStyles.itemText, isSelected && pickerStyles.itemTextSelected]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  column: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(0,212,255,0.08)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,212,255,0.4)",
    zIndex: 0,
    pointerEvents: "none",
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    color: "#475569",
    fontSize: 17,
    letterSpacing: 1,
  },
  itemTextSelected: {
    color: "#00D4FF",
    fontSize: 20,
    fontWeight: "700",
    zIndex: 2,
  },
});

// ─── DatePickerModal ──────────────────────────────────────────────────────────

function DatePickerModal({
  visible,
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  year: string;
  month: string;
  day: string;
  onYearChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onDayChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onCancel} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Pressable onPress={onCancel} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Text style={modalStyles.cancelBtn}>取消</Text>
            </Pressable>
            <Text style={modalStyles.title}>选择出生日期</Text>
            <Pressable onPress={onConfirm} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Text style={modalStyles.confirmBtn}>确定</Text>
            </Pressable>
          </View>

          <View style={modalStyles.labelRow}>
            <Text style={modalStyles.colLabel}>年</Text>
            <Text style={modalStyles.colLabel}>月</Text>
            <Text style={modalStyles.colLabel}>日</Text>
          </View>

          <View style={modalStyles.pickersRow}>
            <WheelPicker data={YEARS} selectedValue={year} onValueChange={onYearChange} />
            <WheelPicker data={MONTHS} selectedValue={month} onValueChange={onMonthChange} />
            <WheelPicker data={DAYS} selectedValue={day} onValueChange={onDayChange} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#060A14",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  title: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cancelBtn: {
    color: "#64748B",
    fontSize: 15,
  },
  confirmBtn: {
    color: "#00D4FF",
    fontSize: 15,
    fontWeight: "700",
  },
  labelRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  colLabel: {
    flex: 1,
    textAlign: "center",
    color: "#475569",
    fontSize: 12,
    letterSpacing: 2,
  },
  pickersRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 4,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitleText}>{children}</Text>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? `请输入${label}`}
        placeholderTextColor="#334155"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        returnKeyType={multiline ? "default" : "done"}
        selectionColor="#00D4FF"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

function OptionSelector({
  label,
  options,
  value,
  onSelect,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.optionRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt);
            }}
            style={({ pressed }) => [
              styles.optionBtn,
              value === opt && styles.optionBtnActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InputScreen() {
  const router = useRouter();
  const { setUserInfo } = useUser();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  const [pickerYear, setPickerYear] = useState(String(currentYear - 25));
  const [pickerMonth, setPickerMonth] = useState("01");
  const [pickerDay, setPickerDay] = useState("01");
  const [birthDate, setBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [occupation, setOccupation] = useState("");
  const [interests, setInterests] = useState("");
  const [relationship, setRelationship] = useState("");
  const [mbti, setMbti] = useState("");
  const [confusion, setConfusion] = useState("");
  const [selfIntro, setSelfIntro] = useState("");
  const [error, setError] = useState("");

  const handleDateConfirm = () => {
    setBirthDate(`${pickerYear}-${pickerMonth}-${pickerDay}`);
    setShowDatePicker(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError("请填写姓名"); return; }
    if (!birthDate) { setError("请选择出生日期"); return; }
    setError("");

    const info: UserInfo = {
      name: name.trim(),
      gender,
      birthDate,
      occupation: occupation.trim(),
      interests: interests.trim(),
      relationship,
      mbti,
      confusion: confusion.trim(),
      selfIntro: selfIntro.trim(),
    };
    setUserInfo(info);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.push("/analysis" as any);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0E1A]" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>信息填写</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={24}
        keyboardOpeningTime={250}
      >
        {/* Hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            ⚡ 请填写以下信息，系统将启动多模型联合分析
          </Text>
        </View>

        {/* Basic */}
        <SectionTitle>基础身份信息</SectionTitle>
        <InputField label="姓名 / 昵称" value={name} onChangeText={setName} placeholder="请输入你的姓名或昵称" required />
        <OptionSelector label="性别" options={GENDER_OPTIONS} value={gender} onSelect={setGender} />

        {/* 出生日期 */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            出生日期<Text style={styles.required}> *</Text>
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              styles.datePickerBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            {birthDate ? (
              <Text style={styles.datePickerValueText}>{birthDate}</Text>
            ) : (
              <Text style={styles.datePickerPlaceholder}>点击选择年 / 月 / 日</Text>
            )}
            <Text style={styles.datePickerArrow}>▾</Text>
          </Pressable>
        </View>

        {/* Social */}
        <SectionTitle>社会角色信息</SectionTitle>
        <InputField label="职业" value={occupation} onChangeText={setOccupation} placeholder="如：学生、程序员、设计师..." />
        <InputField label="兴趣爱好" value={interests} onChangeText={setInterests} placeholder="如：音乐、旅行、摄影..." multiline />
        <OptionSelector label="情感状态" options={RELATIONSHIP_OPTIONS} value={relationship} onSelect={setRelationship} />

        {/* Personality */}
        <SectionTitle>人格深度信息</SectionTitle>
        <OptionSelector label="MBTI 类型（可选）" options={MBTI_OPTIONS} value={mbti} onSelect={setMbti} />
        <InputField label="当前困惑" value={confusion} onChangeText={setConfusion} placeholder="你最近在思考什么问题？" multiline />
        <InputField label="一句话自我介绍" value={selfIntro} onChangeText={setSelfIntro} placeholder="用一句话描述你自己..." multiline />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.85 },
          ]}
        >
          <Text style={styles.submitBtnText}>启动多模型分析</Text>
          <Text style={styles.submitBtnIcon}>⚡</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>

      {/* 日期滚轮弹窗 */}
      <DatePickerModal
        visible={showDatePicker}
        year={pickerYear}
        month={pickerMonth}
        day={pickerDay}
        onYearChange={setPickerYear}
        onMonthChange={setPickerMonth}
        onDayChange={setPickerDay}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  backBtnText: { color: "rgba(0,212,255,0.9)", fontSize: 16, fontWeight: "500" },
  headerTitle: {
    color: "#8899AA",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 2.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 4,
  },
  hintBox: {
    backgroundColor: "rgba(0,212,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,212,255,0.18)",
    borderRadius: 12,
    padding: 13,
    marginBottom: 16,
  },
  hintText: { color: "rgba(0,212,255,0.85)", fontSize: 15, letterSpacing: 0.8, lineHeight: 22 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleBar: { width: 3, height: 16, backgroundColor: "rgba(0,212,255,0.8)", borderRadius: 2 },
  sectionTitleText: { color: "rgba(0,212,255,0.9)", fontSize: 16, fontWeight: "700", letterSpacing: 2.5 },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: { color: "#7A8FA6", fontSize: 15, letterSpacing: 1.2, marginBottom: 8 },
  required: { color: "#FF5A5A" },
  input: {
    height: 52,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#D8E4F0",
    fontSize: 17,
  },
  inputFocused: {
    borderColor: "rgba(0,212,255,0.7)",
    backgroundColor: "rgba(0,212,255,0.05)",
  },
  inputMultiline: { height: undefined, minHeight: 88, textAlignVertical: "top", paddingTop: 14, paddingBottom: 14 },
  datePickerBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerValueText: { color: "#D8E4F0", fontSize: 15, fontWeight: "600", letterSpacing: 1.2 },
  datePickerPlaceholder: { color: "#2D3F52", fontSize: 15 },
  datePickerArrow: { color: "rgba(0,212,255,0.8)", fontSize: 16 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  optionBtnActive: { borderColor: "rgba(0,212,255,0.7)", backgroundColor: "rgba(0,212,255,0.1)" },
  optionText: { color: "#4A6070", fontSize: 16 },
  optionTextActive: { color: "#00D4FF", fontWeight: "600" },
  errorText: { color: "#EF4444", fontSize: 13, textAlign: "center", marginTop: 8, marginBottom: 4 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D4FF",
    paddingVertical: 17,
    borderRadius: 50,
    marginTop: 24,
    gap: 10,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  submitBtnText: { color: "#050810", fontSize: 18, fontWeight: "700", letterSpacing: 2.5 },
  submitBtnIcon: { fontSize: 17 },
});
