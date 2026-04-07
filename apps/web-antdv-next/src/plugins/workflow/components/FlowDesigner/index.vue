<script lang="ts" setup>
import type {
  WorkflowApproverType,
  WorkflowConditionGroup,
  WorkflowConditionRule,
  WorkflowEditorEdge,
  WorkflowEditorNode,
  WorkflowFlowConfig,
  WorkflowNodeType,
} from '#/plugins/workflow/types';

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { message, Modal } from 'antdv-next';

import WorkflowRoleSelect from '#/plugins/workflow/components/WorkflowRoleSelect.vue';
import WorkflowUserSelect from '#/plugins/workflow/components/WorkflowUserSelect.vue';

interface Props {
  formFieldOptions?: Array<{ label: string; value: string }>;
  modelValue: WorkflowFlowConfig;
  selectedNodeId?: string;
}

interface CanvasPoint {
  x: number;
  y: number;
}

interface ContextMenuState {
  edgeId?: string;
  nodeId?: string;
  visible: boolean;
  x: number;
  y: number;
  type: 'canvas' | 'edge' | 'node';
}

const props = withDefaults(defineProps<Props>(), {
  formFieldOptions: () => [],
  selectedNodeId: undefined,
});
const emit = defineEmits<{
  (e: 'selectNode', nodeId: string): void;
  (e: 'update:modelValue', value: WorkflowFlowConfig): void;
}>();
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.1;

const nodeTypes: Array<{ label: string; type: WorkflowNodeType }> = [
  { label: '开始', type: 'START' },
  { label: '审批', type: 'APPROVER' },
  { label: '条件', type: 'CONDITION' },
  { label: '并行', type: 'PARALLEL' },
  { label: '触发器', type: 'TRIGGER' },
  { label: '抄送', type: 'CC' },
  { label: '结束', type: 'END' },
];
const approverTypeOptions: Array<{
  label: string;
  value: WorkflowApproverType;
}> = [
  { label: '指定用户', value: 'DESIGNATED_USER' },
  { label: '指定角色', value: 'DESIGNATED_ROLE' },
  { label: '部门负责人', value: 'DEPT_LEADER' },
  { label: '上级部门负责人', value: 'DEPT_LEADER_UP' },
  { label: '发起人本人', value: 'INITIATOR' },
  { label: '发起人部门负责人', value: 'INITIATOR_LEADER' },
  { label: '表单字段用户', value: 'FORM_FIELD_USER' },
  { label: '发起时自选', value: 'SELF_SELECT' },
];
const contextMenuNodeTypes = nodeTypes.filter(
  (item) => item.type !== 'START' && item.type !== 'END',
);

const nodes = computed(() => props.modelValue.nodes);
const edges = computed(() => props.modelValue.edges);
const selectedNode = computed<undefined | WorkflowEditorNode>(() => {
  return props.modelValue.nodes.find(
    (item) => item.id === props.selectedNodeId,
  );
});
const draggingNodeId = ref<string>();
const dragOffset = ref({ x: 0, y: 0 });
const canvasRef = ref<HTMLElement>();
const shellRef = ref<HTMLElement>();
const connectingFromNodeId = ref<string>();
const mousePosition = ref<CanvasPoint>({ x: 0, y: 0 });
const contextMenu = ref<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  type: 'canvas',
});
const contextMenuCanvasPoint = ref<CanvasPoint>({ x: 120, y: 120 });
const editorVisible = ref(false);
const viewportOffset = ref<CanvasPoint>({ x: 0, y: 0 });
const viewportScale = ref(1);
const panning = ref(false);
const panStart = ref<CanvasPoint>({ x: 0, y: 0 });
const isFullscreen = ref(false);

const viewportStyle = computed(() => ({
  transform: `translate(${viewportOffset.value.x}px, ${viewportOffset.value.y}px) scale(${viewportScale.value})`,
  transformOrigin: '0 0',
}));

const zoomPercent = computed(() => `${Math.round(viewportScale.value * 100)}%`);

function nodeColor(type: WorkflowNodeType) {
  return {
    APPROVER: '#1677ff',
    CC: '#8c8c8c',
    CONDITION: '#fa8c16',
    END: '#ff4d4f',
    PARALLEL: '#722ed1',
    START: '#52c41a',
    TRIGGER: '#faad14',
  }[type];
}

function nodeShape(type: WorkflowNodeType) {
  if (type === 'CONDITION') {
    return 'diamond';
  }
  if (type === 'END' || type === 'START') {
    return 'circle';
  }
  return 'card';
}

function nodeTypeLabel(type: WorkflowNodeType) {
  return {
    APPROVER: '审批',
    CC: '抄送',
    CONDITION: '条件',
    END: '结束',
    PARALLEL: '并行',
    START: '开始',
    TRIGGER: '触发器',
  }[type];
}

function nodeSize(type: WorkflowNodeType) {
  if (type === 'CONDITION') {
    return { height: 110, width: 110 };
  }
  if (type === 'END' || type === 'START') {
    return { height: 96, width: 96 };
  }
  return { height: 64, width: 144 };
}

function nodeWrapperStyle(node: WorkflowEditorNode) {
  const size = nodeSize(node.type);
  return {
    color: nodeColor(node.type),
    height: `${size.height}px`,
    left: `${node.position.x}px`,
    top: `${node.position.y}px`,
    width: `${size.width}px`,
  };
}

