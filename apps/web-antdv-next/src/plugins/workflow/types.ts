export type WorkflowNodeType =
  | 'APPROVER'
  | 'CC'
  | 'CONDITION'
  | 'END'
  | 'PARALLEL'
  | 'START'
  | 'TRIGGER';

export type WorkflowApproverType =
  | 'DEPT_LEADER'
  | 'DEPT_LEADER_UP'
  | 'DESIGNATED_ROLE'
  | 'DESIGNATED_USER'
  | 'FORM_FIELD_USER'
  | 'INITIATOR'
  | 'INITIATOR_LEADER'
  | 'SELF_SELECT';

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export type WorkflowConditionOperator =
  | 'CONTAINS'
  | 'EQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'NEQ';

export interface WorkflowConditionRule {
  field: string;
  operator: WorkflowConditionOperator;
  value: string;
}

export interface WorkflowConditionGroup {
  operator: 'AND' | 'OR';
  conditions: WorkflowConditionRule[];
}

export interface WorkflowNodeData {
  label: string;
  approverType?: WorkflowApproverType;
  approveMode?: 'COUNTERSIGN' | 'OR_SIGN';
  countersignRatio?: number;
  refuseMode?: 'BACK_TO_PREV' | 'BACK_TO_START' | 'TERMINATE';
  selfApprove?: boolean;
  timeoutHours?: null | number;
  timeoutAction?: 'AUTO_APPROVE' | 'AUTO_REJECT' | 'NOTIFY';
  approverIds?: number[];
  approverId?: null | number;
  approverName?: string;
  roleIds?: number[];
  formFieldKey?: string;
  deptLevel?: number;
  selfSelectOptions?: number[];
  conditionText?: string;
  conditionField?: string;
  conditionOperator?: WorkflowConditionOperator;
  conditionValue?: string;
  conditionGroup?: WorkflowConditionGroup;
  ccUserIds?: number[];
}

export interface WorkflowEditorNode {
  id: string;
  type: WorkflowNodeType;
  position: WorkflowNodePosition;
  data: WorkflowNodeData;
}

export interface WorkflowEditorEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowFlowConfig {
  nodes: WorkflowEditorNode[];
  edges: WorkflowEditorEdge[];
}

