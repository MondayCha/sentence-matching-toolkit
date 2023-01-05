import { ButtonInfo } from '@/components/Interaction/ButtonGroup';

export const enum SubCategoryIndex {
  Normal = 0,
  Incomplete,
  Suspension,
  Mismatch,
  Recycled,
  Rule,
}

export const subCategoryInfo = (showRule: boolean): ButtonInfo<SubCategoryIndex>[] => [
  {
    name: '正常',
    index: SubCategoryIndex.Normal,
  },
  {
    name: '缺失',
    index: SubCategoryIndex.Incomplete,
  },
  {
    name: '异常',
    index: SubCategoryIndex.Suspension,
  },
  {
    name: '无',
    index: SubCategoryIndex.Mismatch,
  },
  {
    name: '回收站',
    index: SubCategoryIndex.Recycled,
  },
  ...(showRule
    ? [
        {
          name: '规则',
          index: SubCategoryIndex.Rule,
        },
      ]
    : []),
];

export const enum NameCheckIndex {
  Calc = 0,
  Doubt,
  None,
  Other,
  Recycled,
}

export const nameCheckInfo: ButtonInfo<NameCheckIndex>[] = [
  {
    name: '不在字典中',
    index: NameCheckIndex.Calc,
  },
  {
    name: '不完整',
    index: NameCheckIndex.Doubt,
  },
  {
    name: '无',
    index: NameCheckIndex.None,
  },
  {
    name: '其他',
    index: NameCheckIndex.Other,
  },
  {
    name: '回收站',
    index: NameCheckIndex.Recycled,
  },
];