function getNode(nodeId: string) {
  return props.modelValue.nodes.find((item) => item.id === nodeId);
}

function countOutgoingEdges(nodeId: string) {
  return props.modelValue.edges.filter((item) => item.source === nodeId).length;
}

function countIncomingEdges(nodeId: string) {
  return props.modelValue.edges.filter((item) => item.target === nodeId).length;
}

function hasInputHandle(type: WorkflowNodeType) {
  return type !== 'START';
}

function hasOutputHandle(type: WorkflowNodeType) {
  return type !== 'END';
}

function getEdgeValidation(fromNodeId: string, targetNodeId: string) {
  const source = getNode(fromNodeId);
  const target = getNode(targetNodeId);
  if (!source || !target) {
    return '节点不存在';
  }
  if (fromNodeId === targetNodeId) {
    return '节点不能连接自己';
  }
  if (
    props.modelValue.edges.some(
      (item) => item.source === fromNodeId && item.target === targetNodeId,
    )
  ) {
    return '该连线已存在';
  }
  if (source.type === 'END') {
    return '结束节点不能再连接下游节点';
  }
  if (target.type === 'START') {
    return '开始节点不能作为下游节点';
  }
  if (source.type === 'START' && countOutgoingEdges(source.id) >= 1) {
    return '开始节点必须且只能连接一个下游节点';
  }
  if (source.type === 'PARALLEL') {
    if (target.type === 'END') {
      return '并行节点后至少需要一个业务节点';
    }
  } else if (
    source.type !== 'CONDITION' &&
    countOutgoingEdges(source.id) >= 1
  ) {
    return '当前仅条件节点和并行节点支持多个下游节点';
  }
  if (countIncomingEdges(target.id) >= 1) {
    return '当前目标节点已存在上游，请使用并行汇聚场景';
  }
  if (source.type === 'START' && target.type === 'END') {
    return '开始节点后至少需要一个审批节点';
  }
  return '';
}

function updateModelValue(flowConfig: WorkflowFlowConfig) {
  emit('update:modelValue', flowConfig);
}

function updateNodePosition(
  nodeId: string,
  position: { x: number; y: number },
) {
  updateModelValue({
    ...props.modelValue,
    nodes: props.modelValue.nodes.map((item) =>
      item.id === nodeId
        ? {
            ...item,
            position,
          }
        : item,
    ),
  });
}

function updateSelectedNode(patch: Partial<WorkflowEditorNode['data']>) {
  const nodeId = props.selectedNodeId;
  if (!nodeId) {
    return;
  }
  updateModelValue({
    ...props.modelValue,
    nodes: props.modelValue.nodes.map((node) => {
      if (node.id !== nodeId) {
        return node;
      }
      return {
        ...node,
        data: {
          ...node.data,
          ...patch,
        },
      };
    }),
  });
}

function updateDesignatedUser(value: number | number[] | undefined) {
  if (Array.isArray(value)) {
    updateDesignatedUser(value[0]);
    return;
  }
  if (value === null || value === undefined) {
    updateSelectedNode({
      approverId: null,
      approverIds: [],
      approverName: '',
    });
    return;
  }
  updateSelectedNode({
    approverId: value,
    approverIds: [value],
    approverName: '',
  });
}

function updateRoleIds(value: number | number[] | undefined) {
  updateSelectedNode({
    roleIds: Array.isArray(value) ? value : [],
  });
}

function updateSelfSelectOptions(value: number | number[] | undefined) {
  updateSelectedNode({
    selfSelectOptions: Array.isArray(value) ? value : [],
  });
}

function updateCcUserIds(value: number | number[] | undefined) {
  updateSelectedNode({
    ccUserIds: Array.isArray(value) ? value : [],
  });
}

function updateApproverType(value: WorkflowApproverType) {
  updateSelectedNode({
    approverType: value,
    approverId:
      value === 'DESIGNATED_USER'
        ? (selectedNode.value?.data.approverId ?? null)
        : null,
    approverIds:
      value === 'DESIGNATED_USER'
        ? (selectedNode.value?.data.approverIds ?? [])
        : [],
    approverName:
      value === 'DESIGNATED_USER'
        ? (selectedNode.value?.data.approverName ?? '')
        : '',
    roleIds:
      value === 'DESIGNATED_ROLE'
        ? (selectedNode.value?.data.roleIds ?? [])
        : [],
    formFieldKey:
      value === 'FORM_FIELD_USER'
        ? (selectedNode.value?.data.formFieldKey ?? '')
        : '',
    deptLevel:
      value === 'DEPT_LEADER_UP'
        ? (selectedNode.value?.data.deptLevel ?? 1)
        : undefined,
    selfSelectOptions:
      value === 'SELF_SELECT'
        ? (selectedNode.value?.data.selfSelectOptions ?? [])
        : [],
  });
}

function ensureConditionGroup(
  node?: WorkflowEditorNode,
): WorkflowConditionGroup {
  const firstRule: WorkflowConditionRule = {
    field: node?.data.conditionField ?? '',
    operator: node?.data.conditionOperator ?? 'EQ',
    value: node?.data.conditionValue ?? '',
  };
  return (
    node?.data.conditionGroup ?? {
      operator: 'AND',
      conditions: [firstRule],
    }
  );
}