export interface WorkflowFormField {
  id: string;
  label: string;
  field: string;
  type: 'input' | 'number' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

export interface WorkflowFormConfig {
  fields: WorkflowFormField[];
}

export interface WorkflowDefinitionEditorValue {
  category_id?: null | number;
  name: string;
  code: string;
  description?: null | string;
  status: number;
  allow_withdraw: boolean;
  allow_urge: boolean;
  flow_config: WorkflowFlowConfig;
  form_config: WorkflowFormConfig;
}

export const DEFAULT_WORKFLOW_FLOW_CONFIG: WorkflowFlowConfig = {
  nodes: [
    {
      id: 'start',
      type: 'START',
      position: { x: 80, y: 180 },
      data: { label: '开始' },
    },
    {
      id: 'approve_1',
      type: 'APPROVER',
      position: { x: 280, y: 180 },
      data: {
        label: '审批',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'end',
      type: 'END',
      position: { x: 500, y: 180 },
      data: { label: '结束' },
    },
  ],
  edges: [
    { id: 'edge_start_approve_1', source: 'start', target: 'approve_1' },
    { id: 'edge_approve_1_end', source: 'approve_1', target: 'end' },
  ],
};

export const SERIAL_WORKFLOW_FLOW_TEMPLATE: WorkflowFlowConfig = {
  nodes: [
    {
      id: 'start',
      type: 'START',
      position: { x: 80, y: 180 },
      data: { label: '开始' },
    },
    {
      id: 'approve_1',
      type: 'APPROVER',
      position: { x: 260, y: 180 },
      data: {
        label: '一级审批',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'approve_2',
      type: 'APPROVER',
      position: { x: 460, y: 180 },
      data: {
        label: '二级审批',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'end',
      type: 'END',
      position: { x: 660, y: 180 },
      data: { label: '结束' },
    },
  ],
  edges: [
    { id: 'edge_start_approve_1', source: 'start', target: 'approve_1' },
    {
      id: 'edge_approve_1_approve_2',
      source: 'approve_1',
      target: 'approve_2',
    },
    { id: 'edge_approve_2_end', source: 'approve_2', target: 'end' },
  ],
};

export const PARALLEL_WORKFLOW_FLOW_TEMPLATE: WorkflowFlowConfig = {
  nodes: [
    {
      id: 'start',
      type: 'START',
      position: { x: 80, y: 220 },
      data: { label: '开始' },
    },
    {
      id: 'parallel_1',
      type: 'PARALLEL',
      position: { x: 240, y: 220 },
      data: { label: '并行分支' },
    },
    {
      id: 'approve_1',
      type: 'APPROVER',
      position: { x: 460, y: 120 },
      data: {
        label: '并行审批A',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'approve_2',
      type: 'APPROVER',
      position: { x: 460, y: 320 },
      data: {
        label: '并行审批B',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'end',
      type: 'END',
      position: { x: 700, y: 220 },
      data: { label: '结束' },
    },
  ],
  edges: [
    { id: 'edge_start_parallel_1', source: 'start', target: 'parallel_1' },
    {
      id: 'edge_parallel_1_approve_1',
      source: 'parallel_1',
      target: 'approve_1',
    },
    {
      id: 'edge_parallel_1_approve_2',
      source: 'parallel_1',
      target: 'approve_2',
    },
    { id: 'edge_approve_1_end', source: 'approve_1', target: 'end' },
    { id: 'edge_approve_2_end', source: 'approve_2', target: 'end' },
  ],
};

export const CONDITION_WORKFLOW_FLOW_TEMPLATE: WorkflowFlowConfig = {
  nodes: [
    {
      id: 'start',
      type: 'START',
      position: { x: 80, y: 220 },
      data: { label: '开始' },
    },
    {
      id: 'approve_1',
      type: 'APPROVER',
      position: { x: 250, y: 220 },
      data: {
        label: '发起审批',
        approverType: 'INITIATOR_LEADER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'condition_1',
      type: 'CONDITION',
      position: { x: 450, y: 220 },
      data: {
        label: '金额判断',
        conditionText: '金额 >= 1000 走经理审批，否则抄送财务',
        conditionField: 'amount',
        conditionOperator: 'GTE',
        conditionValue: '1000',
        conditionGroup: {
          operator: 'AND',
          conditions: [
            {
              field: 'amount',
              operator: 'GTE',
              value: '1000',
            },
          ],
        },
      },
    },
    {
      id: 'approve_2',
      type: 'APPROVER',
      position: { x: 680, y: 120 },
      data: {
        label: '经理审批',
        approverType: 'DEPT_LEADER_UP',
        deptLevel: 1,
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'cc_1',
      type: 'CC',
      position: { x: 680, y: 320 },
      data: {
        label: '抄送财务',
        ccUserIds: [1],
      },
    },
    {
      id: 'end',
      type: 'END',
      position: { x: 920, y: 220 },
      data: { label: '结束' },
    },
  ],
  edges: [
    { id: 'edge_start_approve_1', source: 'start', target: 'approve_1' },
    {
      id: 'edge_approve_1_condition_1',
      source: 'approve_1',
      target: 'condition_1',
    },
    {
      id: 'edge_condition_1_approve_2',
      source: 'condition_1',
      target: 'approve_2',
    },
    { id: 'edge_condition_1_cc_1', source: 'condition_1', target: 'cc_1' },
    { id: 'edge_approve_2_end', source: 'approve_2', target: 'end' },
    { id: 'edge_cc_1_end', source: 'cc_1', target: 'end' },
  ],
};

export const TRIGGER_WORKFLOW_FLOW_TEMPLATE: WorkflowFlowConfig = {
  nodes: [
    {
      id: 'start',
      type: 'START',
      position: { x: 80, y: 180 },
      data: { label: '开始' },
    },
    {
      id: 'approve_1',
      type: 'APPROVER',
      position: { x: 270, y: 180 },
      data: {
        label: '业务审批',
        approverType: 'DESIGNATED_USER',
        approverIds: [],
        approverId: null,
        approverName: '',
        roleIds: [],
        formFieldKey: '',
      },
    },
    {
      id: 'trigger_1',
      type: 'TRIGGER',
      position: { x: 500, y: 180 },
      data: {
        label: '自动触发后续动作',
      },
    },
    {
      id: 'end',
      type: 'END',
      position: { x: 730, y: 180 },
      data: { label: '结束' },
    },
  ],
  edges: [
    { id: 'edge_start_approve_1', source: 'start', target: 'approve_1' },
    {
      id: 'edge_approve_1_trigger_1',
      source: 'approve_1',
      target: 'trigger_1',
    },
    { id: 'edge_trigger_1_end', source: 'trigger_1', target: 'end' },
  ],
};

export const DEFAULT_WORKFLOW_FORM_CONFIG: WorkflowFormConfig = {
  fields: [],
};
