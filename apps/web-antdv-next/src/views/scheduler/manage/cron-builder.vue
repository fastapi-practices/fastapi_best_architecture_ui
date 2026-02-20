<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Cron } from 'croner';
import dayjs from 'dayjs';

import { CRONTAB_PRESETS } from './data';

const props = defineProps<{
  open: boolean;
  value?: string;
}>();

const emit = defineEmits<{
  confirm: [value: string];
  'update:open': [value: boolean];
}>();

const WEEKDAY_LABELS: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

interface CronField {
  mode: 'all' | 'specific' | 'step';
  step: number;
  values: number[];
}

const activeTab = ref('minute');

const segmentOptions = [
  { label: '分', value: 'minute' },
  { label: '时', value: 'hour' },
  { label: '日', value: 'day' },
  { label: '月', value: 'month' },
  { label: '周', value: 'weekday' },
];

const cronBuilder = reactive<{
  day: CronField;
  hour: CronField;
  minute: CronField;
  month: CronField;
  weekday: CronField;
}>({
  minute: { mode: 'all', step: 1, values: [] },
  hour: { mode: 'all', step: 1, values: [] },
  day: { mode: 'all', step: 1, values: [] },
  month: { mode: 'all', step: 1, values: [] },
  weekday: { mode: 'all', step: 1, values: [] },
});

function resetCronBuilder() {
  for (const key of ['minute', 'hour', 'day', 'month', 'weekday'] as const) {
    cronBuilder[key].mode = 'all';
    cronBuilder[key].step = 1;
    cronBuilder[key].values = [];
  }
}

function cronFieldToString(field: CronField): string {
  if (field.mode === 'all') return '*';
  if (field.mode === 'step') return `*/${field.step}`;
  if (field.values.length === 0) return '*';
  return [...field.values].toSorted((a, b) => a - b).join(',');
}

function expandCronPart(part: string): number[] {
  const values: number[] = [];
  for (const segment of part.split(',')) {
    if (segment.includes('-')) {
      const nums = segment.split('-').map((v) => Number.parseInt(v, 10));
      const start = nums[0];
      const end = nums[1];
      if (
        start !== undefined &&
        end !== undefined &&
        !Number.isNaN(start) &&
        !Number.isNaN(end)
      ) {
        for (let i = start; i <= end; i++) values.push(i);
      }
    } else {
      const v = Number.parseInt(segment, 10);
      if (!Number.isNaN(v)) values.push(v);
    }
  }
  return values;
}

function parseCronPart(
  key: 'day' | 'hour' | 'minute' | 'month' | 'weekday',
  part: string,
) {
  if (part === '*') {
    cronBuilder[key].mode = 'all';
  } else if (part.startsWith('*/')) {
    cronBuilder[key].mode = 'step';
    cronBuilder[key].step = Number.parseInt(part.slice(2), 10) || 1;
  } else {
    cronBuilder[key].mode = 'specific';
    cronBuilder[key].values = expandCronPart(part);
  }
}

function normalizeCronExpression(expr: string): string {
  return expr
    .split(/\s+/)
    .map((part) => {
      if (part === '*' || part.startsWith('*/')) return part;
      return expandCronPart(part)
        .toSorted((a, b) => a - b)
        .join(',');
    })
    .join(' ');
}

const cronParts = computed(() => ({
  minute: cronFieldToString(cronBuilder.minute),
  hour: cronFieldToString(cronBuilder.hour),
  day: cronFieldToString(cronBuilder.day),
  month: cronFieldToString(cronBuilder.month),
  weekday: cronFieldToString(cronBuilder.weekday),
}));

const cronExpression = computed(() => {
  const p = cronParts.value;
  return `${p.minute} ${p.hour} ${p.day} ${p.month} ${p.weekday}`;
});

const cronPreviewRuns = computed(() => {
  try {
    return new Cron(cronExpression.value).nextRuns(5);
  } catch {
    return [];
  }
});

