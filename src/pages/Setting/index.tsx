/**
 * suspense fallback component
 */
import type { FC } from "react";
import clsx from "clsx";
import { BookOne, FileSettingsOne } from "@icon-park/react";
import ListItem from "../../components/ListItem";
import DataStorage from "./groups/DataStorage";
import RuleManage from "./groups/RuleManage";
import DictManage from "./groups/DictManage";

const Setting: FC = () => {
  return (
    <div className={clsx("mdc-paper")}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">设置</h1>
        <p className="mdc-text-sm">
          配置匹配规则，编辑自学习词典，查看应用数据。
        </p>
      </div>
      <ul className="mdc-list">
        <RuleManage />
        <DictManage />
        <DataStorage />
      </ul>
    </div>
  );
};

export default Setting;