function updateConditionGroup(patch: Partial<WorkflowConditionGroup>) {
  const node = selectedNode.value;
  if (!node || node.type !== 'CONDITION') {
    return;
  }
  const nextGroup = {
    ...ensureConditionGroup(node),
    ...patch,
  };
  const firstRule = nextGroup.conditions[0] ?? {
    field: '',
    operator: 'EQ',
    value: '',
  };
  updateSelectedNode({
    conditionField: firstRule.field,
    conditionGroup: nextGroup,
    conditionOperator: firstRule.operator,
    conditionValue: firstRule.value,
  });
}

function updateConditionRule(
  index: number,
  patch: Partial<WorkflowConditionRule>,
) {
  const node = selectedNode.value;
  if (!node || node.type !== 'CONDITION') {
    return;
  }
  const group = ensureConditionGroup(node);
  updateConditionGroup({
    conditions: group.conditions.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            ...patch,
          }
        : item,
    ),
  });
}

function addConditionRule() {
  const node = selectedNode.value;
  if (!node || node.type !== 'CONDITION') {
    return;
  }
  const group = ensureConditionGroup(node);
  updateConditionGroup({
    conditions: [...group.conditions, { field: '', operator: 'EQ', value: '' }],
  });
}

function removeConditionRule(index: number) {
  const node = selectedNode.value;
  if (!node || node.type !== 'CONDITION') {
    return;
  }
  const group = ensureConditionGroup(node);
  const nextConditions = group.conditions.filter(
    (_, itemIndex) => itemIndex !== index,
  );
  updateConditionGroup({
    conditions:
      nextConditions.length > 0
        ? nextConditions
        : [{ field: '', operator: 'EQ', value: '' }],
  });
}

function approverTypeMessage(node?: WorkflowEditorNode) {
  const approverType = node?.data.approverType;
  if (!approverType) {
    return '';
  }
  if (approverType === 'DEPT_LEADER') {
    return '运行时按发起人当前部门负责人解析审批人。';
  }
  if (approverType === 'INITIATOR') {
    return '运行时按发起人本人解析审批人。';
  }
  if (approverType === 'INITIATOR_LEADER') {
    return '运行时按发起人所在部门负责人解析审批人。';
  }
  if (approverType === 'DEPT_LEADER_UP') {
    return `运行时按发起人向上第${node?.data.deptLevel ?? 1}级部门负责人解析审批人。`;
  }
  if (approverType === 'SELF_SELECT') {
    return '运行时由发起人在申请页选择审批人。';
  }
  return '';
}

function getInputAnchor(node: WorkflowEditorNode) {
  const size = nodeSize(node.type);
  return {
    x: node.position.x,
    y: node.position.y + size.height / 2,
  };
}

function getOutputAnchor(node: WorkflowEditorNode) {
  const size = nodeSize(node.type);
  return {
    x: node.position.x + size.width,
    y: node.position.y + size.height / 2,
  };
}

function bezierPath(from: CanvasPoint, to: CanvasPoint) {
  const mx = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
}

function edgePath(edge: WorkflowEditorEdge) {
  const source = getNode(edge.source);
  const target = getNode(edge.target);
  if (!source || !target) {
    return '';
  }
  return bezierPath(getOutputAnchor(source), getInputAnchor(target));
}

const previewEdgePath = computed(() => {
  if (!connectingFromNodeId.value) {
    return '';
  }
  const source = getNode(connectingFromNodeId.value);
  if (!source) {
    return '';
  }
  return bezierPath(getOutputAnchor(source), mousePosition.value);
});

function nextNodePosition() {
  const nextIndex = props.modelValue.nodes.length + 1;
  return {
    x: 160 + (nextIndex % 3) * 160,
    y: 80 + Math.floor(nextIndex / 3) * 120,
  };
}

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

function setViewportScale(nextScale: number, focusPoint?: CanvasPoint) {
  const previousScale = viewportScale.value;
  const clampedScale = clampScale(nextScale);
  if (clampedScale === previousScale) {
    return;
  }
  if (focusPoint) {
    viewportOffset.value = {
      x:
        focusPoint.x -
        ((focusPoint.x - viewportOffset.value.x) / previousScale) *
          clampedScale,
      y:
        focusPoint.y -
        ((focusPoint.y - viewportOffset.value.y) / previousScale) *
          clampedScale,
    };
  }
  viewportScale.value = clampedScale;
}

function zoomIn() {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) {
    setViewportScale(viewportScale.value + SCALE_STEP);
    return;
  }
  setViewportScale(viewportScale.value + SCALE_STEP, {
    x: rect.width / 2,
    y: rect.height / 2,
  });
}

function zoomOut() {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) {
    setViewportScale(viewportScale.value - SCALE_STEP);
    return;
  }
  setViewportScale(viewportScale.value - SCALE_STEP, {
    x: rect.width / 2,
    y: rect.height / 2,
  });
}

function resetViewport() {
  viewportScale.value = 1;
  viewportOffset.value = { x: 0, y: 0 };
}