function parseCronExpression(expr: string) {
  const parts = expr.split(/\s+/);
  if (parts.length !== 5) return;

  const fields = ['minute', 'hour', 'day', 'month', 'weekday'] as const;
  fields.forEach((key, i) => {
    parseCronPart(key, parts[i] || '*');
  });
}

function applyPreset(expr: string) {
  parseCronExpression(expr);
}

function parseFieldString(
  key: 'day' | 'hour' | 'minute' | 'month' | 'weekday',
  val: string,
) {
  parseCronPart(key, val.trim() || '*');
}

function toggleCronValue(field: CronField, val: number) {
  const idx = field.values.indexOf(val);
  if (idx === -1) {
    field.values.push(val);
  } else {
    field.values.splice(idx, 1);
  }
}

function handleConfirm() {
  emit('confirm', cronExpression.value);
  emit('update:open', false);
}

function handleCancel() {
  emit('update:open', false);
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetCronBuilder();
      activeTab.value = 'minute';
      if (props.value) {
        parseCronExpression(props.value);
      }
    }
  },
);
</script>

<template>
  <a-modal
    :open="open"
    title="Crontab 可视化配置"
    width="720px"
    style="top: 50px"
    :styles="{
      container: { background: 'hsl(var(--background))' },
    }"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-1.5 border-border pt-1">
        <a-tag
          v-for="preset in CRONTAB_PRESETS"
          :key="preset.value"
          :color="
            cronExpression === normalizeCronExpression(preset.value)
              ? 'blue'
              : 'default'
          "
          class="cursor-pointer select-none transition-all hover:opacity-80"
          @click="applyPreset(preset.value)"
        >
          {{ preset.label }}
        </a-tag>
      </div>

      <a-segmented v-model:value="activeTab" block :options="segmentOptions" />

      <div
        v-show="activeTab === 'minute'"
        class="space-y-2 rounded-lg border border-border px-4 py-2.5"
      >
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.minute.mode === 'all' ? '' : 'opacity-40'"
          @click="cronBuilder.minute.mode = 'all'"
        >
          <a-radio :checked="cronBuilder.minute.mode === 'all'" />
          <span class="text-sm">每分钟</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.minute.mode === 'step' ? '' : 'opacity-40'"
          @click="cronBuilder.minute.mode = 'step'"
        >
          <a-radio :checked="cronBuilder.minute.mode === 'step'" />
          <span class="text-sm">每隔</span>
          <a-input-number
            v-model:value="cronBuilder.minute.step"
            :min="1"
            :max="59"
            size="small"
            class="w-16"
            @focus="cronBuilder.minute.mode = 'step'"
          />
          <span class="text-sm">分钟</span>
        </div>
        <div
          class="cursor-pointer"
          :class="cronBuilder.minute.mode === 'specific' ? '' : 'opacity-40'"
          @click="cronBuilder.minute.mode = 'specific'"
        >
          <div class="mb-1 flex items-center gap-2">
            <a-radio :checked="cronBuilder.minute.mode === 'specific'" />
            <span class="text-sm">指定</span>
          </div>
          <div class="grid grid-cols-10 gap-1 pl-6">
            <a-tag
              v-for="v in 60"
              :key="v - 1"
              :color="
                cronBuilder.minute.values.includes(v - 1) ? 'blue' : 'default'
              "
              class="cursor-pointer select-none text-center transition-all hover:opacity-80"
              @click.stop="
                cronBuilder.minute.mode = 'specific';
                toggleCronValue(cronBuilder.minute, v - 1);
              "
            >
              {{ v - 1 }}
            </a-tag>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'hour'"
        class="space-y-2 rounded-lg border border-border px-4 py-2.5"
      >
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.hour.mode === 'all' ? '' : 'opacity-40'"
          @click="cronBuilder.hour.mode = 'all'"
        >
          <a-radio :checked="cronBuilder.hour.mode === 'all'" />
          <span class="text-sm">每小时</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.hour.mode === 'step' ? '' : 'opacity-40'"
          @click="cronBuilder.hour.mode = 'step'"
        >
          <a-radio :checked="cronBuilder.hour.mode === 'step'" />
          <span class="text-sm">每隔</span>
          <a-input-number
            v-model:value="cronBuilder.hour.step"
            :min="1"
            :max="23"
            size="small"
            class="w-16"
            @focus="cronBuilder.hour.mode = 'step'"
          />
          <span class="text-sm">小时</span>
        </div>
        <div
          class="cursor-pointer"
          :class="cronBuilder.hour.mode === 'specific' ? '' : 'opacity-40'"
          @click="cronBuilder.hour.mode = 'specific'"
        >
          <div class="mb-1 flex items-center gap-2">
            <a-radio :checked="cronBuilder.hour.mode === 'specific'" />
            <span class="text-sm">指定</span>
          </div>
          <div class="grid grid-cols-6 gap-1 pl-6">
            <a-tag
              v-for="v in 24"
              :key="v - 1"
              :color="
                cronBuilder.hour.values.includes(v - 1) ? 'blue' : 'default'
              "
              class="cursor-pointer select-none text-center transition-all hover:opacity-80"
              @click.stop="
                cronBuilder.hour.mode = 'specific';
                toggleCronValue(cronBuilder.hour, v - 1);
              "
            >
              {{ v - 1 }}
            </a-tag>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'day'"
        class="space-y-2 rounded-lg border border-border px-4 py-2.5"
      >
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.day.mode === 'all' ? '' : 'opacity-40'"
          @click="cronBuilder.day.mode = 'all'"
        >
          <a-radio :checked="cronBuilder.day.mode === 'all'" />
          <span class="text-sm">每天</span>
        </div>
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.day.mode === 'step' ? '' : 'opacity-40'"
          @click="cronBuilder.day.mode = 'step'"
        >
          <a-radio :checked="cronBuilder.day.mode === 'step'" />
          <span class="text-sm">每隔</span>
          <a-input-number
            v-model:value="cronBuilder.day.step"
            :min="1"
            :max="31"
            size="small"
            class="w-16"
            @focus="cronBuilder.day.mode = 'step'"
          />
          <span class="text-sm">天</span>
        </div>
        <div
          class="cursor-pointer"
          :class="cronBuilder.day.mode === 'specific' ? '' : 'opacity-40'"
          @click="cronBuilder.day.mode = 'specific'"
        >
          <div class="mb-1 flex items-center gap-2">
            <a-radio :checked="cronBuilder.day.mode === 'specific'" />
            <span class="text-sm">指定</span>
          </div>
          <div class="grid grid-cols-7 gap-1 pl-6">
            <a-tag
              v-for="v in 31"
              :key="v"
              :color="cronBuilder.day.values.includes(v) ? 'blue' : 'default'"
              class="cursor-pointer select-none text-center transition-all hover:opacity-80"
              @click.stop="
                cronBuilder.day.mode = 'specific';
                toggleCronValue(cronBuilder.day, v);
              "
            >
              {{ v }}
            </a-tag>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'month'"
        class="space-y-2 rounded-lg border border-border px-4 py-2.5"
      >
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.month.mode === 'all' ? '' : 'opacity-40'"
          @click="cronBuilder.month.mode = 'all'"
        >
          <a-radio :checked="cronBuilder.month.mode === 'all'" />
          <span class="text-sm">每月</span>
        </div>
        <div
          class="cursor-pointer"
          :class="cronBuilder.month.mode === 'specific' ? '' : 'opacity-40'"
          @click="cronBuilder.month.mode = 'specific'"
        >
          <div class="mb-1 flex items-center gap-2">
            <a-radio :checked="cronBuilder.month.mode === 'specific'" />
            <span class="text-sm">指定</span>
          </div>
          <div class="grid grid-cols-4 gap-2 pl-6">
            <a-tag
              v-for="v in 12"
              :key="v"
              :color="cronBuilder.month.values.includes(v) ? 'blue' : 'default'"
              class="cursor-pointer select-none text-center transition-all hover:opacity-80"
              @click.stop="
                cronBuilder.month.mode = 'specific';
                toggleCronValue(cronBuilder.month, v);
              "
            >
              {{ v }}月
            </a-tag>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'weekday'"
        class="space-y-2 rounded-lg border border-border px-4 py-2.5"
      >
        <div
          class="flex cursor-pointer items-center gap-2"
          :class="cronBuilder.weekday.mode === 'all' ? '' : 'opacity-40'"
          @click="cronBuilder.weekday.mode = 'all'"
        >
          <a-radio :checked="cronBuilder.weekday.mode === 'all'" />
          <span class="text-sm">每天</span>
        </div>
        <div
          class="cursor-pointer"
          :class="cronBuilder.weekday.mode === 'specific' ? '' : 'opacity-40'"
          @click="cronBuilder.weekday.mode = 'specific'"
        >
          <div class="mb-1 flex items-center gap-2">
            <a-radio :checked="cronBuilder.weekday.mode === 'specific'" />
            <span class="text-sm">指定</span>
          </div>
          <div class="flex flex-wrap gap-2 pl-6">
            <a-tag
              v-for="v in 7"
              :key="v - 1"
              :color="
                cronBuilder.weekday.values.includes(v - 1) ? 'blue' : 'default'
              "
              class="cursor-pointer select-none px-4 py-1 transition-all hover:opacity-80"
              @click.stop="
                cronBuilder.weekday.mode = 'specific';
                toggleCronValue(cronBuilder.weekday, v - 1);
              "
            >
              {{ WEEKDAY_LABELS[v - 1] }}
            </a-tag>
          </div>
        </div>
      </div>

      <div class="flex gap-3 border-border">
        <div class="flex-1">
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="item in segmentOptions"
              :key="item.value"
              class="flex items-center overflow-hidden rounded-md border border-input transition-colors"
              :class="{
                'border-primary shadow-sm': activeTab === item.value,
              }"
            >
              <span
                class="flex-shrink-0 border-r border-border px-2.5 py-1 text-sm font-medium text-muted-foreground"
                :class="{
                  'text-primary': activeTab === item.value,
                }"
              >
                {{ item.label }}
              </span>
              <a-input
                :value="cronParts[item.value as keyof typeof cronParts]"
                size="small"
                :bordered="false"
                class="font-mono text-sm"
                @change="
                  (e: Event) =>
                    parseFieldString(
                      item.value as any,
                      (e.target as HTMLInputElement).value,
                    )
                "
                @focus="activeTab = item.value"
              />
            </div>
          </div>
          <div
            class="mt-2 flex items-center overflow-hidden rounded-md border border-input"
          >
            <span
              class="flex-shrink-0 border-r border-border px-2.5 py-1 text-sm font-medium text-muted-foreground"
            >
              表达式
            </span>
            <a-input
              :value="cronExpression"
              size="small"
              :bordered="false"
              class="font-mono text-sm"
              @change="
                (e: Event) =>
                  parseCronExpression((e.target as HTMLInputElement).value)
              "
            />
          </div>
        </div>
        <div class="w-52 flex-shrink-0 border-l border-border pl-4">
          <div class="mb-1 text-sm font-medium text-primary">
            近五次执行时间
          </div>
          <template v-if="cronPreviewRuns.length > 0">
            <div
              v-for="(time, idx) in cronPreviewRuns"
              :key="idx"
              class="py-0.5 font-mono text-xs leading-5 text-muted-foreground"
            >
              {{ dayjs(time).format('YYYY-MM-DD HH:mm:ss') }}
            </div>
          </template>
          <div v-else class="text-sm text-muted-foreground/60">
            无法计算运行时间
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
