import { ButtonInfo } from '@/components/Interaction/ButtonGroup';

export const enum SubCategoryIndex {
  Normal = 0,
  Incomplete,
  Suspension,
  Mismatch,
  Recycled,
}

export const listInfo: ButtonInfo<SubCategoryIndex>[] = [
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