function createNode(type: WorkflowNodeType, position?: CanvasPoint) {
  const nextIndex = props.modelValue.nodes.length + 1;
  const id = `${type.toLowerCase()}_${nextIndex}`;
  const node: WorkflowEditorNode = {
    id,
    type,
    position: position ?? nextNodePosition(),
    data: {
      label:
        type === 'APPROVER'
          ? `审批${nextIndex}`
          : nodeTypes.find((item) => item.type === type)?.label || type,
      approverIds: [],
      approverId: null,
      approverName: '',
      approverType: type === 'APPROVER' ? 'DESIGNATED_USER' : undefined,
      roleIds: type === 'APPROVER' ? [] : undefined,
      formFieldKey: type === 'APPROVER' ? '' : undefined,
      approveMode: type === 'APPROVER' ? 'OR_SIGN' : undefined,
      countersignRatio: type === 'APPROVER' ? 100 : undefined,
      refuseMode: type === 'APPROVER' ? 'BACK_TO_START' : undefined,
      selfApprove: type === 'APPROVER' ? false : undefined,
      timeoutHours: type === 'APPROVER' ? null : undefined,
      timeoutAction: type === 'APPROVER' ? 'NOTIFY' : undefined,
      conditionText: type === 'CONDITION' ? '条件分支' : undefined,
      conditionField: type === 'CONDITION' ? '' : undefined,
      conditionOperator: type === 'CONDITION' ? 'EQ' : undefined,
      conditionValue: type === 'CONDITION' ? '' : undefined,
      conditionGroup:
        type === 'CONDITION'
          ? {
              operator: 'AND',
              conditions: [{ field: '', operator: 'EQ', value: '' }],
            }
          : undefined,
      ccUserIds: type === 'CC' ? [] : undefined,
    },
  };
  updateModelValue({
    ...props.modelValue,
    nodes: [...props.modelValue.nodes, node],
  });
  emit('selectNode', id);
  hideContextMenu();
  editorVisible.value = true;
}

function removeNode(nodeId: string) {
  const selected = getNode(nodeId);
  if (!selected) {
    message.warning('当前节点不存在');
    return;
  }
  if (selected.type === 'START' || selected.type === 'END') {
    message.warning('开始节点和结束节点不允许删除');
    return;
  }
  const relatedEdges = props.modelValue.edges.filter(
    (item) => item.source === nodeId || item.target === nodeId,
  );
  Modal.confirm({
    title: '确认删除节点',
    content: `将删除节点“${selected.data.label}”及其 ${relatedEdges.length} 条关联连线，是否继续？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      if (connectingFromNodeId.value === nodeId) {
        cancelConnection();
      }
      if (props.selectedNodeId === nodeId) {
        editorVisible.value = false;
      }
      updateModelValue({
        nodes: props.modelValue.nodes.filter((item) => item.id !== nodeId),
        edges: props.modelValue.edges.filter(
          (item) => item.source !== nodeId && item.target !== nodeId,
        ),
      });
      hideContextMenu();
      message.success(`已删除节点“${selected.data.label}”`);
    },
  });
}

function removeEdge(edgeId: string) {
  const edge = props.modelValue.edges.find((item) => item.id === edgeId);
  if (!edge) {
    message.warning('连线不存在');
    return;
  }
  const source = getNode(edge.source);
  const target = getNode(edge.target);
  Modal.confirm({
    title: '确认删除连线',
    content: `将断开“${source?.data.label || edge.source} → ${target?.data.label || edge.target}”，是否继续？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      updateModelValue({
        ...props.modelValue,
        edges: props.modelValue.edges.filter((item) => item.id !== edgeId),
      });
      hideContextMenu();
      message.success('已删除连线');
    },
  });
}

function createEdge(fromNodeId: string, targetNodeId: string) {
  const current = getNode(fromNodeId);
  const target = getNode(targetNodeId);
  const reason = getEdgeValidation(fromNodeId, targetNodeId);
  if (reason) {
    message.warning(reason);
    return;
  }
  updateModelValue({
    ...props.modelValue,
    edges: [
      ...props.modelValue.edges,
      {
        id: `edge_${fromNodeId}_${targetNodeId}`,
        source: fromNodeId,
        target: targetNodeId,
      },
    ],
  });
  message.success(
    `已连接 ${current?.data.label || fromNodeId} → ${target?.data.label || targetNodeId}`,
  );
}

function startDrag(node: WorkflowEditorNode, event: MouseEvent) {
  if (event.button !== 0) {
    return;
  }
  hideContextMenu();
  panning.value = false;
  const canvasPoint = getCanvasPointFromMouseEvent(event);
  draggingNodeId.value = node.id;
  dragOffset.value = {
    x: canvasPoint.x - node.position.x,
    y: canvasPoint.y - node.position.y,
  };
  emit('selectNode', node.id);
}

function isCanvasBackgroundTarget(target: EventTarget | null) {
  if (!(target instanceof Element) || !canvasRef.value) {
    return false;
  }
  if (!canvasRef.value.contains(target)) {
    return false;
  }
  return !target.closest(
    '.designer-node-wrap, .designer-context-menu, .designer-toolbar',
  );
}

function startCanvasPan(event: MouseEvent) {
  if (
    event.button !== 0 ||
    draggingNodeId.value ||
    !isCanvasBackgroundTarget(event.target)
  ) {
    return;
  }
  hideContextMenu();
  cancelConnection();
  panning.value = true;
  panStart.value = {
    x: event.clientX - viewportOffset.value.x,
    y: event.clientY - viewportOffset.value.y,
  };
}

