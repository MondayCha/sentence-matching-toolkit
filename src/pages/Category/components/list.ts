import { ButtonInfo } from '@/components/Interaction/ButtonGroup';

export const enum CategoryIndex {
  Certainty = 0,
  Probably,
  Possibility,
  Improbability,
  Recycled,
}

export const listInfoWithSub: ButtonInfo<CategoryIndex>[] = [
  {
    name: '极大',
    index: CategoryIndex.Certainty,
  },
  {
    name: '一定',
    index: CategoryIndex.Probably,
  },
  {
    name: '较小',
    index: CategoryIndex.Possibility,
  },
  {
    name: '极小',
    index: CategoryIndex.Improbability,
  },
  {
    name: '回收站',
    index: CategoryIndex.Recycled,
  },
];

export const listInfoWithoutSub: ButtonInfo<CategoryIndex>[] = [
  {
    name: '极大',
    index: CategoryIndex.Certainty,
  },
  {
    name: '较小',
    index: CategoryIndex.Possibility,
  },
  {
    name: '极小',
    index: CategoryIndex.Improbability,
  },
  {
    name: '回收站',
    index: CategoryIndex.Recycled,
  },
];
