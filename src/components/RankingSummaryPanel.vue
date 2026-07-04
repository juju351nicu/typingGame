<script setup lang="ts">
import type { RankingScore } from "@/types/interfaces";

interface RankingSummaryPanelProps {
  bestScore: RankingScore | null;
  bestScoreSummary: string;
  normalBestScore: RankingScore | null;
  normalBestScoreSummary: string;
  timeAttackBestScore: RankingScore | null;
  timeAttackBestScoreSummary: string;
  gameScoresCount: number;
  rankingItemsCount: number;
}

defineProps<RankingSummaryPanelProps>();
</script>
<template>
  <div class="summary-grid">
    <div class="summary-card best-score-card">
      <span class="summary-label">最高スコア</span>
      <span class="summary-value">{{ bestScore?.score ?? "-" }}</span>
      <span class="summary-note">{{ bestScoreSummary }}</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">通常ベスト</span>
      <span class="summary-value">
        {{ normalBestScore?.score ?? "-" }}
      </span>
      <span class="summary-note">{{ normalBestScoreSummary }}</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">タイムアタックベスト</span>
      <span class="summary-value">
        {{ timeAttackBestScore?.score ?? "-" }}
      </span>
      <span class="summary-note">{{ timeAttackBestScoreSummary }}</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">プレイ回数</span>
      <span class="summary-value">{{ gameScoresCount }}</span>
      <span class="summary-note">保存済みプレイ回数</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">表示件数</span>
      <span class="summary-value">{{ rankingItemsCount }}</span>
      <span class="summary-note">現在の表示件数</span>
    </div>
  </div>
</template>
<style scoped>
.summary-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.summary-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
  padding: 18px 20px;
}

.best-score-card {
  border-top: 4px solid #673ab7;
}

.summary-label {
  color: var(--app-text-muted);
  display: block;
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.summary-value {
  color: var(--app-text);
  display: block;
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.1;
}

.summary-note {
  color: var(--app-text-muted);
  display: block;
  font-size: 1.3rem;
  margin-top: 8px;
}

@media (max-width: 720px) {
  .summary-grid {
    gap: 10px;
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 14px 16px;
  }

  .summary-value {
    font-size: 2.6rem;
  }
}
</style>