function onCanvasMouseMove(event: MouseEvent) {
  const canvasPoint = getCanvasPointFromMouseEvent(event);
  mousePosition.value = canvasPoint;
  if (panning.value) {
    viewportOffset.value = {
      x: event.clientX - panStart.value.x,
      y: event.clientY - panStart.value.y,
    };
    return;
  }
  if (!draggingNodeId.value) {
    return;
  }
  updateNodePosition(draggingNodeId.value, {
    x: Math.max(8, canvasPoint.x - dragOffset.value.x),
    y: Math.max(8, canvasPoint.y - dragOffset.value.y),
  });
}

function stopInteractions() {
  draggingNodeId.value = undefined;
  panning.value = false;
}

function getCanvasDisplayPoint(event: MouseEvent): CanvasPoint {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) {
    return { x: event.clientX, y: event.clientY };
  }
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getCanvasPointFromMouseEvent(event: MouseEvent): CanvasPoint {
  const displayPoint = getCanvasDisplayPoint(event);
  return {
    x: (displayPoint.x - viewportOffset.value.x) / viewportScale.value,
    y: (displayPoint.y - viewportOffset.value.y) / viewportScale.value,
  };
}

function hideContextMenu() {
  contextMenu.value = {
    ...contextMenu.value,
    edgeId: undefined,
    nodeId: undefined,
    visible: false,
  };
}

function openCanvasContextMenu(event: MouseEvent) {
  stopInteractions();
  const canvasPoint = getCanvasPointFromMouseEvent(event);
  const displayPoint = getCanvasDisplayPoint(event);
  mousePosition.value = canvasPoint;
  contextMenuCanvasPoint.value = canvasPoint;
  contextMenu.value = {
    type: 'canvas',
    visible: true,
    x: displayPoint.x,
    y: displayPoint.y,
  };
}

function openNodeContextMenu(node: WorkflowEditorNode, event: MouseEvent) {
  stopInteractions();
  const canvasPoint = getCanvasPointFromMouseEvent(event);
  const displayPoint = getCanvasDisplayPoint(event);
  mousePosition.value = canvasPoint;
  emit('selectNode', node.id);
  contextMenu.value = {
    nodeId: node.id,
    type: 'node',
    visible: true,
    x: displayPoint.x,
    y: displayPoint.y,
  };
}

function openEdgeContextMenu(edgeId: string, event: MouseEvent) {
  stopInteractions();
  const canvasPoint = getCanvasPointFromMouseEvent(event);
  const displayPoint = getCanvasDisplayPoint(event);
  mousePosition.value = canvasPoint;
  contextMenu.value = {
    edgeId,
    type: 'edge',
    visible: true,
    x: displayPoint.x,
    y: displayPoint.y,
  };
}

function onCanvasClick() {
  hideContextMenu();
  cancelConnection();
}

function selectNode(nodeId: string) {
  emit('selectNode', nodeId);
  hideContextMenu();
}

function openNodeEditor(nodeId?: string) {
  if (!nodeId) {
    return;
  }
  selectNode(nodeId);
  editorVisible.value = true;
}

function closeNodeEditor() {
  editorVisible.value = false;
}

function startConnection(nodeId: string) {
  const node = getNode(nodeId);
  if (!node || !hasOutputHandle(node.type)) {
    return;
  }
  hideContextMenu();
  emit('selectNode', nodeId);
  if (connectingFromNodeId.value === nodeId) {
    cancelConnection();
    return;
  }
  connectingFromNodeId.value = nodeId;
}

function finishConnection(nodeId: string) {
  const fromNodeId = connectingFromNodeId.value;
  if (!fromNodeId) {
    return;
  }
  const node = getNode(nodeId);
  if (!node || !hasInputHandle(node.type)) {
    return;
  }
  createEdge(fromNodeId, nodeId);
  cancelConnection();
}

function cancelConnection() {
  connectingFromNodeId.value = undefined;
}

function handleCanvasWheel(event: WheelEvent) {
  const displayPoint = getCanvasDisplayPoint(event as unknown as MouseEvent);
  const delta = event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
  setViewportScale(viewportScale.value + delta, displayPoint);
}

async function toggleFullscreen() {
  const element = shellRef.value;
  if (!element || typeof document === 'undefined') {
    return;
  }
  if (document.fullscreenElement === element) {
    await document.exitFullscreen();
    return;
  }
  await element.requestFullscreen();
}

function syncFullscreenState() {
  if (typeof document === 'undefined') {
    isFullscreen.value = false;
    return;
  }
  isFullscreen.value = document.fullscreenElement === shellRef.value;
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hideContextMenu();
    cancelConnection();
    closeNodeEditor();
    stopInteractions();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('fullscreenchange', syncFullscreenState);
  syncFullscreenState();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  document.removeEventListener('fullscreenchange', syncFullscreenState);
});
</script>

