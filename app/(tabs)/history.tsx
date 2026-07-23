import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import type { Lecture } from "@/types/lecture";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-50 text-green-600",
  recording: "bg-accent/10 text-accent",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-ink/5 text-ink/50";
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.split(" ")[0]}`}>
      <Text className={`text-xs font-semibold capitalize ${style.split(" ")[1]}`}>
        {status}
      </Text>
    </View>
  );
}

function LectureCard({ lecture }: { lecture: Lecture }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/lecture/${lecture.id}`)}
      accessibilityRole="button"
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-4 mb-3 border border-black/5 shadow-sm"
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-ink font-semibold text-base flex-1 mr-3" numberOfLines={1}>
          {lecture.title}
        </Text>
        <StatusBadge status={lecture.status} />
      </View>
      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
        <Text className="text-ink/40 text-xs ml-1.5">
          {new Date(lecture.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View className="items-center mt-24 px-8">
      <Ionicons name="mic-outline" size={40} color="#d1d5db" />
      <Text className="text-ink/40 text-center mt-3">
        No lectures yet. Start one from the Home tab.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listLectures();
      setLectures(data);
    } catch {
      // Silently ignored for now — surface via a toast once one exists.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-ink">Your Lectures</Text>
        <Text className="text-ink/40 text-sm mt-0.5">
          {lectures.length} recorded
        </Text>
      </View>

      <FlatList
        data={lectures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        renderItem={({ item }) => <LectureCard lecture={item} />}
      />
    </SafeAreaView>
  );
}