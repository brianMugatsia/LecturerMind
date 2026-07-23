import { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import type { QuizQuestion } from "@/types/quiz";

interface QuizModalProps {
  visible: boolean;
  questions: QuizQuestion[];
  onClose: () => void;
}

type AnswerMap = Record<string, number>;

function QuizChoice({
  label,
  state,
  onPress,
  disabled,
}: {
  label: string;
  state: "default" | "selected" | "correct" | "incorrect";
  onPress: () => void;
  disabled: boolean;
}) {
  const styles = {
    default: "bg-white border-black/10",
    selected: "bg-ink/5 border-ink",
    correct: "bg-green-50 border-green-500",
    incorrect: "bg-red-50 border-red-500",
  } as const;

  const textStyles = {
    default: "text-ink",
    selected: "text-ink font-medium",
    correct: "text-green-700 font-medium",
    incorrect: "text-red-700",
  } as const;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: state === "selected", disabled }}
      className={`flex-row items-center px-3 py-2.5 rounded-lg mb-2 border ${styles[state]}`}
    >
      <Text className={`text-sm flex-1 ${textStyles[state]}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export function QuizModal({ visible, questions = [], onClose }: QuizModalProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  // Safely ensure questions run through validation
  const safeQuestions = useMemo(() => {
    return questions.map(q => ({
      ...q,
      // Handle fallback if backend postgres array strings aren't parsed yet
      choices: Array.isArray(q.choices) ? q.choices : []
    }));
  }, [questions]);

  // Bug Fix: Check that every single question actually has a mapped index in state
  const allAnswered = useMemo(() => {
    if (safeQuestions.length === 0) return false;
    return safeQuestions.every((q) => typeof answers[q.id] === "number");
  }, [safeQuestions, answers]);

  const score = useMemo(
    () =>
      safeQuestions.reduce(
        (total, q) => total + (answers[q.id] === q.correct_index ? 1 : 0),
        0
      ),
    [safeQuestions, answers]
  );

  const selectAnswer = (questionId: string, choiceIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
  };

  const handleClose = () => {
    setAnswers({});
    setSubmitted(false);
    onClose();
  };

  const getChoiceState = (
    questionId: string,
    choiceIndex: number,
    correctIndex: number
  ) => {
    const selected = answers[questionId];

    if (submitted) {
      if (choiceIndex === correctIndex) return "correct" as const;
      if (selected === choiceIndex) return "incorrect" as const;
    }

    if (selected === choiceIndex) return "selected" as const;
    return "default" as const;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-black/10 bg-white">
          <Text className="text-lg font-bold text-ink">
            Quiz ({safeQuestions.length} questions)
          </Text>
          <TouchableOpacity onPress={handleClose} accessibilityRole="button">
            <Text className="text-accent font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {safeQuestions.map((question, index) => (
            <View key={question.id} className="mb-6 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-ink font-semibold mb-3">
                {index + 1}. {question.question}
              </Text>

              {question.choices.map((choice, choiceIndex) => (
                <QuizChoice
                  key={choiceIndex}
                  label={choice}
                  disabled={submitted}
                  state={getChoiceState(
                    question.id,
                    choiceIndex,
                    question.correct_index
                  )}
                  onPress={() => selectAnswer(question.id, choiceIndex)}
                />
              ))}

              {submitted && question.explanation && (
                <View className="mt-2 p-3 bg-ink/5 rounded-lg border-l-2 border-accent">
                  <Text className="text-xs text-ink/80 font-medium mb-0.5">
                    Explanation:
                  </Text>
                  <Text className="text-xs text-ink/60 italic">
                    {question.explanation}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {submitted && (
            <View className="items-center mb-10 p-5 bg-white rounded-xl mx-2 shadow-sm border border-black/5">
              <Text className="text-sm font-medium text-ink/40 uppercase tracking-wider mb-1">
                Quiz Result
              </Text>
              <Text className="text-3xl font-extrabold text-ink">
                {score} / {safeQuestions.length}
              </Text>
              <Text className="text-xs text-ink/50 mt-2">
                {score === safeQuestions.length ? "Perfect Score! 🌟" : "Good attempt! Keep reviewing."}
              </Text>
            </View>
          )}
        </ScrollView>

        {!submitted && (
          <View className="p-4 border-t border-black/10 bg-white">
            <TouchableOpacity
              onPress={() => setSubmitted(true)}
              disabled={!allAnswered}
              accessibilityRole="button"
              accessibilityState={{ disabled: !allAnswered }}
              className={`rounded-full py-3.5 items-center justify-center shadow-sm ${
                allAnswered ? "bg-accent" : "bg-gray-200"
              }`}
            >
              <Text className={`font-semibold ${allAnswered ? "text-white" : "text-ink/30"}`}>
                Submit Answers
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}