<template>
  <div
    ref="shellRef"
    class="designer-shell"
    :class="{ fullscreen: isFullscreen }"
  >
    <div
      ref="canvasRef"
      class="designer-canvas"
      :class="{ panning }"
      @click="onCanvasClick"
      @contextmenu.prevent="openCanvasContextMenu"
      @mousedown="startCanvasPan"
      @mousemove="onCanvasMouseMove"
      @mouseup="stopInteractions"
      @mouseleave="stopInteractions"
      @wheel.prevent="handleCanvasWheel"
    >
      <div class="designer-toolbar" @click.stop>
        <button type="button" @click="zoomOut">－</button>
        <button
          type="button"
          class="designer-toolbar-label"
          @click="resetViewport"
        >
          {{ zoomPercent }}
        </button>
        <button type="button" @click="zoomIn">＋</button>
        <button
          type="button"
          class="designer-toolbar-label"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>

      <div class="designer-guide" @click.stop>
        <div class="designer-tip">
          右键画布新增节点，右键节点编辑，右键连线删除。
        </div>
        <div class="designer-tip">
          左键拖拽空白区域可平移，滚轮可缩放，右上角可全屏。
        </div>
      </div>

      <div class="designer-viewport" :style="viewportStyle">
        <svg class="designer-lines">
          <g v-for="edge in edges" :key="edge.id">
            <path
              :d="edgePath(edge)"
              fill="none"
              stroke="#bfbfbf"
              stroke-width="2"
            />
            <path
              :d="edgePath(edge)"
              class="designer-edge-hit"
              fill="none"
              stroke="transparent"
              stroke-width="14"
              @contextmenu.prevent.stop="openEdgeContextMenu(edge.id, $event)"
            />
          </g>
          <path
            v-if="previewEdgePath"
            :d="previewEdgePath"
            fill="none"
            stroke="#1677ff"
            stroke-dasharray="6 4"
            stroke-width="2"
          />
        </svg>

        <div
          v-for="node in nodes"
          :key="node.id"
          class="designer-node-wrap"
          :class="{
            active: selectedNodeId === node.id,
            connecting: connectingFromNodeId === node.id,
          }"
          :style="nodeWrapperStyle(node)"
        >
          <button
            v-if="hasInputHandle(node.type)"
            class="designer-handle designer-handle-input"
            type="button"
            :title="connectingFromNodeId ? '连接到此节点' : '输入点'"
            @click.stop="finishConnection(node.id)"
            @mousedown.stop
          ></button>
          <div
            class="designer-node"
            :class="nodeShape(node.type)"
            :style="{
              borderColor: nodeColor(node.type),
              color: nodeColor(node.type),
            }"
            @click.stop="selectNode(node.id)"
            @contextmenu.prevent.stop="openNodeContextMenu(node, $event)"
            @mousedown.stop="startDrag(node, $event)"
          >
            <div class="designer-node-content">
              <div class="designer-node-type">{{ node.type }}</div>
              <div class="designer-node-label">{{ node.data.label }}</div>
            </div>
          </div>
          <button
            v-if="hasOutputHandle(node.type)"
            class="designer-handle designer-handle-output"
            type="button"
            :title="
              connectingFromNodeId === node.id ? '取消连线' : '从此节点发起连线'
            "
            @click.stop="startConnection(node.id)"
            @mousedown.stop
          ></button>
        </div>
      </div>

      <div
        v-if="contextMenu.visible"
        class="designer-context-menu"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <template v-if="contextMenu.type === 'canvas'">
          <div class="designer-context-title">添加节点</div>
          <button
            v-for="item in contextMenuNodeTypes"
            :key="item.type"
            class="designer-context-item"
            type="button"
            @click="createNode(item.type, contextMenuCanvasPoint)"
          >
            添加{{ item.label }}
          </button>
        </template>
        <template v-else-if="contextMenu.type === 'edge'">
          <div class="designer-context-title">连线操作</div>
          <button
            class="designer-context-item danger"
            type="button"
            @click="contextMenu.edgeId && removeEdge(contextMenu.edgeId)"
          >
            删除连线
          </button>
          <button
            class="designer-context-item"
            type="button"
            @click="hideContextMenu"
          >
            取消
          </button>
        </template>
        <template v-else>
          <div class="designer-context-title">节点操作</div>
          <button
            class="designer-context-item"
            type="button"
            @click="openNodeEditor(contextMenu.nodeId)"
          >
            编辑节点
          </button>
          <button
            class="designer-context-item danger"
            type="button"
            @click="contextMenu.nodeId && removeNode(contextMenu.nodeId)"
          >
            删除节点
          </button>
          <button
            class="designer-context-item"
            type="button"
            @click="hideContextMenu"
          >
            取消
          </button>
        </template>
      </div>
    </div>
  </div>

  <a-modal
    :open="editorVisible"
    width="720px"
    title="编辑节点"
    :footer="null"
    @cancel="closeNodeEditor"
  >
    <template v-if="selectedNode">
      <a-form layout="vertical">
        <a-form-item label="节点类型">
          <a-input :value="nodeTypeLabel(selectedNode.type)" disabled />
        </a-form-item>
        <a-form-item label="节点名称">
          <a-input
            :value="selectedNode.data.label"
            @update:value="(value) => updateSelectedNode({ label: value })"
          />
        </a-form-item>

        <template v-if="selectedNode.type === 'APPROVER'">
          <a-form-item label="审批人来源">
            <a-select
              :value="selectedNode.data.approverType || 'DESIGNATED_USER'"
              :options="approverTypeOptions"
              @update:value="
                (value) => updateApproverType(value as WorkflowApproverType)
              "
            />
          </a-form-item>
          <a-form-item
            v-if="
              selectedNode.data.approverType === 'DESIGNATED_USER' ||
              !selectedNode.data.approverType
            "
            label="指定审批人"
          >
            <WorkflowUserSelect
              :model-value="selectedNode.data.approverId ?? undefined"
              @update:model-value="updateDesignatedUser"
            />
          </a-form-item>
          <a-form-item
            v-if="selectedNode.data.approverType === 'DESIGNATED_ROLE'"
            label="角色列表"
          >
            <WorkflowRoleSelect
              :model-value="selectedNode.data.roleIds ?? []"
              mode="multiple"
              @update:model-value="updateRoleIds"
            />
          </a-form-item>
          <a-form-item
            v-if="selectedNode.data.approverType === 'FORM_FIELD_USER'"
            label="用户字段"
          >
            <a-select
              allow-clear
              :value="selectedNode.data.formFieldKey"
              :options="formFieldOptions"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    formFieldKey: value ? String(value) : '',
                  })
              "
            />
          </a-form-item>
          <a-form-item
            v-if="selectedNode.data.approverType === 'DEPT_LEADER_UP'"
            label="向上层级"
          >
            <a-input-number
              style="width: 100%"
              :min="1"
              :value="selectedNode.data.deptLevel ?? 1"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    deptLevel: value == null ? 1 : Number(value),
                  })
              "
            />
          </a-form-item>
          <a-form-item
            v-if="selectedNode.data.approverType === 'SELF_SELECT'"
            label="候选用户列表"
          >
            <WorkflowUserSelect
              :model-value="selectedNode.data.selfSelectOptions ?? []"
              mode="multiple"
              @update:model-value="updateSelfSelectOptions"
            />
          </a-form-item>
          <a-alert
            v-if="approverTypeMessage(selectedNode)"
            type="info"
            show-icon
            :message="approverTypeMessage(selectedNode)"
          />

          <a-form-item label="审批方式">
            <a-radio-group
              :value="selectedNode.data.approveMode || 'OR_SIGN'"
              button-style="solid"
              option-type="button"
              :options="[
                { label: '或签', value: 'OR_SIGN' },
                { label: '会签', value: 'COUNTERSIGN' },
              ]"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    approveMode: value as 'COUNTERSIGN' | 'OR_SIGN',
                  })
              "
            />
          </a-form-item>
          <a-form-item
            v-if="selectedNode.data.approveMode === 'COUNTERSIGN'"
            label="通过比例"
          >
            <a-slider
              :min="1"
              :max="100"
              :value="selectedNode.data.countersignRatio || 100"
              @update:value="
                (value) =>
                  updateSelectedNode({ countersignRatio: Number(value) })
              "
            />
          </a-form-item>
          <a-form-item label="拒绝模式">
            <a-select
              :value="selectedNode.data.refuseMode || 'BACK_TO_START'"
              :options="[
                { label: '退回发起', value: 'BACK_TO_START' },
                { label: '退回上一节点', value: 'BACK_TO_PREV' },
                { label: '终止', value: 'TERMINATE' },
              ]"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    refuseMode: value as
                      | 'BACK_TO_PREV'
                      | 'BACK_TO_START'
                      | 'TERMINATE',
                  })
              "
            />
          </a-form-item>
          <a-form-item label="允许自审">
            <a-switch
              :checked="Boolean(selectedNode.data.selfApprove)"
              @update:checked="
                (value) => updateSelectedNode({ selfApprove: Boolean(value) })
              "
            />
          </a-form-item>
          <a-form-item label="超时时间（小时)">
            <a-input-number
              style="width: 100%"
              :value="selectedNode.data.timeoutHours ?? undefined"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    timeoutHours: value == null ? null : Number(value),
                  })
              "
            />
          </a-form-item>
          <a-form-item label="超时动作">
            <a-select
              :value="selectedNode.data.timeoutAction || 'NOTIFY'"
              :options="[
                { label: '通知', value: 'NOTIFY' },
                { label: '自动通过', value: 'AUTO_APPROVE' },
                { label: '自动拒绝', value: 'AUTO_REJECT' },
              ]"
              @update:value="
                (value) =>
                  updateSelectedNode({
                    timeoutAction: value as
                      | 'AUTO_APPROVE'
                      | 'AUTO_REJECT'
                      | 'NOTIFY',
                  })
              "
            />
          </a-form-item>
        </template>

        <a-form-item v-if="selectedNode.type === 'CONDITION'" label="条件说明">
          <a-textarea
            :value="selectedNode.data.conditionText"
            @update:value="
              (value) =>
                updateSelectedNode({
                  conditionText: value ? String(value) : '',
                })
            "
          />
        </a-form-item>
        <template v-if="selectedNode.type === 'CONDITION'">
          <a-form-item label="命中规则">
            <a-radio-group
              :value="ensureConditionGroup(selectedNode).operator"
              button-style="solid"
              option-type="button"
              :options="[
                { label: '全部满足', value: 'AND' },
                { label: '任一满足', value: 'OR' },
              ]"
              @update:value="
                (value) =>
                  updateConditionGroup({
                    operator: String(
                      value,
                    ) as WorkflowConditionGroup['operator'],
                  })
              "
            />
          </a-form-item>
          <div class="space-y-3">
            <div
              v-for="(condition, index) in ensureConditionGroup(selectedNode)
                .conditions"
              :key="`${selectedNode.id}_${index}`"
              class="designer-condition-card"
            >
              <div class="designer-condition-header">
                <span class="text-sm font-medium">条件 {{ index + 1 }}</span>
                <a-button
                  size="small"
                  danger
                  @click="removeConditionRule(index)"
                >
                  删除
                </a-button>
              </div>
              <a-form-item label="条件字段">
                <a-select
                  allow-clear
                  :value="condition.field"
                  :options="formFieldOptions"
                  @update:value="
                    (value) =>
                      updateConditionRule(index, {
                        field: value ? String(value) : '',
                      })
                  "
                />
              </a-form-item>
              <a-form-item label="比较方式">
                <a-select
                  :value="condition.operator"
                  :options="[
                    { label: '等于', value: 'EQ' },
                    { label: '不等于', value: 'NEQ' },
                    { label: '大于', value: 'GT' },
                    { label: '大于等于', value: 'GTE' },
                    { label: '小于', value: 'LT' },
                    { label: '小于等于', value: 'LTE' },
                    { label: '包含', value: 'CONTAINS' },
                  ]"
                  @update:value="
                    (value) =>
                      updateConditionRule(index, {
                        operator: String(
                          value,
                        ) as WorkflowConditionRule['operator'],
                      })
                  "
                />
              </a-form-item>
              <a-form-item label="比较值">
                <a-input
                  :value="condition.value"
                  @update:value="
                    (value) =>
                      updateConditionRule(index, {
                        value: value ? String(value) : '',
                      })
                  "
                />
              </a-form-item>
            </div>
          </div>
          <a-button block type="dashed" @click="addConditionRule">
            新增条件
          </a-button>
        </template>

        <a-form-item v-if="selectedNode.type === 'CC'" label="抄送人列表">
          <WorkflowUserSelect
            :model-value="selectedNode.data.ccUserIds ?? []"
            mode="multiple"
            @update:model-value="updateCcUserIds"
          />
        </a-form-item>

        <a-alert
          v-if="selectedNode.type === 'PARALLEL'"
          type="info"
          show-icon
          message="并行节点已支持多分支派发与汇聚。"
        />
        <a-alert
          v-if="selectedNode.type === 'TRIGGER'"
          type="info"
          show-icon
          message="触发器节点当前作为自动跳过节点处理，可继续串接后续审批。"
        />
      </a-form>
    </template>
  </a-modal>
