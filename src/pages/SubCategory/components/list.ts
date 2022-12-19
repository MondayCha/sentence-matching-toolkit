import { ButtonInfo } from '@/components/Interaction/ButtonGroup';

export const enum SubCategoryIndex {
  Normal = 0,
  Incomplete,
  Suspension,
  Mismatch,
  Recycled,
}

export const subCategoryInfo: ButtonInfo<SubCategoryIndex>[] = [
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
];

export const enum NameCheckIndex {
  Calc = 0,
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