</template>

<style scoped>
.designer-shell {
  position: relative;
  min-height: 560px;
}

.designer-shell.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 16px;
  background: #fff;
}

.designer-canvas {
  position: relative;
  height: 100%;
  min-height: 560px;
  overflow: hidden;
  cursor: grab;
  background-color: #fff;
  background-image: radial-gradient(circle, #f0f0f0 1px, transparent 1px);
  background-size: 16px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.designer-shell.fullscreen .designer-canvas {
  min-height: calc(100vh - 32px);
}

.designer-canvas.panning {
  cursor: grabbing;
}

.designer-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 12;
  display: flex;
  gap: 8px;
}

.designer-toolbar button {
  min-width: 36px;
  height: 36px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

.designer-toolbar-label {
  min-width: 64px !important;
}

.designer-guide {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 12;
  padding: 10px 12px;
  background: rgb(255 255 255 / 92%);
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 6%);
}

.designer-tip {
  font-size: 12px;
  line-height: 1.6;
  color: #8c8c8c;
}

.designer-viewport {
  position: absolute;
  inset: 0;
}

.designer-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.designer-edge-hit {
  pointer-events: stroke;
  cursor: pointer;
}

.designer-node-wrap {
  position: absolute;
}

.designer-node-wrap.active .designer-node {
  box-shadow: 0 0 0 3px rgb(22 119 255 / 15%);
}

.designer-node-wrap.connecting .designer-node {
  box-shadow: 0 0 0 3px rgb(82 196 26 / 18%);
}

.designer-node {
  position: absolute;
  inset: 0;
  cursor: move;
  user-select: none;
  background: #fff;
  border: 2px solid #d9d9d9;
  box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
}

.designer-node.card {
  padding: 10px;
  border-radius: 10px;
}

.designer-node.circle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-align: center;
  border-radius: 999px;
}

.designer-node.diamond {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  transform: rotate(45deg);
}

.designer-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}

.designer-node.diamond .designer-node-content {
  transform: rotate(-45deg);
}

.designer-node-type {
  font-size: 12px;
  opacity: 0.75;
}

.designer-node-label {
  margin-top: 6px;
  font-weight: 600;
  color: #262626;
}

.designer-handle {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 14px;
  height: 14px;
  cursor: crosshair;
  background: #fff;
  border: 2px solid #1677ff;
  border-radius: 999px;
  transform: translateY(-50%);
}

.designer-handle:hover {
  background: #1677ff;
}

.designer-handle-input {
  left: -7px;
}

.designer-handle-output {
  right: -7px;
}

.designer-context-menu {
  position: absolute;
  z-index: 10;
  min-width: 160px;
  padding: 6px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 12%);
}

.designer-context-title {
  padding: 8px 10px;
  font-size: 12px;
  color: #8c8c8c;
}

.designer-context-item {
  display: block;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
}

.designer-context-item:hover {
  background: #f5f5f5;
}

.designer-context-item.danger {
  color: #ff4d4f;
}

.designer-condition-card {
  padding: 12px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
}

.designer-condition-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
